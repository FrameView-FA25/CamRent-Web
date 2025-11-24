import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  PhotoCamera as CameraIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";
import type { ReactElement } from "react";

// ===== TYPES =====

interface StatItem {
  title: string;
  value: string;
  change: string;
  changeValue: string;
  isPositive: boolean;
  icon: ReactElement;
}

interface Booking {
  id: string;
  customer: string;
  camera: string;
  startDate: string;
  endDate: string;
  amount: string;
  status: "active" | "pending" | "completed";
}

interface WeeklyDataItem {
  day: string;
  value: number;
}

// ===== CONSTANTS =====

const STATS: StatItem[] = [
  {
    title: "Total Page Views",
    value: "4,42,236",
    change: "59.3%",
    changeValue: "35,000",
    isPositive: true,
    icon: <CameraIcon />,
  },
  {
    title: "Total Users",
    value: "78,250",
    change: "70.5%",
    changeValue: "8,900",
    isPositive: true,
    icon: <PeopleIcon />,
  },
  {
    title: "Total Order",
    value: "18,800",
    change: "27.4%",
    changeValue: "1,943",
    isPositive: false,
    icon: <MoneyIcon />,
  },
  {
    title: "Total Sales",
    value: "35,078",
    change: "27.4%",
    changeValue: "20,395",
    isPositive: false,
    icon: <TrendingUpIcon />,
  },
];

const RECENT_BOOKINGS: Booking[] = [
  {
    id: "001",
    customer: "Nguyễn Văn A",
    camera: "Canon EOS R5",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    amount: "₫1.200.000",
    status: "active",
  },
  {
    id: "002",
    customer: "Trần Thị B",
    camera: "Sony A7 IV",
    startDate: "2024-01-20",
    endDate: "2024-01-25",
    amount: "₫1.500.000",
    status: "pending",
  },
  {
    id: "003",
    customer: "Lê Minh C",
    camera: "Fujifilm X-T5",
    startDate: "2024-01-12",
    endDate: "2024-01-14",
    amount: "₫800.000",
    status: "completed",
  },
];

const WEEKLY_DATA: WeeklyDataItem[] = [
  { day: "Mo", value: 45 },
  { day: "Tu", value: 60 },
  { day: "We", value: 50 },
  { day: "Th", value: 30 },
  { day: "Fr", value: 55 },
  { day: "Sa", value: 40 },
  { day: "Su", value: 70 },
];

const STATUS_MAP = {
  active: { label: "Đang thuê", color: "success" as const },
  pending: { label: "Chờ duyệt", color: "warning" as const },
  completed: { label: "Hoàn thành", color: "info" as const },
};

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
        <Typography
          variant="h4"
          sx={{ color: "#121212", fontWeight: 700, fontSize: "1.75rem" }}
        >
          {stat.value}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: 2,
            color: stat.isPositive ? "#4CAF50" : "#FF9800",
          }}
        >
          {stat.isPositive ? (
            <ArrowUpIcon sx={{ fontSize: 16 }} />
          ) : (
            <ArrowDownIcon sx={{ fontSize: 16 }} />
          )}
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
          >
            {stat.change}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: "#999", fontSize: "0.75rem" }}>
        You made an extra{" "}
        <Box
          component="span"
          sx={{
            color: stat.isPositive ? "#4CAF50" : "#FF9800",
            fontWeight: 600,
          }}
        >
          {stat.changeValue}
        </Box>{" "}
        this year
      </Typography>
    </CardContent>
  </Card>
);

const BookingRow = ({ booking }: { booking: Booking }) => {
  const statusConfig = STATUS_MAP[booking.status];

  return (
    <TableRow
      sx={{
        "&:hover": { bgcolor: "#FAFAFA" },
        borderBottom: "1px solid #F0F0F0",
      }}
    >
      <TableCell sx={{ border: "none" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "#FFC800",
              color: "#121212",
              width: 36,
              height: 36,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {booking.customer.charAt(0)}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ color: "#121212", fontWeight: 500 }}
          >
            {booking.customer}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ border: "none", color: "#666" }}>
        <Typography variant="body2">{booking.camera}</Typography>
      </TableCell>
      <TableCell sx={{ border: "none", color: "#666" }}>
        <Typography variant="body2">
          {booking.startDate} - {booking.endDate}
        </Typography>
      </TableCell>
      <TableCell sx={{ border: "none" }}>
        <Typography variant="body2" sx={{ color: "#121212", fontWeight: 600 }}>
          {booking.amount}
        </Typography>
      </TableCell>
      <TableCell sx={{ border: "none" }}>
        <Chip
          label={statusConfig.label}
          size="small"
          color={statusConfig.color}
          sx={{ borderRadius: 1, fontWeight: 500 }}
        />
      </TableCell>
      <TableCell align="center" sx={{ border: "none" }}>
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
          <IconButton size="small" sx={{ color: "#666" }}>
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#666" }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#666" }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

const BarChart = ({ data }: { data: WeeklyDataItem[] }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end",
      gap: { xs: 1, sm: 1.5 },
      height: { xs: 150, sm: 200 },
      mt: 3,
    }}
  >
    {data.map((item, index) => (
      <Box
        key={index}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            bgcolor: "#FFC800",
            borderRadius: 1,
            height: `${item.value * 2}px`,
            transition: "all 0.3s",
            "&:hover": { bgcolor: "#FFD633" },
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: "#999", fontSize: "0.75rem", fontWeight: 500 }}
        >
          {item.day}
        </Typography>
      </Box>
    ))}
  </Box>
);

const IncomeOverview = () => (
  <Card
    elevation={0}
    sx={{ border: "1px solid #F0F0F0", borderRadius: 2, height: "100%" }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h6"
        sx={{ color: "#121212", fontWeight: 700, fontSize: "1.125rem", mb: 3 }}
      >
        Income Overview
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: "#999", mb: 1 }}>
          This Week Statistics
        </Typography>
        <Typography variant="h4" sx={{ color: "#121212", fontWeight: 700 }}>
          $7,650
        </Typography>
      </Box>

      <BarChart data={WEEKLY_DATA} />
    </CardContent>
  </Card>
);

const RecentOrdersTable = () => {
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
            Recent Orders
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{
              color: "#FFC800",
              borderColor: "#FFC800",
              "&:hover": { borderColor: "#FFD633", bgcolor: "#FFF9E6" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            View All
          </Button>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: "2px solid #F0F0F0" }}>
                <TableCell
                  sx={{ ...headerCellStyle, textTransform: "uppercase" }}
                >
                  Khách hàng
                </TableCell>
                <TableCell sx={headerCellStyle}>Camera</TableCell>
                <TableCell sx={headerCellStyle}>Thời gian</TableCell>
                <TableCell sx={headerCellStyle}>Số tiền</TableCell>
                <TableCell sx={headerCellStyle}>Trạng thái</TableCell>
                <TableCell align="center" sx={headerCellStyle}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {RECENT_BOOKINGS.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
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
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        {STATS.map((stat, index) => (
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
          <IncomeOverview />
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", xl: "1 1 65%" } }}>
          <RecentOrdersTable />
        </Box>
      </Box>
    </Box>
  );
}
