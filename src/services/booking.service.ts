import type {
  Booking,
  BookingItem,
  Staff,
  CreateDeliveryRequest,
  CreateInspectionRequest,
} from "../types/booking.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const fetchItemDetails = async (
  item: BookingItem
): Promise<BookingItem> => {
  try {
    // Fetch camera details if cameraId exists
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

    // Fetch accessory details if accessoryId exists
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

export const fetchBookings = async (): Promise<{
  bookings: Booking[];
  error: string | null;
}> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/Bookings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const data = await response.json();
    const bookingsArray = Array.isArray(data) ? data : [data];

    // Fetch details for all items in all bookings
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

// ✅ NEW: Fetch Branch Bookings
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

    // ✅ Filter out cart items
    const validBookings = bookingsArray.filter(
      (booking) => booking.statusText !== "Giỏ hàng"
    );

    // ✅ No need to fetch item details - API already provides itemName & itemType
    return { bookings: validBookings, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching branch bookings:", err);
    return { bookings: [], error: errorMessage };
  }
};

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

    // Xử lý trường hợp không có data (404 hoặc 204)
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

    // Fetch details for all items in all bookings
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

    // ✅ Transform API response to match Booking interface
    const booking: Booking = {
      id: data.id,
      type: data.type || "Rental",
      renterId: data.renterId,
      renter: data.renter,
      staffId: data.staffId,
      staff: data.staff,
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
      items: data.items.map((item: any) => ({
        id: item.id,
        bookingId: item.bookingId,
        cameraId: item.cameraId,
        camera: item.camera,
        accessoryId: item.accessoryId,
        accessory: item.accessory,
        comboId: item.comboId,
        combo: item.combo,
        unitPrice: item.unitPrice,
        depositAmount: item.depositAmount,
        // ✅ Add itemName and itemType for consistency
        itemId: item.cameraId || item.accessoryId || item.comboId || "",
        itemName: item.camera
          ? `${item.camera.brand} ${item.camera.model}${
              item.camera.variant ? ` ${item.camera.variant}` : ""
            }`
          : item.accessory
          ? `${item.accessory.brand} ${item.accessory.model}`
          : item.combo
          ? item.combo.name
          : "Unknown Item",
        itemType: item.camera
          ? "Camera"
          : item.accessory
          ? "Accessory"
          : item.combo
          ? "Combo"
          : "Unknown",
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
