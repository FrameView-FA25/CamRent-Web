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
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  PhotoCamera as CameraIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
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
  OwnerDashboardResponse,
  TimeSeriesStat,
  TopRentedAsset,
} from "../../../services/dashboard.service";
import { dashboardService } from "../../../services/dashboard.service";
import { getBalance } from "../../../services/wallet.service";
import type { Wallet as WalletBalanceResponse } from "../../../types/wallet.types";

type StatAccent = "teal" | "indigo" | "amber" | "purple";

interface StatItem {
  title: string;
  value: string | ReactElement;
  description?: string;
  icon: ReactElement;
  accent: StatAccent;
}

type ChartPeriod = "daily" | "monthly" | "yearly";

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
  if (period === "daily") {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }
  if (period === "monthly") {
    return `Tháng ${date.getMonth() + 1}`;
  }
  // yearly
  return date.getFullYear().toString();
};

// Bảng cấu hình style cho từng tone màu của thẻ thống kê (theo phong cách phẳng, giống shadcn)
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
};

// ===== COMPONENTS =====

// Thẻ thống kê nhỏ hiển thị các con số nhanh (camera, phụ kiện, booking, doanh thu)
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
          lg: "calc(25% - 18px)",
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

// Bảng liệt kê các thiết bị được thuê nhiều nhất
const TopRentedAssetsTable = ({ assets }: { assets: TopRentedAsset[] }) => {
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
            Thiết bị được thuê nhiều nhất
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Danh sách các thiết bị mang lại nhiều lượt thuê và doanh thu cao.
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
                <TableCell sx={{ ...headerCellStyle, width: "40%" }}>
                  Thiết bị
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Loại
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Số lượt thuê
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Doanh thu từ đơn hàng
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Doanh thu thực tế
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ border: "none", py: 4 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#999", textAlign: "center" }}
                    >
                      Chưa có dữ liệu thiết bị được thuê nhiều.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow
                    key={asset.itemId}
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
                        {asset.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Chip
                        size="small"
                        label={
                          asset.itemType === "camera" ? "Camera" : "Phụ kiện"
                        }
                        color={
                          asset.itemType === "camera" ? "primary" : "default"
                        }
                        sx={{ borderRadius: 1, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography variant="body2" sx={{ color: "#121212" }}>
                        {asset.rentalCount}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#121212", fontWeight: 600 }}
                      >
                        {formatCurrency(asset.grossRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none", textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#121212", fontWeight: 600 }}
                      >
                        {formatCurrency(asset.netRevenue)}
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

// Biểu đồ cột cho phép chuyển đổi giữa thống kê theo ngày / theo tháng / theo năm
const ColumnChartCard = ({
  stats,
  period,
  onPeriodChange,
  isLoading,
  selectedYear,
  availableYears,
  onYearChange,
}: {
  stats: TimeSeriesStat[];
  period: ChartPeriod;
  onPeriodChange: (
    event: MouseEvent<HTMLElement>,
    value: ChartPeriod | null
  ) => void;
  isLoading: boolean;
  selectedYear: number;
  availableYears: number[];
  onYearChange: (event: any) => void;
}) => {
  const hasData = stats.length > 0;
  const showLoadingState = isLoading && !hasData;
  // const currentStat = stats[stats.length - 1];
  // const previousStat = stats[stats.length - 2];

  // Chuẩn hóa dữ liệu cho biểu đồ area
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
              Hiệu suất thiết bị
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Theo dõi lượt thuê và doanh thu thu được của bạn.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Dropdown chọn năm - chỉ hiển thị khi period là monthly */}
            {period === "monthly" && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={onYearChange}
                  sx={{
                    borderRadius: 1,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E5E7EB",
                    },
                  }}
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      Năm {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <ToggleButtonGroup
              size="small"
              color="primary"
              exclusive
              value={period}
              onChange={onPeriodChange}
            >
              <ToggleButton value="daily">Ngày</ToggleButton>
              <ToggleButton value="monthly">Tháng</ToggleButton>
              <ToggleButton value="yearly">Năm</ToggleButton>
            </ToggleButtonGroup>
          </Box>
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
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
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
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Doanh thu thực tế",
                    ]}
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
                    stroke="#F97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Component Dashboard - Trang tổng quan quản lý cho Owner
 */
export default function Dashboard() {
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(true);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboard = await dashboardService.getOwnerDashboard();
        setData(dashboard);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải dashboard owner:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi tải dữ liệu thống kê."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWallet = async () => {
      setIsLoadingWallet(true);
      try {
        const walletData = await getBalance();
        setWallet(walletData as WalletBalanceResponse);
      } catch (err) {
        console.error("Lỗi khi tải thông tin ví:", err);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchDashboard();
    fetchWallet();
  }, []);

  // Tạo danh sách các năm có dữ liệu
  const availableYears = useMemo(() => {
    const stats = data?.monthlyStats ?? [];
    if (stats.length === 0) return [new Date().getFullYear()];

    const years = new Set<number>();
    stats.forEach((stat) => {
      years.add(new Date(stat.date).getFullYear());
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [data?.monthlyStats]);

  const stats: StatItem[] = useMemo(
    () => [
      {
        title: "Số dư ví",
        value: isLoadingWallet ? (
          <CircularProgress size={24} />
        ) : (
          formatCurrency(wallet?.balance ?? 0)
        ),
        description: "Số dư khả dụng trong ví của bạn.",
        icon: <WalletIcon />,
        accent: "teal",
      },
      {
        title: "Tổng camera",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalCameras ?? 0).toString()
        ),
        description: "Số lượng camera bạn đang cho thuê.",
        icon: <CameraIcon />,
        accent: "indigo",
      },
      {
        title: "Tổng phụ kiện",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalAccessories ?? 0).toString()
        ),
        description: "Số lượng phụ kiện bạn đang cho thuê.",
        icon: <PeopleIcon />,
        accent: "purple",
      },
      {
        title: "Tổng lượt booking",
        value: isLoading ? (
          <CircularProgress size={24} />
        ) : (
          (data?.totalBookingsForOwnerItems ?? 0).toString()
        ),
        description: "Tổng số đơn thuê liên quan tới thiết bị của bạn.",
        icon: <PeopleIcon />,
        accent: "amber",
      },
      {
        title: "Tổng doanh thu đơn hàng",
        value: formatCurrency(data?.totalGrossRevenue ?? 0),
        description: "Tổng doanh thu từ tất cả đơn hàng.",
        icon: <MoneyIcon />,
        accent: "amber",
      },
      {
        title: "Tổng doanh thu thực tế",
        value: formatCurrency(data?.totalNetRevenue ?? 0),
        description: "Tổng doanh thu thực tế sau khi trừ phí nền tảng.",
        icon: <MoneyIcon />,
        accent: "amber",
      },
    ],
    [
      wallet?.balance,
      isLoadingWallet,
      isLoading,
      data?.totalAccessories,
      data?.totalBookingsForOwnerItems,
      data?.totalCameras,
      data?.totalGrossRevenue,
      data?.totalNetRevenue,
    ]
  );

  const dailyStats = useMemo(() => data?.dailyStats ?? [], [data?.dailyStats]);

  const monthlyStats = useMemo(() => {
    const stats = data?.monthlyStats ?? [];

    const yearStats = stats.filter(
      (stat) => new Date(stat.date).getFullYear() === selectedYear
    );

    const monthMap = new Map<number, TimeSeriesStat>(
      yearStats.map((stat) => [new Date(stat.date).getMonth(), stat])
    );

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const existing = monthMap.get(monthIndex);
      if (existing) {
        return existing;
      }

      return {
        date: new Date(Date.UTC(selectedYear, monthIndex, 1)).toISOString(),
        bookingCount: 0,
        capturedRevenue: 0,
      };
    });
  }, [data?.monthlyStats, selectedYear]);

  const yearlyStats = useMemo(() => {
    const stats = data?.monthlyStats ?? [];

    if (stats.length === 0) return [];

    const yearMap = new Map<number, TimeSeriesStat>();

    stats.forEach((stat) => {
      const year = new Date(stat.date).getFullYear();
      const existing = yearMap.get(year);

      if (existing) {
        existing.bookingCount += stat.bookingCount;
        existing.capturedRevenue += stat.capturedRevenue;
      } else {
        yearMap.set(year, {
          date: new Date(Date.UTC(year, 0, 1)).toISOString(),
          bookingCount: stat.bookingCount,
          capturedRevenue: stat.capturedRevenue,
        });
      }
    });

    return Array.from(yearMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data?.monthlyStats]);

  const chartStats = useMemo(() => {
    if (chartPeriod === "daily") return dailyStats;
    if (chartPeriod === "monthly") return monthlyStats;
    return yearlyStats;
  }, [chartPeriod, dailyStats, monthlyStats, yearlyStats]);

  const handleChartPeriodChange = (
    _: MouseEvent<HTMLElement>,
    value: ChartPeriod | null
  ) => {
    if (value) {
      setChartPeriod(value);
    }
  };

  const handleYearChange = (event: any) => {
    setSelectedYear(event.target.value as number);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#F3F4F6",
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        width: "100%",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "#6B7280", fontWeight: 600, letterSpacing: 1.5 }}
          >
            Trung tâm quản lý Owner
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#0F172A",
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.3rem" },
            }}
          >
            Tổng quan hoạt động kinh doanh
          </Typography>
          <Typography variant="body1" sx={{ color: "#475467" }}>
            Theo dõi doanh thu, số lượt booking và hiệu suất thiết bị trong một
            bảng điều khiển trực quan.
          </Typography>
          {isLoading && (
            <Typography variant="body2" sx={{ color: "#999", mt: 1 }}>
              Đang tải dữ liệu thống kê...
            </Typography>
          )}
          {error && !isLoading && (
            <Typography
              variant="body2"
              sx={{ color: "error.main", mt: 1, maxWidth: 600 }}
            >
              {error}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <ColumnChartCard
            stats={chartStats}
            period={chartPeriod}
            onPeriodChange={handleChartPeriodChange}
            isLoading={isLoading}
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={handleYearChange}
          />
          <Box>
            <TopRentedAssetsTable assets={data?.topRentedAssets ?? []} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
