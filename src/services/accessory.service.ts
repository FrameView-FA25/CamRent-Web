import type {
  Accessory,
  AccessoryResponse,
  AccessoryFilters,
} from "../types/accessory.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const accessoryService = {
  // Get all accessories with filters
  getAccessories: async (
    filters: AccessoryFilters
  ): Promise<AccessoryResponse> => {
    const params = new URLSearchParams();
    params.append("page", filters.page.toString());
    params.append("pageSize", filters.pageSize.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.model) params.append("model", filters.model);

    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/Accessories?${params.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get accessory by ID
  getAccessoryById: async (id: string): Promise<Accessory> => {
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/Accessories/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get accessories by owner ID
  getAccessoriesByOwnerId: async (): Promise<Accessory[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${API_BASE_URL}/Accessories/GetAccessoriesByOwnerId`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Create new accessory
  createAccessory: async (formData: FormData): Promise<Accessory> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/Accessories`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update accessory
  updateAccessory: async (
    accessoryId: string,
    accessoryData: Partial<Accessory> & {
      mediaFiles?: File[];
      removeMediaIds?: string[];
    }
  ): Promise<Accessory> => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const formData = new FormData();

      // Thêm Id vào FormData (bắt buộc theo API spec)
      formData.append("Id", accessoryId);

      const appendIfDefined = (key: string, value: unknown) => {
        if (value === undefined || value === null) {
          return;
        }
        if (typeof value === "number" && Number.isNaN(value)) {
          return;
        }
        formData.append(key, String(value));
      };

      appendIfDefined("Brand", accessoryData.brand);
      appendIfDefined("Model", accessoryData.model);
      appendIfDefined("Variant", accessoryData.variant);
      appendIfDefined("SerialNumber", accessoryData.serialNumber);
      appendIfDefined("BaseDailyRate", accessoryData.baseDailyRate);
      appendIfDefined("EstimatedValueVnd", accessoryData.estimatedValueVnd);
      appendIfDefined("DepositPercent", accessoryData.depositPercent);
      appendIfDefined("DepositCapMinVnd", accessoryData.depositCapMinVnd);
      appendIfDefined("DepositCapMaxVnd", accessoryData.depositCapMaxVnd);
      appendIfDefined("SpecsJson", accessoryData.specsJson);

      // Thêm media files mới nếu có
      if (
        accessoryData.mediaFiles &&
        Array.isArray(accessoryData.mediaFiles) &&
        accessoryData.mediaFiles.length > 0
      ) {
        accessoryData.mediaFiles.forEach((file) => {
          if (file instanceof File) {
            formData.append("MediaFiles", file);
          }
        });
      }

      // Thêm removeMediaIds nếu có (để xóa media cũ)
      if (
        accessoryData.removeMediaIds &&
        Array.isArray(accessoryData.removeMediaIds) &&
        accessoryData.removeMediaIds.length > 0
      ) {
        accessoryData.removeMediaIds.forEach((mediaId) => {
          if (mediaId) {
            formData.append("RemoveMediaIds", mediaId);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/Accessories`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật phụ kiện thất bại với status ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data: Accessory = await response.json();
        return data;
      }

      return {
        ...(accessoryData as Accessory),
        id: accessoryId,
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật phụ kiện:", error);
      throw error;
    }
  },

  // Delete accessory
  deleteAccessory: async (id: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/Accessories/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};
