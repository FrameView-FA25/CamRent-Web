import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { colors } from "../../theme/colors";

interface OrderStatsProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    pickedUp: number;
    completed: number;
    cancelled: number;
    returned: number;
  };
}

const OrderStats: React.FC<OrderStatsProps> = ({ stats }) => {
  const statsConfig = [
    {
      label: "Tổng đơn",
      value: stats.total,
      icon: <Package size={32} />,
      color: colors.primary.main,
      bgColor: "#E3F2FD",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: <Clock size={32} />,
      color: "#FFC107",
      bgColor: "#FFFDE7",
    },
    {
      label: "Đã xác nhận",
      value: stats.confirmed,
      icon: <CheckCircle size={32} />,
      color: "#2196F3",
      bgColor: "#E3F2FD",
    },
    {
      label: "Đã nhận máy",
      value: stats.pickedUp,
      icon: <CheckCircle size={32} />,
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      label: "Đã trả máy",
      value: stats.returned,
      icon: <CheckCircle size={32} />,
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      label: "Hoàn thành",
      value: stats.completed,
      icon: <CheckCircle size={32} />,
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
    {
      label: "Đã hủy",
      value: stats.cancelled,
      icon: <XCircle size={32} />,
      color: "#F44336",
      bgColor: "#FFEBEE",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          lg: "repeat(6, 1fr)",
        },
        gap: 3,
        mb: 4,
      }}
    >
      {statsConfig.map((stat, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            bgcolor: colors.background.paper,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transform: "translateY(-2px)",
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
              color: stat.color,
            }}
          >
            {stat.icon}
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 0.5,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default OrderStats;
