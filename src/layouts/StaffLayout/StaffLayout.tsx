import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  Person,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

const drawerWidth = 240;

const StaffLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/staff/dashboard" },
    {
      text: "Đơn hàng của tôi",
      icon: <Assignment />,
      path: "/staff/my-assignments",
    },
    { text: "Profile", icon: <Person />, path: "/staff/profile" },
    { text: "Settings", icon: <Settings />, path: "/staff/settings" },
  ];

  const handleLogout = () => {
    logout(); // Xóa dữ liệu xác thực
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#fff",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "#1e3a5f", width: 32, height: 32 }}>
            {user?.fullName ? user.fullName.charAt(0) : "O"}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#000000ff" }}>
            Bảng nhân viên
          </Typography>
        </Box>

        <Divider />

        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "#e3f2fd",
                    color: "#1976d2",
                    "& .MuiListItemIcon-root": { color: "#1976d2" },
                  },
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: location.pathname === item.path ? "#1976d2" : "#666",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiTypography-root": {
                      fontSize: "0.95rem",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
              {user?.fullName ? user.fullName.charAt(0) : "O"}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {user?.fullName || "Staff Name"}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666" }}>
                {user?.roles?.join(", ") || "User Role"}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              color: "#d32f2f",
              justifyContent: "flex-start",
              textTransform: "none",
              "&:hover": { bgcolor: "#ffebee" },
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default StaffLayout;
