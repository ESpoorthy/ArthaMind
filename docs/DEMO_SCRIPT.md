# ArthaMind Voice Concierge — demo script (about 2 minutes 30 seconds)

## Before recording

Use Node.js 20+, Python 3.11, and two terminal windows. From the repository root:

```bash
cp .env.example .env
npm ci --legacy-peer-deps
cd backend
python3.11 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
```

Start the API in terminal 1:

```bash
cd backend
set -a
. ../.env
set +a
. .venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

Start the frontend in terminal 2 from the repository root:

```bash
npm run dev:frontend
```

Open `http://localhost:5173`, choose **Customer Portal**, then select **Voice Concierge**.
No Gemini key or Amazon partner access is needed. The API uses the backend's configured
demo password (the template default is `Demo@12345`).

## Timed narration and actions

**0:00–0:20 — Customer problem**

Narration: “When a bank holds a transaction, customers need a clear explanation and a safe
next step. ArthaMind already evaluates synthetic transactions with Z-Sentinel; Voice
Concierge makes that decision easier to ask about.”

Show the Voice Concierge header and the disclosure that this is an Alexa+-style web simulation,
not a direct Alexa+ device integration.

**0:20–0:50 — Run the example**

Click **Run multi-signal risk example**. Show the returned transaction card, risk level,
decision, actual contributing signals, and the label distinguishing local model output from
deterministic policy.

Narration: “This customer-scoped demo creates a synthetic transaction and sends it through
the existing server-side risk pipeline. The displayed fields come from that completed
assessment.”

**0:50–1:35 — Ask and explain**

Click **Why was this transaction put on hold?**. Show the assistant response with the actual
risk and policy decision. Then type `Which signals contributed to this decision?` and click
**Send**.

Narration: “The assistant reads the stored assessment and decision. It can explain the model
and rule evidence, but it cannot change the score or authorize a transaction.”

**1:35–2:00 — Useful next step**

Click **Prepare support case**, accept the browser confirmation, and show the
`SIMULATED_ONLY` status.

Narration: “The next step requires confirmation and is recorded only inside the simulator. It
does not contact a bank or change the transaction.”

**2:00–2:25 — Value and limitation**

Narration: “ArthaMind connects a conversational customer experience to an auditable risk
decision path, while making the simulation boundary explicit. This is a web simulation for
the Alexa+ track; it is not a direct Alexa+ or Amazon service integration.”

## Recording notes

- Keep the complete recording below three minutes and in English.
- Show actual UI responses from the running local app; do not add fabricated metrics or
  imply a hosted demo.
- Use only the provided synthetic scenarios.
- Before submission, replace the repository link and project-story details only with verified
  information and add the actual public video URL.
