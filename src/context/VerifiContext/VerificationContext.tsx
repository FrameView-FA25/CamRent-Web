import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { verificationService } from "../../services/verification.service";
import type { Verification } from "../../types/verification.types";
import {
  VerificationContext,
  type VerificationContextType,
} from "./VerificationContext.types";

/**
 * Props cho VerificationProvider component
 */
interface VerificationProviderProps {
  children: ReactNode;
}

/**
 * VerificationProvider Component
 * Provider bọc OwnerLayout để cung cấp verification state cho các component con
 *
 * Chức năng:
 * - Quản lý state: verifications, loading, error
 * - Caching: Chỉ gọi API lần đầu, các lần sau dùng cache
 * - Cung cấp methods: fetchVerifications, refreshVerifications
 */
export const VerificationProvider: React.FC<VerificationProviderProps> = ({
  children,
}) => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  /**
   * Hàm load danh sách verification (có caching)
   * - Đã fetch VÀ có data → Dùng cache (không gọi API)
   * - Chưa fetch HOẶC không có data → Gọi API
   */
  const fetchVerifications = useCallback(async () => {
    // Nếu đã có cache → return (không gọi API)
    if (hasFetched && verifications.length > 0) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách.");
      setLoading(false);
      setVerifications([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await verificationService.getVerificationsByUserId();
      setVerifications(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tải danh sách xác minh";
      setError(errorMessage);
      console.error("Error fetching verifications:", err);
    } finally {
      setLoading(false);
    }
  }, [hasFetched, verifications.length]);

  /**
   * Hàm refresh - Force reload từ API (bỏ qua cache)
   */
  const refreshVerifications = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await verificationService.getVerificationsByUserId();
      setVerifications(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tải danh sách xác minh";
      setError(errorMessage);
      console.error("Error refreshing verifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: VerificationContextType = {
    verifications,
    loading,
    error,
    fetchVerifications,
    refreshVerifications,
    setVerifications,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};

// Re-export VerificationContext để có thể import từ file này
export { VerificationContext } from "./VerificationContext.types";
