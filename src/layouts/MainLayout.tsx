import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import CameraLoginModal from "../components/Modal/ModalLogin";
import CameraRegisterModal from "@/components/Modal/ModalRegister";
import { useAuth } from "@/hooks/useAuth";
import { Button, Menu, MenuItem } from "@mui/material";
import { User, LogOut } from "lucide-react";
import {
  getDefaultRouteByRole,
  getProfileRouteByRole,
} from "@/utils/roleUtils";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleSwitchToRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const handleSwitchToLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const handleLoginSuccess = () => {
    // Đóng modal login
    setLoginOpen(false);

    // Refresh auth state
    refreshAuth();

    // Đợi một chút để auth state update
    setTimeout(() => {
      // Lấy role từ localStorage
      const role = localStorage.getItem("role");

      if (role) {
        // Lấy route mặc định dựa trên role
        const defaultRoute = getDefaultRouteByRole(role);
        console.log("Navigating to:", defaultRoute);
        navigate(defaultRoute);
      }
    }, 200);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleProfile = () => {
    handleMenuClose();
    const role = localStorage.getItem("role");
    if (role) {
      const profileRoute = getProfileRouteByRole(role);
      navigate(profileRoute);
    }
  };
  return (
    <div className="app-shell">
      <header className="app-header flex items-center justify-between px-6 py-3 shadow-sm bg-white">
        {/* Logo */}
        <Link to="/" className="brand flex items-center gap-2">
          <img src="/logo.png" alt="CamRent Logo" width="60" height="60" />
          <span className="font-bold text-lg text-gray-800">CamRent</span>
        </Link>

        {/* Navigation - căn giữa */}
        <nav className="app-nav flex items-center gap-6">
          <Link
            to="/"
            className={
              isActive("/")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Home
          </Link>
          <Link
            to="/products"
            className={
              isActive("/products")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Product
          </Link>
          <Link
            to="/how-it-works"
            className={
              isActive("/how-it-works")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            How it works
          </Link>
          <Link
            to="/contract"
            className={
              isActive("/contract")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Contract
          </Link>
          <Link
            to="/why-us"
            className={
              isActive("/why-us")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Why Us
          </Link>
          <Link
            to="/contact"
            className={
              isActive("/contact")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Contact
          </Link>
        </nav>

        {/* Login button hoặc User menu - góc phải đối xứng logo */}
        {isAuthenticated && user ? (
          <>
            <Button
              onClick={handleMenuOpen}
              variant="outlined"
              sx={{
                borderColor: "#FACC15",
                color: "#111827",
                fontWeight: 600,
                borderRadius: 999,
                px: 3,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&:hover": {
                  borderColor: "#EAB308",
                  bgcolor: "#FEF3C7",
                },
              }}
            >
              <User size={18} />
              <span>{user.fullName}</span>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleProfile}>
                <User size={16} style={{ marginRight: 8 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: 8 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            onClick={() => setLoginOpen(true)}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#FACC15",
              color: "#111827",
              fontWeight: 700,
              borderRadius: 999,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#EAB308" },
            }}
          >
            LOGIN
          </Button>
        )}

        {/* Menu toggle - chỉ dùng cho mobile */}
        <div className="header-menu hidden">
          <button className="menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* Modal Login */}
      <CameraLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />
      {/* Modal Register */}
      <CameraRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={(cred) => {
          console.log("Register:", cred);
          setRegisterOpen(false);
        }}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default MainLayout;
