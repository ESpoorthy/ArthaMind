# Z-Sentinel local model card

## Purpose and intended use

The `2.0.0-profiled` local model supports an educational, deterministic competition demo.
It estimates a synthetic fraud signal alongside independent anomaly detection and rules.
It is not for production banking decisions, customer profiling, or automated financial action.

## Data, features and splits

Training data is generated locally from persistent synthetic customer profiles. It includes
amount deviation, historical transaction counts, merchant/device/location novelty, hour,
recency and balance-utilisation proxy. No customer ID, raw device identifier, or raw
location coordinate is a feature. Features only use events preceding the current event.

Customer groups are disjoint: 0–149 train, 150–174 validation, 175–199 test. The final
16 of 80 events per training customer are also a chronological holdout. The challenge set
uses unseen customers and weak-signal combinations.

## Calibration and policy

Platt scaling (`platt-validation-v1`) is fitted only on validation predictions and stored
with the artefact. It calibrates model probability; displayed confidence is calibrated
model certainty, not a guarantee of fraud or safety. `risk-policy-v1` uses frozen,
configured fusion and decision thresholds. Those thresholds express friction/review-load
trade-offs and are not universally optimal.

## Evaluation

| Split | Precision | Recall | F1 | ROC-AUC | PR-AUC |
|---|---:|---:|---:|---:|---:|
| Chronological | .2426 | .7416 | .3657 | .8988 | .5664 |
| Customer-separated test | .1859 | .7463 | .2976 | .8707 | .4461 |
| Weak-combination challenge | .1418 | .6094 | .2301 | .8099 | .2334 |

Synthetic results do not establish production banking fraud performance. Expected failure
modes include low precision, distribution shift, and unseen behavioral patterns.

## Reproducibility

Run `cd backend && python -m scripts.train_credible_models`. The fixed seed is `20261008`.
