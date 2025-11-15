const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: number;
}

export interface RegisterResponse {
  message?: string;
  success?: boolean;
}

export const authService = {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Login failed with status ${response.status}`
      );
    }

    const data = await response.json();

    // Lưu token vào localStorage ngay lập tức
    this.saveAuthData(data);

    return data;
  },

  saveAuthData(authData: LoginResponse): void {
    localStorage.setItem("accessToken", authData.token);
    localStorage.setItem("role", authData.roles[0]); // Lấy role đầu tiên
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
      })
    );
  },

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  getRole(): string | null {
    return localStorage.getItem("role");
  },

  getUserInfo(): { email: string; fullName: string; roles: string[] } | null {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return null;

    try {
      return JSON.parse(userInfo);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/Auths/RenterRegister`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

  async registerOwner(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/Auths/OwnerRegister`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
};
