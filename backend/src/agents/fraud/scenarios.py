"""
Deterministic demo scenario configurations for ArthaMind Z-Sentinel.

All values are fixed — scenarios are reproducible and do not use random data.
"""

import types
from dataclasses import dataclass
from typing import Final


@dataclass(frozen=True)
class ScenarioConfig:
    """Complete configuration for a deterministic demo transaction scenario."""

    # Transaction fields
    amount: float
    merchant_category_code: int
    merchant_id: str
    device_fingerprint: str
    location_lat: float
    location_lon: float

    # Derived/profile signals (pre-computed for the demo customer)
    historical_amount_baseline: float
    transaction_velocity_1h: int
    transaction_velocity_24h: int
    is_new_merchant: int  # 0 or 1
    is_new_device: int  # 0 or 1
    is_new_location: int  # 0 or 1
    days_since_last_transaction: float
    balance_utilisation_ratio: float

    # Human-readable scenario description
    description: str
    expected_risk_level: str  # LOW / MEDIUM / HIGH / CRITICAL
    expected_decision: str  # APPROVE / STEP_UP_AUTH / HOLD


SCENARIO_CONFIGS: Final[types.MappingProxyType] = types.MappingProxyType(
    {
        "NORMAL_PURCHASE": ScenarioConfig(
            amount=85.00,
            merchant_category_code=5411,  # Grocery
            merchant_id="merchant_grocery_01",
            device_fingerprint="device_known_abc123",
            location_lat=28.6139,  # Delhi — customer's home city
            location_lon=77.2090,
            historical_amount_baseline=90.00,
            transaction_velocity_1h=1,
            transaction_velocity_24h=3,
            is_new_merchant=0,
            is_new_device=0,
            is_new_location=0,
            days_since_last_transaction=1.2,
            balance_utilisation_ratio=0.08,
            description="Normal grocery purchase from a known merchant and device",
            expected_risk_level="LOW",
            expected_decision="APPROVE",
        ),
        "HIGH_VALUE_OUTLIER": ScenarioConfig(
            amount=18000.00,  # ~200× the baseline
            merchant_category_code=5944,  # Jewellery
            merchant_id="merchant_jewel_99",
            device_fingerprint="device_known_abc123",
            location_lat=28.6139,
            location_lon=77.2090,
            historical_amount_baseline=90.00,
            transaction_velocity_1h=1,
            transaction_velocity_24h=2,
            is_new_merchant=1,  # New merchant
            is_new_device=0,
            is_new_location=0,
            days_since_last_transaction=0.5,
            balance_utilisation_ratio=0.95,
            description="Transaction amount is 200× the customer baseline — extreme outlier",
            expected_risk_level="CRITICAL",
            expected_decision="HOLD",
        ),
        "NEW_DEVICE": ScenarioConfig(
            amount=220.00,
            merchant_category_code=5812,  # Restaurant
            merchant_id="merchant_restaurant_12",
            device_fingerprint="device_unknown_xyz789",
            location_lat=28.6139,
            location_lon=77.2090,
            historical_amount_baseline=180.00,
            transaction_velocity_1h=1,
            transaction_velocity_24h=2,
            is_new_merchant=0,
            is_new_device=1,  # New device fingerprint
            is_new_location=0,
            days_since_last_transaction=3.0,
            balance_utilisation_ratio=0.12,
            description="Transaction from a device not seen in the last 90 days",
            expected_risk_level="MEDIUM",
            expected_decision="STEP_UP_AUTH",
        ),
        "LOCATION_ANOMALY": ScenarioConfig(
            amount=450.00,
            merchant_category_code=4722,  # Travel
            merchant_id="merchant_travel_88",
            device_fingerprint="device_known_abc123",
            location_lat=51.5074,  # London — 6,700 km from Delhi
            location_lon=-0.1278,
            historical_amount_baseline=180.00,
            transaction_velocity_1h=1,
            transaction_velocity_24h=1,
            is_new_merchant=1,
            is_new_device=0,
            is_new_location=1,  # Location > 100 km from home
            days_since_last_transaction=0.2,
            balance_utilisation_ratio=0.20,
            description="Transaction from London while customer's home is Delhi",
            expected_risk_level="MEDIUM",
            expected_decision="STEP_UP_AUTH",
        ),
        "VELOCITY_SPIKE": ScenarioConfig(
            amount=200.00,
            merchant_category_code=5999,  # Miscellaneous retail
            merchant_id="merchant_misc_44",
            device_fingerprint="device_known_abc123",
            location_lat=28.6139,
            location_lon=77.2090,
            historical_amount_baseline=180.00,
            transaction_velocity_1h=8,  # 8 transactions in 1 hour (> 5 threshold)
            transaction_velocity_24h=18,
            is_new_merchant=0,
            is_new_device=0,
            is_new_location=0,
            days_since_last_transaction=0.04,  # ~1 hour
            balance_utilisation_ratio=0.18,
            description="8 transactions in the last hour — high velocity spike",
            expected_risk_level="HIGH",
            expected_decision="HOLD",
        ),
        "MULTI_SIGNAL": ScenarioConfig(
            amount=9500.00,  # High amount (~53× baseline)
            merchant_category_code=6011,  # ATM/Cash
            merchant_id="merchant_atm_unknown_99",
            device_fingerprint="device_unknown_hacked_777",
            location_lat=55.7558,  # Moscow — far from Delhi
            location_lon=37.6176,
            historical_amount_baseline=180.00,
            transaction_velocity_1h=7,  # Also high velocity
            transaction_velocity_24h=15,
            is_new_merchant=1,
            is_new_device=1,  # New device
            is_new_location=1,  # New location
            days_since_last_transaction=0.01,
            balance_utilisation_ratio=0.90,
            description="Multi-signal attack: high amount + new device + new location + velocity",
            expected_risk_level="CRITICAL",
            expected_decision="HOLD",
        ),
    }
)

# Valid scenario keys — used for input validation
VALID_SCENARIO_KEYS: Final[frozenset] = frozenset(SCENARIO_CONFIGS.keys())
