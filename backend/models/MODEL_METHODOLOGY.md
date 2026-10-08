# Z-Sentinel local-model methodology

The local artefact is a demonstration model, not a production banking fraud model.
It combines XGBoost fraud probability, independent Isolation Forest anomaly score,
and deterministic behavioural rules. All inputs are available at transaction time;
no raw identifiers or future transaction outcomes are model features.

## Dataset provenance and generation

`scripts/train_credible_models.py` is the active, reproducible local corpus generator
(seed `20261008`). It creates 200 persistent synthetic customer profiles with amount
baselines, purchase frequency, common merchants, devices, locations, and preferred
hours. Each profile emits an ordered transaction sequence. Historical average, one-hour
velocity, daily count, and time-since-last-event are calculated from *preceding events
only*. No customer identifier, raw device identifier, coordinates, or future outcome is
a model feature.

Normal activity can include high amounts, new merchants, unusual hours, and moderate
location novelty. A latent compromised session probabilistically combines weak signals;
fraud may still have ordinary amounts or familiar behaviour. Labels are sampled from the
combination probability rather than assigned from a single extreme feature.

## Splits, leakage checks, and challenge design

Customers `0–149` train, `150–174` validate, and `175–199` test: there is no customer
overlap. A separate chronological test holds out the last 16 of 80 ordered events for
each training customer; its model trains only on the preceding 64 events. Features at
time T only use history before T, preventing future-information leakage. Seeds are fixed;
there are no duplicated rows across generated customer groups.
The challenge group uses unseen customers and filters out dominant amount/velocity cases,
testing moderate amount/device/location/time combinations rather than memorised extremes.

Final v2.0.0-profiled metrics at threshold 0.35:

| Split | Precision | Recall | F1 | ROC-AUC | PR-AUC |
|---|---:|---:|---:|---:|---:|
| Chronological last-events | 0.2426 | 0.7416 | 0.3657 | 0.8988 | 0.5664 |
| Validation customers | 0.2337 | 0.7907 | 0.3607 | 0.8936 | 0.5103 |
| Test customers | 0.1859 | 0.7463 | 0.2976 | 0.8707 | 0.4461 |
| Weak-combination challenge | 0.1418 | 0.6094 | 0.2301 | 0.8099 | 0.2334 |

These results improve compositional recall over the old challenge evaluation but precision
remains low. They are synthetic engineering metrics, not production banking performance.
The legacy `train_models.py` corpus remains available only for comparison; do not use its
perfect held-out values as evidence of generalisation. Production requires governed,
temporally split, customer-separated financial data and ongoing drift monitoring.

## Optional IBM synthetic-data import

`scripts/import_ibm_synthetic.py` validates a user-supplied, licensed local CSV with
`amount`, `timestamp`, and `is_fraud` columns. It does not download data, store secrets,
or commit any external dataset. Dataset-specific mapping and governance review remain
required before it can replace the local corpus.

IBM Z remains an integration boundary: a verified IBM ML for z/OS scoring service
would receive the same feature vector and return probability, anomaly score, model
version, correlation ID and latency. No IBM Z deployment is claimed by this project.
