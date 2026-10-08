"""Train Z-Sentinel demo artefacts on reproducible, profile-based synthetic sequences.

This is deliberately a *simulation methodology*, not a source of banking-performance claims.
Every behavioural value is calculated from events preceding the current transaction.
"""
import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import average_precision_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

SEED = 20261008; VERSION = "2.0.0-profiled"; ROOT = Path(__file__).parent.parent; MODELS = ROOT / "models"
NAMES = ["transaction_amount", "historical_amount_baseline", "amount_deviation_ratio", "transaction_velocity_1h", "transaction_velocity_24h", "merchant_category_code", "is_new_merchant", "is_new_device", "is_new_location", "hour_of_day", "days_since_last_transaction", "balance_utilisation_ratio"]

def sigmoid(x: float) -> float: return 1 / (1 + np.exp(-x))

def generate(customers: range, seed: int) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Returns ordered features, labels and timestamps for customer-disjoint profiles."""
    rng = np.random.default_rng(seed); rows=[]; labels=[]; times=[]; entity=[]
    for customer in customers:
        baseline = rng.uniform(90, 600); frequency = rng.uniform(.4, 2.5); home_hour = int(rng.integers(8, 19))
        merchants = rng.integers(5000, 5999, 5); devices = 2; locations = 2; history=[]; current=customer * 10_000
        for _ in range(80):
            current += int(rng.exponential(24 / frequency) * 3600)
            past = [x for x in history if x[0] < current]; amounts=[x[1] for x in past[-20:]]
            historical = float(np.mean(amounts)) if amounts else baseline
            one_hour=sum(current-x[0] <= 3600 for x in past); day=sum(current-x[0] <= 86400 for x in past)
            new_merchant=bool(rng.random() < .12); new_device=bool(rng.random() < .05); new_location=bool(rng.random() < .07)
            unusual_time=bool(rng.random() < .12); hour=(home_hour + int(rng.normal(0, 3))) % 24 if not unusual_time else int(rng.choice([1, 2, 3, 4, 23]))
            # Fraud is probabilistic and compositional: no feature alone determines the label.
            # A latent compromised session increases several weak signals together while
            # retaining substantial normal overlap for every individual signal.
            compromised = rng.random() < .08
            if compromised:
                new_device = new_device or rng.random() < .65
                new_location = new_location or rng.random() < .55
                new_merchant = new_merchant or rng.random() < .55
                one_hour += int(rng.integers(1, 5))
            signal_count = int(new_merchant) + int(new_device) + int(new_location) + int(one_hour >= 4) + int(unusual_time)
            # Each isolated signal remains common in legitimate activity; risk rises chiefly
            # when several independently weak signals co-occur.
            risk = -5.0 + 0.20 * signal_count + (0.95 * signal_count if signal_count >= 2 else 0) + .18 * min(one_hour, 6)
            amount = float(max(5, rng.lognormal(np.log(baseline), .55)))
            if compromised and signal_count >= 3 and rng.random() < .45:
                amount *= float(rng.uniform(3, 12))
            risk += .45 * min(amount / max(historical, 1), 4)
            fraud = rng.random() < sigmoid(risk)
            # Fraud sometimes has ordinary values; normal activity sometimes has strong individual signals.
            if fraud and rng.random() < .55:
                new_device = new_device or rng.random() < .55; new_location = new_location or rng.random() < .45
            merchant = int(rng.choice(merchants)) if not new_merchant else int(rng.integers(5000, 6200))
            days_since=(current-past[-1][0])/86400 if past else 7
            rows.append([amount, historical, min(amount/historical, 20), one_hour, day, merchant, int(new_merchant), int(new_device), int(new_location), hour, max(days_since,.001), min(amount/(baseline*20),.999)])
            labels.append(int(fraud)); times.append(current); entity.append(customer); history.append((current, amount))
    return np.asarray(rows), np.asarray(labels), np.asarray(times), np.asarray(entity)

def score(y: np.ndarray, p: np.ndarray) -> dict[str, float]:
    q=(p >= .35).astype(int)
    return {"precision": round(float(precision_score(y,q,zero_division=0)),4), "recall": round(float(recall_score(y,q,zero_division=0)),4), "f1": round(float(f1_score(y,q,zero_division=0)),4), "roc_auc": round(float(roc_auc_score(y,p)),4), "pr_auc": round(float(average_precision_score(y,p)),4)}

def main() -> None:
    # 0-149 train, 150-174 validation, 175-199 test: entity separation is absolute.
    X_train,y_train,t_train,c_train=generate(range(150), SEED); X_val,y_val,t_val,_=generate(range(150,175),SEED+1); X_test,y_test,t_test,_=generate(range(175,200),SEED+2)
    # Chronological validation/test use latter events within each entity; training never uses future values.
    scaler=StandardScaler().fit(X_train); train=scaler.transform(X_train); val=scaler.transform(X_val); test=scaler.transform(X_test)
    model=XGBClassifier(n_estimators=180,max_depth=4,learning_rate=.06,subsample=.85,colsample_bytree=.85,scale_pos_weight=(y_train==0).sum()/max((y_train==1).sum(),1),random_state=SEED,eval_metric="logloss",verbosity=0).fit(train,y_train)
    # Platt calibrator fits validation predictions only; test and challenge data remain untouched.
    calibrator=LogisticRegression(random_state=SEED).fit(model.predict_proba(val)[:,1].reshape(-1,1), y_val)
    anomaly=IsolationForest(n_estimators=150,contamination=max(y_train.mean(),.01),random_state=SEED).fit(train[y_train==0])
    # Chronological holdout: for each training customer, last 20% of its ordered sequence.
    chronological=np.zeros(len(c_train), dtype=bool)
    for customer in np.unique(c_train):
        indices=np.flatnonzero(c_train == customer); chronological[indices[-16:]]=True
    chrono_model=XGBClassifier(n_estimators=180,max_depth=4,learning_rate=.06,subsample=.85,colsample_bytree=.85,scale_pos_weight=(y_train[~chronological]==0).sum()/max((y_train[~chronological]==1).sum(),1),random_state=SEED,eval_metric="logloss",verbosity=0).fit(train[~chronological],y_train[~chronological])
    # Challenge cases are generated from unseen customers with only weak combinations (no dominant amount).
    X_c,y_c,_,_=generate(range(200,230),SEED+3); mask=(X_c[:,2] < 3.5) & (X_c[:,3] < 5); X_c,y_c=X_c[mask],y_c[mask]
    report={"chronological_test":score(y_train[chronological],chrono_model.predict_proba(train[chronological])[:,1]),"validation_customer_separated":score(y_val,model.predict_proba(val)[:,1]),"test_customer_separated":score(y_test,model.predict_proba(test)[:,1]),"challenge_weak_combinations":score(y_c,model.predict_proba(scaler.transform(X_c))[:,1]),"temporal_protocol":"Each profile computes baseline, counts and recency strictly from preceding events. Customer groups are disjoint.","seed":SEED}
    MODELS.mkdir(exist_ok=True); joblib.dump(model,MODELS/f"xgboost_fraud_v{VERSION}.joblib"); joblib.dump(anomaly,MODELS/f"isolation_forest_v{VERSION}.joblib"); joblib.dump(scaler,MODELS/f"feature_scaler_v{VERSION}.joblib"); joblib.dump(calibrator,MODELS/f"confidence_platt_v{VERSION}.joblib")
    meta={"model_version":VERSION,"training_date":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"feature_names":NAMES,"xgb_artefact":f"xgboost_fraud_v{VERSION}.joblib","iso_artefact":f"isolation_forest_v{VERSION}.joblib","scaler_artefact":f"feature_scaler_v{VERSION}.joblib","confidence_calibration_version":"platt-validation-v1","confidence_calibrator_artefact":f"confidence_platt_v{VERSION}.joblib","evaluation":report}
    (MODELS/f"model_metadata_v{VERSION}.json").write_text(json.dumps(meta,indent=2)); print(json.dumps(report,indent=2))
if __name__ == "__main__": main()
