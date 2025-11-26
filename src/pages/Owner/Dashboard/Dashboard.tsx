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
} from "@mui/material";
import {
  PhotoCamera as CameraIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  OwnerDashboardResponse,
  TopRentedAsset,
} from "../../../services/dashboard.service";
import { dashboardService } from "../../../services/dashboard.service";

// ===== TYPES =====

interface StatItem {
  title: string;
  value: string;
  description?: string;
  icon: ReactElement;
}

// ===== COMPONENTS =====

const StatCard = ({ stat }: { stat: StatItem }) => (
  <Card
    elevation={0}
    sx={{
      bgcolor: "white",
      border: "1px solid #F0F0F0",
      borderRadius: 2,
      flex: 1,
      minWidth: {
        xs: "100%",
        sm: "calc(50% - 12px)",
        lg: "calc(25% - 18px)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: "#666", fontSize: "0.875rem", mb: 2, fontWeight: 500 }}
      >
        {stat.title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", mb: 1.5 }}>
        <Box
          sx={{
            mr: 2,
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#FFF7CC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFC800",
          }}
        >
          {stat.icon}
        </Box>
        <Typography
          variant="h4"
          sx={{ color: "#121212", fontWeight: 700, fontSize: "1.75rem" }}
        >
          {stat.value}
        </Typography>
      </Box>

      {stat.description && (
        <Typography variant="body2" sx={{ color: "#999", fontSize: "0.75rem" }}>
          {stat.description}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const IncomeOverview = ({
  totalGrossRevenue,
}: {
  totalGrossRevenue: number;
}) => (
  <Card
    elevation={0}
    sx={{ border: "1px solid #F0F0F0", borderRadius: 2, height: "100%" }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h6"
        sx={{ color: "#121212", fontWeight: 700, fontSize: "1.125rem", mb: 2 }}
      >
        Tổng quan doanh thu
      </Typography>

      <Typography variant="body2" sx={{ color: "#999", mb: 1 }}>
        Tổng doanh thu ước tính từ tất cả thiết bị của bạn.
      </Typography>
      <Typography variant="h4" sx={{ color: "#121212", fontWeight: 700 }}>
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
      sx={{ border: "1px solid #F0F0F0", borderRadius: 2, height: "100%" }}
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
            sx={{ color: "#121212", fontWeight: 700, fontSize: "1.125rem" }}
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
                        sx={{ color: "#121212", fontWeight: 500 }}
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

/**
 * Component Dashboard - Trang tổng quan quản lý cho Owner
 */
export default function Dashboard() {
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const stats: StatItem[] = useMemo(() => {
    if (!data) {
      return [
        {
          title: "Tổng camera",
          value: "-",
          description: "Số lượng camera bạn đang cho thuê.",
          icon: <CameraIcon />,
        },
        {
          title: "Tổng phụ kiện",
          value: "-",
          description: "Số lượng phụ kiện bạn đang cho thuê.",
          icon: <PeopleIcon />,
        },
        {
          title: "Tổng lượt booking",
          value: "-",
          description: "Tổng số đơn thuê liên quan tới thiết bị của bạn.",
          icon: <PeopleIcon />,
        },
        {
          title: "Tổng doanh thu ước tính",
          value: "-",
          description: "Tổng doanh thu ước tính từ các booking.",
          icon: <MoneyIcon />,
        },
      ];
    }

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);

    return [
      {
        title: "Tổng camera",
        value: data.totalCameras.toString(),
        description: "Số lượng camera bạn đang cho thuê.",
        icon: <CameraIcon />,
      },
      {
        title: "Tổng phụ kiện",
        value: data.totalAccessories.toString(),
        description: "Số lượng phụ kiện bạn đang cho thuê.",
        icon: <PeopleIcon />,
      },
      {
        title: "Tổng lượt booking",
        value: data.totalBookingsForOwnerItems.toString(),
        description: "Tổng số đơn thuê liên quan tới thiết bị của bạn.",
        icon: <PeopleIcon />,
      },
      {
        title: "Tổng doanh thu ước tính",
        value: formatCurrency(data.totalGrossRevenue),
        description: "Tổng doanh thu ước tính từ các booking.",
        icon: <MoneyIcon />,
      },
    ];
  }, [data]);

  return (
    <Box
      sx={{
        bgcolor: "#F5F5F5",
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
        width: "100%",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#121212",
            fontWeight: 700,
            mb: 0.5,
            fontSize: { xs: "1.75rem", sm: "2rem" },
          }}
        >
          Thống kê
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          Chào mừng trở lại! Đây là tổng quan về hoạt động kinh doanh của bạn.
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

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", xl: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: { xs: "1 1 100%", xl: "1 1 35%" } }}>
          <IncomeOverview totalGrossRevenue={data?.totalGrossRevenue ?? 0} />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", xl: "1 1 65%" } }}>
          <TopRentedAssetsTable assets={data?.topRentedAssets ?? []} />
        </Box>
      </Box>
    </Box>
  );
}
