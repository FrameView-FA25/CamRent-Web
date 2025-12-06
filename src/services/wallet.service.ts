const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://camrent-backend.up.railway.app/api";

export interface WalletResponse {
  balance: number;
  frozenBalance: number;
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
  status?: string;
}

export const walletService = {
  /**
   * Lấy thông tin ví của user hiện tại
   * GET /api/Wallets/me
   */
  async getMyWallet(): Promise<WalletResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/Wallets/me`, {
      method: "GET",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể tải thông tin ví (mã ${response.status})`
      );
    }

    const json = (await response.json()) as WalletResponse;
    return json;
  },
};
