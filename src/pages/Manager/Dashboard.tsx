import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Devices as DevicesIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const DashboardManager: React.FC = () => {
  const statsCards = [
    {
      title: "Total Accounts",
      value: "1,234",
      change: "+12.5%",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#3B82F6",
      bgcolor: "#EFF6FF",
    },
    {
      title: "Total Agencies",
      value: "56",
      change: "+8.2%",
      icon: <StoreIcon sx={{ fontSize: 40 }} />,
      color: "#10B981",
      bgcolor: "#ECFDF5",
    },
    {
      title: "Total Devices",
      value: "8,456",
      change: "+15.3%",
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      color: "#F59E0B",
      bgcolor: "#FEF3C7",
    },
    {
      title: "Growth Rate",
      value: "+23.5%",
      change: "This month",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#8B5CF6",
      bgcolor: "#F3E8FF",
    },
  ];

  const recentActivities = [
    {
      action: "New account created",
      user: "manager@branch1.com",
      time: "2 minutes ago",
    },
    {
      action: "Agency approved",
      user: "Downtown Branch",
      time: "15 minutes ago",
    },
    {
      action: "Device pending approval",
      user: "Canon EOS R5",
      time: "1 hour ago",
    },
    {
      action: "Account status updated",
      user: "staff@branch2.com",
      time: "2 hours ago",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: "#1F2937",
        }}
      >
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: card.bgcolor,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#1F2937",
                    mb: 0.5,
                  }}
                >
                  {card.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#10B981",
                    fontWeight: 600,
                  }}
                >
                  {card.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities and System Status */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              Recent System Activities
            </Typography>
            <Box>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2,
                    borderBottom:
                      index < recentActivities.length - 1
                        ? "1px solid #F3F4F6"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1F2937",
                        mb: 0.5,
                      }}
                    >
                      {activity.action}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6B7280",
                      }}
                    >
                      {activity.user}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9CA3AF",
                    }}
                  >
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              System Status
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Server Performance
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#10B981" }}
                >
                  95%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={95}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: "#F3F4F6",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#10B981",
                  },
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Database Usage
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#3B82F6" }}
                >
                  68%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={68}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: "#F3F4F6",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#3B82F6",
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, color: "#6B7280" }}>
                <strong>Status:</strong>{" "}
                <span style={{ color: "#10B981" }}>
                  All systems operational
                </span>
              </Typography>
              <Typography sx={{ mb: 1, color: "#6B7280" }}>
                <strong>Uptime:</strong> 99.9%
              </Typography>
              <Typography sx={{ color: "#6B7280" }}>
                <strong>Last Updated:</strong> Just now
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardManager;
