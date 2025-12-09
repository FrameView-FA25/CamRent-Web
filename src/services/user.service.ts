// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://camrent-backend.up.railway.app/api";

/**
 * Base interface cho User (các field chung)
 */
interface UserBase {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  createdAt: string;
  roles: string[];
}

/**
 * Interface cho User (dùng "Ban" thống nhất cho cả API và Frontend)
 */
export interface User extends UserBase {
  status: "Active" | "Ban";
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
export interface CreateUserResponse extends UserBase {
  status: string;
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

// Cập nhật user
export interface UpdateUserRequest {
  phone: string;
  fullName: string;
  status: "Active" | "Ban";
}

export interface UserProfileResponse {
  id: string;
  email: string;
  normalizedEmail: string;
  phone: string;
  fullName: string;
  address: string | null;
  status: string;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  avatar: string[] | null;
  roles: Array<{
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  updatedByUserId: string | null;
}

export interface UpdateUserProfileRequest {
  fullName: string;
  phone: string;
  address: string;
  bankNo: string | null;
  bankName: string | null;
  bankAccName: string | null;
}

export const userService = {
  // Lấy danh sách users
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

    const apiResponse = (await response.json()) as {
      page: number;
      pageSize: number;
      total: number;
      items: User[];
    };

    const data: UsersResponse = {
      page: apiResponse.page,
      pageSize: apiResponse.pageSize,
      total: apiResponse.total,
      items: apiResponse.items,
    };

    return data;
  },

  // Tạo user mới
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

  async getCurrentUserProfile(): Promise<UserProfileResponse> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/UserProfiles/UserID`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        errText || `Không thể tải hồ sơ người dùng (mã ${response.status})`
      );
    }

    const data = (await response.json()) as UserProfileResponse;
    return data;
  },

  async updateUserProfile(
    userId: string,
    payload: UpdateUserProfileRequest
  ): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/UserProfiles/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(errText || "Cập nhật thông tin người dùng thất bại");
    }
  },
};
