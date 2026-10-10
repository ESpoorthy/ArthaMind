"""Bounded Z-Sentinel demo API and authenticated live delivery."""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from src.config.settings import get_settings
from src.security import require_manager
from src.sentinel.contracts import (
    CopilotQuestion,
    CopilotResponse,
    ImpactSimulation,
    OverrideRequest,
    Scenario,
    SimulatorRequest,
    TransactionEvent,
)
from src.sentinel.copilot import investigate
from src.sentinel.pipeline import SentinelPipeline

router = APIRouter(prefix="/sentinel", tags=["Z-Sentinel"])


def get_pipeline(request: Request) -> SentinelPipeline:
    return request.app.state.sentinel  # type: ignore[no-any-return]


def scenario_event(scenario: Scenario, index: int) -> TransactionEvent:
    base: dict[str, object] = {
        "transaction_id": str(
            uuid.uuid5(uuid.NAMESPACE_URL, f"z-sentinel:{scenario.value}:{index}")
        ),
        "customer_id": "demo-customer-001",
        "currency": "INR",
        "merchant_category": 5411,
        "merchant_id": "merchant-known-grocery",
        "timestamp": datetime(2026, 10, 8, 12, 0, tzinfo=timezone.utc) + timedelta(seconds=index),
        "historical_average_amount": 180,
        "recent_transaction_count": 1,
        "hours_since_last_transaction": 24,
        "channel": "CARD",
        "scenario": scenario,
    }
    if scenario == Scenario.NORMAL:
        base.update(amount=185)
    elif scenario == Scenario.HIGH_VALUE_OUTLIER:
        base.update(
            amount=18000,
            merchant_category=5944,
            merchant_id="merchant-jewellery-new",
            merchant_novelty=True,
        )
    elif scenario == Scenario.NEW_DEVICE:
        base.update(amount=220, merchant_category=5812, device_novelty=True)
    elif scenario == Scenario.LOCATION_ANOMALY:
        base.update(
            amount=450,
            merchant_category=4722,
            location_novelty=True,
            merchant_novelty=True,
        )
    elif scenario == Scenario.VELOCITY_SPIKE:
        base.update(
            amount=200,
            merchant_category=5999,
            recent_transaction_count=8,
            hours_since_last_transaction=0.1,
        )
    else:
        base.update(
            amount=9500,
            merchant_category=6011,
            merchant_id="merchant-atm-new",
            merchant_novelty=True,
            device_novelty=True,
            location_novelty=True,
            recent_transaction_count=8,
            hours_since_last_transaction=0.01,
            channel="ATM",
        )
    return TransactionEvent(**base)


async def run_stream(
    pipeline: SentinelPipeline,
    request: SimulatorRequest,
    correlation_id: str,
) -> None:
    for index in range(request.event_count):
        if not pipeline.running:
            return
        # A normal event followed by the selected scenario makes the risk change visible.
        scenario = Scenario.NORMAL if index < request.event_count - 1 else request.scenario
        await pipeline.submit(scenario_event(scenario, index), correlation_id)
        if request.interval_ms:
            await asyncio.sleep(request.interval_ms / 1000)


@router.post("/simulator/start", status_code=202)
async def start_simulator(
    payload: SimulatorRequest,
    request: Request,
    _: dict[str, str] = Depends(require_manager),
) -> dict[str, object]:
    pipeline = get_pipeline(request)
    correlation_id = str(uuid.uuid4())
    task = asyncio.create_task(run_stream(pipeline, payload, correlation_id))
    pipeline.tasks.add(task)
    task.add_done_callback(pipeline.tasks.discard)
    return {
        "status": "started",
        "event_count": payload.event_count,
        "scenario": payload.scenario,
        "correlation_id": correlation_id,
    }


@router.post("/simulator/stop")
async def stop_simulator(
    request: Request,
    _: dict[str, str] = Depends(require_manager),
) -> dict[str, str]:
    pipeline = get_pipeline(request)
    for task in list(pipeline.tasks):
        task.cancel()
    return {"status": "stopped"}


@router.get("/transactions/{transaction_id}")
async def transaction_detail(
    transaction_id: str,
    request: Request,
    _: dict[str, str] = Depends(require_manager),
) -> dict[str, object]:
    result = get_pipeline(request).results.get(transaction_id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    assessment, decision = result
    return {"assessment": assessment, "decision": decision}


@router.get("/summary")
async def summary(
    request: Request,
    _: dict[str, str] = Depends(require_manager),
) -> dict[str, object]:
    pipeline = get_pipeline(request)
    assessments = [v[0] for v in pipeline.results.values()]
    return {
        "transactions": len(assessments),
        "high_risk_events": sum(a.risk_level.value in ("HIGH", "CRITICAL") for a in assessments),
        "current_risk": assessments[-1].final_risk_score if assessments else 0,
        "average_inference_ms": (
            round(sum(a.inference_time_ms for a in assessments) / len(assessments), 2)
            if assessments
            else 0
        ),
        "model_version": (
            pipeline.provider.model_version
            if hasattr(pipeline.provider, "model_version")
            else "configured"
        ),
        "inference_mode": ("LOCAL" if pipeline.settings.inference_provider == "local" else "IBM_Z"),
        "ibm_z_status": getattr(pipeline.provider, "status", "NOT_SELECTED"),
        "runtime": pipeline.runtime_mode,
        "human_overrides": len(pipeline.overrides),
        "latency_ms": pipeline.latency_summary(),
    }


@router.get("/transactions/{transaction_id}/impact", response_model=ImpactSimulation)
async def impact(
    transaction_id: str,
    request: Request,
    _: dict[str, str] = Depends(require_manager),
) -> ImpactSimulation:
    result = get_pipeline(request).results.get(transaction_id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    assessment, decision = result
    # Transparent, non-financial assumptions: customer friction and review workload only.
    alternatives = [
        {
            "decision": "APPROVE",
            "customer_friction": 0.0,
            "review_workload": 0.0,
            "assumption": "No added authentication; residual risk remains.",
        },
        {
            "decision": "STEP_UP_AUTHENTICATION",
            "customer_friction": 1.0,
            "review_workload": 0.25,
            "assumption": "One additional authentication step; no loss estimate.",
        },
        {
            "decision": "HOLD",
            "customer_friction": 2.0,
            "review_workload": 1.0,
            "assumption": "Manual review required; no guaranteed loss avoided.",
        },
    ]
    return ImpactSimulation(
        transaction_id=transaction_id,
        authoritative_decision=decision.decision,
        authoritative_risk_score=assessment.final_risk_score,
        alternatives=alternatives,
    )


@router.post("/transactions/{transaction_id}/override")
async def override(
    transaction_id: str,
    payload: OverrideRequest,
    request: Request,
    identity: dict[str, str] = Depends(require_manager),
) -> dict[str, object]:
    pipeline = get_pipeline(request)
    result = pipeline.results.get(transaction_id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    assessment, original = result
    record: dict[str, object] = {
        "transaction_id": transaction_id,
        "reviewer": identity["sub"],
        "original_decision": original.decision.value,
        "final_decision": payload.decision.value,
        "reason": payload.reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "correlation_id": assessment.correlation_id,
    }
    pipeline.overrides.append({k: str(v) for k, v in record.items()})
    await pipeline.bus.publish("decisions:completed", {"event_type": "HUMAN_OVERRIDE", **record})
    await pipeline.bus.publish("audit:events", {"event_type": "HUMAN_OVERRIDE", **record})
    return record


@router.post("/transactions/{transaction_id}/copilot", response_model=CopilotResponse)
async def copilot(
    transaction_id: str,
    payload: CopilotQuestion,
    request: Request,
    _: dict[str, str] = Depends(require_manager),
) -> CopilotResponse:
    result = get_pipeline(request).results.get(transaction_id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    assessment, decision = result
    return investigate(payload.question, assessment, decision)


@router.websocket("/ws")
async def websocket(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    try:
        if not token:
            raise JWTError("missing token")
        settings = get_settings()
        claims = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if claims.get("role") != "manager":
            raise JWTError("manager role required")
    except JWTError:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    hub = websocket.app.state.sentinel.live
    hub.connections.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        hub.connections.discard(websocket)
