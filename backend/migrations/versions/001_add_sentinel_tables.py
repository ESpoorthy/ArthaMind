"""add sentinel tables

Revision ID: 001_sentinel
Revises:
Create Date: 2024-01-15 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_sentinel"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- transactions ---
    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("customer_id", sa.String(64), nullable=False),
        sa.Column("amount", sa.Float, nullable=False),
        sa.Column("merchant_category", sa.Integer, nullable=False),
        sa.Column("merchant_id", sa.String(64), nullable=False),
        sa.Column("device_fingerprint", sa.String(128), nullable=True),
        sa.Column("location_lat", sa.Float, nullable=True),
        sa.Column("location_lon", sa.Float, nullable=True),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("raw_features", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("scenario_type", sa.String(64), nullable=True),
    )
    op.create_index("idx_transactions_customer_id", "transactions", ["customer_id"])
    op.create_index("idx_transactions_timestamp", "transactions", ["timestamp"], postgresql_ops={"timestamp": "DESC"})

    # --- risk_assessments ---
    op.create_table(
        "risk_assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("transaction_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("transactions.id"), nullable=False),
        sa.Column("risk_score", sa.Float, nullable=False),
        sa.Column("risk_level", sa.String(16), nullable=False),
        sa.Column("fraud_probability", sa.Float, nullable=False),
        sa.Column("confidence_score", sa.Float, nullable=False),
        sa.Column("contributing_signals", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("reasoning", sa.Text, nullable=True),
        sa.Column("plain_language_explanation", sa.Text, nullable=True),
        sa.Column("recommended_action", sa.String(32), nullable=False),
        sa.Column("decision", sa.String(32), nullable=False),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("inference_mode", sa.String(32), nullable=False),
        sa.Column("feature_extraction_ms", sa.Integer, nullable=True),
        sa.Column("ml_inference_ms", sa.Integer, nullable=True),
        sa.Column("total_decision_ms", sa.Integer, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint("risk_score >= 0.0 AND risk_score <= 1.0", name="ck_risk_score_range"),
    )
    op.create_index("idx_risk_assessments_transaction_id", "risk_assessments", ["transaction_id"])
    op.create_index("idx_risk_assessments_risk_level", "risk_assessments", ["risk_level"])
    op.create_index("idx_risk_assessments_created_at", "risk_assessments", ["created_at"], postgresql_ops={"created_at": "DESC"})

    # --- decision_overrides ---
    op.create_table(
        "decision_overrides",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("risk_assessment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("risk_assessments.id"), nullable=False),
        sa.Column("original_decision", sa.String(32), nullable=False),
        sa.Column("override_decision", sa.String(32), nullable=False),
        sa.Column("reviewer_id", sa.String(64), nullable=False),
        sa.Column(
            "reviewer_timestamp",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("override_reason", sa.Text, nullable=False),
    )
    op.create_index("idx_decision_overrides_assessment_id", "decision_overrides", ["risk_assessment_id"])

    # --- audit_events ---
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_type", sa.String(64), nullable=False),
        sa.Column("actor_id", sa.String(64), nullable=True),
        sa.Column("actor_role", sa.String(32), nullable=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("idx_audit_events_entity_id", "audit_events", ["entity_id"])
    op.create_index("idx_audit_events_created_at", "audit_events", ["created_at"], postgresql_ops={"created_at": "DESC"})

    # --- ml_models ---
    op.create_table(
        "ml_models",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("model_name", sa.String(64), nullable=False),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("training_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("precision_score", sa.Float, nullable=True),
        sa.Column("recall_score", sa.Float, nullable=True),
        sa.Column("f1_score", sa.Float, nullable=True),
        sa.Column("roc_auc", sa.Float, nullable=True),
        sa.Column("artefact_path", sa.Text, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("model_version", name="uq_ml_model_version"),
    )
    op.create_index("idx_ml_models_is_active", "ml_models", ["is_active"])

    # --- customer_risk_profiles ---
    op.create_table(
        "customer_risk_profiles",
        sa.Column("customer_id", sa.String(64), primary_key=True),
        sa.Column("avg_transaction_amount", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("std_transaction_amount", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("typical_merchants", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("typical_devices", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("typical_locations", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("transaction_frequency_daily", sa.Float, nullable=False, server_default="0.0"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("customer_risk_profiles")
    op.drop_table("ml_models")
    op.drop_index("idx_audit_events_created_at", table_name="audit_events")
    op.drop_index("idx_audit_events_entity_id", table_name="audit_events")
    op.drop_table("audit_events")
    op.drop_index("idx_decision_overrides_assessment_id", table_name="decision_overrides")
    op.drop_table("decision_overrides")
    op.drop_index("idx_risk_assessments_created_at", table_name="risk_assessments")
    op.drop_index("idx_risk_assessments_risk_level", table_name="risk_assessments")
    op.drop_index("idx_risk_assessments_transaction_id", table_name="risk_assessments")
    op.drop_table("risk_assessments")
    op.drop_index("idx_transactions_timestamp", table_name="transactions")
    op.drop_index("idx_transactions_customer_id", table_name="transactions")
    op.drop_table("transactions")
