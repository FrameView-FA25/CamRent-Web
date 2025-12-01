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
  Stack,
} from "@mui/material";
import {
  PhotoCamera as CameraIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import type { MouseEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  OwnerDashboardResponse,
  TimeSeriesStat,
  TopRentedAsset,
} from "../../../services/dashboard.service";
import { dashboardService } from "../../../services/dashboard.service";
import { colors } from "../../../theme/colors";

// ===== TYPES =====

type StatAccent = "teal" | "indigo" | "amber" | "purple";

interface StatItem {
  title: string;
  value: string;
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
const formatCurrencyCompact = (value: number) =>
  COMPACT_CURRENCY_FORMATTER.format(value);

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

const FALLBACK_OWNER_DASHBOARD: OwnerDashboardResponse = {
  totalCameras: 14,
  totalAccessories: 4,
  totalBookingsForOwnerItems: 1,
  totalGrossRevenue: 760000,
  topRentedAssets: [
    {
      itemId: "bf844102-7643-4be5-9c6c-869ddf2196d1",
      itemType: "camera",
      name: "Canon EOS R6 Mark II",
      rentalCount: 1,
      grossRevenue: 760000,
    },
  ],
  dailyStats: [
    {
      date: "2025-11-20T00:00:00Z",
      bookingCount: 1,
      capturedRevenue: 760000,
    },
  ],
  monthlyStats: [
    {
      date: "2025-11-01T00:00:00Z",
      bookingCount: 1,
      capturedRevenue: 760000,
    },
  ],
};

const STAT_ACCENT_STYLES: Record<
  StatAccent,
  {
    cardBg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    shadow: string;
  }
> = {
  teal: {
    cardBg: `linear-gradient(135deg, ${colors.primary.lighter} 0%, #FFE4D2 100%)`,
    border: "rgba(249,115,22,0.35)",
    iconBg: "rgba(249,115,22,0.15)",
    iconColor: colors.primary.dark,
    shadow: "0 12px 30px rgba(249,115,22,0.18)",
  },
  indigo: {
    cardBg: `linear-gradient(135deg, ${colors.secondary.light} 0%, #FFF9DB 100%)`,
    border: "rgba(250,204,21,0.4)",
    iconBg: "rgba(250,204,21,0.18)",
    iconColor: colors.secondary.dark,
    shadow: "0 12px 30px rgba(250,204,21,0.18)",
  },
  amber: {
    cardBg: `linear-gradient(135deg, ${colors.accent.purpleLight} 0%, #F9F5FF 100%)`,
    border: "rgba(79,70,229,0.2)",
    iconBg: "rgba(79,70,229,0.18)",
    iconColor: colors.accent.purple,
    shadow: "0 12px 30px rgba(79,70,229,0.15)",
  },
  purple: {
    cardBg: `linear-gradient(135deg, ${colors.accent.blueLight} 0%, #E3EEFF 100%)`,
    border: "rgba(29,78,216,0.25)",
    iconBg: "rgba(29,78,216,0.18)",
    iconColor: colors.accent.blue,
    shadow: "0 12px 30px rgba(29,78,216,0.15)",
  },
};

// ===== COMPONENTS =====

const StatCard = ({ stat }: { stat: StatItem }) => {
  const palette = STAT_ACCENT_STYLES[stat.accent];

  return (
    <Card
      elevation={0}
      sx={{
        background: palette.cardBg,
        border: `1px solid ${palette.border}`,
        borderRadius: 3,
        flex: 1,
        minWidth: {
          xs: "100%",
          sm: "calc(50% - 12px)",
          lg: "calc(25% - 18px)",
        },
        boxShadow: palette.shadow,
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

const IncomeOverview = ({
  totalGrossRevenue,
}: {
  totalGrossRevenue: number;
}) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid rgba(15,23,42,0.08)",
      borderRadius: 3,
      height: "100%",
      background: "linear-gradient(160deg, #F8FAFC 0%, #FFFFFF 100%)",
      boxShadow: "0 20px 50px rgba(15,23,42,0.05)",
    }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h6"
        sx={{ color: "#0F172A", fontWeight: 700, fontSize: "1.125rem", mb: 2 }}
      >
        Tổng quan doanh thu
      </Typography>

      <Typography variant="body2" sx={{ color: "#475467", mb: 1 }}>
        Tổng doanh thu ước tính từ tất cả thiết bị của bạn.
      </Typography>
      <Typography variant="h4" sx={{ color: "#0F172A", fontWeight: 700 }}>
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(totalGrossRevenue)}
      </Typography>
    </CardContent>
  </Card>
);

const TopRentedAssetsTable = ({ assets }: { assets: TopRentedAsset[] }) => {
  const headerCellStyle = {
    border: "none",
    color: "#999",
    fontWeight: 600,
    fontSize: "0.75rem",
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 3,
        height: "100%",
        boxShadow: "0 25px 60px rgba(15,23,42,0.06)",
        backgroundColor: "white",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#0F172A", fontWeight: 700, fontSize: "1.125rem" }}
          >
            Thiết bị được thuê nhiều nhất
          </Typography>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: "2px solid #F0F0F0" }}>
                <TableCell
                  sx={{ ...headerCellStyle, textTransform: "uppercase" }}
                >
                  Thiết bị
                </TableCell>
                <TableCell sx={headerCellStyle}>Loại</TableCell>
                <TableCell sx={headerCellStyle}>Số lượt thuê</TableCell>
                <TableCell sx={headerCellStyle}>Doanh thu ước tính</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ border: "none", py: 4 }}>
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
                      "&:hover": { bgcolor: "#FAFAFA" },
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <TableCell sx={{ border: "none" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#0F172A", fontWeight: 600 }}
                      >
                        {asset.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
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
                    <TableCell sx={{ border: "none" }}>
                      <Typography variant="body2" sx={{ color: "#121212" }}>
                        {asset.rentalCount}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#121212", fontWeight: 600 }}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(asset.grossRevenue)}
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

const ColumnChartCard = ({
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
  const maxRevenue = Math.max(...stats.map((stat) => stat.capturedRevenue), 1);
  const maxBookings = Math.max(...stats.map((stat) => stat.bookingCount), 1);
  const accentHeight = 18;
  const currentStat = stats[stats.length - 1];
  const previousStat = stats[stats.length - 2];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid rgba(249,115,22,0.15)",
        borderRadius: 3,
        height: "100%",
        background:
          "linear-gradient(135deg, rgba(255,247,237,0.96) 0%, rgba(255,255,255,0.92) 100%)",
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
            <Box
              sx={{
                display: "flex",
                gap: 3,
                minHeight: 260,
                alignItems: "flex-end",
                overflowX: "auto",
                pb: 1,
              }}
            >
              {stats.map((stat) => {
                const baseHeight = Math.max(
                  8,
                  (stat.capturedRevenue / maxRevenue) * 100
                );
                const paleHeight = Math.min(100, baseHeight + accentHeight);
                const overlayHeight = Math.min(
                  100,
                  Math.max(10, (stat.bookingCount / maxBookings) * 100)
                );

                return (
                  <Box
                    key={`${period}-${stat.date}`}
                    sx={{
                      minWidth: 56,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#999", fontWeight: 600 }}
                    >
                      {formatChartLabel(stat.date, period)}
                    </Typography>
                    <Box
                      sx={{
                        height: 220,
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          width: 28,
                          height: `${paleHeight}%`,
                          borderRadius: 999,
                          bgcolor: "rgba(249,115,22,0.25)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "relative",
                          width: 28,
                          height: `${baseHeight}%`,
                          borderRadius: 999,
                          background:
                            "linear-gradient(180deg, #FDBA74 0%, #F97316 100%)",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: `${overlayHeight}%`,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.35)",
                            backdropFilter: "blur(2px)",
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#121212", fontWeight: 600 }}
                    >
                      {formatCurrencyCompact(stat.capturedRevenue)}
                    </Typography>
                  </Box>
                );
              })}
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

const DashboardHero = ({
  totalRevenue,
  totalBookings,
  totalAssets,
  isLoading,
}: {
  totalRevenue: number;
  totalBookings: number;
  totalAssets: number;
  isLoading: boolean;
}) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 4,
      overflow: "hidden",
      background:
        "linear-gradient(120deg, #C2410C 0%, #EA580C 45%, #F97316 80%, #FB923C 100%)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 25px 80px rgba(15,23,42,0.35)",
    }}
  >
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box sx={{ maxWidth: 520 }}>
          <Chip
            label="Owner Dashboard"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              mb: 2,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 1,
              fontSize: { xs: "1.85rem", md: "2.25rem" },
            }}
          >
            Tăng tốc hoạt động cho thuê của bạn
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Tổng quan trực quan về doanh thu, lượt đặt và hiệu suất thiết bị
            giúp bạn đưa ra quyết định nhanh chóng hơn.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
          {[
            {
              label: "Tổng doanh thu",
              value: formatCurrency(totalRevenue),
            },
            {
              label: "Tổng lượt booking",
              value: totalBookings.toString(),
            },
            {
              label: "Thiết bị đang hoạt động",
              value: totalAssets.toString(),
            },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                px: 3,
                py: 2,
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.18)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, mt: 0.5, color: "white" }}
              >
                {isLoading ? "Đang tải..." : item.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Component Dashboard - Trang tổng quan quản lý cho Owner
 */
export default function Dashboard() {
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("daily");

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

    fetchDashboard();
  }, []);

  const resolvedData = data ?? FALLBACK_OWNER_DASHBOARD;

  const stats: StatItem[] = useMemo(
    () => [
      {
        title: "Tổng camera",
        value: resolvedData.totalCameras.toString(),
        description: "Số lượng camera bạn đang cho thuê.",
        icon: <CameraIcon />,
        accent: "teal",
      },
      {
        title: "Tổng phụ kiện",
        value: resolvedData.totalAccessories.toString(),
        description: "Số lượng phụ kiện bạn đang cho thuê.",
        icon: <PeopleIcon />,
        accent: "indigo",
      },
      {
        title: "Tổng lượt booking",
        value: resolvedData.totalBookingsForOwnerItems.toString(),
        description: "Tổng số đơn thuê liên quan tới thiết bị của bạn.",
        icon: <PeopleIcon />,
        accent: "purple",
      },
      {
        title: "Tổng doanh thu ước tính",
        value: formatCurrency(resolvedData.totalGrossRevenue),
        description: "Tổng doanh thu ước tính từ các booking.",
        icon: <MoneyIcon />,
        accent: "amber",
      },
    ],
    [
      resolvedData.totalAccessories,
      resolvedData.totalBookingsForOwnerItems,
      resolvedData.totalCameras,
      resolvedData.totalGrossRevenue,
    ]
  );

  const dailyStats = useMemo(
    () => resolvedData.dailyStats ?? [],
    [resolvedData.dailyStats]
  );
  const monthlyStats = useMemo(() => {
    const stats = resolvedData.monthlyStats ?? [];
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
  }, [resolvedData.monthlyStats]);

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

  const totalAssets = resolvedData.totalCameras + resolvedData.totalAccessories;

  return (
    <Box
      sx={{
        background:
          "linear-gradient(180deg, #FFF7ED 0%, #F8FAFC 55%, #FFFFFF 100%)",
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        width: "100%",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            sx={{ color: "#0F766E", fontWeight: 600, letterSpacing: 2 }}
          >
            Trung tâm quản lý Owner
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#0F172A",
              fontWeight: 700,
              mb: 0.5,
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

        <Box sx={{ mb: 3 }}>
          <DashboardHero
            totalRevenue={resolvedData.totalGrossRevenue}
            totalBookings={resolvedData.totalBookingsForOwnerItems}
            totalAssets={totalAssets}
            isLoading={isLoading}
          />
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </Box>

        {/* Main Content */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <ColumnChartCard
            stats={chartStats}
            period={chartPeriod}
            onPeriodChange={handleChartPeriodChange}
            isLoading={isLoading}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", xl: "row" },
              gap: 3,
            }}
          >
            <Box sx={{ flex: { xs: "1 1 100%", xl: "1 1 35%" } }}>
              <IncomeOverview
                totalGrossRevenue={resolvedData.totalGrossRevenue}
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 100%", xl: "1 1 65%" } }}>
              <TopRentedAssetsTable
                assets={resolvedData.topRentedAssets ?? []}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
