/**
 * Wallet Service
 * API calls for wallet management
 */

import type { Wallet } from "../types/wallet.types";

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
