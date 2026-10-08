# ArthaMind Z-Sentinel

> Real-Time AI for Critical Financial Decisions

## 1. Problem and timing

Critical transactions need an explainable decision before an intervention becomes too
late. Z-Sentinel evaluates an incoming event and pushes the completed decision to the
browser without refresh.

## 2. Solution and architecture

**IMPLEMENTED:** bounded simulation, transaction-time features, XGBoost probability,
independent Isolation Forest anomaly score, deterministic rules/fusion/policy,
explanations, JWT/RBAC manager review, WebSocket delivery, audit events, impact comparison
and reasoned human overrides.

**SIMULATED:** transactions and training data are synthetic.

**PLANNED / REQUIRES IBM Z ENVIRONMENT:** a live IBM ML for z/OS scoring endpoint.

```
transaction → transactions:incoming → features → ML + anomaly + rules
→ risk assessment → deterministic policy → explanation/audit
→ transactions:scored + decisions:completed → WebSocket → Decision Centre
```

PostgreSQL is the persistence target and Redis Streams the event transport. Docker mode
sets `REQUIRE_REAL_INFRASTRUCTURE=true` so Redis cannot silently fall back.

## 3. ML, decisioning and explainability

Default fusion is `0.50 × ML + 0.30 × anomaly + 0.20 × rules`. Inputs are available at
transaction time; raw device fingerprints are not model or UI inputs. The LLM cannot
change a score, confidence, threshold, or decision. The deterministic explanation works
without Gemini.

## 4. Security and human review

Manager APIs/WebSocket require signed JWTs and manager RBAC. Reviews record AI decision,
human decision, reviewer, reason, timestamp, and correlation ID. Impact comparisons show
friction and workload assumptions only—never guaranteed savings.

## 5. IBM Z integration

`LocalInferenceProvider` is functional. `IBMZInferenceProvider` validates configuration
and fails closed; it does not fabricate IBM Z results. A verified IBM ML for z/OS endpoint
would use the same features and preserve correlation ID, model version, timestamp, latency,
and inference mode. No IBM Z deployment is claimed.

## 6. Dataset methodology

See [backend/models/MODEL_METHODOLOGY.md](backend/models/MODEL_METHODOLOGY.md). Perfect
scores from the original synthetic generator are not fraud-performance claims. The
mixed-signal challenge result is deliberately visible: precision **1.000**, recall
**0.026**, F1 **0.051**, ROC-AUC **0.513**. Real deployment needs temporally split,
customer-separated governed data and monitoring.

## 7. Demo

1. Choose Manager and open Z-Sentinel Decision Centre.
2. Start the bounded demo: NORMAL → APPROVE, then MULTI_SIGNAL_HIGH_RISK → CRITICAL → HOLD.
3. Inspect signals and explanation; simulate alternatives.
4. Confirm HOLD or override to STEP-UP with a required reason; inspect the audit trail.

## 8. Limitations and setup

- Docker/Redis/PostgreSQL validation still requires a machine with Docker installed.
- Synthetic metrics are not production metrics.
- IBM Z connectivity requires a licensed, reachable environment.

```bash
cp .env.example .env
docker compose up --build
```

Run local checks with `cd backend && python -m pytest -o addopts='' tests/unit -q`,
`python -m scripts.evaluate_models`, `npm run build:frontend`, and `npm run lint:frontend`.
