const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://camrent-backend.up.railway.app/api";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  status: string;
}

export interface StaffWorkloadItem {
  staffId: string;
  staffName: string;
  assignedBookings: number;
  assignedVerifications: number;
  todayPickupBookings: number;
  todayReturnBookings: number;
}

export interface StaffWorkloadResponse {
  branchId: string;
  branchName: string;
  staffs: StaffWorkloadItem[];
}
export interface StaffScheduleEvent {
  staffId: string;
  staffName: string;
  eventType: "Verification" | "Pickup" | "Return" | "Booking";
  bookingId: string | null;
  verificationId: string | null;
  startAt: string;
  endAt: string;
  title: string;
}
export interface AvailableStaffItem {
  staffId: string;
  staffName: string;
  isAvailable: boolean;
  assignedBookings: number;
  assignedVerifications: number;
  todayPickupBookings: number;
  todayReturnBookings: number;
  conflictingBookings: number;
  conflictingVerifications: number;
}

export interface AvailableStaffResponse {
  branchId: string;
  branchName: string;
  staffs: AvailableStaffItem[];
}
export const staffService = {
  /**
   * Lấy workload của staff trong khoảng thời gian
   */
  async getStaffWorkload(
    fromDate: string,
    toDate: string
  ): Promise<StaffWorkloadResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });

      const url = `${API_BASE_URL}/Dashboard/staff-workload?${params.toString()}`;
      console.log("Fetching staff workload from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch staff workload: ${response.status} - ${errorText}`
        );
      }

      const data: StaffWorkloadResponse = await response.json();
      console.log("Staff workload data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching staff workload:", error);
      throw error;
    }
  },
  async getStaffSchedule(
    staffId: string,
    fromDate: string,
    toDate: string
  ): Promise<StaffScheduleEvent[]> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const params = new URLSearchParams({
        staffId: staffId,
        from: fromDate,
        to: toDate,
      });

      const url = `${API_BASE_URL}/Dashboard/staff-schedule?${params.toString()}`;
      console.log("Fetching staff schedule from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch staff schedule: ${response.status} - ${errorText}`
        );
      }

      const data: StaffScheduleEvent[] = await response.json();
      console.log("Staff schedule data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching staff schedule:", error);
      throw error;
    }
  },
  async getAvailableStaff(
    startDate: string,
    endDate: string,
    type: "booking" | "verification" | "both" = "both"
  ): Promise<AvailableStaffResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        type: type,
      });

      const url = `${API_BASE_URL}/Dashboard/available-staff?${params.toString()}`;
      console.log("Fetching available staff from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch available staff: ${response.status} - ${errorText}`
        );
      }

      const data: AvailableStaffResponse = await response.json();
      console.log("Available staff data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching available staff:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả nhân viên (Staff và BranchManager)
   * Sử dụng API /Users và filter theo role
   */
  async getAllStaffs(): Promise<StaffUser[]> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const url = `${API_BASE_URL}/Users?page=1&pageSize=1000`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch users: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      const users = data.items || data;

      // Filter users có role Staff hoặc BranchManager
      return users.filter(
        (user: StaffUser) =>
          user.roles.includes("Staff") || user.roles.includes("BranchManager")
      );
    } catch (error) {
      console.error("Error fetching staffs:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách nhân viên available (chưa gán branch)
   */
  async getAvailableStaffs(): Promise<StaffUser[]> {
    return this.getAllStaffs();
  },
};
