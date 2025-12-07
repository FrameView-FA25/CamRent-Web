/**
 * Wallet Types
 * Type definitions for wallet-related data
 */

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  isCredit: boolean;
  paymentId?: string;
  bookingId?: string;
  description: string;
  createdAt: string;
  status?: string;
}

export interface Wallet {
  balance: number;
  frozenBalance: number;
  recentTransactions: Transaction[];
}

export interface WalletStats {
  totalDeposit: number;
  totalWithdraw: number;
  totalSpent: number;
  pendingAmount: number;
}

export interface TransactionFilter {
  type?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DepositRequest {
  amount: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface DepositResponse {
  checkoutUrl: string;
  orderId: string;
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface WithdrawResponse {
  transactionId: string;
  amount: number;
  status: string;
  message: string;
}