import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VoiceConcierge from '../../src/pages/customer/VoiceConcierge';

const { apiPost } = vi.hoisted(() => ({ apiPost: vi.fn() }));
vi.mock('../../src/services/api', () => ({
  apiClient: { post: apiPost },
}));

const transaction = {
  transaction: { amount: 9500, currency: 'INR', merchant_id: 'merchant-atm-new' },
  assessment: {
    transaction_id: 'synthetic-transaction',
    final_risk_score: 0.91,
    fraud_probability: 0.82,
    anomaly_score: 0.79,
    risk_level: 'CRITICAL',
    confidence_score: 0.87,
    contributing_signals: ['NEW_DEVICE', 'NEW_LOCATION'],
    reasoning: 'Multiple unusual transaction signals were observed.',
    model_version: 'bootstrap-rf-1',
    inference_mode: 'LOCAL',
  },
  decision: { decision: 'HOLD', recommended_action: 'Route to review' },
};

describe('Voice Concierge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('simulates a real assessment and explains its recorded fields', async () => {
    apiPost.mockResolvedValueOnce({ data: transaction }).mockResolvedValueOnce({
      data: {
        answer:
          'Authoritative assessment: CRITICAL risk. Signals: NEW_DEVICE, NEW_LOCATION. Policy decision: HOLD.',
        source: 'DETERMINISTIC_READ_ONLY_FALLBACK',
      },
    });
    render(<VoiceConcierge />);
    await userEvent.click(screen.getByRole('button', { name: 'Run multi-signal risk example' }));
    expect(
      await screen.findByText((_, element) => element?.textContent === 'CRITICAL risk · HOLD'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Why was this transaction put on hold?' }),
    );
    expect(await screen.findByText(/CRITICAL risk\. Signals: NEW_DEVICE/)).toBeInTheDocument();
    expect(apiPost.mock.calls).toEqual([
      ['/sentinel/companion/simulate', { scenario: 'MULTI_SIGNAL_HIGH_RISK' }],
      [
        '/sentinel/companion/transactions/synthetic-transaction/explain',
        { question: 'Why was this transaction put on hold?' },
      ],
    ]);
  });

  it('explains a normal approval using its assessment response', async () => {
    apiPost
      .mockResolvedValueOnce({
        data: {
          ...transaction,
          assessment: { ...transaction.assessment, risk_level: 'LOW', final_risk_score: 0.08 },
          decision: { decision: 'APPROVE', recommended_action: 'Continue monitoring' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          answer: 'LOW risk. Policy decision: APPROVE.',
          source: 'DETERMINISTIC_READ_ONLY_FALLBACK',
        },
      });
    render(<VoiceConcierge />);
    await userEvent.click(screen.getByRole('button', { name: 'Run normal transaction' }));
    expect(
      await screen.findByText((_, element) => element?.textContent === 'LOW risk · APPROVE'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Why was this transaction put on hold?' }),
    );
    expect(await screen.findByText('LOW risk. Policy decision: APPROVE.')).toBeInTheDocument();
  });

  it('shows errors for unavailable assessment and requires confirmation for actions', async () => {
    apiPost
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: transaction })
      .mockResolvedValueOnce({ data: { case_id: 'case-1', status: 'SIMULATED_ONLY' } });
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
    render(<VoiceConcierge />);
    await userEvent.click(screen.getByRole('button', { name: 'Run normal transaction' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('I could not create an assessment');
    await userEvent.click(screen.getByRole('button', { name: 'Run multi-signal risk example' }));
    await screen.findByText((_, element) => element?.textContent === 'CRITICAL risk · HOLD');
    await userEvent.click(screen.getByRole('button', { name: 'Prepare support case' }));
    expect(apiPost.mock.calls).toHaveLength(2);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    fireEvent.click(screen.getByRole('button', { name: 'Prepare support case' }));
    await waitFor(() => expect(apiPost.mock.calls).toHaveLength(3));
    expect(await screen.findByText(/prepared \(SIMULATED_ONLY\)/)).toBeInTheDocument();
  });

  it('does not send a blank user message', async () => {
    render(<VoiceConcierge />);
    const input = screen.getByRole('textbox', { name: 'Ask about this transaction' });
    await userEvent.type(input, '   ');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(apiPost.mock.calls).toHaveLength(0);
  });

  it('keeps the conversation usable when an explanation request fails', async () => {
    apiPost
      .mockResolvedValueOnce({ data: transaction })
      .mockRejectedValueOnce(new Error('offline'));
    render(<VoiceConcierge />);
    await userEvent.click(screen.getByRole('button', { name: 'Run multi-signal risk example' }));
    await screen.findByText((_, element) => element?.textContent === 'CRITICAL risk · HOLD');
    const input = screen.getByRole('textbox', { name: 'Ask about this transaction' });
    await userEvent.type(input, 'Why was it held?');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'I could not retrieve that assessment explanation',
    );
    expect(screen.getByText('Why was it held?')).toBeInTheDocument();
  });
});
