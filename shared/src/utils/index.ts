// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

/** Format a number as Indian Rupees (alias for formatINR) */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a number as Indian Rupees */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Masking utilities
// ---------------------------------------------------------------------------

/** Mask account number — show only last 4 digits */
export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4);
  return `XXXX XXXX ${last4}`;
}

/** Mask card number */
export function maskCardNumber(cardNumber: string): string {
  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  return `**** **** **** ${last4}`;
}

// ---------------------------------------------------------------------------
// EMI calculation (matches backend Loan Agent logic)
// ---------------------------------------------------------------------------

/** Calculate EMI using reducing balance formula. Returns just the EMI amount. */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  const monthlyRate = annualRate / (12 * 100);
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
}

/** Calculate EMI with full breakdown (total interest and total amount). */
export function calculateEMIDetailed(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
): { emi: number; totalInterest: number; totalAmount: number } {
  const monthlyRate = annualRatePercent / (12 * 100);
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return { emi, totalInterest: 0, totalAmount: principal };
  }
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = Math.round(((principal * monthlyRate * factor) / (factor - 1)) * 100) / 100;
  const totalAmount = Math.round(emi * tenureMonths * 100) / 100;
  const totalInterest = Math.round((totalAmount - principal) * 100) / 100;
  return { emi, totalInterest, totalAmount };
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Format date to readable string */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
