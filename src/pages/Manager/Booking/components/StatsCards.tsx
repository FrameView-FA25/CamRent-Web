import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  ShoppingCart,
  HourglassEmpty,
  CheckCircleOutline,
  LocalShipping,
  TaskAlt,
  Block,
} from "@mui/icons-material";
import type { Booking } from "../../../../types/booking.types";

interface StatsCardsProps {
  bookings: Booking[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ bookings }) => {
  const stats = [
    {
      label: "Tất cả",
      count: bookings.length,
      icon: ShoppingCart,
      bgColor: "#E0F2FE",
      iconColor: "#0284C7",
    },
    {
      label: "Chờ xác nhận",
      count: bookings.filter((b) => b.statusText === "Chờ xác nhận").length,
      icon: HourglassEmpty,
      bgColor: "#FFF7ED",
      iconColor: "#F97316",
    },
    {
      label: "Đã xác nhận",
      count: bookings.filter((b) => b.statusText === "Đã xác nhận").length,
      icon: CheckCircleOutline,
      bgColor: "#DBEAFE",
      iconColor: "#1D4ED8",
    },
    {
      label: "Đang thuê",
      count: bookings.filter((b) => b.statusText === "Đang thuê").length,
      icon: LocalShipping,
      bgColor: "#E0E7FF",
      iconColor: "#4F46E5",
    },
    {
      label: "Hoàn thành",
      count: bookings.filter((b) => b.statusText === "Hoàn thành").length,
      icon: TaskAlt,
      bgColor: "#D1FAE5",
      iconColor: "#059669",
    },
    {
      label: "Đã hủy",
      count: bookings.filter((b) => b.statusText === "Đã hủy").length,
      icon: Block,
      bgColor: "#FEE2E2",
      iconColor: "#DC2626",
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
          lg: "repeat(6, 1fr)",
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
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {stat.label}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
