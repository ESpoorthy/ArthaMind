# Requirements Document

## Introduction

ArthaMind Z-Sentinel is the real-time fraud detection and risk decision engine for the ArthaMind AI Banking Simulator. It ingests transaction events, runs ML-powered inference, fuses risk signals, issues deterministic policy decisions, generates AI explanations, and streams live results to the Z-Sentinel Decision Centre frontend. The system is designed to work fully standalone using a local inference provider and to integrate with IBM ML for z/OS via an env-var toggle. All existing middleware, frontend portals, and infrastructure are preserved; this feature adds only new backend services, database tables, routes, and frontend components.

---

## Glossary

- **System**: The ArthaMind Z-Sentinel back-end service (FastAPI application)
- **Frontend**: The React 18 + TypeScript single-page application
- **Pipeline**: The end-to-end flow from transaction ingest through feature extraction, ML inference, risk fusion, policy decision, and explanation
- **FeatureExtractor**: The component that computes the 12-signal feature vector from a raw transaction payload
- **InferenceGateway**: The abstract interface that decouples the rest of the pipeline from the underlying inference provider
- **LocalInferenceProvider**: The default implementation of InferenceGateway that runs XGBoost and IsolationForest models in-process
- **IBMZInferenceProvider**: The optional implementation that calls an IBM ML for z/OS REST endpoint
- **RiskFusionEngine**: The component that combines ML probability, anomaly score, and deterministic rule signals into a single fused risk score
- **PolicyEngine**: The sole authority for the final APPROVE / STEP_UP_AUTH / HOLD decision, computed deterministically from the fused risk score
- **ExplanationLayer**: The component that produces a plain-language explanation using Gemini or a deterministic fallback
- **GeminiExplainer**: The LLM-powered explanation generator that calls Gemini 2.5 Flash
- **DeterministicExplainer**: The rule-based fallback explanation generator
- **DecisionImpactSimulator**: The component that estimates the financial and operational cost of each possible decision path
- **AuditService**: The append-only audit trail writer for both PostgreSQL and Redis Streams
- **BackgroundWorker**: The asyncio task that consumes `transactions:incoming` and runs the full Pipeline
- **WebSocketServer**: The server-side WebSocket handler at `WS /api/v1/sentinel/ws`
- **ZSentinelPage**: The top-level React page at `/sentinel`
- **TransactionStreamFeed**: The React component that renders the live WebSocket-fed transaction list
- **RiskAssessmentPanel**: The React component that renders the full risk assessment for a selected transaction
- **ContributingSignalsBar**: The pure CSS horizontal bar-chart component rendering per-signal contributions
- **DecisionActionBar**: The React component that allows authorised users to confirm or override the PolicyEngine decision
- **ImpactSimulatorModal**: The React modal that renders the three-column decision impact estimates
- **AICopilotPanel**: The React chat panel that calls the injection-guarded Gemini copilot endpoint
- **AuditTrailTable**: The paginated audit trail React table visible to managers
- **ScenarioLauncher**: The React component with six buttons for triggering deterministic demo scenarios
- **ModelHealthBadge**: The React component that displays the active model version and metrics
- **RiskAssessment**: The JSON record produced by the Pipeline for each processed transaction
- **RiskLevel**: One of LOW, MEDIUM, HIGH, or CRITICAL, derived from the fused risk score
- **Decision**: One of APPROVE, STEP_UP_AUTH, or HOLD, set exclusively by the PolicyEngine
- **JWT**: JSON Web Token used for authentication and RBAC
- **RBAC**: Role-based access control with roles: `customer`, `agent`, `manager`
- **Redis Streams**: The five Redis stream channels used for async inter-component messaging
- **Alembic**: The database migration tool managing all schema changes
- **Hypothesis**: The Python property-based testing library used for correctness properties

---

## Requirements

### Requirement 1: Transaction Simulation Endpoint

**User Story:** As a demo operator, I want to trigger named demo scenarios via a REST endpoint, so that I can showcase the fraud detection pipeline reproducibly during the hackathon.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/sentinel/simulate` with a valid `scenario` key and `customer_id`, THE System SHALL validate the JWT and accept the request only if the token is valid.
2. WHEN a valid simulate request is received, THE System SHALL look up the scenario configuration from the frozen `ScenarioConfig` dictionary in `scenarios.py` and construct the corresponding raw transaction payload.
3. WHEN the raw transaction payload is constructed, THE System SHALL publish it to the `transactions:incoming` Redis stream using `XADD` and return a JSON response containing the `transaction_id` and `status: "queued"` within 200 ms of receiving the request.
4. IF the `scenario` key in the request does not match one of the six valid scenario keys (`NORMAL_PURCHASE`, `HIGH_VALUE_OUTLIER`, `NEW_DEVICE`, `LOCATION_ANOMALY`, `VELOCITY_SPIKE`, `MULTI_SIGNAL`), THEN THE System SHALL return an HTTP 422 response with a descriptive error message.
5. WHEN a simulate request is received from an authenticated user who has exceeded 20 requests per minute, THE System SHALL return HTTP 429 and not enqueue the transaction.
6. THE System SHALL require a valid JWT for all requests to `/api/v1/sentinel/simulate`.

---

### Requirement 2: Background Worker — Pipeline Orchestration

**User Story:** As a system operator, I want the fraud detection pipeline to process transactions asynchronously, so that the API remains responsive while inference runs in the background.

#### Acceptance Criteria

1. WHEN the FastAPI application starts, THE BackgroundWorker SHALL be registered as an `asyncio.Task` within the application `lifespan` context.
2. WHILE the BackgroundWorker is running, THE BackgroundWorker SHALL consume messages from the `transactions:incoming` Redis stream using `XREAD BLOCK 1000` (non-polling, 1-second timeout).
3. WHEN a message is read from `transactions:incoming`, THE BackgroundWorker SHALL execute the following sequential steps: FeatureExtractor.extract → InferenceGateway.infer → RiskFusionEngine.fuse → PolicyEngine.decide → ExplanationLayer.explain → AuditService.write → Redis XADD to `transactions:scored`.
4. IF any step in the Pipeline raises an unhandled exception, THEN THE BackgroundWorker SHALL publish the raw message to the `transactions:failed` dead-letter stream and continue processing subsequent messages without crashing.
5. WHEN the Pipeline completes successfully and the risk level is HIGH or CRITICAL, THE BackgroundWorker SHALL additionally publish an alert event to the `risk:alerts` Redis stream.
6. THE BackgroundWorker SHALL process transactions sequentially in the demo configuration; the batch size SHALL be configurable via `WORKER_BATCH_SIZE` in Settings.

---

### Requirement 3: Feature Extraction

**User Story:** As a data scientist, I want the system to extract a consistent 12-signal feature vector from every transaction, so that the ML models receive well-formed inputs.

#### Acceptance Criteria

1. WHEN `FeatureExtractor.extract()` is called with a raw transaction and a `CustomerRiskProfile`, THE FeatureExtractor SHALL produce a list of exactly 12 float values in the fixed order: `transaction_amount`, `historical_amount_baseline`, `amount_deviation_ratio`, `transaction_velocity_1h`, `transaction_velocity_24h`, `merchant_category_code`, `is_new_merchant`, `is_new_device`, `is_new_location`, `hour_of_day`, `days_since_last_transaction`, `balance_utilisation_ratio`.
2. THE FeatureExtractor SHALL cap `amount_deviation_ratio` at 20.0 regardless of the raw ratio.
3. THE FeatureExtractor SHALL set `is_new_merchant`, `is_new_device`, and `is_new_location` as integer flags (0 or 1).
4. THE FeatureExtractor SHALL define a new location as one more than 100 km from any of the customer's typical locations.
5. THE FeatureExtractor SHALL complete feature extraction within 10 ms at p95 latency.
6. IF a `CustomerRiskProfile` does not exist for the given `customer_id`, THEN THE FeatureExtractor SHALL use zero-value defaults for all profile-derived signals and log a warning.

---

### Requirement 4: ML Inference Gateway

**User Story:** As a developer, I want all ML inference calls to go through a single abstract gateway, so that I can switch between local and IBM Z inference without changing the pipeline code.

#### Acceptance Criteria

1. THE InferenceGateway SHALL expose two abstract methods: `async infer(request: InferenceRequest) -> InferenceResponse` and `async health_check() -> dict`.
2. WHEN `INFERENCE_PROVIDER=local` is set (or the setting is absent), THE System SHALL instantiate `LocalInferenceProvider` as the active InferenceGateway implementation.
3. WHEN `INFERENCE_PROVIDER=ibmz` is set, THE System SHALL instantiate `IBMZInferenceProvider` as the active InferenceGateway implementation.
4. THE InferenceResponse SHALL always contain: `transaction_id`, `ml_probability ∈ [0.0, 1.0]`, `anomaly_score ∈ [0.0, 1.0]`, `model_version`, `inference_mode`, and `inference_latency_ms`.
5. WHEN `InferenceGateway.health_check()` is called, THE InferenceGateway SHALL return the active model version, inference mode, and a status indicator.

---

### Requirement 5: Local Inference Provider

**User Story:** As a demo runner, I want the system to perform ML inference entirely in-process without any external dependencies, so that the demo works on any machine.

#### Acceptance Criteria

1. WHEN the application starts with `INFERENCE_PROVIDER=local`, THE LocalInferenceProvider SHALL load the XGBoost and IsolationForest model artefacts from `backend/models/` using `joblib.load()`.
2. IF any model artefact file is missing at startup, THEN THE System SHALL raise a startup error with a descriptive message identifying the missing file and halt startup.
3. WHEN `LocalInferenceProvider.infer()` is called, THE LocalInferenceProvider SHALL run the XGBoost model to produce `ml_probability` and run the IsolationForest model to produce `anomaly_score`, both normalised to `[0.0, 1.0]`.
4. THE LocalInferenceProvider SHALL set `inference_mode = "LOCAL_DEMO"` on every InferenceResponse.
5. THE LocalInferenceProvider SHALL complete inference within 50 ms at p95 latency.
6. THE LocalInferenceProvider SHALL load artefacts once at startup and reuse the loaded models for all subsequent infer() calls without reloading from disk.

---

### Requirement 6: IBM Z Inference Provider

**User Story:** As an IBM Z integration architect, I want a documented, wired IBMZInferenceProvider that calls the z/OS ML scoring endpoint, so that the system can demonstrate real IBM Z inference when a live z/OS environment is available.

#### Acceptance Criteria

1. WHEN `INFERENCE_PROVIDER=ibmz` is set and all required IBM Z env vars are present (`IBM_Z_HOST`, `IBM_Z_PORT`, `IBM_Z_USERNAME`, `IBM_Z_PASSWORD`, `IBM_Z_MODEL_NAME`), THE IBMZInferenceProvider SHALL send a POST request to `https://{IBM_Z_HOST}/zosmf/analytics/v1/score` with the 12-signal feature vector as the JSON request body.
2. THE IBMZInferenceProvider request body SHALL conform to the documented JSON contract: `{"model_name": ..., "model_version": ..., "inputs": [{"name": "feature_vector", "values": [...]}]}`.
3. WHEN the z/OS endpoint returns a successful response, THE IBMZInferenceProvider SHALL parse `predictions[0].ml_probability` and `predictions[0].anomaly_score` and return them in an InferenceResponse with `inference_mode = "IBM_Z"`.
4. IF the IBM Z endpoint returns an error or times out, THEN THE IBMZInferenceProvider SHALL raise an InferenceError with the HTTP status code and a descriptive message, without exposing IBM Z credentials in the error.
5. WHEN `INFERENCE_PROVIDER=ibmz` is set but one or more required IBM Z env vars are absent, THE System SHALL raise a startup configuration error naming the missing variables and halt startup.
6. THE IBMZInferenceProvider SHALL never log or include in any response the values of `IBM_Z_PASSWORD` or any other credential env vars.

---

### Requirement 7: ML Model Training Pipeline

**User Story:** As a data scientist, I want a reproducible training script that generates synthetic data and trains the XGBoost and IsolationForest models, so that the model artefacts are always available for the demo.

#### Acceptance Criteria

1. WHEN `backend/scripts/train_models.py` is executed, THE System SHALL generate 100,000 synthetic transactions deterministically using `numpy.random.default_rng(seed=42)` with a 2% fraud rate.
2. WHEN training completes, THE System SHALL save four artefacts to `backend/models/`: `xgboost_fraud_v1.0.0.joblib`, `isolation_forest_v1.0.0.joblib`, `feature_scaler_v1.0.0.joblib`, and `model_metadata_v1.0.0.json`.
3. THE trained XGBoost model SHALL achieve at least the following metrics on the held-out 20% test set: Precision ≥ 0.80, Recall ≥ 0.70, F1 Score ≥ 0.75, ROC-AUC ≥ 0.90.
4. WHEN training completes, THE System SHALL persist the model metadata (version, training date, sample count, precision, recall, F1, ROC-AUC, feature names) as `model_metadata_v1.0.0.json` and insert a corresponding row into the `ml_models` table with `is_active=true`.
5. THE training script SHALL use an 80/20 stratified train/test split.
6. IF the trained model fails to meet any minimum performance threshold, THEN THE training script SHALL print a warning for each failing metric and exit with a non-zero exit code.

---

### Requirement 8: Risk Fusion Engine

**User Story:** As a risk analyst, I want the system to combine ML probability, anomaly score, and deterministic rule signals into a single fused risk score, so that the final score reflects all available evidence.

#### Acceptance Criteria

1. WHEN `RiskFusionEngine.fuse()` is called with `ml_probability`, `anomaly_score`, and the feature vector, THE RiskFusionEngine SHALL compute `fused_risk_score = (ml_probability × weight_ml) + (anomaly_score × weight_anomaly) + (rule_signal_boost × weight_rules)`.
2. THE fused_risk_score SHALL always be in the range `[0.0, 1.0]`.
3. THE RiskFusionEngine SHALL evaluate the following deterministic rules and apply the corresponding boost: `VELOCITY_1H` (+0.20) when `transaction_velocity_1h > 5`; `HIGH_AMOUNT_OUTLIER` (+0.30) when `amount_deviation_ratio > 10.0`; `NEW_DEVICE_AND_LOCATION` (+0.20) when `is_new_device == 1 AND is_new_location == 1`; `MODERATE_AMOUNT_OUTLIER` (+0.15) when `amount_deviation_ratio > 3.0 AND ≤ 10.0`.
4. THE rule_signal_boost SHALL be the sum of all triggered rules, capped at 1.0 before the weight is applied.
5. THE RiskFusionEngine SHALL map the fused_risk_score to a RiskLevel: `[0.0, 0.30)` → LOW; `[0.30, 0.60)` → MEDIUM; `[0.60, 0.80)` → HIGH; `[0.80, 1.0]` → CRITICAL.
6. THE RiskFusionEngine SHALL produce a `contributing_signals` list where each entry contains: `signal` name, `value`, `weight`, and `contribution` (value × weight).
7. THE RiskFusionEngine weights SHALL be read from Settings (`RISK_WEIGHT_ML`, `RISK_WEIGHT_ANOMALY`, `RISK_WEIGHT_RULES`); the default weights SHALL be 0.50, 0.30, and 0.20 respectively.
8. WHEN the application starts, THE System SHALL validate that `weight_ml + weight_anomaly + weight_rules == 1.0` and raise a startup configuration error if the invariant is violated.
9. THE RiskFusionEngine SHALL complete in under 5 ms at p95 latency.

---

### Requirement 9: Policy Engine (Decision Engine)

**User Story:** As a compliance officer, I want the final transaction decision to be computed exclusively by a deterministic rule engine, so that no AI component can alter the decision outcome.

#### Acceptance Criteria

1. WHEN `PolicyEngine.decide()` is called with a fused_risk_score and risk_level, THE PolicyEngine SHALL return APPROVE when `fused_risk_score < 0.30`.
2. WHEN `PolicyEngine.decide()` is called with `fused_risk_score ∈ [0.30, 0.60)`, THE PolicyEngine SHALL return STEP_UP_AUTH.
3. WHEN `PolicyEngine.decide()` is called with `fused_risk_score ∈ [0.60, 0.80)`, THE PolicyEngine SHALL return HOLD.
4. WHEN `PolicyEngine.decide()` is called and `risk_level == CRITICAL` (score ≥ 0.80), THE PolicyEngine SHALL return HOLD regardless of any other condition.
5. THE PolicyEngine SHALL be the sole authority for setting the `decision` field on a RiskAssessment; no other component, including the ExplanationLayer or any LLM output, SHALL set or modify this field.
6. THE PolicyEngine decision thresholds SHALL be configurable via Settings (`DECISION_LOW_THRESHOLD=0.30`, `DECISION_MEDIUM_THRESHOLD=0.60`, `DECISION_HIGH_THRESHOLD=0.80`).
7. THE PolicyEngine SHALL complete a decision in under 5 ms at p95 latency.

---

### Requirement 10: Explanation Layer

**User Story:** As a fraud analyst, I want every risk assessment to include a plain-language explanation of why the transaction was flagged, so that I can quickly understand the reasoning without interpreting raw scores.

#### Acceptance Criteria

1. WHEN `ExplanationLayer.explain()` is called, THE ExplanationLayer SHALL attempt to generate an explanation using the GeminiExplainer, and fall back to the DeterministicExplainer if Gemini is unavailable or the response fails validation.
2. WHEN the GeminiExplainer is invoked, THE GeminiExplainer SHALL construct a structured prompt that interpolates transaction data as JSON fields, not raw user text, to resist prompt injection.
3. THE GeminiExplainer prompt SHALL instruct the model that it MUST NOT suggest or modify risk scores, recommend approval or rejection, make policy decisions, or output executable code or JSON structures.
4. WHEN a Gemini response is received, THE ExplanationLayer SHALL validate the response and reject it — falling back to the DeterministicExplainer — if the response contains any of the following: a numeric risk score pattern (e.g. `risk_score: X.XX`), approval or override directives, or any executable code.
5. WHEN `EXPLANATION_MODE=deterministic` is set, THE System SHALL always use the DeterministicExplainer and never call the Gemini API.
6. IF the Gemini API key is absent or rate-limited, THEN THE ExplanationLayer SHALL use the DeterministicExplainer without raising an unhandled error.
7. THE DeterministicExplainer SHALL produce a non-empty explanation string that references the `risk_level`, `fused_risk_score`, and at least the top contributing signal.
8. THE ExplanationLayer SHALL complete within 3000 ms at p95 (including LLM call); the explanation step SHALL be non-blocking and SHALL NOT delay the `transactions:scored` Redis publish.

---

### Requirement 11: Decision Impact Simulator

**User Story:** As a fraud reviewer, I want to see the estimated financial and operational cost of each possible decision path, so that I can make an informed override decision.

#### Acceptance Criteria

1. WHEN `GET /api/v1/sentinel/transactions/{id}/impact-simulation` is called with a valid JWT, THE DecisionImpactSimulator SHALL return a `DecisionImpactResult` containing: `estimated_loss_if_approve`, `estimated_friction_if_step_up`, `estimated_fp_cost_if_hold`, `confidence_in_estimates`, `assumptions`, and `disclaimer`.
2. THE DecisionImpactSimulator SHALL compute `estimated_loss_if_approve` as `fraud_probability × transaction_amount × 1.2` (chargeback multiplier).
3. THE DecisionImpactSimulator SHALL compute `estimated_friction_if_step_up` using the configured step-up friction cost (default $1.00 per event).
4. THE DecisionImpactSimulator SHALL compute `estimated_fp_cost_if_hold` as `(1 - fraud_probability) × customer_friction_value` (default $5.00).
5. THE DecisionImpactSimulator SHALL include the following disclaimer verbatim in every response: "These are estimates based on statistical models and configured parameters, not actuals. Past fraud patterns are used as proxies — individual results vary."
6. THE DecisionImpactSimulator SHALL include the full assumptions list in every response, including the chargeback multiplier, step-up friction cost, and customer friction value currently in effect.

---

### Requirement 12: Human Override Workflow

**User Story:** As a fraud agent, I want to override the system's decision on a flagged transaction with a mandatory reason, so that my judgment is recorded and auditable.

#### Acceptance Criteria

1. WHEN `POST /api/v1/sentinel/transactions/{id}/override` is called with a valid JWT from a user with role `agent` or `manager`, THE System SHALL create a row in the `decision_overrides` table containing the `risk_assessment_id`, `original_decision`, `override_decision`, `reviewer_id`, and `override_reason`.
2. THE System SHALL never mutate the `decision` field on an existing `risk_assessments` row; the original decision SHALL be preserved immutably.
3. IF the override request does not include an `override_reason` string, THEN THE System SHALL return HTTP 422.
4. IF the override request is made by a user with role `customer`, THEN THE System SHALL return HTTP 403 without processing the override.
5. WHEN the `decision` being overridden is for a CRITICAL risk_level transaction, THE System SHALL require the requesting user to have role `manager`; a role of `agent` SHALL result in HTTP 403.
6. WHEN an override is successfully recorded, THE System SHALL publish an event to both the `decisions:completed` and `audit:events` Redis streams.

---

### Requirement 13: Audit Trail

**User Story:** As a compliance manager, I want every system action recorded in an append-only audit trail, so that I can reconstruct the full history of any transaction decision.

#### Acceptance Criteria

1. THE AuditService SHALL write an audit event to the `audit_events` PostgreSQL table for each of the following: a transaction being scored, a decision override being submitted, a CRITICAL alert being raised, and an auth event (login, logout, token refresh).
2. THE `audit_events` table SHALL be append-only: THE System SHALL never issue UPDATE or DELETE statements against it at the application DB role level.
3. WHEN an audit event is written to PostgreSQL, THE AuditService SHALL also publish the event payload to the `audit:events` Redis stream via `XADD`.
4. THE audit event record SHALL contain: `event_type`, `entity_id`, `entity_type`, `actor_id`, `actor_role`, `payload` (JSONB), and `created_at`.
5. THE AuditService SHALL not log the `device_fingerprint`, `location_lat`, or `location_lon` fields at INFO log level or above.

---

### Requirement 14: Redis Event Streaming

**User Story:** As a system architect, I want all inter-component events to flow through named Redis streams, so that components are decoupled and the pipeline is observable.

#### Acceptance Criteria

1. THE System SHALL maintain exactly five Redis stream channels: `transactions:incoming`, `transactions:scored`, `risk:alerts`, `decisions:completed`, and `audit:events`.
2. THE System SHALL use `XADD` to publish to Redis streams and `XREAD BLOCK` to consume from them.
3. WHEN a transaction is published to `transactions:incoming`, THE BackgroundWorker SHALL be the sole consumer of that stream.
4. WHEN a scored assessment is published to `transactions:scored`, THE WebSocketServer SHALL consume it and broadcast to all connected WebSocket clients.
5. WHEN a Pipeline error occurs, THE BackgroundWorker SHALL publish the failed message to the `transactions:failed` dead-letter stream.
6. THE `risk:alerts` stream SHALL only receive events for transactions with risk_level HIGH or CRITICAL.

---

### Requirement 15: WebSocket Real-Time Updates

**User Story:** As a sentinel operator, I want the Decision Centre to receive live risk assessment results without polling, so that I can monitor the transaction feed in real time.

#### Acceptance Criteria

1. THE WebSocketServer SHALL expose a WebSocket endpoint at `WS /api/v1/sentinel/ws`.
2. WHEN a client connects to the WebSocket endpoint, THE WebSocketServer SHALL authenticate the connection by validating the JWT provided in the `?token=<access_token>` query parameter and reject unauthenticated connections with a 4001 close code.
3. WHEN a new entry is consumed from the `transactions:scored` Redis stream, THE WebSocketServer SHALL broadcast a `RiskAssessmentEvent` JSON message to all currently connected authenticated clients.
4. THE RiskAssessmentEvent message SHALL contain: `event_type`, `transaction_id`, `risk_level`, `risk_score`, `decision`, and `timestamp`.
5. THE WebSocketServer SHALL deliver the WebSocket push within 500 ms of the transaction being ingested to `transactions:incoming`.
6. IF a WebSocket client disconnects, THEN THE WebSocketServer SHALL remove that client from the broadcast list without affecting other connected clients.

---

### Requirement 16: PostgreSQL Schema and Migrations

**User Story:** As a backend developer, I want all new database tables created via Alembic migrations, so that schema changes are versioned and reproducible.

#### Acceptance Criteria

1. THE System SHALL create Alembic migrations for all six new tables: `transactions`, `risk_assessments`, `decision_overrides`, `audit_events`, `ml_models`, and `customer_risk_profiles`.
2. THE `risk_assessments` table SHALL have a CHECK constraint ensuring `risk_score >= 0.0 AND risk_score <= 1.0`.
3. THE `risk_assessments` table SHALL have foreign key references to `transactions.id`.
4. THE `decision_overrides` table SHALL have a NOT NULL constraint on `override_reason`.
5. THE System SHALL create the indexes defined in Section 10 of the design on all new tables.
6. THE migrations SHALL be additive — no existing tables SHALL be modified or dropped.

---

### Requirement 17: JWT Authentication Routes

**User Story:** As a user, I want to log in and receive a JWT so that I can access all protected sentinel routes.

#### Acceptance Criteria

1. WHEN `POST /api/v1/auth/login` is called with valid credentials, THE System SHALL return an `access_token`, `refresh_token`, and `user` object containing `user_id`, `email`, and `role`.
2. WHEN `POST /api/v1/auth/refresh` is called with a valid `refresh_token`, THE System SHALL return a new `access_token`.
3. WHEN `POST /api/v1/auth/logout` is called with a valid JWT, THE System SHALL invalidate the session and return HTTP 204.
4. WHEN `GET /api/v1/auth/me` is called with a valid JWT, THE System SHALL return the authenticated user's `user_id`, `email`, and `role`.
5. IF a request to any `/api/v1/sentinel/` route is made without a valid JWT, THEN THE System SHALL return HTTP 401.
6. THE System SHALL encode the user's `role` in the JWT claims and verify it server-side on every protected request before executing any business logic.

---

### Requirement 18: Role-Based Access Control (RBAC)

**User Story:** As a security engineer, I want endpoints to enforce role-based access, so that customers cannot perform agent or manager actions.

#### Acceptance Criteria

1. THE System SHALL enforce three roles: `customer`, `agent`, and `manager`.
2. WHEN a request to `POST /api/v1/sentinel/transactions/{id}/override` is made by a user with role `customer`, THE System SHALL return HTTP 403 without processing the request.
3. WHEN a request to `GET /api/v1/sentinel/metrics` is made by a user with role other than `manager`, THE System SHALL return HTTP 403.
4. WHEN a request to `GET /api/v1/sentinel/audit` is made by a user with role other than `manager`, THE System SHALL return HTTP 403.
5. THE RBAC check SHALL be applied via a FastAPI dependency (`require_role`) before any business logic executes on protected routes.
6. WHEN a CRITICAL-risk override is attempted by a user with role `agent`, THE System SHALL return HTTP 403.

---

### Requirement 19: Sentinel REST API

**User Story:** As a frontend developer, I want a complete set of REST endpoints for the Z-Sentinel Decision Centre, so that all UI components have the data they need.

#### Acceptance Criteria

1. THE System SHALL expose `GET /api/v1/sentinel/transactions` returning a paginated list of transactions, supporting query parameters: `page`, `page_size`, `risk_level`, `decision`, `from_ts`, `to_ts`.
2. THE System SHALL expose `GET /api/v1/sentinel/transactions/{id}/assessment` returning the full `RiskAssessment` JSON including all fields in the AI Output Contract.
3. THE RiskAssessment response SHALL include: `transaction_id`, `risk_score`, `risk_level`, `fraud_probability`, `confidence_score`, `contributing_signals`, `reasoning`, `plain_language_explanation`, `recommended_action`, `decision`, `model_version`, `timestamp`, and `inference_mode`.
4. THE System SHALL expose `GET /api/v1/sentinel/models/health` returning: active model version, inference mode, precision, recall, F1 score, and ROC-AUC.
5. THE System SHALL expose `GET /api/v1/sentinel/metrics` (manager role required) returning the aggregate metrics defined in Section 14 of the design, computed over a configurable time window.
6. THE System SHALL expose `GET /api/v1/sentinel/audit` (manager role required) returning a paginated audit event list.
7. THE System SHALL expose `POST /api/v1/sentinel/copilot/explain` accepting `{transaction_id, question}` and returning the injection-guarded Gemini response via the ExplanationLayer.

---

### Requirement 20: AI Copilot Endpoint (Injection-Guarded)

**User Story:** As a fraud analyst, I want to ask the AI Copilot questions about a flagged transaction and receive safe, factual answers, so that I can investigate without being misled.

#### Acceptance Criteria

1. WHEN `POST /api/v1/sentinel/copilot/explain` is called with a `transaction_id` and a `question`, THE System SHALL retrieve the corresponding RiskAssessment from the database and construct a structured prompt.
2. THE System SHALL validate that `question` does not contain prompt injection patterns before forwarding it to the Gemini API.
3. WHEN the Gemini response is received, THE System SHALL validate it against the same output validation rules defined in Requirement 10 (no score-setting language, no decision directives, no executable code) before returning it to the client.
4. IF the Gemini response fails output validation, THEN THE System SHALL return a deterministic fallback explanation to the client rather than the Gemini output.
5. THE System SHALL include a notice in every copilot response that questions are screened for safety before being sent to AI.

---

### Requirement 21: Six Deterministic Demo Scenarios

**User Story:** As a hackathon presenter, I want six reproducible demo scenarios with known expected outcomes, so that I can demonstrate the full range of risk decisions live on stage.

#### Acceptance Criteria

1. THE scenario `NORMAL_PURCHASE` (amount=85.00, velocity_1h=1, new_device=0, new_location=0) SHALL produce decision APPROVE and risk_level LOW.
2. THE scenario `HIGH_VALUE_OUTLIER` (amount=4200.00, ~23× baseline, velocity_1h=1, new_device=0) SHALL produce decision HOLD and risk_level CRITICAL.
3. THE scenario `NEW_DEVICE` (amount=210.00, new_device=1, new_location=0, velocity_1h=2) SHALL produce decision STEP_UP_AUTH and risk_level MEDIUM.
4. THE scenario `LOCATION_ANOMALY` (amount=320.00, new_device=0, new_location=1) SHALL produce decision STEP_UP_AUTH and risk_level MEDIUM or HIGH.
5. THE scenario `VELOCITY_SPIKE` (amount=95.00, velocity_1h=8, velocity_24h=22) SHALL produce decision HOLD and risk_level HIGH.
6. THE scenario `MULTI_SIGNAL` (amount=3800.00, ~21× baseline, velocity_1h=6, new_device=1, new_location=1) SHALL produce decision HOLD and risk_level CRITICAL.
7. THE scenario configurations SHALL be stored as a frozen dictionary in `backend/src/agents/fraud/scenarios.py` and SHALL NOT use any random values.
8. WHEN the same scenario is triggered multiple times with the same `customer_id`, THE System SHALL produce the same `decision` and `risk_level` on every run.

---

### Requirement 22: Z-Sentinel Decision Centre — Page and Layout

**User Story:** As a sentinel operator, I want a dedicated Decision Centre page at `/sentinel`, so that I can monitor live transactions and act on flagged ones from a single screen.

#### Acceptance Criteria

1. THE Frontend SHALL render the `ZSentinelPage` component at the `/sentinel` route, protected by authentication.
2. THE ZSentinelPage SHALL initialise a WebSocket connection to `WS /api/v1/sentinel/ws?token=<access_token>` on mount using the token from the existing `useAuth()` hook.
3. THE ZSentinelPage SHALL use a split-panel layout: left panel containing `ScenarioLauncher` and `TransactionStreamFeed`; right panel containing `RiskAssessmentPanel`, `DecisionActionBar`, and `AICopilotPanel`.
4. THE ZSentinelPage SHALL display the `ModelHealthBadge` in the page header.
5. THE ZSentinelPage SHALL use `@tanstack/react-query` to fetch the initial transaction list on mount.
6. THE ZSentinelPage SHALL use Tailwind CSS classes consistent with the existing portal style (`bg-blue-950`, `text-white`, `rounded-xl`) and `lucide-react` icons.

---

### Requirement 23: TransactionStreamFeed Component

**User Story:** As a sentinel operator, I want to see a live-updating list of recent transactions colour-coded by risk level, so that I can quickly identify which transactions need attention.

#### Acceptance Criteria

1. THE TransactionStreamFeed SHALL display a scrollable list of recent transactions, updated in real time via the WebSocket connection established by ZSentinelPage.
2. THE TransactionStreamFeed SHALL apply colour coding per risk level: `bg-red-900` for CRITICAL, `bg-orange-800` for HIGH, `bg-yellow-700` for MEDIUM, `bg-green-800` for LOW.
3. WHEN a user clicks a transaction row in the TransactionStreamFeed, THE Frontend SHALL set the selected transaction and trigger a fetch for the full RiskAssessment via `GET /sentinel/transactions/{id}/assessment`.
4. WHEN a new WebSocket message arrives with `event_type: "RISK_ASSESSMENT_COMPLETE"`, THE TransactionStreamFeed SHALL prepend the new transaction to the top of the list without a full page reload.

---

### Requirement 24: RiskAssessmentPanel Component

**User Story:** As a fraud analyst, I want to see the full risk assessment details for any selected transaction, so that I have all the information needed to make an override decision.

#### Acceptance Criteria

1. THE RiskAssessmentPanel SHALL display the `risk_score` as a large numeric value with a colour-coded risk level badge.
2. THE RiskAssessmentPanel SHALL display an `inference_mode` badge: "LOCAL DEMO" styled in blue, or "IBM Z" styled in purple.
3. THE RiskAssessmentPanel SHALL render the `plain_language_explanation` in a styled prose block.
4. THE RiskAssessmentPanel SHALL render the `contributing_signals` list using the `ContributingSignalsBar` component.
5. WHEN no transaction is selected, THE RiskAssessmentPanel SHALL display an empty state prompt instructing the user to select a transaction from the feed.

---

### Requirement 25: ContributingSignalsBar Component

**User Story:** As a fraud analyst, I want to see a visual breakdown of what drove the risk score, so that I can understand the relative importance of each signal at a glance.

#### Acceptance Criteria

1. THE ContributingSignalsBar SHALL render one horizontal bar per contributing signal, with each bar's width proportional to the signal's `contribution` value relative to the maximum contribution.
2. THE ContributingSignalsBar SHALL colour-code bars by signal type: ML signals in blue, anomaly signals in orange, rule-based signals in red.
3. THE ContributingSignalsBar SHALL be implemented using pure CSS (Tailwind) with no external charting library dependency.
4. THE ContributingSignalsBar SHALL display the signal name and numeric contribution value alongside each bar.

---

### Requirement 26: DecisionActionBar Component

**User Story:** As a fraud agent, I want clear action buttons for each possible decision, with the system's recommendation highlighted, so that I can confirm or override quickly.

#### Acceptance Criteria

1. THE DecisionActionBar SHALL display three buttons: APPROVE (green), STEP-UP (yellow), HOLD (red).
2. THE DecisionActionBar SHALL visually highlight the button corresponding to the PolicyEngine's `recommended_action` field.
3. WHEN a user selects a decision that differs from the recommended decision, THE DecisionActionBar SHALL require the user to enter a non-empty override reason before the submit button is enabled.
4. WHEN the submit button is clicked, THE Frontend SHALL call `POST /api/v1/sentinel/transactions/{id}/override` with the selected decision and override reason.
5. THE DecisionActionBar SHALL be disabled (read-only) for users with role `customer`.
6. WHILE an override submission is in flight, THE DecisionActionBar SHALL disable all buttons to prevent duplicate submissions.

---

### Requirement 27: ImpactSimulatorModal Component

**User Story:** As a fraud reviewer, I want to see estimated financial impacts presented clearly before making an override decision, so that I can weigh the cost of different outcomes.

#### Acceptance Criteria

1. WHEN the "View Impact Estimates" button is clicked in the RiskAssessmentPanel, THE Frontend SHALL open the ImpactSimulatorModal populated with data from `GET /sentinel/transactions/{id}/impact-simulation`.
2. THE ImpactSimulatorModal SHALL display a three-column layout: APPROVE, STEP-UP, HOLD.
3. THE ImpactSimulatorModal SHALL display "ESTIMATE" labels on all monetary values.
4. THE ImpactSimulatorModal SHALL display the full assumptions list below the estimates.
5. THE ImpactSimulatorModal SHALL display the disclaimer text verbatim as returned by the API.
6. THE ImpactSimulatorModal SHALL be dismissible without performing any action.

---

### Requirement 28: AICopilotPanel Component

**User Story:** As a fraud analyst, I want to ask the AI Copilot questions about the selected transaction in a chat interface, so that I can investigate efficiently.

#### Acceptance Criteria

1. THE AICopilotPanel SHALL display a text input field and a send button.
2. THE AICopilotPanel SHALL display a safety notice above the input field: "Questions are analysed for safety before sending to AI."
3. WHEN the user submits a question, THE Frontend SHALL call `POST /api/v1/sentinel/copilot/explain` with the current `transaction_id` and the question text.
4. WHEN the API response is received, THE AICopilotPanel SHALL render the response in a styled message bubble.
5. WHILE a copilot request is in flight, THE AICopilotPanel SHALL disable the send button and show a loading indicator.
6. THE AICopilotPanel SHALL be scoped to the currently selected transaction; switching to a different transaction SHALL clear the chat history.

---

### Requirement 29: AuditTrailTable Component

**User Story:** As a compliance manager, I want to view a paginated audit trail directly in the Decision Centre, so that I can review all actions taken on transactions without leaving the page.

#### Acceptance Criteria

1. THE AuditTrailTable SHALL be rendered below the main split-panel layout, visible only to users with role `manager`.
2. THE AuditTrailTable SHALL display columns: `event_type`, `entity_id`, `actor_id`, `actor_role`, `created_at`.
3. THE AuditTrailTable SHALL support pagination using the `page` and `page_size` query parameters.
4. WHEN a user clicks a table row, THE AuditTrailTable SHALL expand that row to display the full `payload` JSON.
5. THE AuditTrailTable SHALL be hidden (not merely disabled) for users with roles `customer` and `agent`.

---

### Requirement 30: ScenarioLauncher Component

**User Story:** As a hackathon presenter, I want six clearly labelled scenario buttons in the Decision Centre, so that I can trigger demo scenarios instantly during a live presentation.

#### Acceptance Criteria

1. THE ScenarioLauncher SHALL display exactly six buttons with labels: "Normal Purchase", "High-Value Outlier", "New Device", "Location Anomaly", "Velocity Spike", "Multi-Signal Attack".
2. WHEN a scenario button is clicked, THE Frontend SHALL call `POST /api/v1/sentinel/simulate` with the corresponding scenario key and `customer_id: "cust_demo_001"`.
3. WHEN the simulate API responds successfully, THE ScenarioLauncher SHALL display a toast notification: "Scenario queued — watch the stream".
4. WHILE a simulate request is in flight, THE ScenarioLauncher SHALL disable all six buttons to prevent duplicate submissions.

---

### Requirement 31: ModelHealthBadge Component

**User Story:** As a demo presenter, I want a persistent model health indicator in the page header, so that the audience can see which inference provider is active and the model's performance metrics.

#### Acceptance Criteria

1. THE ModelHealthBadge SHALL call `GET /api/v1/sentinel/models/health` on mount and display the result.
2. THE ModelHealthBadge SHALL display: model version, inference mode, F1 score, and ROC-AUC.
3. WHEN `inference_mode == "LOCAL_DEMO"`, THE ModelHealthBadge SHALL pulse green.
4. WHEN `inference_mode == "IBM_Z"`, THE ModelHealthBadge SHALL pulse purple.

---

### Requirement 32: Security — LLM Cannot Set Decisions

**User Story:** As a security engineer, I want to guarantee that no LLM output can ever change the transaction decision, so that the system is protected against prompt injection attacks targeting the decision outcome.

#### Acceptance Criteria

1. THE PolicyEngine SHALL set the `decision` field on every RiskAssessment before the ExplanationLayer is invoked.
2. THE ExplanationLayer SHALL receive the `decision` as a read-only input and SHALL NOT be able to modify it.
3. THE System SHALL validate every Gemini response and reject it if it contains any language attempting to set, change, or recommend a specific `decision` value.
4. THE copilot endpoint SHALL validate every question and reject it if it contains prompt injection patterns before forwarding to the LLM.
5. THE GeminiExplainer prompt template SHALL interpolate all transaction data as structured JSON values, not as free-form text that could be interpreted as instructions.

---

### Requirement 33: Security — RBAC and API Protection

**User Story:** As a security engineer, I want all sensitive API endpoints to be protected by role verification, so that unauthorised users cannot escalate privileges.

#### Acceptance Criteria

1. THE System SHALL apply JWT verification as a FastAPI dependency on every `/api/v1/sentinel/` route.
2. THE RBAC role check SHALL be evaluated server-side from the JWT claims on every request, before any business logic executes.
3. THE System SHALL apply a per-user rate limit of 100 requests per minute across all sentinel routes, and 20 requests per minute specifically on `/api/v1/sentinel/simulate`.
4. THE System SHALL never include stack traces or internal error details in HTTP error response bodies in production mode.
5. THE System SHALL never log or return the values of `IBM_Z_PASSWORD`, `GEMINI_API_KEY`, or any other credential settings.

---

### Requirement 34: Observability and Model Health

**User Story:** As a system operator, I want per-transaction timing metrics and aggregate operational metrics, so that I can monitor pipeline performance.

#### Acceptance Criteria

1. THE System SHALL record `feature_extraction_ms`, `ml_inference_ms`, and `total_decision_ms` on every `risk_assessments` row.
2. WHEN `GET /api/v1/sentinel/metrics` is called by a manager, THE System SHALL return aggregate metrics for the configured time window including: `transactions_per_minute`, `alerts_per_minute`, `human_override_rate`, `avg_confidence`, `avg_total_decision_ms`, `decision_distribution`, `risk_level_distribution`, `active_model_version`, and `inference_mode`.
3. THE Pipeline SHOULD meet the following p95 latency targets: feature extraction < 10 ms; ML inference (local) < 50 ms; risk fusion + policy < 5 ms; total pipeline (excluding LLM) < 200 ms; WebSocket delivery < 500 ms from ingest.
4. THE System SHALL expose `GET /api/v1/sentinel/models/health` returning the active model version, inference mode, and training metrics (precision, recall, F1, ROC-AUC) from the `ml_models` table.

---

### Requirement 35: Correctness Properties

**User Story:** As a quality engineer, I want formal correctness properties that property-based tests can validate, so that the system's invariants are machine-verifiable across a wide range of inputs.

#### Acceptance Criteria

1. THE System SHALL satisfy the property: *for any valid feature vector, the fused_risk_score produced by RiskFusionEngine SHALL be in the range [0.0, 1.0]*.
2. THE System SHALL satisfy the property: *for any feature vector that produces risk_level == CRITICAL, the decision produced by PolicyEngine SHALL be HOLD*.
3. THE System SHALL satisfy the property: *for any feature vector that produces fused_risk_score < 0.30, the decision produced by PolicyEngine SHALL be APPROVE*.
4. THE System SHALL satisfy the property: *for any valid combination of (weight_ml, weight_anomaly, weight_rules) that satisfies weight_ml + weight_anomaly + weight_rules == 1.0 and all weights ∈ [0.0, 1.0], the fused_risk_score SHALL remain in [0.0, 1.0]*.
5. THE System SHALL satisfy the property: *for any RiskAssessment, the sum of all signal contributions in contributing_signals SHALL equal fused_risk_score within floating-point tolerance (± 1e-9)*.
6. THE System SHALL satisfy the property: *for any valid RiskAssessment JSON object, serialising it to JSON and deserialising it SHALL produce an equivalent RiskAssessment object (round-trip property)*.
7. THE System SHALL satisfy the property: *for any valid transaction payload, running the full Pipeline twice with identical inputs SHALL produce identical decision and risk_level outputs (idempotence)*.
8. THE System SHALL satisfy the property: *for any non-empty explanation string produced by the DeterministicExplainer, it SHALL contain the risk_level string and at least one signal name from the contributing_signals list*.
