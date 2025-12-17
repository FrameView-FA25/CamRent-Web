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

export interface UnassignedBooking {
  id: string;
  code: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  items: any[];
}

export interface UnassignedVerification {
  id: string;
  code: string;
  fullName: string;
  verificationDate: string;
  status: string;
  documentType: string;
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
   * Lấy danh sách bookings chưa được gán staff
   */
  async getUnassignedBookings(): Promise<UnassignedBooking[]> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const url = `${API_BASE_URL}/Bookings/branchbookings`;
      console.log("Fetching branch bookings from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch branch bookings: ${response.status} - ${errorText}`
        );
      }

      const data: any[] = await response.json();
      console.log("Branch bookings data:", data);
      
      // Filter bookings that don't have staffId assigned
      const unassignedBookings = data
        .filter((booking) => !booking.staffId)
        .map((booking) => ({
          id: booking.id,
          code: `#${booking.id.substring(0, 8).toUpperCase()}`,
          renterName: booking.renter?.fullName || "N/A",
          startDate: booking.pickupAt,
          endDate: booking.returnAt,
          totalAmount: booking.snapshotRentalTotal || 0,
          status: booking.statusText || booking.status,
          items: booking.items || [],
        }));
      
      console.log("Unassigned bookings:", unassignedBookings);
      return unassignedBookings;
    } catch (error) {
      console.error("Error fetching unassigned bookings:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách verifications chưa được gán staff
   */
  async getUnassignedVerifications(): Promise<UnassignedVerification[]> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const url = `${API_BASE_URL}/Verifications/get_by_user_id`;
      console.log("Fetching user verifications from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch user verifications: ${response.status} - ${errorText}`
        );
      }

      const data: any[] = await response.json();
      console.log("User verifications data:", data);
      
      // Filter verifications that don't have staffId assigned
      const unassignedVerifications = data
        .filter((verification) => !verification.staffId)
        .map((verification) => {
          // Generate code from id if not available
          const code = `VER-${verification.id.substring(0, 8).toUpperCase()}`;
          
          // Get item types from items array
          const itemTypes = verification.items?.map((item: any) => item.itemType).join(", ") || "Camera";
          
          return {
            id: verification.id,
            code: code,
            fullName: verification.name || "N/A",
            verificationDate: verification.inspectionDate,
            status: verification.status,
            documentType: itemTypes,
          };
        });
      
      console.log("Unassigned verifications:", unassignedVerifications);
      return unassignedVerifications;
    } catch (error) {
      console.error("Error fetching unassigned verifications:", error);
      throw error;
    }
  },

  /**
   * Gán staff cho booking
   */
  async assignStaffToBooking(
    bookingId: string,
    staffId: string
  ): Promise<void> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const url = `${API_BASE_URL}/Bookings/${bookingId}/assign-staff/${staffId}`;
      console.log("Assigning staff to booking:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to assign staff to booking: ${response.status} - ${errorText}`
        );
      }

      console.log("Staff assigned to booking successfully");
    } catch (error) {
      console.error("Error assigning staff to booking:", error);
      throw error;
    }
  },

  /**
   * Gán staff cho verification
   */
  async assignStaffToVerification(
    verificationId: string,
    staffId: string
  ): Promise<void> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy access token");
      }

      const params = new URLSearchParams({
        verificationId: verificationId,
        staffId: staffId,
      });

      const url = `${API_BASE_URL}/Verifications/assign_staff?${params.toString()}`;
      console.log("Assigning staff to verification:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to assign staff to verification: ${response.status} - ${errorText}`
        );
      }

      console.log("Staff assigned to verification successfully");
    } catch (error) {
      console.error("Error assigning staff to verification:", error);
      throw error;
    }
  },
};