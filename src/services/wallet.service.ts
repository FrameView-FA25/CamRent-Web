/**
 * Wallet Service
 * API calls for wallet management
 */

import type { Wallet, WalletBalanceResponse } from "../types/wallet.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app/api";

interface TopupResponse {
  redirectUrl?: string;
  paymentUrl?: string;
  payUrl?: string;
  checkoutUrl?: string;
  url?: string;
  data?: {
    redirectUrl?: string;
    paymentUrl?: string;
    payUrl?: string;
    checkoutUrl?: string;
    url?: string;
  };
}

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
export async function getBalance(): Promise<WalletBalanceResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/Wallets/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Không thể tải số dư ví");
  }

  return response.json();
}

/**
 * Tạo giao dịch nạp tiền
 */
export async function topupWallet(
  amount: number,
  returnUrl: string,
  cancelUrl: string
): Promise<string> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/Wallets/topup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      returnUrl,
      cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorMessage = "Không thể tạo giao dịch nạp tiền";
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  let data: any;
  try {
    const responseText = await response.text();
    // Thử parse JSON
    try {
      data = JSON.parse(responseText);
    } catch {
      // Nếu không phải JSON, có thể là string URL trực tiếp
      if (responseText.startsWith("http://") || responseText.startsWith("https://")) {
        return responseText.trim();
      }
      throw new Error("Response không hợp lệ");
    }
  } catch (parseError) {
    console.error("Lỗi parse response:", parseError);
    throw new Error("Không thể đọc phản hồi từ server");
  }
  
  // Log để debug
  console.log("Topup response:", data);
  
  // Tìm URL thanh toán trong nhiều định dạng có thể
  const url =
    data?.redirectUrl ||
    data?.paymentUrl ||
    data?.payUrl ||
    data?.checkoutUrl ||
    data?.url ||
    data?.payment_url ||
    data?.checkout_url ||
    data?.redirect_url ||
    data?.data?.redirectUrl ||
    data?.data?.paymentUrl ||
    data?.data?.payUrl ||
    data?.data?.checkoutUrl ||
    data?.data?.url ||
    data?.data?.payment_url ||
    data?.data?.checkout_url ||
    data?.data?.redirect_url ||
    data?.result?.redirectUrl ||
    data?.result?.paymentUrl ||
    data?.result?.url ||
    (typeof data === "string" && (data.startsWith("http://") || data.startsWith("https://")) ? data : null);

  if (!url) {
    console.error("Response không chứa payment URL. Full response:", JSON.stringify(data, null, 2));
    throw new Error("Không nhận được liên kết thanh toán từ server. Vui lòng thử lại sau.");
  }

  return url;
}
