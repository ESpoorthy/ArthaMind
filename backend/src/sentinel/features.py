"""Reusable feature extraction. No raw PII is emitted to models or events."""
from dataclasses import dataclass
from .contracts import TransactionEvent

FEATURE_NAMES = [
    "transaction_amount", "historical_amount_baseline", "amount_deviation_ratio",
    "transaction_velocity_1h", "transaction_velocity_24h", "merchant_category_code",
    "is_new_merchant", "is_new_device", "is_new_location", "hour_of_day",
    "days_since_last_transaction", "balance_utilisation_ratio",
]

@dataclass(frozen=True)
class Features:
    values: list[float]
    signals: list[str]
    amount_deviation: float
    transaction_velocity: float
    recent_transaction_count: int
    merchant_novelty: float
    device_novelty: float
    location_novelty: float
    time_anomaly: float
    behavioural_deviation: float

def extract(event: TransactionEvent) -> Features:
    deviation = min(event.amount / event.historical_average_amount, 20.0)
    velocity = event.recent_transaction_count
    time_anomaly = 1.0 if event.timestamp.hour < 6 or event.timestamp.hour >= 22 else 0.0
    signals: list[str] = []
    if deviation >= 3: signals.append("HIGH_AMOUNT_DEVIATION")
    if event.device_novelty: signals.append("NEW_DEVICE")
    if event.location_novelty: signals.append("LOCATION_ANOMALY")
    if velocity >= 5: signals.append("VELOCITY_SPIKE")
    if event.merchant_novelty: signals.append("MERCHANT_NOVELTY")
    if time_anomaly: signals.append("TIME_ANOMALY")
    behavioural = min(1.0, (min(deviation / 5, 1) + min(velocity / 8, 1) + int(event.device_novelty) + int(event.location_novelty)) / 4)
    values = [event.amount, event.historical_average_amount, deviation, velocity,
              max(1, velocity * 2), event.merchant_category, float(event.merchant_novelty),
              float(event.device_novelty), float(event.location_novelty), event.timestamp.hour,
              max(event.hours_since_last_transaction / 24, 0.001), min(event.amount / 10000, 0.999)]
    return Features(values, signals, deviation, velocity, velocity, float(event.merchant_novelty),
                    float(event.device_novelty), float(event.location_novelty), time_anomaly, behavioural)
