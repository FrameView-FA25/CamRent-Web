import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  ShoppingCart,
  HourglassEmpty,
  CheckCircleOutline,
  LocalShipping,
  AssignmentTurnedIn,
  TaskAlt,
  Block,
  Warning,
} from "@mui/icons-material";
import type { Booking } from "../../../../types/booking.types";

interface StatsCardsProps {
  bookings: Booking[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ bookings }) => {
  const getStatusCount = (status: string) => {
    return bookings.filter((b) => b.status === status).length;
  };

  // Exclude Draft from visible bookings
  const visibleBookings = bookings.filter((b) => b.status !== "Draft");

  const stats = [
    {
      label: "Tất cả",
      count: visibleBookings.length,
      icon: ShoppingCart,
      bgColor: "#E0F2FE",
      iconColor: "#0284C7",
    },
    {
      label: "Chờ xác nhận",
      count: getStatusCount("PendingApproval"),
      icon: HourglassEmpty,
      bgColor: "#FFF7ED",
      iconColor: "#F97316",
    },
    {
      label: "Đã xác nhận",
      count: getStatusCount("Confirmed"),
      icon: CheckCircleOutline,
      bgColor: "#DBEAFE",
      iconColor: "#1D4ED8",
    },
    {
      label: "Đã nhận máy",
      count: getStatusCount("PickedUp"),
      icon: LocalShipping,
      bgColor: "#E0E7FF",
      iconColor: "#4F46E5",
    },
    {
      label: "Đã trả máy",
      count: getStatusCount("Returned"),
      icon: AssignmentTurnedIn,
      bgColor: "#F3E8FF",
      iconColor: "#7C3AED",
    },
    {
      label: "Hoàn thành",
      count: getStatusCount("Completed"),
      icon: TaskAlt,
      bgColor: "#D1FAE5",
      iconColor: "#059669",
    },
    {
      label: "Đã hủy",
      count: getStatusCount("Cancelled"),
      icon: Block,
      bgColor: "#FEE2E2",
      iconColor: "#DC2626",
    },
    {
      label: "Quá hạn",
      count: getStatusCount("Overdue"),
      icon: Warning,
      bgColor: "#FEF2F2",
      iconColor: "#991B1B",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
        mb: 3,
      }}
    >
      {stats.map((stat, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: stat.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <stat.icon sx={{ color: stat.iconColor, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
            >
              {stat.count}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#6B7280", fontSize: "0.875rem" }}
            >
              {stat.label}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
