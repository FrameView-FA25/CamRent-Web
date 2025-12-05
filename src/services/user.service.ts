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

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const apiData = {
      ...userData,
      status: userData.status,
    };

    const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (!response.ok) {
      let errorData: { message?: string; title?: string } = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text) as {
              message?: string;
              title?: string;
            };
          }
        } catch {
          // Ignore parse errors
        }
      }
      const errorMessage =
        errorData.message ||
        errorData.title ||
        `Không thể cập nhật thông tin người dùng (mã ${response.status})`;
      throw new Error(errorMessage);
    }

    // Kiểm tra xem response có body không
    const contentType = response.headers.get("content-type");
    const isNoContent = response.status === 204;

    let responseData: User | null = null;

    // Nếu không phải No Content và có content-type JSON, thử parse
    if (
      !isNoContent &&
      contentType &&
      contentType.includes("application/json")
    ) {
      try {
        const text = await response.text();
        if (text && text.trim()) {
          responseData = JSON.parse(text);
        }
      } catch (err) {
        console.warn("Failed to parse response JSON:", err);
        // Nếu parse lỗi, responseData vẫn là null và sẽ fetch lại user
      }
    }

    // Nếu không có response body (204 No Content hoặc empty), fetch lại user
    if (!responseData) {
      // Fetch lại user để lấy thông tin mới nhất
      const updatedUserResponse = await fetch(
        `${API_BASE_URL}/Users/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (updatedUserResponse.ok) {
        responseData = (await updatedUserResponse.json()) as User;
      } else {
        // Nếu không fetch được, trả về dữ liệu đã gửi (nhưng không có id và các field khác)
        // Trong trường hợp này, tốt nhất là throw error hoặc return một user object hợp lệ
        throw new Error(
          "Cập nhật thành công nhưng không thể lấy thông tin user mới"
        );
      }
    }

    return responseData;
  },
};
