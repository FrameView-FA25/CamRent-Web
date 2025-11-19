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

  // ✅ NEW: Get cameras by branch (for branch manager)
  getCamerasByBranch: async (): Promise<Camera[]> => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    const response = await fetch(`${API_BASE_URL}/Cameras/my-branch`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to view branch cameras.');
      }
      if (response.status === 404) {
        // Branch không có camera nào
        return [];
      }
      
      throw new Error(`Failed to fetch branch cameras: ${response.status}`);
    }

    const data: Camera[] = await response.json();
    return data;
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