import type {
  Dispute,
  CreateDisputeRequest,
  AddDisputeItemRequest,
} from "../types/booking.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Hàm helper để tạo headers xác thực cho các request API
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
 * Tạo dispute mới cho booking
 * @param request - Thông tin dispute cần tạo
 * @returns Promise chứa ID của dispute mới được tạo
 */
export const createDispute = async (
  request: CreateDisputeRequest
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Disputes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create dispute: ${response.statusText}`
      );
    }

    const disputeId = await response.text();
    return disputeId;
  } catch (error) {
    console.error("Error creating dispute:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết dispute theo ID
 * @param disputeId - ID của dispute cần lấy
 * @returns Promise chứa thông tin chi tiết dispute
 */
export const getDisputeById = async (disputeId: string): Promise<Dispute> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Disputes/${disputeId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dispute: ${response.statusText}`);
    }

    const dispute = await response.json();
    return dispute;
  } catch (error) {
    console.error("Error fetching dispute:", error);
    throw error;
  }
};

/**
 * Lấy danh sách disputes theo booking ID
 * @param bookingId - ID của booking
 * @returns Promise chứa danh sách disputes của booking
 */
export const getDisputesByBookingId = async (
  bookingId: string
): Promise<Dispute[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Disputes/by-booking/${bookingId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch disputes for booking: ${response.statusText}`
      );
    }

    const disputes = await response.json();
    return disputes;
  } catch (error) {
    console.error("Error fetching disputes by booking:", error);
    throw error;
  }
};

/**
 * Thêm item vào dispute
 * @param disputeId - ID của dispute
 * @param request - Thông tin item cần thêm
 * @returns Promise void
 */
export const addDisputeItem = async (
  disputeId: string,
  request: AddDisputeItemRequest
): Promise<void> => {
  try {
    console.log("Adding dispute item:", { disputeId, request });

    const response = await fetch(
      `${API_BASE_URL}/Disputes/${disputeId}/items`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: request.type,
          amount: request.amount,
          notes: request.notes,
        }),
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(
        errorData.title ||
          errorData.message ||
          `Failed to add dispute item: ${response.statusText}`
      );
    }

    console.log("Dispute item added successfully");
  } catch (error) {
    console.error("Error adding dispute item:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái dispute
 * @param disputeId - ID của dispute
 * @param status - Trạng thái mới
 * @returns Promise void
 */
export const updateDisputeStatus = async (
  disputeId: string,
  status: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Disputes/${disputeId}/status`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update dispute status: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error updating dispute status:", error);
    throw error;
  }
};

/**
 * Gán dispute cho staff
 * @param disputeId - ID của dispute
 * @param staffId - ID của staff được gán
 * @returns Promise void
 */
export const assignDispute = async (
  disputeId: string,
  staffId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Disputes/${disputeId}/assign`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ staffId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to assign dispute: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error assigning dispute:", error);
    throw error;
  }
};

export const resolveDispute = async (disputeId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Disputes/${disputeId}/resolved`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to resolve dispute: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error resolving dispute:", error);
    throw error;
  }
};

/**
 * Từ chối dispute
 * @param disputeId - ID của dispute
 * @param request - Thông tin từ chối (resolutionNote)
 * @returns Promise void
 */
export const rejectDispute = async (disputeId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Disputes/${disputeId}/rejected`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to reject dispute: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error rejecting dispute:", error);
    throw error;
  }
};
