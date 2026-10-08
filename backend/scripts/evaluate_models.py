"""Reproducible, adversarial evaluation for the persisted Z-Sentinel local model.

This reports separate distribution, profile and challenge-set metrics.  It deliberately
does not promote synthetic results to production performance claims.
"""
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score

from scripts.train_models import FEATURE_NAMES, generate_synthetic_data

MODELS = Path(__file__).parent.parent / "models"

def metrics(y: np.ndarray, probability: np.ndarray) -> dict[str, float]:
    prediction = (probability >= 0.5).astype(int)
    return {"precision": float(precision_score(y, prediction, zero_division=0)), "recall": float(recall_score(y, prediction, zero_division=0)), "f1": float(f1_score(y, prediction, zero_division=0)), "roc_auc": float(roc_auc_score(y, probability))}

def main() -> None:
    meta = json.loads(next(MODELS.glob("model_metadata_v*.json")).read_text())
    model = joblib.load(MODELS / meta["xgb_artefact"]); scaler = joblib.load(MODELS / meta["scaler_artefact"])
    # Different seed: no row overlap with training, but same intentionally simplified generator.
    X, y = generate_synthetic_data(n_samples=20_000, seed=20261008)
    # Unseen profile slice is generated with a third independent seed; customer/profile IDs were
    # not present in training, so this is distributional rather than true entity-group validation.
    X_profile, y_profile = generate_synthetic_data(n_samples=10_000, seed=20261009)
    # Challenge examples have mixed and borderline signals, unlike the original disjoint classes.
    rng = np.random.default_rng(7); normal = rng.normal(0, 1, (500, 12)); fraud = rng.normal(0.8, 1.35, (500, 12)); fraud[:, 2] += 1.4; fraud[:, 3] += 1.5; fraud[:, 6:9] += .5
    X_challenge, y_challenge = np.vstack((normal, fraud)), np.r_[np.zeros(500), np.ones(500)]
    report = {"standard_held_out": metrics(y, model.predict_proba(scaler.transform(X))[:, 1]), "unseen_profile_seed": metrics(y_profile, model.predict_proba(scaler.transform(X_profile))[:, 1]), "challenge_set": metrics(y_challenge, model.predict_proba(scaler.transform(X_challenge))[:, 1]), "caveat": "All sets are synthetic. The original generator class-conditions features strongly; these are reproducible engineering checks, not production fraud metrics.", "feature_names": FEATURE_NAMES}
    print(json.dumps(report, indent=2))

if __name__ == "__main__": main()
