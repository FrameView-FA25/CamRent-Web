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
};
