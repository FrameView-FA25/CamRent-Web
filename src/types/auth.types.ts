export interface User {
  email: string;
  fullName: string;
  roles: string[];
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
