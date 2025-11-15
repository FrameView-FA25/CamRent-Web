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
  ShoppingCart as OrdersIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../theme/colors";
import { CameraProvider } from "../../context/CameraContext";

const DRAWER_WIDTH = 280;

const menuItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/owner/dashboard" },
  {
    text: "Camera Management",
    icon: <PeopleIcon />,
    path: "/owner/cameras",
  },
  { text: "Orders", icon: <OrdersIcon />, path: "/owner/orders" },
  { text: "Profile", icon: <PersonIcon />, path: "/owner/profile" },
];

const OwnerLayout: React.FC = () => {
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffffff",
        borderRight: "1px solid #E5E7EB",
        overflow: "hidden", // Loại bỏ hoàn toàn scroll
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
          flexShrink: 0, // Không cho co lại
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
          Owner Panel
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          py: 3,
          px: 2,
          overflow: "hidden", // Không cho scroll
          display: "flex",
          flexDirection: "column",
        }}
      >
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
                      bgcolor: colors.primary.light,
                      color: "#FFFFFF",
                      "& .MuiListItemIcon-root": {
                        color: "#FFFFFF",
                      },
                      "& .MuiListItemText-primary": {
                        color: "#FFFFFF",
                      },
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
          flexShrink: 0, // Không cho co lại
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
              bgcolor: "#EF4444",
              color: "#FFFFFF",
              "& .MuiListItemIcon-root": {
                color: "#FFFFFF",
              },
              "& .MuiListItemText-primary": {
                color: "#FFFFFF",
              },
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
    <CameraProvider>
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
                overflow: "hidden", // Loại bỏ scroll
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
                overflow: "hidden", // Loại bỏ scroll
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
    </CameraProvider>
  );
};

export default OwnerLayout;
