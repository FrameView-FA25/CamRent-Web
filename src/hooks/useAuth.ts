import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth.service";

interface User {
  email: string;
  fullName: string;
  roles: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(() => {
    const accessToken = authService.getToken();
    const role = authService.getRole();
    const userInfo = authService.getUserInfo();

    if (accessToken && role && userInfo) {
      setUser({
        email: userInfo.email,
        fullName: userInfo.fullName,
        roles: userInfo.roles,
      });
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.roles.includes("Admin") || false;
  const isOwner = user?.roles.includes("Owner") || false;

  return {
    user,
    isAuthenticated,
    isAdmin,
    isOwner,
    loading: isLoading,
    logout,
    refreshAuth,
    checkAuthStatus,
  };
};
