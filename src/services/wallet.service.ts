/**
 * Wallet Service
 * API calls for wallet management
 */

import type {
  Wallet,
  Transaction,
  DepositRequest,
  DepositResponse,
  WithdrawRequest,
  WithdrawResponse,
  TransactionFilter,
  TransactionListResponse,
  WalletStats,
} from "../types/wallet.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Get wallet information
 */
export async function getWallet(): Promise<Wallet> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/Wallets/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể tải thông tin ví");
  }

  return response.json();
}

/**
 * Get wallet statistics
 */
export async function getWalletStats(): Promise<WalletStats> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/Wallets/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể tải thống kê ví");
  }

  return response.json();
}

/**
 * Get transaction history
 */
export async function getTransactions(
  filter: TransactionFilter = {}
): Promise<TransactionListResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const params = new URLSearchParams();
  if (filter.type) params.append("type", filter.type);
  if (filter.status) params.append("status", filter.status);
  if (filter.fromDate) params.append("fromDate", filter.fromDate);
  if (filter.toDate) params.append("toDate", filter.toDate);
  if (filter.page) params.append("page", filter.page.toString());
  if (filter.pageSize) params.append("pageSize", filter.pageSize.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE_URL}/Transactions?${queryString}`
    : `${API_BASE_URL}/Transactions`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể tải lịch sử giao dịch");
  }

  return response.json();
}

/**
 * Deposit money to wallet
 */
export async function depositToWallet(
  request: DepositRequest
): Promise<DepositResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/Wallets/deposit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể nạp tiền vào ví");
  }

  return response.json();
}

/**
 * Withdraw money from wallet
 */
export async function withdrawFromWallet(
  request: WithdrawRequest
): Promise<WithdrawResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/Wallets/withdraw`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể rút tiền từ ví");
  }

  return response.json();
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(
  transactionId: string
): Promise<Transaction> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(
    `${API_BASE_URL}/Transactions/${transactionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể tải chi tiết giao dịch");
  }

  return response.json();
}
