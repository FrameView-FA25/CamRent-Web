import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import CameraLoginModal from "../components/Modal/Auth/ModalLogin";
import CameraRegisterModal from "../components/Modal/Auth/ModalRegister";
import { useAuth } from "@/hooks/useAuth";
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Box,
  Typography,
  Popover,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  User,
  LogOut,
  ShoppingCart,
  Camera,
  Package,
  ChartLine,
  Wallet,
} from "lucide-react";
import { getDefaultRouteByRole } from "@/utils/roleUtils";
import { colors } from "../theme/colors";
import CartModal from "../components/Modal/ModalCart";
import { useCartContext } from "../context/CartContext";
import Footer from "./Footer";
import { ModalResetPassword } from "@/components/Modal/Auth/ModalResetPassword";
import { getBalance } from "@/services/wallet.service";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();
  const { cartCount, refreshCart } = useCartContext();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [productMenuAnchor, setProductMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

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

  const handleMenuOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (isAuthenticated) {
      try {
        const balanceData = await getBalance();
        setWalletBalance(balanceData.balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalance(null);
      }
    }
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
    const storedRole = localStorage.getItem("role");
    const roleFromUser = Array.isArray(user?.roles) ? user?.roles[0] : null;
    const role = storedRole || roleFromUser || "";
    navigate(`/${role}/dashboard`);
  };

  const handleCartOpen = () => {
    setCartModalOpen(true);
  };

  const handleCartClose = () => {
    setCartModalOpen(false);
    refreshCart();
  };

  const handleProductMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProductMenuAnchor(event.currentTarget);
  };

  const handleProductMenuClose = () => {
    // Add delay before closing
    closeTimeoutRef.current = setTimeout(() => {
      setProductMenuAnchor(null);
    }, 150);
  };

  const handleProductMenuEnter = () => {
    // Cancel close when entering menu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleNavigateToProducts = (tab: number) => {
    navigate("/products", { state: { defaultTab: tab } });
    setProductMenuAnchor(null);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const role = localStorage.getItem("role");
  const isRenter = role === "Renter";
  const productMenuOpen = Boolean(productMenuAnchor);

  useEffect(() => {
    if (isAuthenticated && role === "Staff") {
      // luôn đưa về trang staff mà bạn muốn
      if (!location.pathname.startsWith("/staff")) {
        navigate("/staff/check-booking", { replace: true });
      }
    }
  }, [isAuthenticated, role, location.pathname, navigate]);

  // Mở modal đặt lại mật khẩu khi user truy cập /reset-password từ email
  useEffect(() => {
    if (location.pathname === "/reset-password") {
      const params = new URLSearchParams(location.search);
      const emailParam = params.get("email") || "";
      const tokenParam = params.get("token") || "";
      setResetEmail(emailParam);
      setResetToken(tokenParam);
      setResetOpen(true);
    } else {
      setResetOpen(false);
    }
  }, [location.pathname, location.search]);

  const handleResetClose = () => {
    setResetOpen(false);
    navigate("/", { replace: true });
  };
  console.log("User", user);
  return (
    <div className="app-shell">
      <header className="app-header flex items-center justify-between px-6 py-3 shadow-sm bg-white">
        {/* Logo */}
        <Link to="/" className="brand flex items-center gap-2">
          <img src="/logo.png" alt="CamRent Logo" width="65" height="65" />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              letterSpacing: "-0.5px",
            }}
          >
            CamRent
          </Typography>
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
            Trang Chủ
          </Link>

          {/* Product Link with Dropdown */}
          <Box
            sx={{ position: "relative" }}
            onMouseEnter={handleProductMenuOpen}
            onMouseLeave={handleProductMenuClose}
          >
            <Link
              to="/products"
              className={
                isActive("/products")
                  ? "active text-yellow-500 font-semibold"
                  : "text-gray-700 hover:text-yellow-500"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Sản Phẩm
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{
                  transition: "transform 0.2s",
                  transform: productMenuOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <path d="M4 6l4 4 4-4H4z" />
              </svg>
            </Link>

            {/* Dropdown Menu */}
            <Popover
              open={productMenuOpen}
              anchorEl={productMenuAnchor}
              onClose={() => {
                setProductMenuAnchor(null);
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              disableRestoreFocus
              slotProps={{
                paper: {
                  onMouseEnter: handleProductMenuEnter,
                  onMouseLeave: handleProductMenuClose,
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    minWidth: 200,
                  },
                },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  overflow: "hidden",
                }}
              >
                <List sx={{ py: 0.5 }}>
                  <ListItem
                    onClick={() => handleNavigateToProducts(0)}
                    sx={{
                      cursor: "pointer",
                      py: 1.5,
                      px: 2.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: colors.primary.lighter,
                        "& .MuiListItemText-primary": {
                          color: colors.primary.main,
                          fontWeight: 600,
                        },
                        "& svg": {
                          color: colors.primary.main,
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        width: "100%",
                      }}
                    >
                      <Camera size={18} />
                      <ListItemText
                        primary="Máy Ảnh"
                        primaryTypographyProps={{
                          fontSize: "0.95rem",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </ListItem>

                  <Divider sx={{ my: 0.5 }} />

                  <ListItem
                    onClick={() => handleNavigateToProducts(1)}
                    sx={{
                      cursor: "pointer",
                      py: 1.5,
                      px: 2.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: colors.primary.lighter,
                        "& .MuiListItemText-primary": {
                          color: colors.primary.main,
                          fontWeight: 600,
                        },
                        "& svg": {
                          color: colors.primary.main,
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        width: "100%",
                      }}
                    >
                      <Package size={18} />
                      <ListItemText
                        primary="Phụ Kiện"
                        primaryTypographyProps={{
                          fontSize: "0.95rem",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </ListItem>
                </List>
              </Paper>
            </Popover>
          </Box>

          <Link
            to="/how-it-works"
            className={
              isActive("/how-it-works")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Hướng dẫn
          </Link>

          <Link
            to="/why-us"
            className={
              isActive("/why-us")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Chính Sách
          </Link>
          <Link
            to="/contact"
            className={
              isActive("/contact")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Liên lạc
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
              <span>{user.email}</span>
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
                <ChartLine size={16} style={{ marginRight: 8 }} />
                Bảng Điều Khiển
              </MenuItem>
              {isRenter && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/renter/my-orders");
                  }}
                >
                  <ShoppingCart size={16} style={{ marginRight: 8 }} />
                  Đơn hàng
                </MenuItem>
              )}

              {/* Wallet Balance Display */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Wallet size={16} style={{ color: colors.primary.main }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: colors.text.primary,
                  }}
                >
                  Số dư:{" "}
                  {walletBalance !== null
                    ? walletBalance.toLocaleString("vi-VN") + " ₫"
                    : "Đang tải..."}
                </Typography>
              </Box>

              <MenuItem onClick={handleLogout}>
                <LogOut
                  size={16}
                  style={{ marginRight: 8, color: colors.status.error }}
                />
                Đăng xuất
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
              color: "white",
              fontWeight: 700,
              borderRadius: 999,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: colors.primary.light },
            }}
          >
            Đăng nhập
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
      <Footer />
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

      {/* Modal đặt lại mật khẩu từ link email */}
      <ModalResetPassword
        open={resetOpen}
        onClose={handleResetClose}
        email={resetEmail}
        token={resetToken}
      />
    </div>
  );
};

export default MainLayout;
