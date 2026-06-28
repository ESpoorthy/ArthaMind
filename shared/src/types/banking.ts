import type { UUID, ISODateString, CurrencyCode } from './common';

export type AccountType = 'savings' | 'current';
export type AccountStatus = 'active' | 'inactive' | 'frozen';
export type CardType = 'debit' | 'credit';
export type CardStatus = 'active' | 'blocked' | 'expired';
export type LoanType = 'personal' | 'home' | 'auto' | 'education';
export type LoanStatus = 'active' | 'closed' | 'defaulted';
export type TransactionType = 'debit' | 'credit' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type FDStatus = 'active' | 'matured' | 'closed';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Account {
  accountId: UUID;
  accountNumber: string; // masked: XXXX XXXX 1234
  accountType: AccountType;
  balance: number;
  currency: CurrencyCode;
  status: AccountStatus;
  openedDate: ISODateString;
}

export interface Transaction {
  transactionId: UUID;
  accountId: UUID;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  balanceAfter: number;
  description: string;
  merchantName?: string;
  merchantCategory?: string;
  referenceNumber: string;
  status: TransactionStatus;
  transactionDate: ISODateString;
}

export interface Card {
  cardId: UUID;
  accountId: UUID;
  cardNumber: string; // masked: **** **** **** 1234
  cardType: CardType;
  status: CardStatus;
  expiryDate: string; // MM/YY
  creditLimit?: number;
  availableCredit?: number;
}

export interface Loan {
  loanId: UUID;
  loanType: LoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  outstandingAmount: number;
  status: LoanStatus;
  nextEmiDate: ISODateString;
  disbursementDate: ISODateString;
  maturityDate: ISODateString;
}

export interface FixedDeposit {
  fdId: UUID;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  maturityAmount: number;
  status: FDStatus;
  startDate: ISODateString;
  maturityDate: ISODateString;
  autoRenewal: boolean;
}

export interface EMICalculation {
  emiAmount: number;
  totalInterest: number;
  totalAmount: number;
  schedule: EMIScheduleEntry[];
}

export interface EMIScheduleEntry {
  installmentNo: number;
  dueDate: ISODateString;
  emiAmount: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface Notification {
  notificationId: UUID;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: ISODateString;
}
