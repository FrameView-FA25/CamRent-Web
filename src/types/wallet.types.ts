/**
 * Wallet Types
 * Type definitions for wallet-related data
 */

export interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  isCredit: boolean;
  paymentId?: string;
  bookingId?: string;
  description: string;
  createdAt: string;
}

export interface WalletBalanceResponse {
  balance: number;
}

export interface Wallet {
  balance: number;
  frozenBalance: number;
  recentTransactions: RecentTransaction[];
}
