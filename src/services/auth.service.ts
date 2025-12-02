// URL cơ sở của API backend
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

/**
 * Interface cho request đăng nhập
 */
export interface LoginRequest {
  email: string; // Email đăng nhập
  password: string; // Mật khẩu
}

/**
 * Interface cho response đăng nhập
 */
export interface LoginResponse {
  token: string; // Access token để xác thực các request sau
  refreshToken: string; // Refresh token để làm mới access token
  expiresAt: string; // Thời gian hết hạn của token
  fullName: string; // Tên đầy đủ của user
  phoneNumber: string; // Số điện thoại của user
  createdAt: string; // Ngày tạo tài khoản
  address: string; // Địa chỉ của user
  email: string; // Email của user
  roles: string[]; // Danh sách vai trò của user (VD: ["Owner"], ["Renter"], ["BranchManager"])
}

/**
 * Interface cho request đăng ký
 */
export interface RegisterRequest {
  email: string; // Email đăng ký
  phone: string; // Số điện thoại
  password: string; // Mật khẩu
  fullName: string; // Tên đầy đủ
  role: number; // Vai trò (số, nhưng sẽ được convert thành string khi gửi API)
}

/**
 * Interface cho response đăng ký
 */
export interface RegisterResponse {
  message?: string; // Thông báo từ server
  success?: boolean; // Trạng thái thành công
}

/**
 * Service quản lý xác thực (Authentication)
 * Bao gồm: đăng nhập, đăng ký, quản lý token, kiểm tra trạng thái đăng nhập
 */
export const authService = {
  /**
   * Đăng nhập vào hệ thống
   * @param credentials - Thông tin đăng nhập (email, password)
   * @returns Promise chứa thông tin user và token sau khi đăng nhập thành công
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/Auths/Login`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let message = "Đăng nhập thất bại. Vui lòng thử lại.";
      let payload: Record<string, unknown> | null = null;

      if (response.headers.get("content-type")?.includes("application/json")) {
        payload = await response.json().catch(() => null);
        message = (payload as { message?: string } | null)?.message || message;
      } else {
        await response.text().catch(() => "");
      }

      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 500
      ) {
        message = "Sai tên đăng nhập hoặc mật khẩu";
      }

      throw new Error(message);
    }

    const data = await response.json();

    // Lưu token và thông tin user vào localStorage ngay lập tức
    this.saveAuthData(data);

    return data;
  },

  /**
   * Lưu thông tin xác thực vào localStorage
   * @param authData - Dữ liệu xác thực từ API sau khi đăng nhập
   */
  saveAuthData(authData: LoginResponse): void {
    localStorage.setItem("accessToken", authData.token);
    localStorage.setItem("role", authData.roles[0]); // Lấy role đầu tiên
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
        phoneNumber: authData.phoneNumber,
        createdAt: authData.createdAt,
        address: authData.address,
      })
    );
  },

  /**
   * Lấy access token từ localStorage
   * @returns Token xác thực hoặc null nếu không tìm thấy
   */
  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  /**
   * Lấy vai trò (role) của user hiện tại
   * @returns Role của user hoặc null nếu không tìm thấy
   */
  getRole(): string | null {
    return localStorage.getItem("role");
  },

  /**
   * Lấy thông tin user từ localStorage
   * @returns Object chứa email, fullName, roles hoặc null nếu không tìm thấy
   */
  getUserInfo(): {
    email: string;
    fullName: string;
    roles: string[];
    phoneNumber?: string;
    createdAt?: string;
    address?: string;
  } | null {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return null;

    try {
      return JSON.parse(userInfo);
    } catch {
      return null;
    }
  },

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   * @returns true nếu có token, false nếu không
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  /**
   * Đăng xuất - xóa tất cả thông tin xác thực khỏi localStorage
   */
  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
  },

  /**
   * Đăng ký tài khoản Renter (Người thuê)
   * @param data - Thông tin đăng ký (email, phone, password, fullName)
   * @returns Promise chứa kết quả đăng ký
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/Auths/RenterRegister`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        role: "Renter", // Cố định role là Renter cho API này
      }),
    });

    if (!response.ok) {
      let errorMessage = `Đăng ký thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    return { success: true, message: text };
  },

  /**
   * Đăng ký tài khoản Owner (Chủ sở hữu thiết bị)
   * @param data - Thông tin đăng ký (email, phone, password, fullName)
   * @returns Promise chứa kết quả đăng ký
   */
  async registerOwner(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/Auths/OwnerRegister`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        role: "Owner", // Cố định role là Owner cho API này
      }),
    });

    if (!response.ok) {
      let errorMessage = `Đăng ký Owner thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    return { success: true, message: text };
  },
  async forgotPassword(email: string): Promise<void> {
    const body = {
      email,
      continueUrl: `${window.location.origin}/reset-password`,
    };

    const response = await fetch(`${API_BASE_URL}/Auths/forgot-password`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Gửi email đặt lại mật khẩu thất bại");
    }
  },

  // === THÊM MỚI: Đặt lại mật khẩu ===
  async resetPassword(
    email: string,
    token: string,
    newPassword: string
  ): Promise<void> {
    const body = { email, token, newPassword };

    const response = await fetch(`${API_BASE_URL}/Auths/reset-password`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Đặt lại mật khẩu thất bại");
    }
  },
};
