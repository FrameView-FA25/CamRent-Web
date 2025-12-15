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
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Devices as DevicesIcon,
  AccountBalanceWallet as WalletIcon,
  Group as GroupIcon,
  ShoppingCart as BookingIcon,
  Gavel as DisputeIcon,
  Camera as CameraIcon,
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
import type { MouseEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminDashboardResponse,
  TimeSeriesStat,
  BookingStatusCount,
} from "../../../services/dashboard.service";
import { dashboardService } from "../../../services/dashboard.service";

type StatAccent =
  | "teal"
  | "indigo"
  | "amber"
  | "purple"
  | "green"
  | "blue"
  | "red"
  | "orange";

interface StatItem {
  title: string;
  value: string | ReactElement;
  description?: string;
  icon: ReactElement;
  accent: StatAccent;
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

const formatCurrency = (value: number) => CURRENCY_FORMATTER.format(value);

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
  green: {
    borderTop: "4px solid #10B981",
    iconBg: "rgba(16,185,129,0.08)",
    iconColor: "#10B981",
  },
  blue: {
    borderTop: "4px solid #3B82F6",
    iconBg: "rgba(59,130,246,0.08)",
    iconColor: "#3B82F6",
  },
  red: {
    borderTop: "4px solid #EF4444",
    iconBg: "rgba(239,68,68,0.08)",
    iconColor: "#EF4444",
  },
  orange: {
    borderTop: "4px solid #F97316",
    iconBg: "rgba(249,115,22,0.08)",
    iconColor: "#F97316",
  },
};

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
        boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: "#6B7280",
              fontSize: "0.75rem",
              fontWeight: 600,
              lineHeight: 1.4,
              flex: 1,
            }}
          >
            {stat.title}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              bgcolor: palette.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.iconColor,
              flexShrink: 0,
            }}
          >
            {stat.icon}
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{
            color: "#0F172A",
            fontWeight: 700,
            fontSize: "1.75rem",
            mb: 0.5,
            lineHeight: 1.2,
          }}
        >
          {stat.value}
        </Typography>

        {stat.description && (
          <Typography
            variant="body2"
            sx={{ color: "#9CA3AF", fontSize: "0.75rem", lineHeight: 1.4 }}
          >
            {stat.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const BookingStatusTable = ({
  bookingsByStatus,
}: {
  bookingsByStatus: BookingStatusCount[];
}) => {
  const headerCellStyle = {
    border: "none",
    color: "#6B7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingY: 1.5,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "PendingApproval":
        return "warning";
      case "Draft":
        return "default";
      case "Completed":
        return "info";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
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
            Phân bổ booking theo trạng thái
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Tổng quan về tình trạng các đơn thuê trong hệ thống.
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
                <TableCell sx={{ ...headerCellStyle, width: "50%" }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Số lượng
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Tỷ lệ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookingsByStatus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ border: "none", py: 4 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#999", textAlign: "center" }}
                    >
                      Chưa có dữ liệu booking.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookingsByStatus.map((booking) => {
                  const totalBookings = bookingsByStatus.reduce(
                    (sum, b) => sum + b.count,
                    0
                  );
                  const percentage = (
                    (booking.count / totalBookings) *
                    100
                  ).toFixed(1);

                  return (
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
                          label={booking.statusText}
                          color={getStatusColor(booking.status) as any}
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
                      <TableCell sx={{ border: "none", textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: "#121212" }}>
                          {percentage}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const RevenueChartCard = ({
  stats,
  period,
  onPeriodChange,
  isLoading,
}: {
  stats: TimeSeriesStat[];
  period: ChartPeriod;
  onPeriodChange: (
    event: MouseEvent<HTMLElement>,
    value: ChartPeriod | null
  ) => void;
  isLoading: boolean;
}) => {
  const hasData = stats.length > 0;
  const showLoadingState = isLoading && !hasData;
  const currentStat = stats[stats.length - 1];
  const previousStat = stats[stats.length - 2];

  const chartData = stats.map((stat) => ({
    ...stat,
    label: formatChartLabel(stat.date, period),
  }));

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        height: "100%",
        backgroundColor: "white",
        boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                color: "#121212",
                fontWeight: 700,
                fontSize: "1.125rem",
                mb: 0.5,
              }}
            >
              Doanh thu hệ thống
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Theo dõi doanh thu và lượt booking trong hệ thống.
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={period}
            onChange={onPeriodChange}
          >
            <ToggleButton value="daily">Ngày</ToggleButton>
            <ToggleButton value="monthly">Tháng</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {showLoadingState && (
          <Typography variant="body2" sx={{ color: "#999" }}>
            Đang tải dữ liệu biểu đồ...
          </Typography>
        )}

        {!isLoading && !hasData && (
          <Typography variant="body2" sx={{ color: "#999" }}>
            Chưa có dữ liệu để hiển thị.
          </Typography>
        )}

        {hasData && (
          <>
            <Box sx={{ width: "100%", height: 260 }}>
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
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
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
                    labelFormatter={(label: string) => `Thời gian: ${label}`}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="capturedRevenue"
                    stroke="#3B82F6"
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
                  sx={{ color: "#666", textTransform: "uppercase" }}
                >
                  Thời điểm hiện tại
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "#0F172A", fontWeight: 700 }}
                >
                  {currentStat
                    ? formatCurrency(currentStat.capturedRevenue)
                    : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#666", textTransform: "uppercase" }}
                >
                  Kỳ trước
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "#0F172A", fontWeight: 700 }}
                >
                  {previousStat
                    ? formatCurrency(previousStat.capturedRevenue)
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardAdmin() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboard = await dashboardService.getAdminDashboard();
        setData(dashboard);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải dashboard admin:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi tải dữ liệu thống kê."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats: StatItem[] = useMemo(
    () => [
      {
        title: "Tổng người dùng",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalUsers ?? 0).toString()
        ),
        description: `${data?.totalRenters ?? 0} khách thuê, ${
          data?.totalOwners ?? 0
        } chủ thuê`,
        icon: <PeopleIcon />,
        accent: "teal",
      },
      {
        title: "Nhân viên & Quản lý",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (
            (data?.totalStaffs ?? 0) + (data?.totalBranchManagers ?? 0)
          ).toString()
        ),
        description: `${data?.totalStaffs ?? 0} nhân viên, ${
          data?.totalBranchManagers ?? 0
        } quản lý chi nhánh`,
        icon: <GroupIcon />,
        accent: "indigo",
      },
      {
        title: "Chi nhánh",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalBranches ?? 0).toString()
        ),
        description: "Số lượng chi nhánh đang hoạt động",
        icon: <StoreIcon />,
        accent: "green",
      },
      {
        title: "Thiết bị",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          ((data?.totalCameras ?? 0) + (data?.totalAccessories ?? 0)).toString()
        ),
        description: `${data?.totalCameras ?? 0} camera, ${
          data?.totalAccessories ?? 0
        } phụ kiện`,
        icon: <DevicesIcon />,
        accent: "purple",
      },
      {
        title: "Tổng booking",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalBookings ?? 0).toString()
        ),
        description: "Tổng số đơn thuê trong hệ thống",
        icon: <BookingIcon />,
        accent: "amber",
      },
      {
        title: "Doanh thu đã thu",
        value: formatCurrency(data?.totalCapturedRevenue ?? 0),
        description: `Hoàn tiền: ${formatCurrency(
          data?.totalRefundedAmount ?? 0
        )}`,
        icon: <WalletIcon />,
        accent: "blue",
      },
      {
        title: "Tranh chấp",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          ((data?.openDisputes ?? 0) + (data?.resolvedDisputes ?? 0)).toString()
        ),
        description: `${data?.openDisputes ?? 0} đang mở, ${
          data?.resolvedDisputes ?? 0
        } đã giải quyết`,
        icon: <DisputeIcon />,
        accent: "red",
      },
      {
        title: "Combo sản phẩm",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalCombos ?? 0).toString()
        ),
        description: "Số lượng combo đang có",
        icon: <CameraIcon />,
        accent: "orange",
      },
    ],
    [isLoading, data]
  );

  const dailyStats = useMemo(() => data?.dailyStats ?? [], [data?.dailyStats]);
  const monthlyStats = useMemo(() => {
    const stats = data?.monthlyStats ?? [];
    const targetYear = stats[0]
      ? new Date(stats[0].date).getFullYear()
      : new Date().getFullYear();
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
  }, [data?.monthlyStats]);

  const chartStats = useMemo(
    () => (chartPeriod === "daily" ? dailyStats : monthlyStats),
    [chartPeriod, dailyStats, monthlyStats]
  );

  const handleChartPeriodChange = (
    _: MouseEvent<HTMLElement>,
    value: ChartPeriod | null
  ) => {
    if (value) {
      setChartPeriod(value);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#F3F4F6",
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
        width: "100%",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Compact Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: "#0F172A",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
                mb: 0.5,
              }}
            >
              Dashboard Admin
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Tổng quan hệ thống CamRent
            </Typography>
          </Box>
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Đang tải...
              </Typography>
            </Box>
          )}
          {error && !isLoading && (
            <Typography
              variant="body2"
              sx={{
                color: "error.main",
                bgcolor: "#FEE2E2",
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: "0.875rem",
              }}
            >
              {error}
            </Typography>
          )}
        </Box>

        {/* Stats Grid - More compact */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <RevenueChartCard
            stats={chartStats}
            period={chartPeriod}
            onPeriodChange={handleChartPeriodChange}
            isLoading={isLoading}
          />
          <Box>
            <BookingStatusTable
              bookingsByStatus={data?.bookingsByStatus ?? []}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
