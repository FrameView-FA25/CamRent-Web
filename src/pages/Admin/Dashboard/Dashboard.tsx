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
  Group as GroupIcon,
  ShoppingCart as BookingIcon,
  MonetizationOn as RevenueIcon,
  TrendingUp as NetRevenueIcon,
  Warning as DisputeRevenueIcon,
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
  BranchRevenue,
} from "../../../services/dashboard.service";
import { dashboardService } from "../../../services/dashboard.service";

// Dashboard Admin - hiển thị số liệu tổng quan cho Admin
// Lấy dữ liệu từ API thông qua `dashboardService.getAdminDashboard`
// Các phần: Stat cards, Biểu đồ doanh thu, Bảng trạng thái & Bảng doanh thu chi nhánh

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

// formatCurrency: format số tiền cho UI (rút gọn M/B khi lớn)
// - < 1M: hiển thị đầy đủ (ví dụ 90.000 đ)
// - >=1M và <1B: hiển thị xM (ví dụ 25.5M đ)
// - >=1B: hiển thị xB (ví dụ 2.5B đ)
const formatCurrency = (value = 0) => {
  if (!Number.isFinite(value)) return CURRENCY_FORMATTER.format(0);
  return CURRENCY_FORMATTER.format(value);
};

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

// StatCard: component hiển thị một ô số liệu (title, value, description, icon)
// Dùng lại cho tất cả metric ở phần header.
const StatCard = ({ stat }: { stat: StatItem }) => {
  const palette = STAT_ACCENT_STYLES[stat.accent];

  return (
    <Card
      elevation={1}
      sx={{
        backgroundColor: "white",
        borderRadius: 2,
        minHeight: 88,
        display: "flex",
        alignItems: "center",
        p: { xs: 1, sm: 1.25 },
        boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: palette.iconBg,
          color: palette.iconColor,
          flexShrink: 0,
          mr: 2,
        }}
      >
        {stat.icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: "#6B7280", fontWeight: 700, fontSize: "0.85rem" }}
        >
          {stat.title}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: "#0F172A",
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            lineHeight: 1.05,
            mt: 0.25,
          }}
        >
          {stat.value}
        </Typography>

        {stat.description && (
          <Typography
            variant="caption"
            sx={{ color: "#9CA3AF", display: "block", mt: 0.5 }}
          >
            {stat.description}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

const BranchRevenueTable = ({
  branchRevenues,
}: {
  branchRevenues: BranchRevenue[];
}) => {
  // BranchRevenueTable: bảng liệt kê doanh thu theo chi nhánh
  // Hiển thị tên chi nhánh và doanh thu ròng (netRevenue) đã được tổng hợp ở backend.
  // Mục đích: cho admin so sánh hiệu quả giữa các chi nhánh.
  const headerCellStyle = {
    border: "none",
    color: "#6B7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingY: 1.5,
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
            Doanh thu theo chi nhánh
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Phân tích doanh thu hoa hồng và lợi nhuận từng chi nhánh.
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
                <TableCell sx={{ ...headerCellStyle, width: "30%" }}>
                  Chi nhánh
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Hoa hồng
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Đền bù
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Lợi nhuận
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branchRevenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ border: "none", py: 4 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#999", textAlign: "center" }}
                    >
                      Chưa có dữ liệu doanh thu.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                branchRevenues.map((branch) => (
                  <TableRow
                    key={branch.branchId}
                    sx={{
                      "&:hover": { bgcolor: "#F9FAFB" },
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <TableCell sx={{ border: "none", py: 1.75 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#0F172A", fontWeight: 600 }}
                      >
                        {branch.branchName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#10B981", fontWeight: 600 }}
                      >
                        {formatCurrency(branch.commissionRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#F59E0B", fontWeight: 600 }}
                      >
                        {formatCurrency(branch.disputeRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#4F46E5", fontWeight: 600 }}
                      >
                        {formatCurrency(branch.netRevenue)}
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

const BookingStatusTable = ({
  bookingsByStatus,
}: {
  bookingsByStatus: BookingStatusCount[];
}) => {
  // BookingStatusTable: bảng tóm tắt số lượng booking theo trạng thái
  // Dùng để xem phân bổ trạng thái (Draft, Confirmed, Completed...) trong hệ thống.
  const headerCellStyle = {
    border: "none",
    color: "#6B7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingY: 1.5,
  };

  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
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
  // RevenueChartCard: hiển thị biểu đồ area cho doanh thu theo thời gian
  // - `stats` là mảng time series từ backend (date, bookingCount, capturedRevenue)
  // - Người dùng có thể đổi period giữa daily/monthly
  const hasData = stats.length > 0;
  const showLoadingState = isLoading && !hasData;
  // const currentStat = stats[stats.length - 1];
  // const previousStat = stats[stats.length - 2];

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
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Doanh thu đã thu",
                    ]}
                    labelFormatter={(label: string) => `Thời gian: ${label}`}
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

            {/* <Box
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
            </Box> */}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardAdmin() {
  // Component chính DashboardAdmin
  // - Lấy dữ liệu admin dashboard từ backend
  // - Quản lý trạng thái loading / error
  // - Chuẩn bị dữ liệu cho các component con (stats, charts, tables)
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
        title: "Doanh thu hoa hồng",
        value: formatCurrency(data?.totalCommissionRevenue ?? 0),
        description: "Thu nhập từ hoa hồng",
        icon: <RevenueIcon />,
        accent: "green",
      },
      {
        title: "Doanh thu đền bù",
        value: formatCurrency(data?.totalDisputeRevenue ?? 0),
        description: "Thu nhập từ xử lý đền bù",
        icon: <DisputeRevenueIcon />,
        accent: "orange",
      },
      {
        title: "Doanh thu ròng",
        value: formatCurrency(data?.totalNetRevenue ?? 0),
        description: "Lợi nhuận sau tất cả",
        icon: <NetRevenueIcon />,
        accent: "indigo",
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
              Thống kê Admin
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

        {/* Stats Grid - two rows of 4 boxes each */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2,1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 2, sm: 3 },
              mb: 3,
              alignItems: "stretch",
            }}
          >
            {stats.slice(0, 4).map((stat, index) => (
              <StatCard key={`top-${index}`} stat={stat} />
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2,1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 2, sm: 3 },
              alignItems: "stretch",
            }}
          >
            {stats.slice(4, 8).map((stat, index) => (
              <StatCard key={`bottom-${index}`} stat={stat} />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <RevenueChartCard
            stats={chartStats}
            period={chartPeriod}
            onPeriodChange={handleChartPeriodChange}
            isLoading={isLoading}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 3,
            }}
          >
            <BookingStatusTable
              bookingsByStatus={data?.bookingsByStatus ?? []}
            />
            <BranchRevenueTable branchRevenues={data?.branchRevenues ?? []} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
