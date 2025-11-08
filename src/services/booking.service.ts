import type { Booking, BookingItem } from "../types/booking.types";
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

export const fetchStaffBookings = async (): Promise<{
  bookings: Booking[];
  error: string | null;
}> => {
  try {
    console.log("Fetching staff bookings...");

    // Reuse the existing fetchBookings function to ensure consistency
    const { bookings: allBookings, error } = await fetchBookings();

    if (error) {
      console.error("Error from fetchBookings:", error);
      return { bookings: [], error };
    }

    console.log("All bookings count:", allBookings.length);
    console.log(
      "Booking statuses:",
      allBookings.map((b) => ({ id: b.id, status: b.status }))
    );

    // Filter bookings for staff (confirmed and processing bookings that need handling)
    const staffRelevantBookings = allBookings.filter(
      (booking: Booking) => booking.status === 2 || booking.status === 1 // Confirmed or processing bookings
    );

    console.log(
      "Staff relevant bookings:",
      staffRelevantBookings.length,
      "out of",
      allBookings.length
    );

    return { bookings: staffRelevantBookings, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching staff bookings:", err);
    return { bookings: [], error: errorMessage };
  }
};
