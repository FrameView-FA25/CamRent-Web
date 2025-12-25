import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CircularProgress,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Extension as ExtensionIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardServiceManager } from "../../services/dashboard.service";

interface BookingStatus {
  status: string;
  statusText: string;
  count: number;
}

interface TimeSeriesStat {
  date: string;
  bookingCount: number;
  capturedRevenue: number;
}

interface TopRentedAsset {
  itemId: string;
  itemType: string;
  name: string;
  rentalCount: number;
  grossRevenue: number;
}

interface DashboardData {
  branchId: string;
  branchName: string;
  camerasInBranch: number;
  accessoriesInBranch: number;
  totalBookings: number;
  bookingsByStatus: BookingStatus[];
  totalCapturedRevenue: number;
  totalGrossRevenue?: number;
  openDisputes: number;
  topRentedAssets?: TopRentedAsset[];
  dailyStats?: TimeSeriesStat[];
  monthlyStats?: TimeSeriesStat[];
}

type ChartPeriod = "daily" | "monthly";

const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCurrency = (amount: number) => CURRENCY_FORMATTER.format(amount);

const formatChartLabel = (dateString: string, period: ChartPeriod) => {
  const date = new Date(dateString);
  return period === "daily"
    ? date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    : date.toLocaleDateString("vi-VN", {
        month: "short",
        year: "numeric",
      });
};

const DashboardManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardServiceManager.getManagerDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error("Error loading dashboard:", err);
      setError(err?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "completed":
        return "#3B82F6";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const dailyStats = useMemo(
    () => dashboardData?.dailyStats ?? [],
    [dashboardData?.dailyStats]
  );

  const monthlyStats = useMemo(() => {
    const stats = dashboardData?.monthlyStats ?? [];
    if (stats.length === 0) return [];

    const targetYear = new Date(stats[0].date).getFullYear();
    const monthMap = new Map<number, TimeSeriesStat>(
      stats.map((stat) => [new Date(stat.date).getMonth(), stat])
    );

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const existing = monthMap.get(monthIndex);
      if (existing) {
        return existing;
      }

      return {
        date: new Date(Date.UTC(targetYear, monthIndex, 1)).toISOString(),
        bookingCount: 0,
        capturedRevenue: 0,
      };
    });
  }, [dashboardData?.monthlyStats]);

  const chartStats = useMemo(
    () => (chartPeriod === "daily" ? dailyStats : monthlyStats),
    [chartPeriod, dailyStats, monthlyStats]
  );

  const chartData = useMemo(
    () =>
      chartStats.map((stat) => ({
        ...stat,
        label: formatChartLabel(stat.date, chartPeriod),
      })),
    [chartStats, chartPeriod]
  );

  const currentStat = chartStats[chartStats.length - 1];
  const previousStat = chartStats[chartStats.length - 2];

  const handleChartPeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    value: ChartPeriod | null
  ) => {
    if (value) {
      setChartPeriod(value);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#F5F5F5",
        }}
      >
        <CircularProgress size={48} sx={{ color: "#FF6B35" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Không có dữ liệu
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#6B7280",
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          TRUNG TÂM QUẢN LY {dashboardData.branchName.toUpperCase()}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#1F2937", mt: 1 }}
        >
          Tổng quan hoạt động kinh doanh
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
          Theo dõi doanh thu, số lượng booking và hiệu suất thiết bị trong một
          bảng điều khiển trực quan.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Cameras */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              borderTop: "4px solid #10B981",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "#ECFDF5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 24, color: "#10B981" }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", mb: 0.5, fontWeight: 500 }}
                >
                  Tổng camera
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  {dashboardData.camerasInBranch}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Số lượng camera đang cho thuê.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Accessories */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              borderTop: "4px solid #6366F1",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <ExtensionIcon sx={{ fontSize: 24, color: "#6366F1" }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", mb: 0.5, fontWeight: 500 }}
                >
                  Tổng phụ kiện
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  {dashboardData.accessoriesInBranch}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Số lượng phụ kiện đang cho thuê.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Total Bookings */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              borderTop: "4px solid #F59E0B",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "#FFFBEB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <EventIcon sx={{ fontSize: 24, color: "#F59E0B" }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", mb: 0.5, fontWeight: 500 }}
                >
                  Tổng lượt booking
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  {dashboardData.totalBookings}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Tổng số đơn thuê thiết bị.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Total Captured Revenue */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              borderTop: "4px solid #10B981",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "#ECFDF5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <AttachMoneyIcon sx={{ fontSize: 24, color: "#10B981" }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", mb: 0.5, fontWeight: 500 }}
                >
                  Doanh thu đã thu
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  {formatCurrency(dashboardData.totalCapturedRevenue)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Doanh thu đã thu từ booking.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Total Gross Revenue */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              borderTop: "4px solid #F59E0B",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "#FFFBEB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <AttachMoneyIcon sx={{ fontSize: 24, color: "#F59E0B" }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", mb: 0.5, fontWeight: 500 }}
                >
                  Tổng doanh thu gộp
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  {formatCurrency(dashboardData.totalGrossRevenue ?? 0)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Doanh thu gộp từ các booking.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Box sx={{ mb: 4 }}>
        <Card
          elevation={0}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 3,
            bgcolor: "white",
            boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1F2937",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    mb: 0.5,
                  }}
                >
                  Hiệu suất thiết bị
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Theo dõi lượt thuê và doanh thu thu được của bạn.
                </Typography>
              </Box>
              <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                value={chartPeriod}
                onChange={handleChartPeriodChange}
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontWeight: 500,
                    px: 3,
                    "&.Mui-selected": {
                      bgcolor: "#F97316",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#EA580C",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="daily">Ngày</ToggleButton>
                <ToggleButton value="monthly">Tháng</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {chartStats.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                }}
              >
                <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                  Chưa có dữ liệu để hiển thị
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 16, left: 24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F97316"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F97316"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E7EB"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "#E5E7EB" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "#E5E7EB" }}
                        width={72}
                        tickFormatter={(value: number) =>
                          value === 0
                            ? "0"
                            : COMPACT_CURRENCY_FORMATTER.format(value)
                        }
                      />
                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label: string) =>
                          `Thời gian: ${label}`
                        }
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="capturedRevenue"
                        stroke="#F97316"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6B7280",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Thời điểm hiện tại
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: "#0F172A", fontWeight: 700 }}
                    >
                      {currentStat
                        ? formatCurrency(currentStat.capturedRevenue)
                        : "0 ₫"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6B7280",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Kỳ trước
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: "#0F172A", fontWeight: 700 }}
                    >
                      {previousStat
                        ? formatCurrency(previousStat.capturedRevenue)
                        : "0 ₫"}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Card>
      </Box>

      {/* Top Rented Assets */}
      {dashboardData.topRentedAssets &&
        dashboardData.topRentedAssets.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "white",
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 3 }}
              >
                Top thiết bị được thuê nhiều nhất
              </Typography>

              <Grid container spacing={2}>
                {dashboardData.topRentedAssets
                  .slice(0, 6)
                  .map((asset, index) => (
                    <Grid key={asset.itemId} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#F97316",
                            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: "#FFF7ED",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              color: "#F97316",
                            }}
                          >
                            #{index + 1}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#1F2937",
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {asset.name}
                            </Typography>
                            <Chip
                              label={
                                asset.itemType === "camera"
                                  ? "Camera"
                                  : "Phụ kiện"
                              }
                              size="small"
                              sx={{
                                bgcolor:
                                  asset.itemType === "camera"
                                    ? "#ECFDF5"
                                    : "#EEF2FF",
                                color:
                                  asset.itemType === "camera"
                                    ? "#10B981"
                                    : "#6366F1",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 20,
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6B7280",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Lượt thuê
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#1F2937" }}
                            >
                              {asset.rentalCount}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6B7280",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Doanh thu
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: "#F59E0B" }}
                            >
                              {formatCurrency(asset.grossRevenue)}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Box>
        )}

      {/* Bookings by Status & Disputes */}
      <Grid container spacing={3}>
        {/* Bookings by Status */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1F2937", mb: 3 }}
            >
              Phân bố trạng thái booking
            </Typography>

            {dashboardData.bookingsByStatus.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                }}
              >
                <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                  Chưa có booking nào
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {dashboardData.bookingsByStatus.map((status, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "4px",
                          height: "100%",
                          bgcolor: getStatusColor(status.status),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={status.statusText}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(status.status),
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: "#1F2937",
                          mb: 0.5,
                        }}
                      >
                        {status.count}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6B7280" }}>
                        đơn booking
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Open Disputes */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1F2937", mb: 3 }}
            >
              Tranh chấp đang mở
            </Typography>

            <Box
              sx={{
                textAlign: "center",
                py: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor:
                    dashboardData.openDisputes > 0 ? "#FEF2F2" : "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <WarningIcon
                  sx={{
                    fontSize: 40,
                    color:
                      dashboardData.openDisputes > 0 ? "#EF4444" : "#10B981",
                  }}
                />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  mb: 1,
                }}
              >
                {dashboardData.openDisputes}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
                {dashboardData.openDisputes > 0
                  ? "tranh chấp cần xử lý"
                  : "Không có tranh chấp"}
              </Typography>
              {dashboardData.openDisputes > 0 && (
                <Alert
                  severity="warning"
                  icon={<WarningIcon fontSize="small" />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textAlign: "left",
                  }}
                >
                  <Typography variant="caption">
                    Vui lòng xử lý các tranh chấp đang mở để đảm bảo chất lượng
                    dịch vụ
                  </Typography>
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardManager;
