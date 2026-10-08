"""Public, PII-minimised contracts for the Z-Sentinel decision path."""
from datetime import datetime, timezone
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Scenario(str, Enum):
    NORMAL = "NORMAL"
    HIGH_VALUE_OUTLIER = "HIGH_VALUE_OUTLIER"
    NEW_DEVICE = "NEW_DEVICE"
    LOCATION_ANOMALY = "LOCATION_ANOMALY"
    VELOCITY_SPIKE = "VELOCITY_SPIKE"
    MULTI_SIGNAL_HIGH_RISK = "MULTI_SIGNAL_HIGH_RISK"


class Decision(str, Enum):
    APPROVE = "APPROVE"
    STEP_UP_AUTHENTICATION = "STEP_UP_AUTHENTICATION"
    HOLD = "HOLD"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TransactionEvent(BaseModel):
    """An ingestion event; device and location fields are novelty indicators only."""
    model_config = ConfigDict(extra="forbid")
    transaction_id: str = Field(min_length=3, max_length=64)
    customer_id: str = Field(min_length=3, max_length=64)
    amount: Annotated[float, Field(gt=0, le=10_000_000)]
    currency: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    merchant_category: int = Field(ge=0, le=9999)
    merchant_id: str = Field(min_length=3, max_length=64)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    device_novelty: bool = False
    location_novelty: bool = False
    channel: str = Field(default="CARD", pattern=r"^(CARD|UPI|ATM|WEB|MOBILE)$")
    historical_average_amount: float = Field(default=180.0, gt=0)
    recent_transaction_count: int = Field(default=1, ge=0, le=500)
    merchant_novelty: bool = False
    hours_since_last_transaction: float = Field(default=24.0, ge=0, le=8760)
    scenario: Scenario | None = None

    @field_validator("timestamp")
    @classmethod
    def timestamp_must_be_timezone_aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("timestamp must include a timezone")
        return value


class RiskAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")
    transaction_id: str
    fraud_probability: float = Field(ge=0, le=1)
    anomaly_score: float = Field(ge=0, le=1)
    rule_risk: float = Field(ge=0, le=1)
    final_risk_score: float = Field(ge=0, le=1)
    risk_level: RiskLevel
    confidence_score: float = Field(ge=0, le=1)
    confidence_calibration_version: str = "uncalibrated-v1"
    policy_version: str = "risk-policy-v1"
    ml_component: float = Field(ge=0, le=1)
    anomaly_component: float = Field(ge=0, le=1)
    rule_component: float = Field(ge=0, le=1)
    contributing_signals: list[str]
    reasoning: str
    model_version: str
    inference_mode: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    correlation_id: str
    inference_time_ms: float = Field(ge=0)


class DecisionResult(BaseModel):
    transaction_id: str
    decision: Decision
    recommended_action: str
    rationale: str
    risk_score: float = Field(ge=0, le=1)
    confidence_score: float = Field(ge=0, le=1)
    policy_version: str = "risk-policy-v1"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuditEvent(BaseModel):
    transaction_id: str
    timestamp: datetime
    model_version: str
    risk_components: dict[str, float]
    final_risk_score: float = Field(ge=0, le=1)
    confidence_score: float = Field(ge=0, le=1)
    signals: list[str]
    decision: Decision
    recommended_action: str
    inference_mode: str
    correlation_id: str
    policy_version: str = "risk-policy-v1"
    previous_audit_hash: str = ""
    audit_hash: str = ""


class SimulatorRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario: Scenario = Scenario.MULTI_SIGNAL_HIGH_RISK
    event_count: int = Field(default=6, ge=1, le=50)
    interval_ms: int = Field(default=500, ge=0, le=10_000)

class OverrideRequest(BaseModel):
    decision: Decision
    reason: str = Field(min_length=8, max_length=500)

class ImpactSimulation(BaseModel):
    transaction_id: str
    authoritative_decision: Decision
    authoritative_risk_score: float
    alternatives: list[dict[str, str | float]]

class CopilotQuestion(BaseModel):
    question: str = Field(min_length=3, max_length=500)

class CopilotResponse(BaseModel):
    transaction_id: str
    answer: str
    source: str
    read_only: bool = True
