// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

export interface TopRentedAsset {
  itemId: string;
  itemType: string;
  name: string;
  rentalCount: number;
  grossRevenue: number;
  netRevenue: number;
}


export interface OwnerDashboardResponse {
  totalCameras: number;
  totalAccessories: number;
  totalBookingsForOwnerItems: number;
  totalGrossRevenue: number;
  totalNetRevenue: number;
  topRentedAssets: TopRentedAsset[];
  dailyStats?: TimeSeriesStat[];
  monthlyStats?: TimeSeriesStat[];
}

export interface BookingStatusCount {
  status: string;
  count: number;
}

export interface StaffDashboardResponse {
  totalAssignedBookings: number;
  bookingsByStatus: BookingStatusCount[];
  todayPickupBookings: number;
  todayReturnBookings: number;
  pendingVerificationRequests: number;
  pendingReviewsToModerate: number;
}

export interface StaffScheduleEvent {
  staffId: string;
  staffName: string;
  eventType: "Verification" | "BookingPickup" | "BookingReturn";
  bookingId: string | null;
  verificationId: string | null;
  startAt: string;
  endAt: string;
  title: string;
}

export type StaffScheduleResponse = StaffScheduleEvent[];

export interface WorkSlot {
  id: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BookingStatusCount {
  status: string;
  statusText: string;
  count: number;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalRenters: number;
  totalOwners: number;
  totalStaffs: number;
  totalBranchManagers: number;
  totalBranches: number;
  totalCameras: number;
  totalAccessories: number;
  totalCombos: number;
  totalBookings: number;
  bookingsByStatus: BookingStatusCount[];
  totalCapturedRevenue: number;
  totalRefundedAmount: number;
  dailyStats: TimeSeriesStat[];
  monthlyStats: TimeSeriesStat[];
  openDisputes: number;
  resolvedDisputes: number;
}
interface BookingStatus {
  status: string;
  statusText: string;
  count: number;
}
export interface TimeSeriesStat {
  date: string;
  bookingCount: number;
  capturedRevenue: number;
}
interface ManagerDashboardResponse {
  branchId: string;
  branchName: string;
  camerasInBranch: number;
  accessoriesInBranch: number;
  totalBookings: number;
  bookingsByStatus: BookingStatus[];
  totalCapturedRevenue: number;
  openDisputes: number;
  dailyStats: TimeSeriesStat[];
  monthlyStats: TimeSeriesStat[];
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

  async getStaffDashboard(): Promise<StaffDashboardResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/Dashboard/staff`, {
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

    const json = (await response.json()) as StaffDashboardResponse;
    return json;
  },

  async getStaffSchedule(
    staffId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<StaffScheduleResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    let url = `${API_BASE_URL}/Dashboard/staff-schedule`;

    const params = new URLSearchParams({
      staffId: staffId,
    });

    if (fromDate && toDate) {
      params.append("from", fromDate);
      params.append("to", toDate);
    }

    url += `?${params.toString()}`;

    const response = await fetch(url, {
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
          `Không thể tải lịch làm việc (mã ${response.status})`
      );
    }

    const json = (await response.json()) as StaffScheduleResponse;
    return json;
  },

  async getWorkSlots(): Promise<WorkSlot[]> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/WorkSlots`, {
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
          `Không thể tải danh sách ca làm việc (mã ${response.status})`
      );
    }

    const json = (await response.json()) as WorkSlot[];
    return json;
  },

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/Dashboard/admin`, {
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
          `Không thể tải dữ liệu thống kê admin (mã ${response.status})`
      );
    }

    const json = (await response.json()) as AdminDashboardResponse;
    return json;
  },
};
export const dashboardServiceManager = {
  getManagerDashboard: async (): Promise<ManagerDashboardResponse> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/Dashboard/manager`, {
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
          `Không thể tải dữ liệu thống kê manager (mã ${response.status})`
      );
    }

    const json = (await response.json()) as ManagerDashboardResponse;
    return json;
  },
};

