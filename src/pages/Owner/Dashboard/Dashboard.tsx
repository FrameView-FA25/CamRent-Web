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
} from "@mui/icons-material";
import type { ReactElement } from "react";
import "./Dashboard.css";

/**
 * Interface cho dữ liệu thống kê
 */
interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: ReactElement;
  color: string;
  bgColor: string;
}

/**
 * Interface cho đơn thuê
 */
interface Booking {
  id: string;
  customer: string;
  camera: string;
  startDate: string;
  endDate: string;
  amount: string;
  status: "active" | "pending" | "completed";
}

// ===== MOCK DATA =====

const STATS: StatItem[] = [
  {
    title: "Tổng Camera",
    value: "24",
    change: "+12%",
    icon: <CameraIcon />,
    color: "#1976d2",
    bgColor: "#e3f2fd",
  },
  {
    title: "Doanh thu tháng",
    value: "₫15.2M",
    change: "+23%",
    icon: <MoneyIcon />,
    color: "#388e3c",
    bgColor: "#e8f5e8",
  },
  {
    title: "Lượt thuê",
    value: "89",
    change: "+18%",
    icon: <PeopleIcon />,
    color: "#f57c00",
    bgColor: "#fff3e0",
  },
  {
    title: "Đánh giá trung bình",
    value: "4.8",
    change: "+0.2",
    icon: <TrendingUpIcon />,
    color: "#7b1fa2",
    bgColor: "#f3e5f5",
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

/**
 * Component Dashboard - Trang tổng quan quản lý cho Owner
 * Hiển thị thống kê, đơn thuê gần đây và camera phổ biến
 */
export default function Dashboard() {
  /**
   * Lấy màu cho Chip status của đơn thuê
   */
  const getStatusColor = (
    status: string
  ): "success" | "warning" | "info" | "default" => {
    const statusMap: Record<string, "success" | "warning" | "info"> = {
      active: "success",
      pending: "warning",
      completed: "info",
    };
    return statusMap[status] || "default";
  };

  /**
   * Lấy text tiếng Việt cho status
   */
  const getStatusText = (status: string): string => {
    const statusTextMap: Record<string, string> = {
      active: "Đang thuê",
      pending: "Chờ duyệt",
      completed: "Hoàn thành",
    };
    return statusTextMap[status] || status;
  };

  /**
   * Render stat card
   */
  const renderStatCard = (stat: StatItem, index: number) => (
    <Box key={index} className="stat-card-wrapper">
      <Card className="stat-card">
        <CardContent>
          <Box className="stat-card-content">
            <Avatar
              className="stat-icon"
              sx={{ bgcolor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </Avatar>
            <Box>
              <Typography className="stat-value">{stat.value}</Typography>
              <Typography className="stat-title">{stat.title}</Typography>
            </Box>
          </Box>
          <Box className="stat-change">
            <Chip
              label={stat.change}
              size="small"
              color="success"
              variant="outlined"
            />
            <Typography className="stat-change-text">
              so với tháng trước
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  /**
   * Render booking row trong bảng
   */
  const renderBookingRow = (booking: Booking) => (
    <TableRow key={booking.id}>
      <TableCell>
        <Box className="customer-info">
          <Avatar className="customer-avatar" sx={{ bgcolor: "primary.main" }}>
            {booking.customer.charAt(0)}
          </Avatar>
          <Typography className="customer-name" variant="body2">
            {booking.customer}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{booking.camera}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {booking.startDate} - {booking.endDate}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {booking.amount}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={getStatusText(booking.status)}
          size="small"
          color={getStatusColor(booking.status)}
          variant="outlined"
        />
      </TableCell>
      <TableCell align="center">
        <Box className="table-actions">
          <IconButton size="small">
            <ViewIcon />
          </IconButton>
          <IconButton size="small">
            <EditIcon />
          </IconButton>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );

  /**
   * Render camera item trong danh sách top cameras
   */

  return (
    <Box className="dashboard-container">
      {/* Header */}
      <Box className="dashboard-header">
        <Typography className="dashboard-title">Dashboard</Typography>
        <Typography className="dashboard-subtitle">
          Chào mừng trở lại! Đây là tổng quan về hoạt động kinh doanh của bạn.
        </Typography>
      </Box>

      {/* Stats Cards - Thẻ thống kê */}
      <Box className="stats-container">{STATS.map(renderStatCard)}</Box>

      {/* Main Content Grid */}
      <Box className="content-grid">
        {/* Recent Bookings - Đơn thuê gần đây */}
        <Box className="content-main">
          <Card>
            <CardContent>
              <Box className="bookings-header">
                <Typography className="bookings-title">
                  Đơn thuê gần đây
                </Typography>
                <Button variant="outlined" size="small">
                  Xem tất cả
                </Button>
              </Box>
              <TableContainer className="bookings-table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell>Camera</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Số tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{RECENT_BOOKINGS.map(renderBookingRow)}</TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar - Top Cameras & Quick Actions */}
        <Box className="content-sidebar"></Box>
      </Box>
    </Box>
  );
}
