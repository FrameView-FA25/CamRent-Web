import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { CheckCircleRounded } from "@mui/icons-material";
import type { Verification } from "../../../types/verification.types";

interface VerificationStatsProps {
  verifications: Verification[];
}

export const VerificationStats: React.FC<VerificationStatsProps> = ({
  verifications,
}) => {
  const pendingCount = verifications.filter(
    (v) => v.status === "Pending" || v.status.toLowerCase() === "pending"
  ).length;

  const approvedCount = verifications.filter(
    (v) => v.status === "Approved" || v.status?.toLowerCase() === "approved"
  ).length;

  const cancelledOrRejectedCount = verifications.filter(
    (v) => v.status === "Cancelled" || v.status === "Rejected"
  ).length;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
        mb: 4,
      }}
    >
      <Card
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 2.5,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#FF6B35",
            boxShadow: "0 4px 12px rgba(255, 107, 53, 0.08)",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontWeight: 600,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.75rem",
                }}
              >
                Tổng Số Yêu Cầu
              </Typography>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: "#1E293B" }}
              >
                {verifications.length}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "#FFF5F0",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.5rem" }}>📦</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 2.5,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#3B82F6",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.08)",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontWeight: 600,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.75rem",
                }}
              >
                Chờ Xử Lý
              </Typography>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: "#3B82F6" }}
              >
                {pendingCount}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "#EFF6FF",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.5rem" }}>⏳</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 2.5,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#10B981",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontWeight: 600,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.75rem",
                }}
              >
                Đã Duyệt
              </Typography>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: "#10B981" }}
              >
                {approvedCount}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "#F0FDF4",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleRounded sx={{ color: "#10B981", fontSize: 32 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 2.5,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#EF4444",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.08)",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontWeight: 600,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.75rem",
                }}
              >
                Đã Hủy/Từ Chối
              </Typography>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: "#EF4444" }}
              >
                {cancelledOrRejectedCount}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "#FEF2F2",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.5rem" }}>❌</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
