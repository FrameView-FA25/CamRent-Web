import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import CameraLoginModal from "../components/Modal/ModalLogin";
import CameraRegisterModal from "@/components/Modal/ModalRegister";
import { useAuth } from "@/hooks/useAuth";
import { Button, Menu, MenuItem, IconButton, Badge, Box } from "@mui/material";
import { User, LogOut, ShoppingCart } from "lucide-react";
import { getDefaultRouteByRole } from "@/utils/roleUtils";
import { colors } from "../theme/colors";
import CartModal from "../components/Modal/ModalCart";
import { useCart } from "../hooks/useCart";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();
  const { cartCount, refreshCart } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
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
    setLoginOpen(false);
    refreshAuth();

    setTimeout(() => {
      const role = localStorage.getItem("role");
      if (role) {
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
    if (role == "Renter") {
      navigate("/renter/dashboard");
    } else if (role == "Staff") {
      navigate("/staff/dashboard");
    } else if (role == "BranchManager") {
      navigate("/manager/dashboard");
    } else if (role == "Owner") {
      navigate("/owner/dashboard");
    }
  };

  const handleCartOpen = () => {
    setCartModalOpen(true);
  };

  const handleCartClose = () => {
    setCartModalOpen(false);
    refreshCart();
  };

  const role = localStorage.getItem("role");
  const isRenter = role === "Renter";

  return (
    <div className="app-shell">
      <header className="app-header flex items-center justify-between px-6 py-3 shadow-sm bg-white">
        {/* Logo */}
        <Link to="/" className="brand flex items-center gap-2">
          <img src="/logo.png" alt="CamRent Logo" width="65" height="65" />
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

        {/* Right Side - Cart (for RENTER) + User Menu */}
        {isAuthenticated && user ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* ✅ Cart Icon - Chỉ hiển thị cho RENTER */}
            {isRenter && (
              <IconButton
                onClick={handleCartOpen}
                sx={{
                  color: colors.text.primary,
                  padding: 1,
                  "&:hover": {
                    bgcolor: colors.primary.lighter,
                  },
                }}
              >
                <Badge
                  badgeContent={cartCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: colors.primary.main,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      minWidth: 20,
                      height: 20,
                    },
                  }}
                >
                  <ShoppingCart size={24} />
                </Badge>
              </IconButton>
            )}

            {/* User Menu Button */}
            <Button
              onClick={handleMenuOpen}
              variant="outlined"
              sx={{
                borderColor: colors.primary.main,
                color: "#111827",
                fontWeight: 600,
                borderRadius: 999,
                px: 3,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                textTransform: "none",
                height: 40,
                "&:hover": {
                  borderColor: colors.primary.light,
                  bgcolor: colors.primary.lighter,
                },
              }}
            >
              <User size={18} />
              <span>{user.fullName}</span>
            </Button>

            {/* User Dropdown Menu */}
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
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <MenuItem onClick={handleProfile}>
                <User size={16} style={{ marginRight: 8 }} />
                Profile
              </MenuItem>
              {isRenter && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/renter/orders");
                  }}
                >
                  <ShoppingCart size={16} style={{ marginRight: 8 }} />
                  My Orders
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: 8 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          // Login Button for guests
          <Button
            onClick={() => setLoginOpen(true)}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: colors.primary.main,
              color: "#111827",
              fontWeight: 700,
              borderRadius: 999,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: colors.primary.light },
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
        onSwitchToLogin={handleSwitchToLogin}
      />

      {/* ✅ Cart Modal - Chỉ render nếu là RENTER */}
      {isRenter && <CartModal open={cartModalOpen} onClose={handleCartClose} />}
    </div>
  );
};

export default MainLayout;
