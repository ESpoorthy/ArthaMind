"""persist transparent Z-Sentinel risk components

Revision ID: 002_sentinel_components
Revises: 001_sentinel
"""
from alembic import op
import sqlalchemy as sa

revision = "002_sentinel_components"
down_revision = "001_sentinel"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("risk_assessments", sa.Column("anomaly_score", sa.Float(), nullable=True))
    op.add_column("risk_assessments", sa.Column("rule_risk", sa.Float(), nullable=True))
    op.add_column("risk_assessments", sa.Column("correlation_id", sa.String(length=64), nullable=True))
    op.create_index("idx_risk_assessments_correlation_id", "risk_assessments", ["correlation_id"])

def downgrade() -> None:
    op.drop_index("idx_risk_assessments_correlation_id", table_name="risk_assessments")
    op.drop_column("risk_assessments", "correlation_id")
    op.drop_column("risk_assessments", "rule_risk")
    op.drop_column("risk_assessments", "anomaly_score")
