import type { Camera, CameraResponse, CameraFilters } from '../types/product.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://camrent-backend.up.railway.app';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const cameraManagementService = {
  // Get all cameras with filters
  getCameras: async (filters: CameraFilters): Promise<CameraResponse> => {
    const params = new URLSearchParams();
    params.append('page', filters.page.toString());
    params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.model) params.append('model', filters.model);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/Cameras?${params.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get camera by ID
  getCameraById: async (id: string): Promise<Camera> => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/Cameras/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
};