export interface User {
  email: string;
  fullName: string;
  roles: string[];
  phoneNumber?: string;
  createdAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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

export interface RegisterRequest {
  email: string; // Email đăng ký
  phone: string; // Số điện thoại
  password: string; // Mật khẩu
  fullName: string; // Tên đầy đủ
  role: number; // Vai trò (số, nhưng sẽ được convert thành string khi gửi API)
}

export interface RegisterResponse {
  message?: string; // Thông báo từ server
  success?: boolean; // Trạng thái thành công
}

export interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  ok?: boolean;
}
