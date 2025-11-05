import { Navigate } from "react-router-dom";
import { decodeToken } from "@/utils/decodeToken";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // Kiểm tra xem user đã đăng nhập chưa
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  // Nếu yêu cầu role cụ thể, kiểm tra role
  if (requiredRole && role !== requiredRole) {
    // Thử decode token để lấy role từ JWT
    const decoded = decodeToken(accessToken);
    const tokenRole = decoded?.role || decoded?.Role;

    if (tokenRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
