import type { Camera, CameraResponse, CameraFilters } from '../types/product.types';

// URL cơ sở của API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://camrent-backend.up.railway.app';

/**
 * Hàm helper để lấy token xác thực từ localStorage
 * @returns Token xác thực hoặc null nếu không tìm thấy
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Service quản lý camera cho trang sản phẩm (ProductPage)
 * Khác với camera.service.ts - service này dùng cho việc hiển thị danh sách camera công khai
 */
export const cameraManagementService = {
  /**
   * Lấy danh sách tất cả camera với các bộ lọc (phân trang, sắp xếp, tìm kiếm)
   * API công khai - không bắt buộc đăng nhập
   * @param filters - Đối tượng chứa các bộ lọc: page, pageSize, sortBy, sortDir, brand, model
   * @returns Promise chứa danh sách camera với thông tin phân trang
   */
  getCameras: async (filters: CameraFilters): Promise<CameraResponse> => {
    // Tạo query parameters từ filters
    const params = new URLSearchParams();
    params.append('page', filters.page.toString());
    params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.model) params.append('model', filters.model);

    // Lấy token xác thực và chuẩn bị headers (optional - có thể không cần đăng nhập)
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    // Thêm token vào header nếu có (để xem thông tin chi tiết hơn)
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

  /**
   * Lấy danh sách camera của chi nhánh hiện tại
   * Dành cho BranchManager - chỉ lấy các camera thuộc chi nhánh của họ
   * Yêu cầu đăng nhập với quyền BranchManager
   * @returns Promise chứa danh sách camera của chi nhánh
   */
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
        // Chi nhánh không có camera nào
        return [];
      }
      
      throw new Error(`Failed to fetch branch cameras: ${response.status}`);
    }

    const data: Camera[] = await response.json();
    return data;
  },

  /**
   * Lấy thông tin chi tiết của một camera theo ID
   * API công khai - không bắt buộc đăng nhập
   * @param id - ID của camera cần lấy
   * @returns Promise chứa thông tin chi tiết của camera
   */
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