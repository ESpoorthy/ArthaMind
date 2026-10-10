"""Authoritative scoring pipeline; LLMs only explain completed decisions."""

import asyncio
import json
import time
import uuid
from abc import ABC, abstractmethod
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from src.config.settings import Settings, get_settings
from src.sentinel.audit_chain import extend
from src.sentinel.contracts import (
    AuditEvent,
    Decision,
    DecisionResult,
    RiskAssessment,
    RiskLevel,
    TransactionEvent,
)
from src.sentinel.features import Features, extract


@dataclass(frozen=True)
class InferenceResponse:
    transaction_id: str
    correlation_id: str
    fraud_probability: float
    anomaly_score: float
    model_version: str
    inference_mode: str
    timestamp: datetime
    latency_ms: float


class InferenceProvider(ABC):
    @abstractmethod
    def score(
        self,
        transaction_id: str,
        correlation_id: str,
        features: Features,
    ) -> InferenceResponse: ...


class LocalInferenceProvider(InferenceProvider):
    """Loads persisted XGBoost/IsolationForest artefacts, with deterministic real ML bootstrap."""

    def __init__(self, artefacts_path: str = "models") -> None:
        self.path = Path(artefacts_path)
        self.model_version = "bootstrap-rf-1"
        self.model: Any = None
        self.anomaly: Any = None
        self.scaler: Any = None
        self.calibrator: Any = None
        self.confidence_calibration_version = "uncalibrated-v1"
        self._load_or_bootstrap()

    def _load_or_bootstrap(self) -> None:
        metadata = (
            sorted(self.path.glob("model_metadata_v*.json"))[-1]
            if self.path.exists() and list(self.path.glob("model_metadata_v*.json"))
            else None
        )
        if metadata:
            values = json.loads(metadata.read_text())
            self.model_version = str(values["model_version"])
            self.model = joblib.load(self.path / values["xgb_artefact"])
            self.anomaly = joblib.load(self.path / values["iso_artefact"])
            self.scaler = joblib.load(self.path / values["scaler_artefact"])
            if values.get("confidence_calibrator_artefact"):
                self.calibrator = joblib.load(self.path / values["confidence_calibrator_artefact"])
                self.confidence_calibration_version = str(
                    values.get("confidence_calibration_version", "platt-validation-v1")
                )
            return
        # A small reproducible supervised bootstrap keeps local demo functional
        # before training artefacts exist.
        rng = np.random.default_rng(42)
        normal = rng.normal(0, 1, (2500, 12))
        fraud = rng.normal(0, 1, (500, 12))
        fraud[:, 0] += 5
        fraud[:, 2] += 5
        fraud[:, 3] += 4
        fraud[:, 6:9] += 2
        X = np.vstack([normal, fraud])
        y = np.r_[np.zeros(len(normal)), np.ones(len(fraud))]
        self.scaler = StandardScaler().fit(X)
        scaled = self.scaler.transform(X)
        self.model = RandomForestClassifier(
            n_estimators=100, class_weight="balanced", random_state=42
        ).fit(scaled, y)
        self.anomaly = IsolationForest(n_estimators=100, contamination=0.05, random_state=42).fit(
            scaled[: len(normal)]
        )

    def score(
        self,
        transaction_id: str,
        correlation_id: str,
        features: Features,
    ) -> InferenceResponse:
        started = time.perf_counter()
        scaled = self.scaler.transform([features.values])
        probability = float(self.model.predict_proba(scaled)[0][1])
        if self.calibrator is not None:
            probability = float(self.calibrator.predict_proba([[probability]])[0][1])
        # IsolationForest is independent; sigmoid produces a stable, bounded anomaly component.
        anomaly = float(1 / (1 + np.exp(8 * float(self.anomaly.decision_function(scaled)[0]))))
        return InferenceResponse(
            transaction_id,
            correlation_id,
            probability,
            anomaly,
            self.model_version,
            "LOCAL",
            datetime.now(timezone.utc),
            (time.perf_counter() - started) * 1000,
        )


class IBMZInferenceProvider(InferenceProvider):
    """Contract boundary only. Refuses operation unless a real IBM z/OS integration is supplied."""

    def __init__(self, settings: Settings) -> None:
        if not all(
            (
                settings.ibm_z_host,
                settings.ibm_z_username,
                settings.ibm_z_password,
                settings.ibm_z_model_name,
            )
        ):
            raise ValueError(
                "IBM Z inference requires configured z/OS host, credentials, and model name"
            )
        self.settings = settings

    @property
    def status(self) -> str:
        return "IBM_Z_UNAVAILABLE"

    def score(
        self,
        transaction_id: str,
        correlation_id: str,
        features: Features,
    ) -> InferenceResponse:
        raise RuntimeError(
            "IBM Z scoring endpoint is not implemented or verified; "
            "refusing to fabricate an IBM Z result"
        )


class EventBus:
    """Redis Streams adapter with an in-process fallback for local tests/demo without Redis."""

    def __init__(self, redis_url: str) -> None:
        self.redis_url = redis_url
        self.redis: Any = None
        self.mode = "LOCAL_FALLBACK"
        self.require_real: bool = False
        self.events: dict[str, list[dict[str, Any]]] = defaultdict(list)

    async def start(self) -> None:
        try:
            import redis.asyncio as redis

            self.redis = redis.from_url(self.redis_url, decode_responses=True)
            await self.redis.ping()
        except Exception:
            self.redis = None
            if self.redis_url and self.redis_url.startswith("redis") and self.require_real:
                raise RuntimeError("REAL_REDIS is required but Redis is unavailable")
        else:
            self.mode = "REAL_REDIS"

    async def publish(self, stream: str, payload: dict[str, Any]) -> None:
        self.events[stream].append(payload)
        if self.redis:
            await self.redis.xadd(stream, {"payload": json.dumps(payload, default=str)})

    async def close(self) -> None:
        if self.redis:
            await self.redis.aclose()


class LiveHub:
    def __init__(self) -> None:
        self.connections: set[Any] = set()

    async def broadcast(self, payload: dict[str, Any]) -> None:
        stale = []
        for socket in self.connections:
            try:
                await socket.send_json(payload)
            except Exception:
                stale.append(socket)
        for socket in stale:
            self.connections.discard(socket)


def rule_risk(features: Features) -> float:
    return min(
        1.0,
        (
            min(features.amount_deviation / 8, 1) * 0.35
            + min(features.transaction_velocity / 8, 1) * 0.25
            + features.device_novelty * 0.15
            + features.location_novelty * 0.15
            + features.merchant_novelty * 0.1
        ),
    )


def level(score: float, settings: Settings) -> RiskLevel:
    if score >= settings.decision_high_threshold:
        return RiskLevel.CRITICAL
    if score >= settings.decision_medium_threshold:
        return RiskLevel.HIGH
    if score >= settings.decision_low_threshold:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def decide(
    event: TransactionEvent,
    score: float,
    confidence: float,
    settings: Settings,
) -> DecisionResult:
    risk_level = level(score, settings)
    if risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        decision, action = Decision.HOLD, "Hold transaction and route to fraud review"
    elif risk_level == RiskLevel.MEDIUM:
        decision, action = (
            Decision.STEP_UP_AUTHENTICATION,
            "Require additional customer authentication",
        )
    else:
        decision, action = Decision.APPROVE, "Approve transaction and continue monitoring"
    return DecisionResult(
        transaction_id=event.transaction_id,
        decision=decision,
        recommended_action=action,
        rationale=f"Deterministic policy for {risk_level.value} risk",
        risk_score=score,
        confidence_score=confidence,
    )


def explain(signals: list[str], result: DecisionResult) -> str:
    evidence = ", ".join(signals) if signals else "no material anomaly signals"
    return f"Decision {result.decision.value}: {result.rationale}. Evidence: {evidence}."


class SentinelPipeline:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.provider: InferenceProvider = (
            LocalInferenceProvider(self.settings.model_artefacts_path)
            if self.settings.inference_provider == "local"
            else IBMZInferenceProvider(self.settings)
        )
        self.bus = EventBus(self.settings.redis_url)
        self.bus.require_real = self.settings.require_real_infrastructure
        self.live = LiveHub()
        self.audit: list[AuditEvent] = []
        self.results: dict[str, tuple[RiskAssessment, DecisionResult]] = {}
        self.overrides: list[dict[str, str]] = []
        self.latencies: dict[str, list[float]] = defaultdict(list)
        self._dedupe_lock = asyncio.Lock()
        self.tasks: set[asyncio.Task[None]] = set()
        self.running = True

    async def start(self) -> None:
        await self.bus.start()

    @property
    def runtime_mode(self) -> dict[str, str]:
        return {
            "redis": self.bus.mode,
            "postgres": (
                "REAL_POSTGRES" if self.settings.require_real_infrastructure else "LOCAL_FALLBACK"
            ),
        }

    def latency_summary(self) -> dict[str, dict[str, float]]:
        def summary(values: list[float]) -> dict[str, float]:
            if not values:
                return {"p50": 0.0, "p95": 0.0, "p99": 0.0, "max": 0.0}
            return {
                "p50": round(float(np.percentile(values, 50)), 3),
                "p95": round(float(np.percentile(values, 95)), 3),
                "p99": round(float(np.percentile(values, 99)), 3),
                "max": round(max(values), 3),
            }

        return {stage: summary(values) for stage, values in self.latencies.items()}

    async def stop(self) -> None:
        self.running = False
        for task in self.tasks:
            task.cancel()
        await self.bus.close()

    async def submit(self, event: TransactionEvent, correlation_id: str) -> None:
        await self.bus.publish(
            "transactions:incoming",
            {"transaction": event.model_dump(mode="json"), "correlation_id": correlation_id},
        )
        task = asyncio.create_task(self.process(event, correlation_id))
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)

    async def _persist(
        self,
        event: TransactionEvent,
        assessment: RiskAssessment,
        decision: DecisionResult,
        audit: AuditEvent,
    ) -> None:
        """Persist the authoritative records; availability failure never alters a decision."""
        # Imported lazily so the standalone local demo can still run without a PostgreSQL driver.
        try:
            from src.database.session import AsyncSessionLocal
            from src.models.audit_event import AuditEvent as AuditEventModel
            from src.models.risk_assessment import RiskAssessment as RiskAssessmentModel
            from src.models.transaction import Transaction as TransactionModel
        except ImportError:
            return
        try:
            transaction_uuid = uuid.UUID(event.transaction_id)
        except ValueError:
            transaction_uuid = uuid.uuid5(uuid.NAMESPACE_URL, event.transaction_id)
        try:
            async with AsyncSessionLocal() as session:
                existing = await session.get(TransactionModel, transaction_uuid)
                if not existing:
                    session.add(
                        TransactionModel(
                            id=transaction_uuid,
                            customer_id=event.customer_id,
                            amount=event.amount,
                            merchant_category=event.merchant_category,
                            merchant_id=event.merchant_id,
                            device_fingerprint=None,
                            location_lat=None,
                            location_lon=None,
                            timestamp=event.timestamp,
                            raw_features={
                                "device_novelty": event.device_novelty,
                                "location_novelty": event.location_novelty,
                            },
                            scenario_type=str(event.scenario or ""),
                        )
                    )
                session.add(
                    RiskAssessmentModel(
                        transaction_id=transaction_uuid,
                        risk_score=assessment.final_risk_score,
                        risk_level=assessment.risk_level.value,
                        fraud_probability=assessment.fraud_probability,
                        anomaly_score=assessment.anomaly_score,
                        rule_risk=assessment.rule_risk,
                        confidence_score=assessment.confidence_score,
                        contributing_signals={"signals": assessment.contributing_signals},
                        reasoning=assessment.reasoning,
                        plain_language_explanation=assessment.reasoning,
                        recommended_action=decision.recommended_action,
                        decision=decision.decision.value,
                        model_version=assessment.model_version,
                        inference_mode=assessment.inference_mode,
                        correlation_id=assessment.correlation_id,
                        feature_extraction_ms=None,
                        ml_inference_ms=round(assessment.inference_time_ms),
                        total_decision_ms=round(assessment.inference_time_ms),
                    )
                )
                session.add(
                    AuditEventModel(
                        event_type="Z_SENTINEL_DECISION",
                        entity_id=transaction_uuid,
                        entity_type="transaction",
                        payload=audit.model_dump(mode="json"),
                    )
                )
                await session.commit()
        except Exception:
            # The event has already been safely published;
            # callers can monitor persistence separately.
            return

    async def process(self, event: TransactionEvent, correlation_id: str) -> None:
        # Transaction ID is the idempotency key for this single-process demo worker.
        # Production Redis consumers should additionally use consumer groups/DB uniqueness.
        async with self._dedupe_lock:
            if event.transaction_id in self.results:
                return
        started = time.perf_counter()
        mark = started
        features = extract(event)
        self.latencies["feature_engineering_ms"].append((time.perf_counter() - mark) * 1000)

        mark = time.perf_counter()
        inference = self.provider.score(event.transaction_id, correlation_id, features)
        self.latencies["ml_and_anomaly_inference_ms"].append((time.perf_counter() - mark) * 1000)

        probability = inference.fraud_probability
        anomaly = inference.anomaly_score
        version = inference.model_version
        mode = inference.inference_mode

        mark = time.perf_counter()
        rules = rule_risk(features)
        ml_component = self.settings.risk_weight_ml * probability
        anomaly_component = self.settings.risk_weight_anomaly * anomaly
        rule_component = self.settings.risk_weight_rules * rules
        score = min(1.0, ml_component + anomaly_component + rule_component)
        # Calibrated certainty is deliberately distinct from calibrated fraud probability.
        confidence = max(probability, 1 - probability)
        decision = decide(event, score, confidence, self.settings)
        self.latencies["risk_fusion_and_decision_ms"].append((time.perf_counter() - mark) * 1000)

        assessment = RiskAssessment(
            transaction_id=event.transaction_id,
            fraud_probability=probability,
            anomaly_score=anomaly,
            rule_risk=rules,
            final_risk_score=score,
            risk_level=level(score, self.settings),
            confidence_score=confidence,
            contributing_signals=features.signals,
            reasoning=explain(features.signals, decision),
            model_version=version,
            inference_mode=mode,
            correlation_id=correlation_id,
            inference_time_ms=(time.perf_counter() - started) * 1000,
            confidence_calibration_version=getattr(
                self.provider,
                "confidence_calibration_version",
                "uncalibrated-v1",
            ),
            ml_component=ml_component,
            anomaly_component=anomaly_component,
            rule_component=rule_component,
        )
        audit = AuditEvent(
            transaction_id=event.transaction_id,
            timestamp=assessment.timestamp,
            model_version=version,
            risk_components={"ml": probability, "anomaly": anomaly, "rules": rules},
            final_risk_score=score,
            confidence_score=confidence,
            signals=features.signals,
            decision=decision.decision,
            recommended_action=decision.recommended_action,
            inference_mode=mode,
            correlation_id=correlation_id,
            policy_version=decision.policy_version,
        )
        audit = extend(audit, self.audit[-1].audit_hash if self.audit else "")
        self.results[event.transaction_id] = (assessment, decision)
        self.audit.append(audit)

        mark = time.perf_counter()
        await self._persist(event, assessment, decision, audit)
        self.latencies["persistence_ms"].append((time.perf_counter() - mark) * 1000)

        payload = {
            "event_type": "RISK_ASSESSMENT_COMPLETE",
            "transaction": {
                "transaction_id": event.transaction_id,
                "amount": event.amount,
                "currency": event.currency,
                "merchant_id": event.merchant_id,
                "merchant_category": event.merchant_category,
                "channel": event.channel,
            },
            "assessment": assessment.model_dump(mode="json"),
            "decision": decision.model_dump(mode="json"),
        }
        await self.bus.publish("transactions:scored", payload)
        await self.bus.publish("decisions:completed", decision.model_dump(mode="json"))
        await self.bus.publish("audit:events", audit.model_dump(mode="json"))
        if assessment.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            await self.bus.publish("risk:alerts", payload)
        await self.live.broadcast(payload)
        self.latencies["decision_pipeline_ms"].append((time.perf_counter() - started) * 1000)
