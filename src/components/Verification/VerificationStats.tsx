import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { FileText, Clock } from "lucide-react";
import { colors } from "../../theme/colors";
import type { Verification } from "../../types/verification.types";

interface VerificationStatsProps {
  verifications: Verification[];
}

const VerificationStats: React.FC<VerificationStatsProps> = ({
  verifications,
}) => {
  const stats = [
    {
      label: "Tổng yêu cầu",
      value: verifications.length,
      icon: <FileText size={32} />,
      color: colors.primary.main,
      bgColor: "#E3F2FD",
    },
    {
      label: "Đang chờ",
      value: verifications.filter(
        (v) => v.status === "Pending" || v.status.toLowerCase() === "pending"
      ).length,
      icon: <Clock size={32} />,
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      label: "Đã xác nhận",
      value: verifications.filter((v) => v.status === "Assigned").length,
      icon: <Clock size={32} />,
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
    {
      label: "Đã từ chối",
      value: verifications.filter((v) => v.status === "Rejected").length,
      icon: <Clock size={32} />,
      color: "#F44336",
      bgColor: "#FFEBEE",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        mb: 4,
        flexWrap: "wrap",
      }}
    >
      {stats.map((stat, index) => (
        <Box
          key={index}
          sx={{
            flex: {
              xs: "1 1 calc(50% - 12px)",
              sm: "1 1 calc(25% - 18px)",
            },
            minWidth: 0,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              bgcolor: colors.background.paper,
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                bgcolor: stat.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h3"
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
        </Box>
      ))}
    </Box>
  );
};

export default VerificationStats;
