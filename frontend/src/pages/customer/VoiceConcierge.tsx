import { useState } from 'react';
import { apiClient } from '../../services/api';

type Scenario = 'NORMAL' | 'MULTI_SIGNAL_HIGH_RISK';
type Assessment = {
  transaction_id: string;
  final_risk_score: number;
  fraud_probability: number;
  anomaly_score: number;
  risk_level: string;
  confidence_score: number;
  contributing_signals: string[];
  reasoning: string;
  model_version: string;
  inference_mode: string;
};
type TransactionResult = {
  transaction: { amount: number; currency: string; merchant_id: string };
  assessment: Assessment;
  decision: { decision: string; recommended_action: string };
};
type Message = { role: 'customer' | 'assistant'; text: string };

const suggestions = [
  'Why was this transaction put on hold?',
  'What made this transaction high risk?',
  'Which signals contributed to this decision?',
  'What can I do next?',
];

export default function VoiceConcierge() {
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello! I can help explain a simulated ArthaMind transaction decision. Choose a synthetic example, then ask me about its assessment.',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [caseStatus, setCaseStatus] = useState('');

  const simulate = async (scenario: Scenario) => {
    setBusy(true);
    setError('');
    setCaseStatus('');
    try {
      const response = await apiClient.post<TransactionResult>('/sentinel/companion/simulate', {
        scenario,
      });
      setResult(response.data);
      setMessages([
        {
          role: 'assistant',
          text: `A synthetic ${scenario === 'NORMAL' ? 'everyday' : 'multi-signal high-risk'} transaction is ready. Ask why it was approved or held.`,
        },
      ]);
    } catch {
      setError(
        'I could not create an assessment. Check that the backend is running and you are signed in as the demo customer, then try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const send = async (prompt = input) => {
    const question = prompt.trim();
    if (!question || busy) return;
    if (!result) {
      setError('Choose a synthetic transaction first so I can answer from a real assessment.');
      return;
    }
    setMessages((current) => [...current, { role: 'customer', text: question }]);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const response = await apiClient.post<{ answer: string; source: string }>(
        `/sentinel/companion/transactions/${result.assessment.transaction_id}/explain`,
        { question },
      );
      setMessages((current) => [...current, { role: 'assistant', text: response.data.answer }]);
    } catch {
      setError(
        'I could not retrieve that assessment explanation. Your message is still here; try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const nextStep = async (action: 'REQUEST_VERIFICATION' | 'PREPARE_SUPPORT_CASE') => {
    if (!result) return;
    const confirmed = window.confirm(
      'This creates a simulator-only support action. It will not contact a bank or change a transaction. Continue?',
    );
    if (!confirmed) return;
    setBusy(true);
    setError('');
    try {
      const response = await apiClient.post<{ case_id: string; status: string }>(
        `/sentinel/companion/transactions/${result.assessment.transaction_id}/next-step`,
        { action, confirmed },
      );
      setCaseStatus(
        `${action === 'REQUEST_VERIFICATION' ? 'Verification request' : 'Support case'} prepared (${response.data.status}).`,
      );
    } catch {
      setError('The simulated next step could not be prepared. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-5 p-4 sm:p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          ArthaMind Voice Concierge
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Conversational Finance Companion
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Ask about a synthetic transaction, and get an explanation grounded in its Z-Sentinel
          assessment.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Alexa+-style simulation for the Amazon Developer Hackathon. This is not a direct Alexa+
          device integration.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(270px,0.8fr)]">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Conversation</h2>
            <p className="text-xs text-gray-500">
              Answers use completed assessment and policy fields. The assistant cannot change a
              decision.
            </p>
          </div>
          <div
            className="min-h-64 space-y-3 p-4"
            aria-live="polite"
            aria-label="Conversation history"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-2xl p-3 text-sm ${message.role === 'customer' ? 'ml-auto bg-blue-700 text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                <p className="mb-1 text-xs font-semibold opacity-75">
                  {message.role === 'customer' ? 'You' : 'ArthaMind'}
                </p>
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            ))}
            {busy && (
              <p role="status" className="text-sm text-gray-500">
                Checking the assessment…
              </p>
            )}
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t p-4">
            {suggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void send(prompt)}
                className="rounded-full border px-3 py-1.5 text-left text-xs text-blue-800 hover:bg-blue-50 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
            className="flex gap-2 border-t p-4"
          >
            <label className="sr-only" htmlFor="concierge-message">
              Ask about this transaction
            </label>
            <input
              id="concierge-message"
              className="input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this transaction…"
              maxLength={500}
            />
            <button className="btn-primary shrink-0" type="submit" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Select a synthetic example</h2>
            <p className="mt-1 text-xs text-gray-600">
              Each option runs through the existing backend risk pipeline.
            </p>
            <div className="mt-4 grid gap-2">
              <button
                className="btn-secondary"
                disabled={busy}
                onClick={() => void simulate('NORMAL')}
              >
                Run normal transaction
              </button>
              <button
                className="btn-secondary"
                disabled={busy}
                onClick={() => void simulate('MULTI_SIGNAL_HIGH_RISK')}
              >
                Run multi-signal risk example
              </button>
            </div>
          </div>
          {result && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Assessment from Z-Sentinel</h2>
              <p className="mt-3 text-sm">
                {result.transaction.currency} {result.transaction.amount.toLocaleString()} at{' '}
                {result.transaction.merchant_id}
              </p>
              <p className="mt-2 text-sm">
                <b>{result.assessment.risk_level}</b> risk · {result.decision.decision}
              </p>
              <p className="text-sm">
                Risk score: {Math.round(result.assessment.final_risk_score * 100)}% · fraud
                probability: {Math.round(result.assessment.fraud_probability * 100)}% · anomaly:{' '}
                {Math.round(result.assessment.anomaly_score * 100)}%
              </p>
              <p className="mt-2 text-sm">
                Signals:{' '}
                {result.assessment.contributing_signals.join(', ') ||
                  'No material anomaly signals recorded.'}
              </p>
              <p className="mt-2 text-sm text-gray-600">{result.assessment.reasoning}</p>
              <p className="mt-2 text-xs text-gray-500">
                Model output is a simulated local inference ({result.assessment.model_version},{' '}
                {result.assessment.inference_mode}); the policy decision is deterministic.
              </p>
              <div className="mt-4 grid gap-2">
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => void nextStep('REQUEST_VERIFICATION')}
                >
                  Request additional verification
                </button>
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => void nextStep('PREPARE_SUPPORT_CASE')}
                >
                  Prepare support case
                </button>
              </div>
              {caseStatus && (
                <p role="status" className="mt-3 text-sm text-green-800">
                  {caseStatus}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
