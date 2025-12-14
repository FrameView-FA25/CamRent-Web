import React, { useState, useEffect, useMemo, type ReactElement } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Assignment,
  LocalShipping,
  AssignmentReturn,
  VerifiedUser,
  RateReview,
} from "@mui/icons-material";
import { dashboardService } from "../../services/dashboard.service";
import type {
  StaffDashboardResponse,
  BookingStatusCount,
} from "../../services/dashboard.service";

type StatAccent = "teal" | "indigo" | "amber" | "purple" | "rose";

interface StatItem {
  title: string;
  value: string | ReactElement;
  description?: string;
  icon: ReactElement;
  accent: StatAccent;
}

// Bảng cấu hình style cho từng tone màu của thẻ thống kê
const STAT_ACCENT_STYLES: Record<
  StatAccent,
  {
    borderTop: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  teal: {
    borderTop: "4px solid #0D9488",
    iconBg: "rgba(13,148,136,0.08)",
    iconColor: "#0D9488",
  },
  indigo: {
    borderTop: "4px solid #4F46E5",
    iconBg: "rgba(79,70,229,0.08)",
    iconColor: "#4F46E5",
  },
  amber: {
    borderTop: "4px solid #F59E0B",
    iconBg: "rgba(245,158,11,0.08)",
    iconColor: "#F59E0B",
  },
  purple: {
    borderTop: "4px solid #2563EB",
    iconBg: "rgba(37,99,235,0.08)",
    iconColor: "#2563EB",
  },
  rose: {
    borderTop: "4px solid #E11D48",
    iconBg: "rgba(225,29,72,0.08)",
    iconColor: "#E11D48",
  },
};

// Thẻ thống kê
const StatCard = ({ stat }: { stat: StatItem }) => {
  const palette = STAT_ACCENT_STYLES[stat.accent];

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        borderTop: palette.borderTop,
        flex: 1,
        minWidth: {
          xs: "100%",
          sm: "calc(50% - 12px)",
          lg: "calc(20% - 19.2px)",
        },
        boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: palette.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.iconColor,
            }}
          >
            {stat.icon}
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ color: "#475467", fontSize: "0.85rem", fontWeight: 600 }}
          >
            {stat.title}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{ color: "#0F172A", fontWeight: 700, fontSize: "2rem", mb: 1 }}
        >
          {stat.value}
        </Typography>

        {stat.description && (
          <Typography
            variant="body2"
            sx={{ color: "#4B5563", fontSize: "0.85rem" }}
          >
            {stat.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Bảng trạng thái booking
const BookingStatusTable = ({
  bookings,
}: {
  bookings: BookingStatusCount[];
}) => {
  const headerCellStyle = {
    border: "none",
    color: "#6B7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    paddingY: 1.5,
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<
      string,
      "primary" | "success" | "warning" | "error" | "default"
    > = {
      Pending: "warning",
      Confirmed: "primary",
      InProgress: "primary",
      Completed: "success",
      Cancelled: "error",
      Delivering: "primary",
      Delivered: "success",
    };
    return statusMap[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      Pending: "Chờ xử lý",
      Confirmed: "Đã xác nhận",
      InProgress: "Đang thực hiện",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
      Delivering: "Đang giao",
      Delivered: "Đã giao",
    };
    return statusLabels[status] || status;
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        height: "100%",
        boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
        backgroundColor: "white",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            variant="h6"
            sx={{ color: "#0F172A", fontWeight: 700, fontSize: "1.1rem" }}
          >
            Đơn hàng theo trạng thái
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Tổng quan các đơn hàng được phân công theo từng trạng thái.
          </Typography>
        </Box>

        <TableContainer
          sx={{
            overflowX: "auto",
            borderRadius: 2,
            border: "1px solid #E5E7EB",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                <TableCell sx={{ ...headerCellStyle, width: "60%" }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Số lượng
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} sx={{ border: "none", py: 4 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#999", textAlign: "center" }}
                    >
                      Chưa có đơn hàng nào được phân công.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.status}
                    sx={{
                      "&:hover": { bgcolor: "#F9FAFB" },
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <TableCell sx={{ border: "none", py: 1.75 }}>
                      <Chip
                        size="small"
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status)}
                        sx={{ borderRadius: 1, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#121212", fontWeight: 600 }}
                      >
                        {booking.count}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const StaffDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<StaffDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getStaffDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats: StatItem[] = useMemo(
    () => [
      {
        title: "Tổng đơn hàng",
        value: loading ? (
          <CircularProgress size={24} />
        ) : (
          (dashboardData?.totalAssignedBookings ?? 0).toString()
        ),
        description: "Tổng số đơn hàng được giao.",
        icon: <Assignment fontSize="large" />,
        accent: "teal",
      },
      {
        title: "Lấy hàng hôm nay",
        value: loading ? (
          <CircularProgress size={24} />
        ) : (
          (dashboardData?.todayPickupBookings ?? 0).toString()
        ),
        description: "Số đơn cần lấy hàng hôm nay.",
        icon: <LocalShipping fontSize="large" />,
        accent: "indigo",
      },
      {
        title: "Trả hàng hôm nay",
        value: loading ? (
          <CircularProgress size={24} />
        ) : (
          (dashboardData?.todayReturnBookings ?? 0).toString()
        ),
        description: "Số đơn cần trả hàng hôm nay.",
        icon: <AssignmentReturn fontSize="large" />,
        accent: "amber",
      },
      {
        title: "Xác minh chờ",
        value: loading ? (
          <CircularProgress size={24} />
        ) : (
          (dashboardData?.pendingVerificationRequests ?? 0).toString()
        ),
        description: "Yêu cầu xác minh đang chờ xử lý.",
        icon: <VerifiedUser fontSize="large" />,
        accent: "purple",
      },
      {
        title: "Đánh giá chờ",
        value: loading ? (
          <CircularProgress size={24} />
        ) : (
          (dashboardData?.pendingReviewsToModerate ?? 0).toString()
        ),
        description: "Đánh giá cần kiểm duyệt.",
        icon: <RateReview fontSize="large" />,
        accent: "rose",
      },
    ],
    [loading, dashboardData]
  );

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 64px)",
          bgcolor: "#F9FAFB",
          p: 4,
        }}
      >
        <Card
          elevation={0}
          sx={{
            border: "1px solid #FCA5A5",
            borderRadius: 2,
            bgcolor: "#FEE2E2",
            p: 3,
          }}
        >
          <Typography variant="body1" sx={{ color: "#DC2626" }}>
            {error}
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "#F9FAFB",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#0F172A",
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          Dashboard Nhân Viên
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          Tổng quan công việc và nhiệm vụ của bạn hôm nay.
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </Box>

      {/* Booking Status Table */}
      {!loading && dashboardData && (
        <BookingStatusTable bookings={dashboardData.bookingsByStatus} />
      )}
    </Box>
  );
};

export default StaffDashboard;
