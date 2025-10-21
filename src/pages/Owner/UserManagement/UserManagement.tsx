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
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Rating,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useState } from "react";
import type { ReactElement } from "react";
import "./UserManagement.css";

/**
 * Interface cho khách hàng
 */
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: string;
  rating: number;
  status: "active" | "blocked" | "inactive";
  joinDate: string;
  lastOrder: string;
}

/**
 * Interface cho thống kê
 */
interface CustomerStat {
  title: string;
  value: string;
  icon: ReactElement;
  color: string;
  bgColor: string;
}

// ===== MOCK DATA =====

const CUSTOMER_STATS: CustomerStat[] = [
  {
    title: "Tổng khách hàng",
    value: "245",
    icon: <PersonAddIcon />,
    color: "#1976d2",
    bgColor: "#e3f2fd",
  },
  {
    title: "Khách hàng mới",
    value: "32",
    icon: <PersonAddIcon />,
    color: "#388e3c",
    bgColor: "#e8f5e8",
  },
  {
    title: "Khách VIP",
    value: "48",
    icon: <CheckIcon />,
    color: "#f57c00",
    bgColor: "#fff3e0",
  },
  {
    title: "Bị chặn",
    value: "5",
    icon: <BlockIcon />,
    color: "#d32f2f",
    bgColor: "#ffebee",
  },
];

const CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    totalOrders: 15,
    totalSpent: "₫18.500.000",
    rating: 4.8,
    status: "active",
    joinDate: "2023-06-15",
    lastOrder: "2024-01-15",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0912345678",
    totalOrders: 23,
    totalSpent: "₫32.400.000",
    rating: 4.9,
    status: "active",
    joinDate: "2023-03-20",
    lastOrder: "2024-01-18",
  },
  {
    id: "3",
    name: "Lê Minh C",
    email: "leminhc@email.com",
    phone: "0923456789",
    totalOrders: 8,
    totalSpent: "₫9.200.000",
    rating: 4.5,
    status: "active",
    joinDate: "2023-09-10",
    lastOrder: "2024-01-12",
  },
  {
    id: "4",
    name: "Phạm Văn D",
    email: "phamvand@email.com",
    phone: "0934567890",
    totalOrders: 2,
    totalSpent: "₫2.800.000",
    rating: 4.2,
    status: "inactive",
    joinDate: "2023-11-05",
    lastOrder: "2023-12-20",
  },
  {
    id: "5",
    name: "Hoàng Thị E",
    email: "hoangthie@email.com",
    phone: "0945678901",
    totalOrders: 5,
    totalSpent: "₫6.500.000",
    rating: 3.8,
    status: "blocked",
    joinDate: "2023-08-22",
    lastOrder: "2024-01-05",
  },
];

/**
 * Component UserManagement - Trang quản lý khách hàng
 */
export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  /**
   * Lấy màu cho status chip
   */
  const getStatusColor = (status: string): "success" | "default" | "error" => {
    const statusMap = {
      active: "success" as const,
      inactive: "default" as const,
      blocked: "error" as const,
    };
    return statusMap[status as keyof typeof statusMap] || "default";
  };

  /**
   * Lấy text tiếng Việt cho status
   */
  const getStatusText = (status: string): string => {
    const statusTextMap: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      blocked: "Đã chặn",
    };
    return statusTextMap[status] || status;
  };

  /**
   * Kiểm tra khách VIP (> 10 đơn)
   */
  const isVipCustomer = (totalOrders: number): boolean => {
    return totalOrders >= 10;
  };

  /**
   * Xử lý mở menu actions
   */
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    customer: Customer
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  /**
   * Xử lý đóng menu
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  /**
   * Xử lý thay đổi tab filter
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Filter customers theo tab và search
   */
  const getFilteredCustomers = () => {
    let filtered = CUSTOMERS;

    // Filter theo tab
    if (tabValue === 1)
      filtered = CUSTOMERS.filter((c) => c.status === "active");
    if (tabValue === 2)
      filtered = CUSTOMERS.filter((c) => isVipCustomer(c.totalOrders));
    if (tabValue === 3)
      filtered = CUSTOMERS.filter((c) => c.status === "inactive");
    if (tabValue === 4)
      filtered = CUSTOMERS.filter((c) => c.status === "blocked");

    // Filter theo search term
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
    }

    return filtered;
  };

  /**
   * Render stat card
   */
  const renderStatCard = (stat: CustomerStat, index: number) => (
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
   * Render customer row
   */
  const renderCustomerRow = (customer: Customer) => (
    <TableRow key={customer.id} className="customer-row">
      <TableCell>
        <Box className="customer-info-cell">
          <Avatar
            className="customer-avatar"
            sx={{ bgcolor: "primary.main", width: 48, height: 48 }}
          >
            {customer.name.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography className="customer-name" variant="body2">
                {customer.name}
              </Typography>
              {isVipCustomer(customer.totalOrders) && (
                <Chip label="VIP" size="small" color="warning" />
              )}
            </Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {customer.email}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {customer.phone}
              </Typography>
            </Box>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {customer.totalOrders} đơn
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Đơn gần nhất: {customer.lastOrder}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="bold" color="primary">
          {customer.totalSpent}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating
            value={customer.rating}
            precision={0.1}
            size="small"
            readOnly
          />
          <Typography variant="body2">({customer.rating})</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{customer.joinDate}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={getStatusText(customer.status)}
          size="small"
          color={getStatusColor(customer.status)}
          variant="outlined"
        />
      </TableCell>
      <TableCell align="center">
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, customer)}>
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <Box className="user-management-container">
      {/* Header */}
      <Box className="page-header">
        <Box>
          <Typography className="page-title">Quản lý Khách hàng</Typography>
          <Typography className="page-subtitle">
            Quản lý thông tin và hoạt động của khách hàng
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box className="stats-container">
        {CUSTOMER_STATS.map(renderStatCard)}
      </Box>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Search & Filter Bar */}
          <Box className="search-bar">
            <TextField
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
              <Tab label={`Tất cả (${CUSTOMERS.length})`} />
              <Tab
                label={`Hoạt động (${
                  CUSTOMERS.filter((c) => c.status === "active").length
                })`}
              />
              <Tab
                label={`VIP (${
                  CUSTOMERS.filter((c) => isVipCustomer(c.totalOrders)).length
                })`}
              />
              <Tab
                label={`Không hoạt động (${
                  CUSTOMERS.filter((c) => c.status === "inactive").length
                })`}
              />
              <Tab
                label={`Đã chặn (${
                  CUSTOMERS.filter((c) => c.status === "blocked").length
                })`}
              />
            </Tabs>
          </Box>

          {/* Customers Table */}
          <TableContainer className="customers-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Đơn thuê</TableCell>
                  <TableCell>Tổng chi tiêu</TableCell>
                  <TableCell>Đánh giá</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredCustomers().map(renderCustomerRow)}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Empty State */}
          {getFilteredCustomers().length === 0 && (
            <Box className="empty-state">
              <Typography variant="body1" color="text.secondary">
                Không tìm thấy khách hàng nào
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
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Gửi email
        </MenuItem>
        {selectedCustomer?.status === "active" && (
          <MenuItem onClick={handleMenuClose} sx={{ color: "warning.main" }}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            Chặn khách hàng
          </MenuItem>
        )}
        {selectedCustomer?.status === "blocked" && (
          <MenuItem onClick={handleMenuClose} sx={{ color: "success.main" }}>
            <CheckIcon fontSize="small" sx={{ mr: 1 }} />
            Bỏ chặn
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>
    </Box>
  );
}
