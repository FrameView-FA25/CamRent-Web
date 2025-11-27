import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  // Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../theme/colors";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
const DRAWER_WIDTH = 280;

const menuItems = [
  { text: "Thống kê", icon: <HomeIcon />, path: "/manager/dashboard" },
  { text: "Quản lý nhân viên", icon: <PeopleIcon />, path: "/manager/staff" },
  {
    text: "Quản lý đơn thuê",
    icon: <ProductsIcon />,
    path: "/manager/booking",
  },
  {
    text: "Quản lý yêu cầu xác minh",
    icon: <OrdersIcon />,
    path: "/manager/verifications",
  },
  {
    text: "Quản lý sản phẩm",
    icon: <ProductsIcon />,
    path: "/manager/products",
  },
  {
    text: "Quản lý hợp đồng",
    icon: <ImportContactsIcon />,
    path: "/manager/contracts",
  },
  { text: "Hồ sơ", icon: <PersonIcon />, path: "/manager/profile" },
  // { text: "Cài đặt", icon: <SettingsIcon />, path: "/manager/settings" },
];

const ManagerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout(); // Xóa dữ liệu xác thực
    navigate("/");
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffffff",
        borderRight: "1px solid #E5E7EB",
      }}
    >
      {/* Header với Logo và Tiêu đề */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#1F2937",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          A
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            color: "#1F2937",
            fontWeight: 700,
            fontSize: "1.25rem",
            letterSpacing: "-0.02em",
          }}
          onClick={() => navigate("/")}
        >
          Manager
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, py: 3, px: 2 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: 1.5,
                    py: 1.5,
                    px: 2,
                    color: isActive ? "#f7f7f7ff" : "#6B7280",
                    bgcolor: isActive ? colors.primary.light : "transparent",
                    "&:hover": {
                      bgcolor: isActive
                        ? colors.primary.light
                        : colors.primary.light,
                      color: "#ffffff",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.9375rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Info và Logout */}
      <Box
        sx={{
          borderTop: "1px solid #E5E7EB",
          p: 2,
        }}
      >
        {/* User Profile */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: "#F9FAFB",
            mb: 1,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#3B82F6",
            }}
            src="/user-avatar.jpg"
          >
            {user?.fullName ? user.fullName.charAt(0) : "O"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#1F2937",
                lineHeight: 1.3,
              }}
            >
              {user?.fullName || "Owner"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: "#6B7280",
                lineHeight: 1.3,
              }}
            >
              {user?.roles?.join(", ") || "User Role"}
            </Typography>
          </Box>
        </Stack>

        {/* Logout Button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            py: 1.5,
            px: 2,
            color: "#EF4444",
            "&:hover": {
              bgcolor: "#FEF2F2",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: "0.9375rem",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F9FAFB" }}>
      {/* Mobile Menu Button - Chỉ hiển thị trên mobile */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1300,
          bgcolor: "#FFFFFF",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          "&:hover": {
            bgcolor: "#F3F4F6",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
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
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
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
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          bgcolor: "#F9FAFB",
        }}
      >
        <Toolbar sx={{ display: { xs: "block", md: "none" } }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default ManagerLayout;
