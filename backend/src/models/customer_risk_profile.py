"""CustomerRiskProfile ORM model for per-customer baseline risk data."""

from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class CustomerRiskProfile(Base):
    __tablename__ = "customer_risk_profiles"

    customer_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    avg_transaction_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    std_transaction_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    typical_merchants: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    typical_devices: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    typical_locations: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    transaction_frequency_daily: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now()
    )
