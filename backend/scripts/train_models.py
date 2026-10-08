# -*- coding: utf-8 -*-
"""
ArthaMind Z-Sentinel — ML Model Training Script

Generates synthetic transaction data, trains XGBoost fraud classifier and
IsolationForest anomaly detector, evaluates against quality thresholds,
and saves artefacts to backend/models/.

Usage:
    cd backend
    python -m scripts.train_models
    # or
    python scripts/train_models.py

Never hard-codes precision/recall/F1/ROC-AUC values.
All reported metrics come from actual model evaluation on held-out test data.
"""

import json
import sys
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SEED = 42
N_SAMPLES = 100_000
FRAUD_RATE = 0.02  # 2% fraud class — realistic imbalance

MODEL_VERSION = "1.0.0"
MODELS_DIR = Path(__file__).parent.parent / "models"

# Quality thresholds — script exits non-zero if any fail
MIN_PRECISION = 0.80
MIN_RECALL = 0.70
MIN_F1 = 0.75
MIN_AUC = 0.90

# Feature names (must match FeatureExtractor order)
FEATURE_NAMES = [
    "transaction_amount",
    "historical_amount_baseline",
    "amount_deviation_ratio",
    "transaction_velocity_1h",
    "transaction_velocity_24h",
    "merchant_category_code",
    "is_new_merchant",
    "is_new_device",
    "is_new_location",
    "hour_of_day",
    "days_since_last_transaction",
    "balance_utilisation_ratio",
]


# ---------------------------------------------------------------------------
# Synthetic data generation
# ---------------------------------------------------------------------------

def generate_synthetic_data(
    n_samples: int = N_SAMPLES,
    fraud_rate: float = FRAUD_RATE,
    seed: int = SEED,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Generate deterministic synthetic transaction data.

    Returns (X, y) where X has shape (n_samples, 12) and y is binary (0=legit, 1=fraud).
    """
    rng = np.random.default_rng(seed)

    n_fraud = int(n_samples * fraud_rate)
    n_legit = n_samples - n_fraud

    # ------------------------------------------------------------------
    # Legitimate transactions — realistic banking distributions
    # ------------------------------------------------------------------
    legit_amount = rng.normal(loc=180.0, scale=45.0, size=n_legit).clip(1.0, 2000.0)
    legit_baseline = rng.normal(loc=175.0, scale=40.0, size=n_legit).clip(10.0, 5000.0)
    legit_deviation = (legit_amount / legit_baseline).clip(0.1, 20.0)

    legit_velocity_1h = rng.integers(0, 4, size=n_legit)
    legit_velocity_24h = rng.integers(1, 12, size=n_legit)
    legit_mcc = rng.choice([5411, 5812, 5912, 5310, 4111, 5999, 7011], size=n_legit)
    legit_new_merchant = rng.choice([0, 1], size=n_legit, p=[0.85, 0.15])
    legit_new_device = rng.choice([0, 1], size=n_legit, p=[0.95, 0.05])
    legit_new_location = rng.choice([0, 1], size=n_legit, p=[0.92, 0.08])
    legit_hour = rng.integers(6, 23, size=n_legit)
    legit_days_since = rng.exponential(scale=2.0, size=n_legit).clip(0.01, 30.0)
    legit_bal_util = rng.beta(a=2.0, b=10.0, size=n_legit).clip(0.001, 0.95)

    X_legit = np.column_stack([
        legit_amount, legit_baseline, legit_deviation,
        legit_velocity_1h, legit_velocity_24h, legit_mcc,
        legit_new_merchant, legit_new_device, legit_new_location,
        legit_hour, legit_days_since, legit_bal_util,
    ])
    y_legit = np.zeros(n_legit, dtype=int)

    # ------------------------------------------------------------------
    # Fraud transactions — injected anomalies
    # ------------------------------------------------------------------
    fraud_amount = rng.uniform(low=500.0, high=25000.0, size=n_fraud)
    fraud_baseline = rng.normal(loc=175.0, scale=40.0, size=n_fraud).clip(10.0, 5000.0)
    fraud_deviation = (fraud_amount / fraud_baseline).clip(0.1, 20.0)  # capped at 20

    # High velocity is a strong fraud signal
    fraud_velocity_1h = rng.integers(5, 12, size=n_fraud)
    fraud_velocity_24h = rng.integers(10, 30, size=n_fraud)
    fraud_mcc = rng.choice([6011, 5944, 7995, 5999, 4722], size=n_fraud)
    # Fraud strongly associated with new device/location
    fraud_new_merchant = rng.choice([0, 1], size=n_fraud, p=[0.2, 0.8])
    fraud_new_device = rng.choice([0, 1], size=n_fraud, p=[0.2, 0.8])
    fraud_new_location = rng.choice([0, 1], size=n_fraud, p=[0.3, 0.7])
    # Fraud often happens at unusual hours
    fraud_hour = rng.choice(
        list(range(0, 6)) + list(range(22, 24)), size=n_fraud
    )
    fraud_days_since = rng.exponential(scale=0.3, size=n_fraud).clip(0.001, 5.0)
    fraud_bal_util = rng.beta(a=8.0, b=2.0, size=n_fraud).clip(0.001, 0.999)

    X_fraud = np.column_stack([
        fraud_amount, fraud_baseline, fraud_deviation,
        fraud_velocity_1h, fraud_velocity_24h, fraud_mcc,
        fraud_new_merchant, fraud_new_device, fraud_new_location,
        fraud_hour, fraud_days_since, fraud_bal_util,
    ])
    y_fraud = np.ones(n_fraud, dtype=int)

    # Combine and shuffle deterministically
    X = np.vstack([X_legit, X_fraud])
    y = np.concatenate([y_legit, y_fraud])

    shuffle_idx = rng.permutation(n_samples)
    return X[shuffle_idx], y[shuffle_idx]


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train_and_evaluate() -> None:
    """Train, evaluate, and save all model artefacts."""
    print(f"ArthaMind Z-Sentinel — Training ML pipeline (seed={SEED})")
    print(f"Generating {N_SAMPLES:,} synthetic transactions ({FRAUD_RATE*100:.1f}% fraud)...")

    t0 = time.time()
    X, y = generate_synthetic_data()
    print(f"  Data generated in {time.time() - t0:.1f}s")

    # Train/test split — stratified to preserve fraud rate
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=SEED, stratify=y
    )
    print(f"  Train: {len(X_train):,}  Test: {len(X_test):,}  "
          f"Fraud in test: {y_test.sum():,}")

    # Feature scaling (fit only on train)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ------------------------------------------------------------------
    # XGBoost — supervised fraud classifier
    # ------------------------------------------------------------------
    print("\nTraining XGBoost classifier...")
    # scale_pos_weight compensates for class imbalance
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    xgb_model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=SEED,
        eval_metric="logloss",
        verbosity=0,
        use_label_encoder=False,
    )
    xgb_model.fit(X_train_scaled, y_train)

    y_pred = xgb_model.predict(X_test_scaled)
    y_prob = xgb_model.predict_proba(X_test_scaled)[:, 1]

    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob)

    print(f"\n  XGBoost Evaluation Results:")
    print(f"  Precision : {precision:.4f}  (threshold: {MIN_PRECISION})")
    print(f"  Recall    : {recall:.4f}  (threshold: {MIN_RECALL})")
    print(f"  F1 Score  : {f1:.4f}  (threshold: {MIN_F1})")
    print(f"  ROC-AUC   : {roc_auc:.4f}  (threshold: {MIN_AUC})")
    print()
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Fraud"]))

    # Check thresholds
    failed_metrics = []
    if precision < MIN_PRECISION:
        failed_metrics.append(f"Precision {precision:.4f} < {MIN_PRECISION}")
    if recall < MIN_RECALL:
        failed_metrics.append(f"Recall {recall:.4f} < {MIN_RECALL}")
    if f1 < MIN_F1:
        failed_metrics.append(f"F1 {f1:.4f} < {MIN_F1}")
    if roc_auc < MIN_AUC:
        failed_metrics.append(f"ROC-AUC {roc_auc:.4f} < {MIN_AUC}")

    if failed_metrics:
        print("\n⚠️  WARNING: The following metrics are below minimum thresholds:")
        for m in failed_metrics:
            print(f"   ✗ {m}")
        print()

    # ------------------------------------------------------------------
    # IsolationForest — unsupervised anomaly detector
    # ------------------------------------------------------------------
    print("Training IsolationForest anomaly detector...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.02,
        random_state=SEED,
        n_jobs=-1,
    )
    # Fit on legitimate transactions only (unsupervised anomaly detection)
    iso_forest.fit(X_train_scaled[y_train == 0])

    # Compute normalised anomaly scores for test set [0.0, 1.0]
    # IsolationForest.decision_function returns negative anomaly scores
    # (more negative = more anomalous). We invert and normalise.
    raw_scores = iso_forest.decision_function(X_test_scaled)
    # Normalise to [0, 1]: higher = more anomalous
    iso_min, iso_max = raw_scores.min(), raw_scores.max()
    normalised_scores = 1.0 - (raw_scores - iso_min) / (iso_max - iso_min + 1e-9)

    print(f"  Anomaly score range: [{normalised_scores.min():.3f}, {normalised_scores.max():.3f}]")
    print(f"  Mean score (fraud): {normalised_scores[y_test == 1].mean():.3f}")
    print(f"  Mean score (legit): {normalised_scores[y_test == 0].mean():.3f}")

    # ------------------------------------------------------------------
    # Save artefacts
    # ------------------------------------------------------------------
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    xgb_path = MODELS_DIR / f"xgboost_fraud_v{MODEL_VERSION}.joblib"
    iso_path = MODELS_DIR / f"isolation_forest_v{MODEL_VERSION}.joblib"
    scaler_path = MODELS_DIR / f"feature_scaler_v{MODEL_VERSION}.joblib"
    meta_path = MODELS_DIR / f"model_metadata_v{MODEL_VERSION}.json"

    joblib.dump(xgb_model, xgb_path)
    joblib.dump(iso_forest, iso_path)
    joblib.dump(scaler, scaler_path)

    metadata = {
        "model_version": MODEL_VERSION,
        "training_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "n_samples": N_SAMPLES,
        "fraud_rate": FRAUD_RATE,
        "seed": SEED,
        "precision": round(float(precision), 6),
        "recall": round(float(recall), 6),
        "f1_score": round(float(f1), 6),
        "roc_auc": round(float(roc_auc), 6),
        "feature_names": FEATURE_NAMES,
        "xgb_artefact": str(xgb_path.name),
        "iso_artefact": str(iso_path.name),
        "scaler_artefact": str(scaler_path.name),
        "isolation_forest_score_range": {
            "min": round(float(iso_min), 6),
            "max": round(float(iso_max), 6),
        },
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n✅ Artefacts saved to {MODELS_DIR}/")
    print(f"   {xgb_path.name}")
    print(f"   {iso_path.name}")
    print(f"   {scaler_path.name}")
    print(f"   {meta_path.name}")
    print(f"\nTotal training time: {time.time() - t0:.1f}s")

    # Exit non-zero if any threshold failed
    if failed_metrics:
        print(f"\n❌ {len(failed_metrics)} metric(s) below threshold. Review model tuning.")
        sys.exit(1)
    else:
        print("\n✅ All quality thresholds met.")


if __name__ == "__main__":
    train_and_evaluate()
