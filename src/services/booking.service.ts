import type { Booking, BookingItem, Staff, CreateDeliveryRequest,  } from "../types/booking.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
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

    const response = await fetch(
      `https://camrent-backend.up.railway.app/memberships`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch staff bookings");
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
    console.error("Error fetching staff bookings:", err);
    return { bookings: [], error: errorMessage };
  }
};

export const fetchBookingById = async (
  bookingId: string
): Promise<{ booking: Booking | null; error: string | null }> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockBooking: Booking = {
      id: bookingId,
      renterId: "renter-123",
      type: 0,
      pickupAt: new Date().toISOString(),
      returnAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      status: 1,
      statusText: "Confirmed",
      snapshotRentalTotal: 5000000,
      snapshotDepositAmount: 2000000,
      snapshotTransportFee: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      renter: {
        id: "renter-123",
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phoneNumber: "0912345678",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        dateOfBirth: "1990-01-01",
        gender: 1,
        avatar: "",
        emailConfirmed: true,
        phoneNumberConfirmed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      items: [
        {
          cameraId: "item-1",
          productId: "product-1",
          quantity: 1,
          unitPrice: 3000000,
          depositAmount: 1000000,
          product: {
            id: "product-1",
            name: "Canon EOS R5",
            category: "Camera",
            brand: "Canon",
            model: "EOS R5",
            price: 3000000,
            depositAmount: 1000000,
            rating: 4.8,
            reviewCount: 156,
            categoryId: "cat-1",
            description: "Máy ảnh chuyên nghiệp",
            specifications: "42MP, 8K Video",
            status: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },  
        {
          cameraId: "item-2",
          productId: "product-2",
          quantity: 1,
          unitPrice: 2000000,
          depositAmount: 1000000,
          product: {
            id: "product-2",
            name: "Lens RF 24-70mm f/2.8",
            category: "Lens",
            brand: "Canon",
            model: "RF 24-70mm",
            price: 2000000,
            depositAmount: 1000000,
            rating: 4.9,
            reviewCount: 89,
            categoryId: "cat-2",
            description: "Ống kính zoom đa năng",
            specifications: "24-70mm, f/2.8",
            status: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ],
    };

    return { booking: mockBooking, error: null };
  } catch (error: unknown) {
    console.error("Error fetching booking by ID:", error);
    return { booking: null, error: "Không thể tải thông tin đơn hàng" };
  }
};
