const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

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
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
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
};