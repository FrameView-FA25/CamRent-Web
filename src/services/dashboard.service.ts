// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

export interface TopRentedAsset {
  itemId: string;
  itemType: string;
  name: string;
  rentalCount: number;
  grossRevenue: number;
}

export interface TimeSeriesStat {
  date: string;
  bookingCount: number;
  capturedRevenue: number;
}

export interface OwnerDashboardResponse {
  totalCameras: number;
  totalAccessories: number;
  totalBookingsForOwnerItems: number;
  totalGrossRevenue: number;
  topRentedAssets: TopRentedAsset[];
  dailyStats?: TimeSeriesStat[];
  monthlyStats?: TimeSeriesStat[];
}

/**
 * Lấy dữ liệu thống kê dashboard cho Owner
 */
export const dashboardService = {
  async getOwnerDashboard(): Promise<OwnerDashboardResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/Dashboard/owner`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể tải dữ liệu thống kê (mã ${response.status})`
      );
    }

    const json = (await response.json()) as OwnerDashboardResponse;
    return json;
  },
};
