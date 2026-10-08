# Implementation Plan: ArthaMind Z-Sentinel

## Overview

Build the real-time fraud detection and risk decision engine on top of the existing FastAPI + React scaffold. The implementation follows a strict dependency order: foundation → ML pipeline → core pipeline services → infrastructure → API routes → frontend → testing. All existing routes, middleware, and frontend portals are preserved untouched.

---

## Tasks

- [x] 1. Foundation — Dependencies, Settings, and Database Infrastructure
  - [x] 1.1 Add missing ML and testing dependencies to `backend/requirements.txt`
    - Append `xgboost==2.0.3`, `scikit-learn==1.4.2`, `joblib==1.4.0`, `hypothesis==6.100.0`, `pytest-hypothesis==0.19.0` (exact pinned versions)
    - Verify no version conflicts with existing `fastapi==0.111.0`, `sqlalchemy==2.0.29`, `redis==5.0.4`
    - _Requirements: Req 5.1, Req 7.1_

  - [x] 1.2 Extend `backend/src/config/settings.py` with all Z-Sentinel configuration fields
    - Add inference settings: `inference_provider: Literal["local", "ibmz"] = "local"`, `worker_batch_size: int = 1`
    - Add risk weight settings: `risk_weight_ml: float = 0.50`, `risk_weight_anomaly: float = 0.30`, `risk_weight_rules: float = 0.20` with a `@model_validator` that asserts they sum to 1.0 and raises `ValueError` on violation
    - Add policy thresholds: `decision_low_threshold: float = 0.30`, `decision_medium_threshold: float = 0.60`, `decision_high_threshold: float = 0.80`
    - Add explanation setting: `explanation_mode: Literal["gemini", "deterministic"] = "gemini"`
    - Add IBM Z settings (all optional strings, defaulting to empty): `ibm_z_host`, `ibm_z_port`, `ibm_z_username`, `ibm_z_password`, `ibm_z_model_name` — add a `@model_validator` that raises `ValueError` naming missing vars when `inference_provider == "ibmz"`
    - Add impact simulator cost params: `step_up_friction_cost: float = 1.00`, `customer_friction_value: float = 5.00`
    - Add `model_artefacts_path: str = "backend/models"` and `sensitive_log_fields: list[str] = ["ibm_z_password", "gemini_api_key", "device_fingerprint"]`
    - _Requirements: Req 4.2, Req 4.3, Req 6.5, Req 8.7, Req 8.8, Req 9.6_

  - [x] 1.3 Create the async SQLAlchemy database layer
    - Create `backend/src/database/base.py` — `DeclarativeBase` subclass (`Base`) used by all ORM models
    - Create `backend/src/database/session.py` — `async_engine` via `create_async_engine(settings.database_url)`, `AsyncSessionLocal` factory, and `get_db()` FastAPI dependency that yields a session and commits/rolls back on exit
    - _Requirements: Req 16_

  - [x] 1.4 Create all six SQLAlchemy ORM models
    - Create `backend/src/models/transaction.py` — `Transaction` model matching the `transactions` schema in design Section 10 (all columns including `raw_features JSONB`, `scenario_type`)
    - Create `backend/src/models/risk_assessment.py` — `RiskAssessment` model with all fields from design Section 10, FK to `Transaction`, `CHECK (risk_score >= 0.0 AND risk_score <= 1.0)` via `CheckConstraint`
    - Create `backend/src/models/decision_override.py` — `DecisionOverride` model with `NOT NULL` on `override_reason`, FK to `RiskAssessment`
    - Create `backend/src/models/audit_event.py` — `AuditEvent` model with `payload: JSONB`, append-only (no update/delete methods)
    - Create `backend/src/models/ml_model.py` — `MLModel` model with `UNIQUE` on `model_version`, `is_active: Boolean`
    - Create `backend/src/models/customer_risk_profile.py` — `CustomerRiskProfile` model with JSONB arrays for `typical_merchants`, `typical_devices`, `typical_locations`
    - Update `backend/src/models/__init__.py` to export all six models
    - _Requirements: Req 16.1, Req 16.2, Req 16.3, Req 16.4_

  - [x] 1.5 Create Alembic migrations for all six new tables
    - Initialise Alembic under `backend/migrations/` if not already present (`alembic init`)
    - Configure `alembic.ini` and `env.py` to use `settings.database_url_sync` and import `Base` metadata from the new ORM models
    - Generate migration: `alembic revision --autogenerate -m "add_sentinel_tables"` — produces one migration file under `backend/migrations/versions/`
    - Verify migration adds exactly the six tables with all indexes from design Section 10 (13 indexes total) and adds nothing else
    - _Requirements: Req 16.1, Req 16.5, Req 16.6_

- [x] 2. ML Training Pipeline
  - [x] 2.1 Create the synthetic data generator and model training script
    - Create `backend/models/` directory (gitignored)
    - Create `backend/scripts/train_models.py` with:
      - `numpy.random.default_rng(seed=42)` generating 100,000 samples (2% fraud rate)
      - Legitimate transaction distributions: `amount ~ N(180, 45)`, velocity and device/location flags at realistic base rates
      - Fraud samples: elevated `amount_deviation_ratio > 5`, high velocity, `is_new_device=1`, `is_new_location=1` with realistic covariance
      - `StandardScaler` fit on training features, saved as `feature_scaler_v1.0.0.joblib`
      - 80/20 stratified train/test split via `train_test_split(stratify=y)`
      - XGBoost `XGBClassifier` training with `scale_pos_weight` to handle class imbalance
      - IsolationForest training on all samples, score normalised to `[0.0, 1.0]` via min-max
      - Assertion block: precision ≥ 0.80, recall ≥ 0.70, F1 ≥ 0.75, ROC-AUC ≥ 0.90 — print warning per failing metric and `sys.exit(1)` if any fail
      - `joblib.dump()` for `xgboost_fraud_v1.0.0.joblib`, `isolation_forest_v1.0.0.joblib`, `feature_scaler_v1.0.0.joblib`
      - Write `model_metadata_v1.0.0.json` with all fields from design Section 4
    - _Requirements: Req 7.1, Req 7.2, Req 7.3, Req 7.4, Req 7.5, Req 7.6_

  - [ ]* 2.2 Write unit tests for model training output (`backend/tests/unit/ml/test_model_training.py`)
    - Test: all four artefact files exist in `backend/models/` after script runs
    - Test: `model_metadata_v1.0.0.json` has all required keys and metrics ≥ thresholds
    - Test: loaded XGBoost model accepts a 12-element float array and returns a probability in `[0.0, 1.0]`
    - Test: IsolationForest normalised score is in `[0.0, 1.0]` for arbitrary inputs
    - _Requirements: Req 7.3_

- [ ] 3. Checkpoint — ML artefacts in place
  - Run `python backend/scripts/train_models.py` and verify four files exist in `backend/models/`. Ask the user if any metric thresholds fail.

- [ ] 4. Inference Gateway and Providers
  - [~] 4.1 Create the `InferenceGateway` abstract interface and data classes
    - Create `backend/src/services/inference/gateway.py`
    - Define `@dataclass InferenceRequest` and `@dataclass InferenceResponse` exactly as in design Section 3
    - Define `InferenceGateway(ABC)` with abstract methods `infer()` and `health_check()`
    - Define `InferenceError(Exception)` for inference-specific failures
    - _Requirements: Req 4.1, Req 4.4, Req 4.5_

  - [~] 4.2 Implement `LocalInferenceProvider`
    - Create `backend/src/services/inference/local_provider.py`
    - `__init__`: call `joblib.load()` for all three artefacts from `settings.model_artefacts_path`; raise `RuntimeError` with the missing filename if any artefact is absent
    - `infer()`: scale the 12-element feature vector with the loaded scaler, run `xgb_model.predict_proba()` for `ml_probability`, run `isolation_forest.decision_function()` and normalise to `[0.0, 1.0]` for `anomaly_score`, record `inference_latency_ms`, return `InferenceResponse` with `inference_mode="LOCAL_DEMO"`
    - `health_check()`: return dict with model version, status, inference mode
    - _Requirements: Req 5.1, Req 5.2, Req 5.3, Req 5.4, Req 5.5, Req 5.6_

  - [~] 4.3 Implement `IBMZInferenceProvider` stub
    - Create `backend/src/services/inference/ibmz_provider.py`
    - `__init__`: validate all five required IBM Z env vars are non-empty (already checked by Settings, but assert here too); store them as instance attributes — never log their values
    - `infer()`: use `httpx.AsyncClient` to POST to `https://{ibm_z_host}/zosmf/analytics/v1/score` with the JSON contract from design Section 3; parse `predictions[0].ml_probability` and `predictions[0].anomaly_score`; set `inference_mode="IBM_Z"`; catch `httpx.HTTPError` and raise `InferenceError` with status code — never include credential values in the error message
    - `health_check()`: return IBM Z model version and mode
    - _Requirements: Req 6.1, Req 6.2, Req 6.3, Req 6.4, Req 6.5, Req 6.6_

  - [~] 4.4 Create the `InferenceGateway` factory function
    - Add `get_inference_gateway() -> InferenceGateway` to `backend/src/services/inference/__init__.py`
    - Return `LocalInferenceProvider()` when `settings.inference_provider == "local"`, else `IBMZInferenceProvider()`
    - Cache the singleton instance (module-level variable set at first call)
    - _Requirements: Req 4.2, Req 4.3_

  - [ ]* 4.5 Write unit tests for `LocalInferenceProvider` (`backend/tests/unit/ml/test_inference.py`)
    - Test: `infer()` returns all required fields with values in correct ranges
    - Test: missing artefact file raises `RuntimeError` at construction
    - Test: `inference_mode` is always `"LOCAL_DEMO"`
    - _Requirements: Req 5.2, Req 5.3, Req 5.4_

- [ ] 5. Feature Extractor
  - [~] 5.1 Implement `FeatureExtractor`
    - Create `backend/src/services/feature_extraction.py`
    - Define `FeatureExtractor` class with `extract(raw_transaction: dict, profile: CustomerRiskProfile | None) -> list[float]` method
    - Produce the 12 signals in the exact fixed order from design Section 4
    - Cap `amount_deviation_ratio` at 20.0; use `profile.avg_transaction_amount` as the baseline (default to `raw_transaction["amount"]` if profile is None, log a WARNING)
    - Compute `is_new_merchant` (1 if merchant_id not in `profile.typical_merchants` within 90 days), `is_new_device` (1 if fingerprint not in `profile.typical_devices`), `is_new_location` (1 if Haversine distance > 100 km from all `profile.typical_locations`)
    - Set integer flags `is_new_*` as exactly 0 or 1
    - _Requirements: Req 3.1, Req 3.2, Req 3.3, Req 3.4, Req 3.5, Req 3.6_

  - [ ]* 5.2 Write property test for `FeatureExtractor` (`backend/tests/unit/sentinel/test_feature_extractor.py`)
    - **Property 1: Feature Vector Structure Invariants**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Use `hypothesis` `@given` to generate arbitrary valid transaction dicts and optional profiles
    - Assert: output has exactly 12 elements, all are `float`, `output[2] <= 20.0`, `output[6] in {0, 1}`, `output[7] in {0, 1}`, `output[8] in {0, 1}`
    - _Requirements: Req 3.1, Req 3.2, Req 3.3, Req 35.1_

- [ ] 6. Risk Fusion Engine
  - [~] 6.1 Implement `RiskFusionEngine`
    - Create `backend/src/services/risk_fusion.py`
    - Define `RiskFusionEngine` class with `fuse(ml_probability: float, anomaly_score: float, feature_vector: list[float]) -> RiskFusionResult` method
    - Evaluate the four deterministic rules from design Section 5 (`VELOCITY_1H`, `HIGH_AMOUNT_OUTLIER`, `NEW_DEVICE_AND_LOCATION`, `MODERATE_AMOUNT_OUTLIER`), sum triggered boosts, cap at 1.0
    - Compute `fused_risk_score` using weights from `settings`; clamp result to `[0.0, 1.0]`
    - Map score to `RiskLevel` enum (`LOW/MEDIUM/HIGH/CRITICAL`) using the thresholds from settings
    - Build `contributing_signals` list: one entry per signal (`ML_PROBABILITY`, `ANOMALY_SCORE`, one per triggered rule) with `signal`, `value`, `weight`, `contribution` fields
    - Define `RiskFusionResult` dataclass with `fused_risk_score`, `risk_level`, `contributing_signals`, `rules_triggered`
    - _Requirements: Req 8.1, Req 8.2, Req 8.3, Req 8.4, Req 8.5, Req 8.6, Req 8.7, Req 8.9_

  - [ ]* 6.2 Write property tests for `RiskFusionEngine` (`backend/tests/unit/sentinel/test_risk_fusion.py`)
    - **Property 3: Fused Risk Score Bounds** — `@given` any `ml_probability ∈ [0,1]`, `anomaly_score ∈ [0,1]`, valid weights summing to 1.0; assert `0.0 ≤ fused_risk_score ≤ 1.0`
    - **Validates: Requirements 8.2, 35.1, 35.4**
    - **Property 4: Risk Fusion Formula Correctness** — assert `fused_risk_score == ml_prob×w_ml + anomaly×w_an + min(boost,1.0)×w_rules` within `1e-9`
    - **Validates: Requirements 8.1**
    - **Property 5: Contributing Signals Sum** — assert `sum(s["contribution"] for s in contributing_signals) ≈ fused_risk_score` within `1e-9`
    - **Validates: Requirements 8.6, 35.5**
    - _Requirements: Req 8.1, Req 8.2, Req 8.6, Req 35.1, Req 35.4, Req 35.5_

- [ ] 7. Policy Engine
  - [~] 7.1 Implement `PolicyEngine`
    - Create `backend/src/services/policy_engine.py`
    - Define `Decision` enum with values `APPROVE`, `STEP_UP_AUTH`, `HOLD`
    - Define `PolicyEngine` class with `decide(fused_risk_score: float, risk_level: RiskLevel) -> Decision` method
    - Map thresholds from `settings.decision_low_threshold`, `settings.decision_medium_threshold`, `settings.decision_high_threshold` — no hardcoded values
    - `risk_level == CRITICAL` always returns `HOLD` regardless of score
    - `score < low_threshold` → `APPROVE`; `score ∈ [low, medium)` → `STEP_UP_AUTH`; `score ≥ medium` → `HOLD`
    - _Requirements: Req 9.1, Req 9.2, Req 9.3, Req 9.4, Req 9.5, Req 9.6, Req 9.7_

  - [ ]* 7.2 Write property tests for `PolicyEngine` (`backend/tests/unit/sentinel/test_policy_engine.py`)
    - **Property 6: PolicyEngine Complete Threshold Coverage** — `@given` any `fused_risk_score ∈ [0.0, 1.0]`; assert exactly one decision is returned, APPROVE when score < 0.30, HOLD when score ≥ 0.60
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
    - **Property 2 (from design): Critical Always Hold** — `@given` score ∈ [0.80, 1.0]; assert decision is always `HOLD`
    - **Validates: Requirements 9.4, 35.2**
    - **Property: Low Always Approve** — `@given` score in `[0.0, 0.30)`; assert decision is always `APPROVE`
    - **Validates: Requirements 35.3**
    - _Requirements: Req 9.1, Req 9.2, Req 9.3, Req 9.4, Req 35.2, Req 35.3_

- [ ] 8. Explanation Layer
  - [~] 8.1 Implement `DeterministicExplainer`
    - Create `backend/src/services/explanation.py`
    - Define `DeterministicExplainer` class with `explain(risk_assessment_data: dict) -> str`
    - Template: "This transaction was flagged as {risk_level} risk (score: {score:.2f}). Primary signals: {top_signal_name} ({top_contribution:.3f} contribution){additional_signals}. Recommended action: {decision}."
    - Must include `risk_level` string and at least the highest-contribution signal name
    - _Requirements: Req 10.7, Req 35.8_

  - [~] 8.2 Implement `GeminiExplainer` with injection-resistant prompt and output validation
    - Add `GeminiExplainer` class to `backend/src/services/explanation.py`
    - Construct the structured prompt from design Section 7 — interpolate ALL transaction data as JSON values, never as free-form text
    - Add output validator `_validate_response(text: str) -> bool`: returns `False` if text contains numeric `risk_score: X.XX` pattern, override directives (`"you should approve"`, `"override the decision"`, `"change the threshold"`), or executable code blocks (```...)
    - _Requirements: Req 10.2, Req 10.3, Req 10.4, Req 32.3, Req 32.5_

  - [~] 8.3 Implement `ExplanationLayer` orchestrator
    - Add `ExplanationLayer` class to `backend/src/services/explanation.py`
    - `explain(risk_assessment_data: dict) -> str`: try `GeminiExplainer` first (unless `settings.explanation_mode == "deterministic"` or `settings.gemini_api_key == ""`); catch any exception from Gemini; fall back to `DeterministicExplainer` without raising
    - Explanation step is non-blocking — the `transactions:scored` Redis publish happens before this result is awaited by the caller
    - _Requirements: Req 10.1, Req 10.5, Req 10.6, Req 10.8_

  - [ ]* 8.4 Write property test for `DeterministicExplainer` (`backend/tests/unit/sentinel/test_explanation.py`)
    - **Property 8: Deterministic Explanation Completeness** — `@given` valid `RiskAssessment` data dicts; assert output is non-empty, contains `risk_level` string, contains at least one signal name from `contributing_signals`
    - **Validates: Requirements 10.7, 35.8**
    - Add unit test: `GeminiExplainer._validate_response()` returns `False` for each forbidden pattern
    - **Validates: Requirements 10.4, 32.3** (Property 7)
    - _Requirements: Req 10.7, Req 35.8_

- [ ] 9. Decision Impact Simulator
  - [~] 9.1 Implement `DecisionImpactSimulator`
    - Create `backend/src/services/impact_simulator.py`
    - Define `ImpactSimulationInput` and `DecisionImpactResult` dataclasses from design Section 8
    - `simulate(input: ImpactSimulationInput) -> DecisionImpactResult`:
      - `estimated_loss_if_approve = fraud_probability × transaction_amount × 1.2`
      - `estimated_friction_if_step_up = settings.step_up_friction_cost`
      - `estimated_fp_cost_if_hold = (1 - fraud_probability) × settings.customer_friction_value`
      - Include the verbatim disclaimer string from Req 11.5
      - Include the full assumptions list from design Section 8 with current config values
    - _Requirements: Req 11.1, Req 11.2, Req 11.3, Req 11.4, Req 11.5, Req 11.6_

  - [ ]* 9.2 Write property test for `DecisionImpactSimulator` (`backend/tests/unit/sentinel/test_impact_simulator.py`)
    - **Property 9: Impact Simulator Formula Correctness** — `@given` `fraud_probability ∈ [0,1]`, `transaction_amount > 0`; assert `estimated_loss_if_approve ≈ fraud_probability × amount × 1.2` within `1e-9`
    - **Validates: Requirements 11.2, 11.3, 11.4**
    - _Requirements: Req 11.2, Req 11.3, Req 11.4_

- [ ] 10. Audit Service
  - [~] 10.1 Implement `AuditService`
    - Create `backend/src/services/audit.py`
    - Define `AuditEventType` enum: `TRANSACTION_SCORED`, `DECISION_OVERRIDE`, `CRITICAL_ALERT`, `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_REFRESH`
    - `write(event_type, entity_id, entity_type, actor_id, actor_role, payload: dict, db: AsyncSession, redis: Redis)` — async method that:
      1. Inserts a row into `audit_events` table (no `UPDATE`/`DELETE` ever called on this table)
      2. XADDs the event payload to `audit:events` Redis stream
    - Never include `device_fingerprint`, `location_lat`, `location_lon` in INFO-level log output
    - _Requirements: Req 13.1, Req 13.2, Req 13.3, Req 13.4, Req 13.5_

- [x] 11. Demo Scenarios Configuration
  - [x] 11.1 Create scenario configuration module
    - Create `backend/src/agents/fraud/scenarios.py`
    - Define `ScenarioConfig` dataclass with all raw transaction fields (amount, velocity_1h, velocity_24h, new_device, new_location, merchant_category_code, etc.)
    - Define `SCENARIO_CONFIGS: Final[dict[str, ScenarioConfig]]` as a frozen dict (use `types.MappingProxyType`) with the six scenarios from design Section 15 — no random values, all deterministic
    - Scenario keys: `NORMAL_PURCHASE`, `HIGH_VALUE_OUTLIER`, `NEW_DEVICE`, `LOCATION_ANOMALY`, `VELOCITY_SPIKE`, `MULTI_SIGNAL`
    - Scenario values match design Section 15 exactly (amounts, velocities, device/location flags)
    - _Requirements: Req 21.1–21.8_

- [~] 12. Checkpoint — Core pipeline services complete
  - Ensure all unit and property tests pass for FeatureExtractor, RiskFusionEngine, PolicyEngine, ExplanationLayer, and ImpactSimulator. Ask the user before proceeding if any tests fail.

- [ ] 13. JWT Authentication Routes
  - [~] 13.1 Create the User model and authentication database table
    - Create `backend/src/models/user.py` — `User` ORM model with `id`, `email`, `hashed_password`, `role` (VARCHAR 32), `is_active`, `created_at`
    - Create Alembic migration for the `users` table (separate migration file from Sentinel tables)
    - Add DB seeding logic for three demo users (`customer`, `agent`, `manager` roles) in `backend/scripts/seed_db.py`
    - _Requirements: Req 17, Req 18.1_

  - [~] 13.2 Implement JWT utility functions
    - Create `backend/src/utils/jwt_utils.py`
    - `create_access_token(user_id, email, role) -> str` — encodes `sub`, `email`, `role`, `exp` using `settings.secret_key`
    - `create_refresh_token(user_id) -> str` — encodes `sub`, `exp` using `settings.refresh_secret_key`
    - `decode_token(token, secret_key) -> dict` — raises `HTTPException(401)` for invalid/expired tokens
    - `get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserClaims` — FastAPI dependency
    - `require_role(roles: list[str])` — FastAPI dependency factory that raises `HTTPException(403)` if `current_user.role` not in `roles`
    - _Requirements: Req 17.6, Req 18.5, Req 33.1, Req 33.2_

  - [~] 13.3 Implement auth route handlers
    - Create `backend/src/routes/auth.py` with router prefix `/auth`
    - `POST /auth/login`: query `users` table by email, `passlib.bcrypt.verify()` password, return `access_token`, `refresh_token`, `user` object; write `AUTH_LOGIN` audit event; emit `HTTPException(401)` for bad credentials
    - `POST /auth/refresh`: decode refresh token, issue new access token
    - `POST /auth/logout`: invalidate session (Redis blacklist with TTL = remaining token lifetime), return `204`; write `AUTH_LOGOUT` audit event
    - `GET /auth/me`: return `user_id`, `email`, `role` from JWT claims
    - _Requirements: Req 17.1, Req 17.2, Req 17.3, Req 17.4, Req 17.5_

  - [~] 13.4 Update `authStore.tsx` and `api.ts` to use real JWT auth
    - Replace mock `login(role)` in `authStore.tsx` with `login(email, password)` that calls `POST /api/v1/auth/login`, stores `access_token` in `localStorage`, and populates user state from the response
    - Add `logout()` to call `POST /api/v1/auth/logout` and clear `localStorage`
    - Update `api.ts` to add a response interceptor that calls `POST /api/v1/auth/refresh` on `401` (once, using a refresh lock to prevent infinite loops), then retries the original request
    - Ensure the `LoginPage` form now passes email + password to the updated `login()` function
    - _Requirements: Req 17.1, Req 17.3_

  - [~] 13.5 Register auth router in `backend/src/routes/__init__.py`
    - Import `auth_router` and add `api_router.include_router(auth_router, prefix="/auth")`
    - Preserve the existing `health_router` registration
    - _Requirements: Req 17_

- [ ] 14. Redis Stream Infrastructure and Background Worker
  - [~] 14.1 Create Redis connection pool and stream helpers
    - Create `backend/src/database/redis_client.py`
    - `get_redis() -> Redis` — async dependency that returns a connected `redis.asyncio.Redis` client from a module-level connection pool; closes on app shutdown
    - `xadd(client, stream_key, payload)` — helper that serialises payload to JSON and calls `client.xadd()`
    - `xread_block(client, stream_key, last_id, block_ms=1000)` — helper wrapping `client.xread()`
    - _Requirements: Req 14.1, Req 14.2_

  - [~] 14.2 Implement the Pipeline orchestrator
    - Create `backend/src/agents/fraud/detector.py`
    - Define `async run_pipeline(raw_transaction: dict, db: AsyncSession, redis_client: Redis) -> RiskAssessment`:
      1. Record `t0 = time.monotonic()`
      2. Load or create `CustomerRiskProfile` for `customer_id` from DB
      3. `feature_vector = FeatureExtractor().extract(raw_transaction, profile)` — record `feature_extraction_ms`
      4. `inference_result = await gateway.infer(InferenceRequest(...))` — record `ml_inference_ms`
      5. `fusion_result = RiskFusionEngine().fuse(inference_result.ml_probability, inference_result.anomaly_score, feature_vector)`
      6. `decision = PolicyEngine().decide(fusion_result.fused_risk_score, fusion_result.risk_level)` — PolicyEngine sets decision BEFORE ExplanationLayer is called
      7. Persist `Transaction` and `RiskAssessment` rows to DB
      8. `explanation = await ExplanationLayer().explain(risk_assessment_data)` — async, non-blocking path continues immediately
      9. Update `RiskAssessment.plain_language_explanation` in DB
      10. Return completed `RiskAssessment`
    - Record `total_decision_ms` = time from step 1 to after step 7
    - _Requirements: Req 2.3, Req 9.5, Req 32.1, Req 32.2, Req 34.1_

  - [~] 14.3 Implement `BackgroundWorker`
    - Create `backend/src/workers/stream_worker.py`
    - `async run_worker(redis_client, db_session_factory)` — infinite loop:
      - `XREAD BLOCK 1000` from `transactions:incoming`
      - For each message: `await run_pipeline(raw_transaction, db, redis)`, then `XADD transactions:scored {risk_assessment_json}`
      - If `risk_level in (HIGH, CRITICAL)`: `XADD risk:alerts {...}`
      - On any unhandled exception from pipeline: `XADD transactions:failed {raw_message}`; log the error; continue loop (do not crash)
    - Batch size from `settings.worker_batch_size`
    - _Requirements: Req 2.1, Req 2.2, Req 2.3, Req 2.4, Req 2.5, Req 2.6, Req 14.3, Req 14.5, Req 14.6_

  - [~] 14.4 Register `BackgroundWorker` and Redis pool in the FastAPI `lifespan`
    - Edit `backend/src/main.py` — inside the `lifespan` context manager:
      - On startup: create Redis pool via `get_redis()`, create `AsyncEngine`, run `asyncio.create_task(run_worker(...))`
      - On shutdown: cancel the worker task gracefully, close Redis pool
    - Do NOT modify any existing middleware registrations
    - _Requirements: Req 2.1_

- [ ] 15. WebSocket Server
  - [~] 15.1 Implement the WebSocket broadcaster
    - Create `backend/src/routes/sentinel_ws.py`
    - Maintain a module-level `set[WebSocket]` of active connections
    - `WS /sentinel/ws?token=<access_token>`: validate token via `decode_token()`; on invalid token, `await websocket.close(code=4001)` and return
    - Accept the connection, add to the active set
    - Start a `XREAD BLOCK` loop on `transactions:scored`; for each entry, broadcast `RiskAssessmentEvent` JSON (with fields from Req 15.4) to all connected clients
    - On `WebSocketDisconnect`: remove from the active set without affecting other connections
    - _Requirements: Req 15.1, Req 15.2, Req 15.3, Req 15.4, Req 15.5, Req 15.6_

- [ ] 16. Z-Sentinel REST API Routes
  - [~] 16.1 Implement the simulate endpoint
    - Create `backend/src/routes/sentinel.py` with router prefix `/sentinel`
    - `POST /sentinel/simulate`: require valid JWT (any role); validate `scenario` against `SCENARIO_CONFIGS` keys, return `HTTP 422` with descriptive message if invalid; look up `ScenarioConfig`, build raw transaction dict, `XADD transactions:incoming`; return `{transaction_id, status: "queued"}` within 200 ms; apply per-route rate limit of 20 rpm using a Redis sliding window decorator/dependency
    - _Requirements: Req 1.1, Req 1.2, Req 1.3, Req 1.4, Req 1.5, Req 1.6_

  - [~] 16.2 Implement transaction list and assessment endpoints
    - `GET /sentinel/transactions`: JWT required; support `page`, `page_size`, `risk_level`, `decision`, `from_ts`, `to_ts` query params; query `transactions` + `risk_assessments` with SQLAlchemy joins; return paginated response
    - `GET /sentinel/transactions/{id}/assessment`: JWT required; return full `RiskAssessment` JSON matching the AI Output Contract from design Section 11 (all 13 fields from Req 19.3)
    - _Requirements: Req 19.1, Req 19.2, Req 19.3_

  - [~] 16.3 Implement the override endpoint
    - `POST /sentinel/transactions/{id}/override`: require `role in [agent, manager]` via `require_role()`; reject `customer` role with `HTTP 403`; require non-empty `override_reason` or return `HTTP 422`; if `risk_level == CRITICAL`, require `role == manager` or return `HTTP 403`; insert `decision_override` row (never mutate original `risk_assessments.decision`); `XADD decisions:completed`, `XADD audit:events`; write audit event via `AuditService`
    - _Requirements: Req 12.1, Req 12.2, Req 12.3, Req 12.4, Req 12.5, Req 12.6, Req 18.2, Req 18.6_

  - [~] 16.4 Implement the impact simulation endpoint
    - `GET /sentinel/transactions/{id}/impact-simulation`: JWT required; fetch `RiskAssessment` + `Transaction`; call `DecisionImpactSimulator.simulate()`; return `DecisionImpactResult` JSON
    - _Requirements: Req 11.1, Req 11.5, Req 11.6_

  - [~] 16.5 Implement model health, metrics, and audit endpoints
    - `GET /sentinel/models/health`: JWT required; query `ml_models` where `is_active=true`; return `model_version`, `inference_mode`, `precision`, `recall`, `f1_score`, `roc_auc`
    - `GET /sentinel/metrics`: `require_role(["manager"])`; aggregate query over `risk_assessments` for the configured time window; return all fields from design Section 14
    - `GET /sentinel/audit`: `require_role(["manager"])`; paginated query on `audit_events` ordered by `created_at DESC`; support `page` and `page_size`
    - _Requirements: Req 18.3, Req 18.4, Req 19.4, Req 19.5, Req 19.6, Req 29.3, Req 34.2, Req 34.4_

  - [~] 16.6 Implement the AI Copilot endpoint
    - `POST /sentinel/copilot/explain`: JWT required; validate `question` for prompt injection patterns (same checks as `GeminiExplainer._validate_response()`); fetch `RiskAssessment`; call `ExplanationLayer.explain()` with the question appended to context; validate output; return deterministic fallback if validation fails; always include the safety notice from Req 20.5
    - _Requirements: Req 20.1, Req 20.2, Req 20.3, Req 20.4, Req 20.5, Req 32.4_

  - [~] 16.7 Register all sentinel routers in `backend/src/routes/__init__.py`
    - Import and include `sentinel_router` (prefix `/sentinel`) and `ws_router` (no prefix, for WebSocket)
    - Preserve existing health and auth router registrations
    - _Requirements: Req 19, Req 15.1, Req 33.1_

- [~] 17. Checkpoint — Full backend pipeline functional
  - Run `pytest backend/tests/` and verify: all unit tests pass, the full pipeline can be exercised via `POST /sentinel/simulate` → worker → `transactions:scored`. Ask the user to resolve any failures before proceeding to the frontend.

- [ ] 18. Frontend TypeScript Types and API Service
  - [~] 18.1 Create TypeScript types for all Z-Sentinel domain objects
    - Create `frontend/src/types/sentinel.ts`
    - Define: `ContributingSignal`, `Reasoning`, `RiskAssessment` (matching the AI Output Contract from Req 19.3), `RiskAssessmentEvent` (WebSocket message), `DecisionImpactResult`, `Transaction`, `AuditEvent`, `ModelHealth`, `SentinelMetrics`, `SimulateRequest`, `SimulateResponse`, `OverrideRequest`
    - Use `string` literal union types for `RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"` and `Decision = "APPROVE" | "STEP_UP_AUTH" | "HOLD"`
    - _Requirements: Req 22–31_

  - [~] 18.2 Create the Sentinel API service module
    - Create `frontend/src/services/sentinelApi.ts`
    - Use the existing `apiClient` from `api.ts` — no new HTTP client
    - Export typed async functions:
      - `simulateScenario(scenario, customerId)` → `POST /sentinel/simulate`
      - `getTransactions(params)` → `GET /sentinel/transactions`
      - `getAssessment(id)` → `GET /sentinel/transactions/{id}/assessment`
      - `submitOverride(id, body)` → `POST /sentinel/transactions/{id}/override`
      - `getImpactSimulation(id)` → `GET /sentinel/transactions/{id}/impact-simulation`
      - `getModelHealth()` → `GET /sentinel/models/health`
      - `getMetrics()` → `GET /sentinel/metrics`
      - `getAuditTrail(params)` → `GET /sentinel/audit`
      - `askCopilot(transactionId, question)` → `POST /sentinel/copilot/explain`
    - _Requirements: Req 22.5_

  - [~] 18.3 Create the `useSentinelWebSocket` custom hook
    - Create `frontend/src/hooks/useSentinelWebSocket.ts`
    - Accepts a callback `onMessage: (event: RiskAssessmentEvent) => void`
    - On mount: read `access_token` from `localStorage`, open `new WebSocket(WS_URL + "?token=" + token)`
    - Handle `onmessage`, `onerror`, `onclose` — auto-reconnect with exponential backoff on unexpected closes
    - Cleanup: `websocket.close()` on unmount
    - _Requirements: Req 22.2, Req 15.2_

- [ ] 19. Frontend — Z-Sentinel Page and Layout
  - [~] 19.1 Add the `/sentinel` route to `App.tsx`
    - Add a lazy import for `ZSentinelPage` from `./pages/sentinel/ZSentinelPage`
    - Add `<Route path="/sentinel" element={<ZSentinelPage />} />` inside the existing `<Routes>` — do NOT modify any existing routes
    - _Requirements: Req 22.1_

  - [~] 19.2 Create `ZSentinelPage` — page shell, layout, and WebSocket initialisation
    - Create `frontend/src/pages/sentinel/ZSentinelPage.tsx`
    - Use `useAuth()` from the existing `authStore` for user/token access
    - Initialise `useSentinelWebSocket` with a callback that prepends new `RiskAssessmentEvent` to a local `transactions` state array
    - Use `@tanstack/react-query` `useQuery` to fetch the initial transaction list on mount via `getTransactions()`
    - Layout: `<div className="min-h-screen bg-blue-950 text-white">` → page header with title and `ModelHealthBadge`, split-panel body (left: `ScenarioLauncher` + `TransactionStreamFeed`; right: `RiskAssessmentPanel` + `DecisionActionBar` + `AICopilotPanel`), and `AuditTrailTable` below (manager only)
    - Manage `selectedTransactionId` state; pass setter to `TransactionStreamFeed`
    - _Requirements: Req 22.1, Req 22.2, Req 22.3, Req 22.4, Req 22.5, Req 22.6_

- [ ] 20. Frontend — Z-Sentinel Components (Left Panel)
  - [~] 20.1 Create `ScenarioLauncher` component
    - Create `frontend/src/components/sentinel/ScenarioLauncher.tsx`
    - Render exactly six buttons using a `scenarios` array: `[{key: "NORMAL_PURCHASE", label: "Normal Purchase"}, ...]` matching Req 30.1
    - `onClick`: call `simulateScenario(key, "cust_demo_001")`; disable all six buttons while any request is in flight; show a toast on success: "Scenario queued — watch the stream"
    - Style: `bg-blue-900 hover:bg-blue-800 rounded-xl text-white` with `lucide-react` icons (e.g. `Zap`, `AlertTriangle` etc.)
    - _Requirements: Req 30.1, Req 30.2, Req 30.3, Req 30.4_

  - [~] 20.2 Create `TransactionStreamFeed` component
    - Create `frontend/src/components/sentinel/TransactionStreamFeed.tsx`
    - Props: `transactions: RiskAssessmentEvent[]`, `selectedId: string | null`, `onSelect: (id: string) => void`
    - Render scrollable list of transaction rows; colour-code rows: `bg-red-900` (CRITICAL), `bg-orange-800` (HIGH), `bg-yellow-700` (MEDIUM), `bg-green-800` (LOW)
    - Click row → call `onSelect(transaction_id)`, which triggers a `useQuery` fetch for the full assessment in the parent
    - When a new WebSocket message arrives with `event_type: "RISK_ASSESSMENT_COMPLETE"`, the parent state update causes this list to re-render with the new entry prepended
    - _Requirements: Req 23.1, Req 23.2, Req 23.3, Req 23.4_

- [ ] 21. Frontend — Z-Sentinel Components (Right Panel)
  - [~] 21.1 Create `ContributingSignalsBar` component
    - Create `frontend/src/components/sentinel/ContributingSignalsBar.tsx`
    - Props: `signals: ContributingSignal[]`
    - Render one horizontal bar per signal using only Tailwind CSS — no external charting library
    - Bar width: `style={{ width: \`${(contribution / maxContribution) * 100}%\` }}`
    - Colour classes by signal type: `bg-blue-500` for `ML_PROBABILITY`, `bg-orange-500` for `ANOMALY_SCORE`, `bg-red-500` for rule-based signals
    - Display signal name and numeric contribution value alongside each bar
    - _Requirements: Req 25.1, Req 25.2, Req 25.3, Req 25.4_

  - [~] 21.2 Create `RiskAssessmentPanel` component
    - Create `frontend/src/components/sentinel/RiskAssessmentPanel.tsx`
    - Props: `transactionId: string | null`
    - Use `@tanstack/react-query` `useQuery` to fetch assessment on `transactionId` change via `getAssessment(id)`
    - When no transaction selected: show empty-state prompt "Select a transaction from the feed"
    - Display `risk_score` as large numeric + colour-coded risk level badge
    - `inference_mode` badge: `"LOCAL DEMO"` with `bg-blue-600`, `"IBM_Z"` with `bg-purple-600`
    - `plain_language_explanation` in a `<p className="prose text-sm">` block
    - Render `<ContributingSignalsBar signals={assessment.contributing_signals} />`
    - "View Impact Estimates" button that opens `ImpactSimulatorModal`
    - _Requirements: Req 24.1, Req 24.2, Req 24.3, Req 24.4, Req 24.5_

  - [~] 21.3 Create `DecisionActionBar` component
    - Create `frontend/src/components/sentinel/DecisionActionBar.tsx`
    - Props: `assessment: RiskAssessment | null`, `userRole: string`
    - Render three buttons: `APPROVE` (`bg-green-600`), `STEP-UP` (`bg-yellow-600`), `HOLD` (`bg-red-600`)
    - Highlight the button matching `assessment.recommended_action` with a ring/border
    - When selected decision differs from recommended: show a `<textarea>` for override reason; submit button is disabled until reason is non-empty
    - On submit: call `submitOverride(id, {override_decision, override_reason})`; disable all buttons while in-flight to prevent duplicates
    - Component is fully read-only (buttons disabled) when `userRole === "customer"`
    - _Requirements: Req 26.1, Req 26.2, Req 26.3, Req 26.4, Req 26.5, Req 26.6_

  - [~] 21.4 Create `ImpactSimulatorModal` component
    - Create `frontend/src/components/sentinel/ImpactSimulatorModal.tsx`
    - Props: `transactionId: string`, `isOpen: boolean`, `onClose: () => void`
    - Fetch impact data via `getImpactSimulation(transactionId)` when `isOpen` becomes true
    - Render three-column layout: APPROVE / STEP-UP / HOLD with monetary values labelled "ESTIMATE"
    - Display full `assumptions` list below columns
    - Display `disclaimer` text verbatim
    - Close button dismisses without any action
    - _Requirements: Req 27.1, Req 27.2, Req 27.3, Req 27.4, Req 27.5, Req 27.6_

  - [~] 21.5 Create `AICopilotPanel` component
    - Create `frontend/src/components/sentinel/AICopilotPanel.tsx`
    - Props: `transactionId: string | null`
    - Maintain local `messages: {role: "user"|"ai", text: string}[]` state; reset to `[]` when `transactionId` changes
    - Show safety notice above input: "Questions are analysed for safety before sending to AI."
    - On submit: call `askCopilot(transactionId, question)`, append question to messages, then append AI response; disable send button + show spinner while in-flight
    - Render messages as styled bubbles (user: right-aligned `bg-blue-700`, AI: left-aligned `bg-slate-700`)
    - _Requirements: Req 28.1, Req 28.2, Req 28.3, Req 28.4, Req 28.5, Req 28.6_

- [ ] 22. Frontend — Header and Manager-Only Components
  - [~] 22.1 Create `ModelHealthBadge` component
    - Create `frontend/src/components/sentinel/ModelHealthBadge.tsx`
    - Call `getModelHealth()` via `useQuery` on mount (10-second refetch interval)
    - Display: `v{model_version} ● {inference_mode} | F1: {f1_score} | AUC: {roc_auc}`
    - Pulse animation: `animate-pulse text-green-400` for `LOCAL_DEMO`, `animate-pulse text-purple-400` for `IBM_Z`
    - _Requirements: Req 31.1, Req 31.2, Req 31.3, Req 31.4_

  - [~] 22.2 Create `AuditTrailTable` component
    - Create `frontend/src/components/sentinel/AuditTrailTable.tsx`
    - Props: `userRole: string`
    - Render `null` (not disabled, fully hidden) when `userRole !== "manager"`
    - Fetch `getAuditTrail({page, page_size: 20})` via `useQuery`
    - Render table with columns: `event_type`, `entity_id`, `actor_id`, `actor_role`, `created_at`
    - Click row → toggle expanded state showing full `payload` JSON in a `<pre>` block
    - Pagination: prev/next buttons updating page state, which re-triggers the query
    - _Requirements: Req 29.1, Req 29.2, Req 29.3, Req 29.4, Req 29.5_

- [~] 23. Checkpoint — Full end-to-end flow working
  - Verify in the browser: click a scenario button → transaction appears in feed → click transaction → right panel shows full assessment → override dialog works for agent/manager → audit trail visible for manager. Ask the user if anything needs adjustment.

- [ ] 24. Integration Tests
  - [~] 24.1 Write backend integration tests for the full pipeline
    - Create `backend/tests/integration/sentinel/test_pipeline.py`
    - `test_simulate_to_websocket`: `POST /sentinel/simulate` → assert Redis `transactions:incoming` receives message → assert worker processes it → assert `risk_assessments` row exists in DB → assert `transactions:scored` receives message
    - `test_override_creates_audit`: `POST /sentinel/transactions/{id}/override` with agent JWT → assert `decision_overrides` row exists → assert `audit_events` row exists → assert original `risk_assessments.decision` is unchanged
    - `test_auth_required`: all `/sentinel` routes return `401` without JWT
    - `test_rbac_override`: customer-role JWT → `403` on override endpoint
    - `test_rate_limit_simulate`: fire 21 `POST /simulate` requests → 21st returns `429`
    - _Requirements: Req 1.5, Req 2.3, Req 12.2, Req 17.5, Req 18.2, Req 33.3_

  - [ ]* 24.2 Write property test for RiskAssessment JSON round-trip (`backend/tests/unit/sentinel/test_round_trip.py`)
    - **Property 10: RiskAssessment JSON Round-Trip**
    - **Validates: Requirements 35.6**
    - `@given` valid `RiskAssessment` dicts; serialise to JSON via `json.dumps`, deserialise via `json.loads`, assert all fields equal within type constraints
    - _Requirements: Req 35.6_

  - [ ]* 24.3 Write property test for Pipeline idempotence (`backend/tests/integration/sentinel/test_idempotence.py`)
    - **Property 11: Pipeline Idempotence**
    - **Validates: Requirements 35.7, 21.8**
    - `@given` a valid scenario key; run the full pipeline twice with identical inputs; assert `decision` and `risk_level` are identical on both runs
    - _Requirements: Req 35.7, Req 21.8_

  - [ ]* 24.4 Write property test for invalid scenario rejection (`backend/tests/unit/sentinel/test_simulate_validation.py`)
    - **Property 12: Invalid Scenario Inputs Always Rejected**
    - **Validates: Requirements 1.4**
    - `@given` arbitrary strings filtered to exclude the six valid keys; call the scenario validator; assert `HTTP 422` is returned
    - _Requirements: Req 1.4_

- [ ] 25. End-to-End Demo Scenario Tests
  - [~] 25.1 Write deterministic demo scenario integration tests
    - Create `backend/tests/integration/scenarios/test_demo_scenarios.py`
    - One `@pytest.mark.parametrize` test covering all six scenarios from design Section 15
    - Each test: trigger pipeline with frozen scenario config → assert `decision` matches expected → assert `risk_level` matches expected
    - Run against the full pipeline (no mocking) to validate end-to-end determinism
    - _Requirements: Req 21.1, Req 21.2, Req 21.3, Req 21.4, Req 21.5, Req 21.6, Req 21.7, Req 21.8_

- [ ] 26. IBM Z Integration Documentation
  - [~] 26.1 Create the IBM Z integration guide
    - Create `backend/docs/ibmz_integration.md`
    - Document: all five required env vars (`IBM_Z_HOST`, `IBM_Z_PORT`, `IBM_Z_USERNAME`, `IBM_Z_PASSWORD`, `IBM_Z_MODEL_NAME`) with types and examples
    - Document: how to set `INFERENCE_PROVIDER=ibmz` in `.env`
    - Include the full JSON request contract and expected response contract from design Section 3
    - Include a note that `IBM_Z_PASSWORD` is never logged or included in error responses (Req 6.6, Req 33.5)
    - Document the `LocalInferenceProvider` fallback — the demo works on any machine without IBM Z
    - _Requirements: Req 6.1, Req 6.2, Req 6.3, Req 6.4, Req 6.6_

- [~] 27. Final Checkpoint — Ensure all tests pass
  - Run `pytest backend/tests/ --cov=backend/src --cov-report=term-missing` and verify all P0 tests pass.
  - Run `vitest --run` in the frontend directory and verify no TypeScript or component errors.
  - Ask the user if any failing tests require design clarification before marking this feature complete.

---

## Notes

- Tasks marked with `*` are optional (property-based and integration tests) and can be skipped for a faster MVP delivery
- P0 tasks (1–17, 18–23) are required for a working hackathon demo; P1 tasks (24–27) strengthen the demo and code quality
- Each task references specific requirements for full traceability to `requirements.md`
- The `PolicyEngine` must ALWAYS set the `decision` field before the `ExplanationLayer` is called — this is a security invariant, not just an ordering preference (Req 9.5, Req 32.1, Req 32.2)
- The `audit_events` table must never receive `UPDATE` or `DELETE` statements from application code — enforce this at the `AuditService` level (Req 13.2)
- The `IBMZInferenceProvider` credentials (`IBM_Z_PASSWORD`) must NEVER appear in logs, error responses, or tracebacks — enforce via the exception handler and the logger's `SENSITIVE_LOG_FIELDS` list (Req 6.6, Req 33.5)
- All existing routes (`/login`, `/dashboard/*`, `/agent`, `/manager`) and all middleware must remain untouched
- The `authStore.tsx` update (Task 13.4) switches from mock to real JWT — coordinate with any team members using mock login before merging

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "11.1"] },
    { "id": 2, "tasks": ["1.5", "2.1"] },
    { "id": 3, "tasks": ["2.2", "4.1", "10.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 5, "tasks": ["4.4", "4.5", "5.2", "6.1"] },
    { "id": 6, "tasks": ["6.2", "7.1"] },
    { "id": 7, "tasks": ["7.2", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3"] },
    { "id": 9, "tasks": ["8.4", "9.1"] },
    { "id": 10, "tasks": ["9.2", "13.1"] },
    { "id": 11, "tasks": ["13.2"] },
    { "id": 12, "tasks": ["13.3", "14.1"] },
    { "id": 13, "tasks": ["13.4", "14.2"] },
    { "id": 14, "tasks": ["13.5", "14.3"] },
    { "id": 15, "tasks": ["14.4", "15.1"] },
    { "id": 16, "tasks": ["16.1", "16.2"] },
    { "id": 17, "tasks": ["16.3", "16.4", "16.5", "16.6"] },
    { "id": 18, "tasks": ["16.7", "18.1"] },
    { "id": 19, "tasks": ["18.2", "18.3"] },
    { "id": 20, "tasks": ["19.1", "19.2"] },
    { "id": 21, "tasks": ["20.1", "20.2"] },
    { "id": 22, "tasks": ["21.1", "21.2"] },
    { "id": 23, "tasks": ["21.3", "21.4", "21.5"] },
    { "id": 24, "tasks": ["22.1", "22.2"] },
    { "id": 25, "tasks": ["24.1", "25.1", "26.1"] },
    { "id": 26, "tasks": ["24.2", "24.3", "24.4"] }
  ]
}
```
