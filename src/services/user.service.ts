// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://camrent-backend.up.railway.app/api";

/**
 * Interface cho User
 */
export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  status: "Active" | "Inactive" | "Blocked";
  createdAt: string;
  roles: string[];
}

/**
 * Interface cho request tạo user mới
 */
export interface CreateUserRequest {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: "Admin" | "Owner" | "BranchManager" | "Staff" | "Renter" | "Guest";
}

/**
 * Interface cho response tạo user
 */
export interface CreateUserResponse {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  status: string;
  createdAt: string;
  roles: string[];
}

/**
 * Interface cho response danh sách users với pagination
 */
export interface UsersResponse {
  page: number;
  pageSize: number;
  total: number;
  items: User[];
}

export const userService = {
  async getUsers(
    page: number = 1,
    pageSize: number = 50
  ): Promise<UsersResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(
      `${API_BASE_URL}/Users?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể tải danh sách người dùng (mã ${response.status})`
      );
    }

    const data = (await response.json()) as UsersResponse;
    return data;
  },

  /**
   * Tạo user mới (Admin only)
   * @param userData - Thông tin user cần tạo
   * @returns Promise chứa thông tin user vừa tạo
   */
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/Users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể tạo người dùng mới (mã ${response.status})`
      );
    }

    const data = (await response.json()) as CreateUserResponse;
    return data;
  },
};
