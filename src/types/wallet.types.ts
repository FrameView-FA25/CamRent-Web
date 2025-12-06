/**
 * Wallet Types
 * Types and interfaces for wallet management
 */

export interface Wallet {
  userId: string;
  accountId: string;
  balance: number;
  currency: string;
  status: "Active" | "Suspended" | "Closed";
  createdDate: string;
  updatedDate: string;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  amount: number;
  type: "Deposit" | "Withdraw" | "Payment" | "Refund" | "Rental" | "Return";
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
  description: string;
  createdDate: string;
  updatedDate: string;
  relatedId?: string; // booking ID hoặc payment ID
}

export interface DepositRequest {
  amount: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface DepositResponse {
  transactionId: string;
  checkoutUrl: string;
  qrCode?: string;
}

export interface WithdrawRequest {
  amount: number;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
}

export interface WithdrawResponse {
  transactionId: string;
  status: string;
  message: string;
}

export interface TransactionFilter {
  type?: Transaction["type"];
  status?: Transaction["status"];
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

export interface WalletStats {
  totalDeposit: number;
  totalWithdraw: number;
  totalSpent: number;
  pendingAmount: number;
  transactionCount: number;
}
