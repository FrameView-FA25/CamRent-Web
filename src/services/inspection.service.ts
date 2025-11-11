import type { Inspection, InspectionPayload } from "../types/inspection.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

/**
 * Tạo inspection mới cho booking
 */
export const createInspection = async (
  payload: InspectionPayload
): Promise<{ inspection: Inspection | null; error: string | null }> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/api/Inspections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create inspection");
    }

    const data = await response.json();
    return { inspection: data, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error creating inspection:", err);
    return { inspection: null, error: errorMessage };
  }
};

/**
 * Lấy danh sách inspections của một booking
 */
export const getInspectionsByBooking = async (
  bookingId: string
): Promise<{ inspections: Inspection[]; error: string | null }> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please login again.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/Inspections?bookingId=${bookingId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch inspections");
    }

    const data = await response.json();
    const inspectionsArray = Array.isArray(data) ? data : [data];

    return { inspections: inspectionsArray, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching inspections:", err);
    return { inspections: [], error: errorMessage };
  }
};
