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
  Camera as CameraIcon,
  Receipt as OrdersIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../theme/colors";

const DRAWER_WIDTH = 280;

const menuItems = [
  { text: "Trang Chủ", icon: <HomeIcon />, path: "/renter/dashboard" },
  { text: "Sản Phẩm", icon: <CameraIcon />, path: "/products" },
  { text: "Đơn Hàng", icon: <OrdersIcon />, path: "/renter/my-orders" },
  {
    text: "Sản Phẩm Yêu Thích",
    icon: <FavoriteIcon />,
    path: "/renter/favorites",
  },
  { text: "Thông Tin Cá Nhân", icon: <PersonIcon />, path: "/renter/profile" },
  { text: "Cài Đặt", icon: <SettingsIcon />, path: "/renter/settings" },
];

const RenterLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const drawer = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: colors.background.paper,
        borderRight: `1px solid ${colors.border.light}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${colors.border.light}`,
          flexShrink: 0,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: colors.primary.main,
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          C
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            color: colors.text.primary,
            fontWeight: 700,
            fontSize: "1.25rem",
            letterSpacing: "-0.02em",
          }}
          onClick={() => navigate("/")}
        >
          CamRent
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          py: 3,
          px: 2,
          overflow: "hidden",
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
                    color: isActive
                      ? colors.background.paper
                      : colors.text.secondary,
                    bgcolor: isActive ? colors.primary.main : "transparent",
                    "&:hover": {
                      bgcolor: isActive
                        ? colors.primary.dark
                        : colors.primary.lighter,
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

      {/* User Info */}
      <Box
        sx={{
          borderTop: `1px solid ${colors.border.light}`,
          p: 2,
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: colors.neutral[50],
            mb: 1,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: colors.primary.main,
            }}
          >
            {user?.fullName ? user.fullName.charAt(0) : "R"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: colors.text.primary,
                lineHeight: 1.3,
              }}
            >
              {user?.fullName || "Renter"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: colors.text.secondary,
                lineHeight: 1.3,
              }}
            >
              {user?.email || "renter@camrent.com"}
            </Typography>
          </Box>
        </Stack>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            py: 1.5,
            px: 2,
            color: colors.status.error,
            "&:hover": {
              bgcolor: colors.status.errorLight,
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: colors.background.default,
      }}
    >
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1300,
          bgcolor: colors.background.paper,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          "&:hover": {
            bgcolor: colors.neutral[100],
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
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
              overflow: "hidden",
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              border: "none",
              overflow: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          bgcolor: colors.background.default,
        }}
      >
        <Toolbar sx={{ display: { xs: "block", md: "none" } }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default RenterLayout;
