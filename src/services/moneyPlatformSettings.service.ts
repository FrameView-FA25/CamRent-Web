const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MoneyPlatformSettingsResponse {
  id: string;
  upfrontPercent: number;
  platformFeePercent: number;
  ownerSharePercent: number;
  lateFeeFirstNDays: number;
  lateFeeFactorFirstN: number;
  lateFeeFactorAfter: number;
  downtimeFactor: number;
  cancelTimeMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MoneyPlatformSettingsRequest {
  upfrontPercent: number;
  platformFeePercent: number;
  ownerSharePercent: number;
  lateFeeFirstNDays: number;
  lateFeeFactorFirstN: number;
  lateFeeFactorAfter: number;
  downtimeFactor: number;
  cancelTimeMinutes: number;
  isActive: boolean;
}

// Helper function để lấy token từ localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function để tạo headers
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function để xử lý response
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const moneyPlatformSettingsService = {
  // Lấy danh sách cấu hình
  getAll: async (): Promise<MoneyPlatformSettingsResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/MoneyPlatformSettings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<MoneyPlatformSettingsResponse[]>(response);
  },

  // Tạo cấu hình mới
  create: async (data: MoneyPlatformSettingsRequest): Promise<MoneyPlatformSettingsResponse> => {
    const response = await fetch(`${API_BASE_URL}/MoneyPlatformSettings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MoneyPlatformSettingsResponse>(response);
  },

  // Cập nhật cấu hình
  update: async (id: string, data: MoneyPlatformSettingsRequest): Promise<MoneyPlatformSettingsResponse> => {
    const response = await fetch(`${API_BASE_URL}/MoneyPlatformSettings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MoneyPlatformSettingsResponse>(response);
  },
};