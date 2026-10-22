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

## 8. ArthaMind Voice Concierge (Alexa+-style simulation)

The customer portal now includes **ArthaMind Voice Concierge**, a text-based conversational
experience for asking why a synthetic transaction was approved or held. It runs one of two
synthetic scenarios through the existing Z-Sentinel inference, risk fusion, deterministic
policy, and explanation pipeline. The browser receives the actual transaction, assessment,
and policy decision; explanation requests go to a customer-authenticated, read-only API and
are grounded in those saved in-memory assessment fields. If the backend is unavailable or
the transaction cannot be found, the UI shows an error instead of inventing an answer.

The companion allows only the signed-in demo customer to create the normal and multi-signal
scenarios, and it checks transaction ownership before returning an explanation or recording
a next step. Additional verification and support-case actions require confirmation and are
recorded as `SIMULATED_ONLY`; they do not contact a bank or change the decision. Manager-only
simulator controls, overrides, reasons, and audit behavior remain in the Z-Sentinel Decision
Centre. The local inference model output is distinct from the deterministic policy decision;
the natural-language explanation is deterministic and cannot alter either. Assessment records
use Z-Sentinel's existing best-effort PostgreSQL persistence when configured and available.
In the local no-service fallback, runtime results, transaction ownership, and simulated
next-step records live in process memory and are lost on restart.
The trained model metadata is checked in, but its `.joblib` weight files are git-ignored and
not present in a fresh checkout. When a complete artifact bundle is unavailable, the
provider uses the existing seeded synthetic bootstrap model and reports `bootstrap-rf-1`;
the Concierge shows that model version in its assessment card.

This is an **Alexa+-style simulation for the Amazon Developer Hackathon**, not a direct Alexa+
device or partner-preview integration. No Alexa SDK, Amazon production service, or live
banking integration is implemented. Z-Sentinel's IBM ML for z/OS adapter remains an
unimplemented contract boundary. The existing broader application also includes other
simulated banking portal experiences.

## 9. Setup and run

Requirements: Node.js 20+ and npm 9+; Python 3.11; optionally Docker with Compose for the
full PostgreSQL/Redis/Chroma stack. The concise text companion works locally without those
services: Z-Sentinel uses its local inference provider and in-process event fallback. Gemini
is optional for the companion and no API key is needed for its deterministic explanations.

From the repository root:

```bash
cp .env.example .env
npm ci --legacy-peer-deps
cd backend
python3.11 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
```

In terminal 1, load the root environment and start the API:

```bash
cd backend
set -a
. ../.env
set +a
. .venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

In terminal 2, from the repository root:

```bash
npm run dev:frontend
```

Open `http://localhost:5173`, choose **Customer Portal**, then choose **Voice Concierge** in
the customer navigation. The demo login uses the simulator's configured demo password
(`DEMO_CUSTOMER_PASSWORD`, default `Demo@12345`). `.env` is ignored by Git. Change placeholder
JWT/encryption/database credentials before using any network-accessible or production-like
deployment. To run the full infrastructure setup instead, configure the values in `.env` and
use `docker compose up --build`; Docker mode requires healthy PostgreSQL, Redis, and ChromaDB.

## 10. Tests and checks

```bash
cd backend
set -a
. ../.env.test.example
set +a
flake8 src/ tests/ --max-line-length=100 --extend-ignore=E203,W503
black --check src/ tests/
isort --check-only src/ tests/
mypy src/ --ignore-missing-imports
python -m pytest tests/ -v --no-header -x
cd ..
npm run lint:frontend
npx tsc --noEmit -p frontend/tsconfig.json
npm run test --workspace=frontend -- --run --coverage
npm run build:frontend
npm run build:shared
```

Use the workflow-defined commands in `.github/workflows/ci.yml` for CI parity; its frontend
test command runs from `frontend/` as `npx vitest run --coverage`. Integration tests that
need PostgreSQL/Redis and Docker image builds require those services/tools to be available.

## 11. Limitations and setup

- Docker/Redis/PostgreSQL validation still requires a machine with Docker installed.
- Synthetic metrics are not production metrics.
- IBM Z connectivity requires a licensed, reachable environment.

See `docs/DEMO_SCRIPT.md` for the exact local demo sequence and `docs/AMAZON_HACKATHON_SUBMISSION.md`
for an accurately scoped submission draft and human-completion checklist.
