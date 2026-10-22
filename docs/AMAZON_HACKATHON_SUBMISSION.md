# Build, Ship, Shape: Amazon Developer Hackathon 2026 — submission draft

## Project

**ArthaMind Voice Concierge**

**Primary track:** Alexa+ (simulated web experience)

## Elevator pitch

ArthaMind Voice Concierge gives a customer a conversational way to ask why a synthetic
financial transaction was approved or held. Its answers come from ArthaMind Z-Sentinel's
actual local inference output, recorded signals, and deterministic policy decision, with
confirmed next steps that remain inside the simulator.

## Project story

ArthaMind already contained a synthetic transaction-risk workflow called Z-Sentinel. It
combines local model inference, anomaly and rule signals, deterministic risk fusion and
policy, explanatory evidence, manager review, and audit records. During this hackathon
submission effort, the existing application was extended with a customer-scoped conversational
simulation: a customer can run a normal or multi-signal synthetic example, ask about its
assessment, and prepare a confirmation-gated simulated support action. The feature does not
claim to be an Alexa+ device integration. Replace this paragraph with a truthful account of
the team's eligible-period work and contributions before submitting.

## What it does

- Runs customer-selected normal or multi-signal high-risk examples through the existing
  server-side Z-Sentinel pipeline.
- Explains the actual risk level, score, recorded contributing signals, and deterministic
  policy decision through a read-only deterministic response.
- Supports useful questions about why a decision happened, its signals, comparison, and
  simulated next steps.
- Provides a confirmation-gated additional-verification or support-case action, recorded
  only as `SIMULATED_ONLY`.
- Requires the demo customer role and checks ownership of generated transactions. Existing
  manager-only controls and reason-recorded overrides remain protected.

## Alexa+ track representation

This project demonstrates an Alexa+-style interaction in the ArthaMind web application. It is
a **simulated web experience**, not a direct Alexa+ integration, device skill, partner-preview
connection, or Amazon production-service integration. No Amazon SDK or AWS service is required
to run the feature.

## Architecture and data flow

```text
Customer browser
  → authenticated POST /api/v1/sentinel/companion/simulate
  → server-generated synthetic transaction
  → existing local inference + risk fusion + deterministic policy
  → transaction, assessment, and decision returned to browser
  → authenticated read-only explanation from stored assessment fields
  → explicitly confirmed simulator-only next-step record
```

The backend remains authoritative. A local model supplies inference fields; deterministic
policy maps the resulting risk level to APPROVE, STEP_UP_AUTHENTICATION, or HOLD. The
explanation is a deterministic rendering of the recorded assessment and policy output. It is
not a language-model decision. The pipeline uses its existing best-effort PostgreSQL
persistence when configured and available. In the local no-service fallback, runtime results,
transaction ownership, and simulated next-step records live in process memory and are lost on
restart.
The repository includes model metadata but not its git-ignored `.joblib` weights. A fresh
checkout therefore uses the existing seeded synthetic bootstrap model, reported as
`bootstrap-rf-1`, unless a complete trained artifact bundle is provided locally.

## Built with

- React, TypeScript, Vite, Tailwind CSS, and Axios.
- Python 3.11, FastAPI, Pydantic, and the existing scikit-learn local inference pipeline.
- Existing JWT authentication and role checks.
- Synthetic transaction scenarios only.

## Setup and demo

Follow [README setup and run instructions](../README.md#run-locally), then use the
three-minute sequence in [DEMO_SCRIPT.md](DEMO_SCRIPT.md). No Gemini key, Amazon account,
partner preview, or cloud deployment is required for the local simulated experience.

## Tests

Use the CI commands documented in [README tests and checks](../README.md#quality-checks-and-tests).
The added backend integration tests verify the normal approval and multi-signal hold paths,
assessment-grounded explanations, role restrictions, transaction ownership, invalid input,
and confirmation requirements. Frontend tests cover API-driven results and error feedback.
Only report checks that have actually been run in the submitted revision.

## Limitations

- Synthetic scenarios and local ML outputs are demonstrations, not claims about fraud-detection
  performance or real customer outcomes.
- No payment, transfer, account change, or real support action can be initiated here.
- The companion uses a text interaction; it does not record voice or synthesize speech.
- No direct Alexa+, partner-preview, AWS, or IBM Z integration is implemented or claimed.
- A public hosted demo is not included in this code change.

## Devpost completion checklist

- [ ] Confirm the current hackathon's eligibility terms and select the permitted simulated
      Alexa+ route.
- [ ] Replace the project-story reminder with a truthful timeline and team contribution account.
- [ ] Record and publicly upload the actual English demo video (under three minutes), then add
      its verified URL.
- [ ] Add the verified repository URL and any required live-demo URL (leave blank if none).
- [ ] Review product feedback and complete all eligibility and disclosure declarations truthfully.
- [ ] Check that screenshots show only synthetic records and match the submitted revision.
- [ ] Complete and submit the Devpost form manually.
