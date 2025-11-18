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
