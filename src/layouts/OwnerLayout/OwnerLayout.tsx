import { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PhotoCamera as CameraIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./OwnerLayout.css";

// Chiều rộng của sidebar drawer
const DRAWER_WIDTH = 280;

// Danh sách các menu item trong sidebar navigation
const MENU_ITEMS = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/owner/dashboard",
  },
  {
    text: "Quản lý Camera",
    icon: <CameraIcon />,
    path: "/owner/cameras",
  },
  {
    text: "Quản lí khách hàng",
    icon: <PeopleIcon />,
    path: "/owner/users",
  },
  {
    text: "Quản lí đơn thuê",
    icon: <SettingsIcon />,
    path: "/owner/orders",
  },
];

/**
 * Component OwnerLayout - Layout chính cho khu vực quản lý của Owner
 * Bao gồm sidebar navigation và main content area
 */
export default function OwnerLayout() {
  // State để quản lý việc mở/đóng mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hook để lấy theme MUI và check responsive breakpoint
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Hook để điều hướng giữa các trang
  const navigate = useNavigate();

  // Hook để lấy đường dẫn hiện tại (dùng để highlight menu active)
  const location = useLocation();

  /**
   * Hàm xử lý toggle mobile drawer (mở/đóng)
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /**
   * Hàm xử lý khi click vào menu item
   * @param path - Đường dẫn cần navigate tới
   */
  const handleMenuClick = (path: string) => {
    navigate(path);
    // Đóng mobile drawer sau khi navigate (chỉ trên mobile)
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  /**
   * Hàm xử lý khi click logout
   */
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Đăng xuất được click");
    // Có thể thêm logic như: clear localStorage, redirect to login, etc.
  };

  /**
   * Kiểm tra xem menu item có đang active không
   * @param path - Đường dẫn của menu item
   * @returns boolean - true nếu đang active
   */
  const isActiveMenu = (path: string) => {
    return location.pathname === path;
  };

  /**
   * Render nội dung của sidebar drawer
   */
  const renderSidebarContent = () => (
    <Box className="sidebar-drawer">
      {/* Header/Logo Section */}
      <Box className="sidebar-header">
        <Typography className="sidebar-logo" variant="h5">
          CamRent Owner
        </Typography>
      </Box>

      {/* Navigation Menu Section */}
      <List className="sidebar-nav">
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding className="nav-item">
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              className={`nav-button ${
                isActiveMenu(item.path) ? "active" : ""
              }`}
              sx={{
                borderRadius: 2,
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
                "&.active": {
                  bgcolor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <ListItemIcon className="nav-icon">{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                className="nav-text"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Divider ngăn cách menu và user section */}
      <Divider className="sidebar-divider" />

      {/* User Profile/Action Section */}
      <Box className="user-section">
        {/* Profile Button */}
        <ListItem disablePadding>
          <ListItemButton
            className="user-button"
            sx={{
              borderRadius: 2,
              py: 1.5,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ListItemIcon className="nav-icon">
              <AccountIcon />
            </ListItemIcon>
            <ListItemText
              primary="Hồ sơ"
              className="nav-text"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            className="user-button"
            sx={{
              borderRadius: 2,
              py: 1.5,
              mt: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ListItemIcon className="nav-icon">
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              className="nav-text"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box className="owner-layout-container">
      {/* Mobile AppBar - chỉ hiển thị trên màn hình mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          className="mobile-appbar"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar className="mobile-toolbar">
            <IconButton
              color="inherit"
              aria-label="mở menu navigation"
              edge="start"
              onClick={handleDrawerToggle}
              className="mobile-menu-button"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="mobile-title"
            >
              CamRent Owner
            </Typography>
            <IconButton color="inherit" aria-label="xem thông báo">
              <NotificationsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Navigation Container */}
      <Box
        component="nav"
        className="nav-container"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile Drawer - Temporary (overlay trên mobile) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Giữ mounted để performance tốt hơn trên mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              border: "none",
            },
          }}
        >
          {renderSidebarContent()}
        </Drawer>

        {/* Desktop Drawer - Permanent (cố định trên desktop) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              border: "none",
            },
          }}
          open
        >
          {renderSidebarContent()}
        </Drawer>
      </Box>

      {/* Main Content Area - nơi render các trang con */}
      <Box
        component="main"
        className="main-content"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 }, // Margin top cho mobile AppBar
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        {/* Render các component con dựa trên route hiện tại */}
        <Outlet />
      </Box>
    </Box>
  );
}
