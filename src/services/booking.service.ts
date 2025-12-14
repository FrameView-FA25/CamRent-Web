import type {
  Booking,
  BookingItem,
  Staff,
  CreateDeliveryRequest,
  CreateInspectionRequest,
  RenterInfo,
  RenterBookingHistory,
} from "../types/booking.types";

export type { RenterInfo, RenterBookingHistory };

type ApiBookingItem = BookingItem & {
  id: string;
  bookingId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// URL cơ sở của API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Hàm helper để tạo headers xác thực cho các request API
 * @returns Object chứa headers với token xác thực
 */
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

/**
 * Lấy thông tin chi tiết của item trong booking (camera hoặc phụ kiện)
 * Hàm này sẽ fetch thông tin đầy đủ từ API nếu item chỉ có ID mà chưa có thông tin chi tiết
 * @param item - BookingItem cần lấy thông tin chi tiết
 * @returns Promise chứa BookingItem với thông tin đầy đủ
 */
export const fetchItemDetails = async (
  item: BookingItem
): Promise<BookingItem> => {
  try {
    // Lấy thông tin chi tiết camera nếu có cameraId nhưng chưa có thông tin camera
    if (item.cameraId && !item.camera) {
      const cameraResponse = await fetch(
        `${API_BASE_URL}/Cameras/${item.cameraId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (cameraResponse.ok) {
        const cameraData = await cameraResponse.json();
        item.camera = {
          id: cameraData.id,
          brand: cameraData.brand,
          model: cameraData.model,
          variant: cameraData.variant,
        };
      }
    }

    // Lấy thông tin chi tiết phụ kiện nếu có accessoryId nhưng chưa có thông tin accessory
    if (item.accessoryId && !item.accessory) {
      const accessoryResponse = await fetch(
        `${API_BASE_URL}/Accessories/${item.accessoryId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (accessoryResponse.ok) {
        const accessoryData = await accessoryResponse.json();
        item.accessory = {
          id: accessoryData.id,
          brand: accessoryData.brand,
          model: accessoryData.model,
          variant: accessoryData.variant,
        };
      }
    }

    return item;
  } catch (err) {
    console.error("Error fetching item details:", err);
    return item;
  }
};

/**
 * Lấy danh sách tất cả booking của user hiện tại
 * Yêu cầu đăng nhập
 * @returns Promise chứa danh sách booking và error (nếu có)
 */
export const fetchBookings = async (): Promise<{
  bookings: Booking[];
  error: string | null;
}> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    // Gọi API để lấy danh sách booking
    const response = await fetch(`${API_BASE_URL}/Bookings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const data = await response.json();
    // Đảm bảo data là array
    const bookingsArray = Array.isArray(data) ? data : [data];

    // Lấy thông tin chi tiết cho tất cả items trong tất cả bookings
    const bookingsWithDetails = await Promise.all(
      bookingsArray.map(async (booking) => {
        const itemsWithDetails = await Promise.all(
          booking.items.map((item: BookingItem) => fetchItemDetails(item))
        );
        return { ...booking, items: itemsWithDetails };
      })
    );

    return { bookings: bookingsWithDetails, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching bookings:", err);
    return { bookings: [], error: errorMessage };
  }
};

/**
 * Lấy danh sách booking của chi nhánh hiện tại
 * Dành cho BranchManager - chỉ lấy các booking thuộc chi nhánh của họ
 * Yêu cầu đăng nhập với quyền BranchManager
 * @returns Promise chứa danh sách booking của chi nhánh và error (nếu có)
 */
export const fetchBranchBookings = async (): Promise<{
  bookings: Booking[];
  error: string | null;
}> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/Bookings/branchbookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 404 || response.status === 204) {
      console.info("No branch bookings found");
      return { bookings: [], error: null };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      throw new Error(`Failed to fetch branch bookings: ${response.status}`);
    }

    const data = await response.json();

    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.info("Branch bookings list is empty");
      return { bookings: [], error: null };
    }

    const bookingsArray = Array.isArray(data) ? data : [data];

    // Lọc bỏ các booking có status "Giỏ hàng" (chưa được xác nhận)
    const validBookings = bookingsArray.filter(
      (booking) => booking.statusText !== "Giỏ hàng"
    );

    // Không cần fetch item details vì API đã cung cấp itemName & itemType
    return { bookings: validBookings, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching branch bookings:", err);
    return { bookings: [], error: errorMessage };
  }
};

/**
 * Lấy danh sách nhân viên (Staff) của chi nhánh hiện tại
 * Dành cho BranchManager để xem và phân công nhân viên
 * Yêu cầu đăng nhập với quyền BranchManager
 * @returns Promise chứa danh sách staff và error (nếu có)
 */
export const fetchStaffList = async (): Promise<{
  staff: Staff[];
  error: string | null;
}> => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return {
        staff: [],
        error: "Unauthorized - No token found",
      };
    }

    const response = await fetch(`${API_BASE_URL}/Branchs/Memberships`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          staff: [],
          error: "Unauthorized - Please login again",
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Staff[] = await response.json();

    return {
      staff: data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return {
      staff: [],
      error: error instanceof Error ? error.message : "Failed to fetch staff",
    };
  }
};

/**
 * Gán nhân viên cho booking
 * Dành cho BranchManager để phân công nhân viên chăm sóc booking
 * @param bookingId - ID của booking cần gán nhân viên
 * @param staffId - ID của nhân viên được phân công
 * @returns Promise chứa kết quả (success/error)
 */
export const assignStaffToBooking = async (
  bookingId: string,
  staffId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { success: false, error: "Unauthorized - No token found" };
    }

    const response = await fetch(
      `${API_BASE_URL}/Bookings/${bookingId}/assign-staff/${staffId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ 204 No Content = Success
    if (response.status === 204) {
      return { success: true };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to assign staff: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error assigning staff to booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Tạo đơn giao hàng (Delivery) cho một booking
 * Dành cho BranchManager để tạo đơn giao và phân công nhân viên giao hàng
 * @param bookingId - ID của booking cần tạo đơn giao
 * @param assigneeUserId - ID của nhân viên được phân công giao hàng
 * @returns Promise chứa kết quả (success/error)
 */
export const createDelivery = async (
  bookingId: string,
  assigneeUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { success: false, error: "Unauthorized - No token found" };
    }

    const requestBody: CreateDeliveryRequest = {
      bookingId,
      assigneeUserId,
      trackingCode: "",
      notes: "",
      deliveryFee: 0,
    };

    const response = await fetch(`${API_BASE_URL}/Deliveries`, {
      method: "POST",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to create delivery: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating delivery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Lấy danh sách booking được phân công cho nhân viên hiện tại
 * Dành cho Staff - chỉ lấy các booking mà họ được phân công xử lý
 * Yêu cầu đăng nhập với quyền Staff
 * @returns Promise chứa danh sách booking của staff và error (nếu có)
 */
export const fetchStaffBookings = async (): Promise<{
  bookings: Booking[];
  error: string | null;
}> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/Bookings/staffbookings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    // Xử lý trường hợp không có data (404 hoặc 204) - không có booking nào được gán
    if (response.status === 404 || response.status === 204) {
      console.info("Không có booking nào được gán");
      return { bookings: [], error: null };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      return {
        bookings: [],
        error: `Failed to fetch bookings: ${response.status}`,
      };
    }

    const data = await response.json();

    // Kiểm tra nếu data rỗng
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.info("Danh sách booking trống");
      return { bookings: [], error: null };
    }

    const bookingsArray = Array.isArray(data) ? data : [data];

    // Lấy thông tin chi tiết cho tất cả items trong tất cả bookings
    const bookingsWithDetails = await Promise.all(
      bookingsArray.map(async (booking) => {
        const itemsWithDetails = await Promise.all(
          booking.items.map((item: BookingItem) => fetchItemDetails(item))
        );
        return { ...booking, items: itemsWithDetails };
      })
    );

    return { bookings: bookingsWithDetails, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching staff bookings:", err);
    return { bookings: [], error: errorMessage };
  }
};

/**
 * Lấy thông tin chi tiết của một booking theo ID
 * Yêu cầu đăng nhập
 * @param bookingId - ID của booking cần lấy
 * @returns Promise chứa thông tin booking và error (nếu có)
 */
export const fetchBookingById = async (
  bookingId: string
): Promise<{ booking: Booking | null; error: string | null }> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/Bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 404) {
      return { booking: null, error: "Booking not found" };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      throw new Error(`Failed to fetch booking: ${response.status}`);
    }

    const data = await response.json();

    // Chuyển đổi dữ liệu từ API để khớp với interface Booking
    const booking: Booking = {
      contracts: data.contracts,
      id: data.id,
      type: data.type || "Rental",
      renterId: data.renterId,
      renter: data.renter,
      staffId: data.staffId,
      pickupAt: data.pickupAt,
      returnAt: data.returnAt,
      location: data.location,
      branchId: data.branchId,
      branch: data.branch,
      status: data.status,
      statusText: data.status, // API trả về status là string
      snapshotBaseDailyRate: data.snapshotBaseDailyRate,
      snapshotDepositPercent: data.snapshotDepositPercent,
      snapshotPlatformFeePercent: data.snapshotPlatformFeePercent,
      snapshotRentalTotal: data.snapshotRentalTotal,
      snapshotDepositAmount: data.snapshotDepositAmount,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      items: data.items.map((item: ApiBookingItem) => ({
        id: item.id,
        bookingId: item.bookingId,
        cameraId: item.cameraId,
        camera: item.camera,
        accessoryId: item.accessoryId,
        accessory: item.accessory,
        comboId: item.comboId,
        combo: item.combo,
        itemId:
          item.itemId ||
          item.cameraId ||
          item.accessoryId ||
          item.comboId ||
          "",
        itemName:
          item.itemName ||
          (item.camera
            ? `${item.camera.brand} ${item.camera.model}${
                item.camera.variant ? ` ${item.camera.variant}` : ""
              }`
            : item.accessory
            ? `${item.accessory.brand} ${item.accessory.model}`
            : item.combo
            ? item.combo.name
            : "Unknown Item"),
        itemType:
          item.itemType ||
          (item.camera
            ? "Camera"
            : item.accessory
            ? "Accessory"
            : item.combo
            ? "Combo"
            : "Unknown"),
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? 0,
        depositAmount: item.depositAmount ?? 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      inspections: data.inspections || [],
    };

    return { booking, error: null };
  } catch (error: unknown) {
    console.error("Error fetching booking by ID:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể tải thông tin đơn hàng";
    return { booking: null, error: errorMessage };
  }
};

/**
 * Cập nhật trạng thái booking
 * @param bookingId - ID của booking cần cập nhật
 * @param status - Trạng thái mới (Confirmed, PickedUp, Returned, Completed, Cancelled)
 * @returns Promise void
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: "Confirmed" | "PickedUp" | "Returned" | "Completed" | "Cancelled"
): Promise<void> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Vui lòng đăng nhập lại");
    }

    const response = await fetch(
      `${API_BASE_URL}/Bookings/${bookingId}/update-status?status=${status}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.title || "Cập nhật trạng thái thất bại"
      );
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

/**
 * Tạo bản kiểm tra thiết bị (Inspection) cho một booking
 * Dành cho Staff để kiểm tra tình trạng thiết bị khi nhận/trả
 * @param inspectionData - Dữ liệu inspection: bookingId, itemId, condition, notes, images
 * @returns Promise chứa kết quả (success/error)
 */
export const createInspection = async (
  inspectionData: CreateInspectionRequest
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/Inspections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(inspectionData),
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create inspection");
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating inspection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
export const fetchOwnerRenters = async (): Promise<{
  renters: RenterInfo[];
  error: string | null;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Bookings/owner/renters`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { renters: data, error: null };
  } catch (error: unknown) {
    console.error("Error fetching owner renters:", error);
    return {
      renters: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const fetchRenterBookingHistory = async (
  renterId: string
): Promise<{
  bookings: RenterBookingHistory[];
  error: string | null;
}> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Bookings/owner/renters/${renterId}/bookings`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { bookings: data, error: null };
  } catch (error: unknown) {
    console.error("Error fetching renter booking history:", error);
    return {
      bookings: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
