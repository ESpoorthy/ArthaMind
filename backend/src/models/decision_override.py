"""DecisionOverride ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.base import Base

if TYPE_CHECKING:
    from src.models.risk_assessment import RiskAssessment


class DecisionOverride(Base):
    __tablename__ = "decision_overrides"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risk_assessment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("risk_assessments.id"), nullable=False, index=True
    )
    original_decision: Mapped[str] = mapped_column(String(32), nullable=False)
    override_decision: Mapped[str] = mapped_column(String(32), nullable=False)
    reviewer_id: Mapped[str] = mapped_column(String(64), nullable=False)
    reviewer_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=func.now()
    )
    override_reason: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationship
    risk_assessment: Mapped[RiskAssessment] = relationship(
        "RiskAssessment", back_populates="overrides"
    )
