import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useState } from "react";
import type { ReactElement } from "react";
import "./OrderManagement.css";

/**
 * Interface cho đơn hàng
 */
interface Order {
  id: string;
  orderCode: string;
  customer: {
    name: string;
    avatar?: string;
    email: string;
    phone: string;
  };
  camera: {
    name: string;
    image: string;
  };
  startDate: string;
  endDate: string;
  totalAmount: string;
  deposit: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  createdAt: string;
}

/**
 * Interface cho thống kê
 */
interface OrderStat {
  title: string;
  value: string;
  icon: ReactElement;
  color: string;
  bgColor: string;
}

// ===== MOCK DATA =====

const ORDER_STATS: OrderStat[] = [
  {
    title: "Tổng đơn thuê",
    value: "156",
    icon: <SearchIcon />,
    color: "#1976d2",
    bgColor: "#e3f2fd",
  },
  {
    title: "Đang xử lý",
    value: "23",
    icon: <FilterIcon />,
    color: "#f57c00",
    bgColor: "#fff3e0",
  },
  {
    title: "Đang thuê",
    value: "45",
    icon: <CheckIcon />,
    color: "#388e3c",
    bgColor: "#e8f5e8",
  },
  {
    title: "Đã hoàn thành",
    value: "88",
    icon: <CheckIcon />,
    color: "#7b1fa2",
    bgColor: "#f3e5f5",
  },
];

const ORDERS: Order[] = [
  {
    id: "1",
    orderCode: "ORD001",
    customer: {
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
    },
    camera: {
      name: "Canon EOS R5",
      image: "/camera1.jpg",
    },
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    totalAmount: "₫1.200.000",
    deposit: "₫300.000",
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    orderCode: "ORD002",
    customer: {
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0912345678",
    },
    camera: {
      name: "Sony A7 IV",
      image: "/camera2.jpg",
    },
    startDate: "2024-01-20",
    endDate: "2024-01-25",
    totalAmount: "₫1.500.000",
    deposit: "₫400.000",
    status: "pending",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    orderCode: "ORD003",
    customer: {
      name: "Lê Minh C",
      email: "leminhc@email.com",
      phone: "0923456789",
    },
    camera: {
      name: "Fujifilm X-T5",
      image: "/camera3.jpg",
    },
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    totalAmount: "₫800.000",
    deposit: "₫200.000",
    status: "completed",
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    orderCode: "ORD004",
    customer: {
      name: "Phạm Văn D",
      email: "phamvand@email.com",
      phone: "0934567890",
    },
    camera: {
      name: "Nikon Z6 II",
      image: "/camera4.jpg",
    },
    startDate: "2024-01-22",
    endDate: "2024-01-26",
    totalAmount: "₫1.000.000",
    deposit: "₫250.000",
    status: "confirmed",
    createdAt: "2024-01-14",
  },
];

/**
 * Component OrderManagement - Trang quản lý đơn hàng
 */
export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [_selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /**
   * Lấy màu cho status chip
   */
  const getStatusColor = (
    status: string
  ): "default" | "warning" | "info" | "success" | "error" => {
    const statusMap = {
      pending: "warning" as const,
      confirmed: "info" as const,
      active: "success" as const,
      completed: "success" as const,
      cancelled: "error" as const,
    };
    return statusMap[status as keyof typeof statusMap] || "default";
  };

  /**
   * Lấy text tiếng Việt cho status
   */
  const getStatusText = (status: string): string => {
    const statusTextMap: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      active: "Đang thuê",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusTextMap[status] || status;
  };

  /**
   * Xử lý mở menu actions
   */
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    order: Order
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  /**
   * Xử lý đóng menu
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  /**
   * Xử lý thay đổi tab filter
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Filter orders theo tab và search
   */
  const getFilteredOrders = () => {
    let filtered = ORDERS;

    // Filter theo tab
    if (tabValue === 1) filtered = ORDERS.filter((o) => o.status === "pending");
    if (tabValue === 2)
      filtered = ORDERS.filter((o) => o.status === "confirmed");
    if (tabValue === 3) filtered = ORDERS.filter((o) => o.status === "active");
    if (tabValue === 4)
      filtered = ORDERS.filter((o) => o.status === "completed");
    if (tabValue === 5)
      filtered = ORDERS.filter((o) => o.status === "cancelled");

    // Filter theo search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.camera.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  /**
   * Render stat card
   */
  const renderStatCard = (stat: OrderStat, index: number) => (
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
        </CardContent>
      </Card>
    </Box>
  );

  /**
   * Render order row
   */
  const renderOrderRow = (order: Order) => (
    <TableRow key={order.id} className="order-row">
      <TableCell>
        <Typography variant="body2" fontWeight="medium" color="primary">
          {order.orderCode}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {order.createdAt}
        </Typography>
      </TableCell>
      <TableCell>
        <Box className="customer-info">
          <Avatar className="customer-avatar" sx={{ bgcolor: "primary.main" }}>
            {order.customer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography className="customer-name" variant="body2">
              {order.customer.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.customer.phone}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {order.camera.name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {order.startDate} → {order.endDate}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="bold" color="primary">
          {order.totalAmount}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Cọc: {order.deposit}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={getStatusText(order.status)}
          size="small"
          color={getStatusColor(order.status)}
          variant="outlined"
        />
      </TableCell>
      <TableCell align="center">
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, order)}>
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <Box className="order-management-container">
      {/* Header */}
      <Box className="page-header">
        <Box>
          <Typography className="page-title">Quản lý Đơn thuê</Typography>
          <Typography className="page-subtitle">
            Quản lý tất cả đơn thuê camera trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          className="action-button"
        >
          Xuất báo cáo
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box className="stats-container">{ORDER_STATS.map(renderStatCard)}</Box>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Search & Filter Bar */}
          <Box className="search-bar">
            <TextField
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, camera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              className="search-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              className="filter-button"
            >
              Lọc
            </Button>
          </Box>

          {/* Status Tabs */}
          <Box className="tabs-container">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`Tất cả (${ORDERS.length})`} />
              <Tab
                label={`Chờ xác nhận (${
                  ORDERS.filter((o) => o.status === "pending").length
                })`}
              />
              <Tab
                label={`Đã xác nhận (${
                  ORDERS.filter((o) => o.status === "confirmed").length
                })`}
              />
              <Tab
                label={`Đang thuê (${
                  ORDERS.filter((o) => o.status === "active").length
                })`}
              />
              <Tab
                label={`Hoàn thành (${
                  ORDERS.filter((o) => o.status === "completed").length
                })`}
              />
              <Tab
                label={`Đã hủy (${
                  ORDERS.filter((o) => o.status === "cancelled").length
                })`}
              />
            </Tabs>
          </Box>

          {/* Orders Table */}
          <TableContainer className="orders-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Camera</TableCell>
                  <TableCell>Thời gian thuê</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{getFilteredOrders().map(renderOrderRow)}</TableBody>
            </Table>
          </TableContainer>

          {/* Empty State */}
          {getFilteredOrders().length === 0 && (
            <Box className="empty-state">
              <Typography variant="body1" color="text.secondary">
                Không tìm thấy đơn thuê nào
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CheckIcon fontSize="small" sx={{ mr: 1 }} />
          Xác nhận đơn
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CancelIcon fontSize="small" sx={{ mr: 1 }} />
          Hủy đơn
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>
    </Box>
  );
}
