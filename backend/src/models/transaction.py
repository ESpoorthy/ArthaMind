"""Transaction ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.base import Base

if TYPE_CHECKING:
    from src.models.risk_assessment import RiskAssessment


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    merchant_category: Mapped[int] = mapped_column(Integer, nullable=False)
    merchant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    device_fingerprint: Mapped[str | None] = mapped_column(String(128), nullable=True)
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=func.now(), index=True
    )
    raw_features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    scenario_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Relationship
    risk_assessment: Mapped[RiskAssessment | None] = relationship(
        "RiskAssessment", back_populates="transaction", uselist=False
    )
