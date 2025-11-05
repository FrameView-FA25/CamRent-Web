import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  FileDownload,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Assignment,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  camera: string;
  rentalPeriod: string;
  totalAmount: number;
  deposit: number;
  status: "pending" | "confirmed" | "renting" | "completed" | "cancelled";
  assignedStaff?: string;
  hasContract?: boolean;
}

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");

  // Mock data
  const bookings: Booking[] = [
    {
      id: "ORD001",
      date: "2024-01-10",
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      camera: "Canon EOS R5",
      rentalPeriod: "2024-01-15 — 2024-01-18",
      totalAmount: 1200000,
      deposit: 300000,
      status: "renting",
      hasContract: true,
    },
    {
      id: "ORD002",
      date: "2024-01-12",
      customerName: "Trần Thị B",
      customerPhone: "0812345678",
      camera: "Sony A7 IV",
      rentalPeriod: "2024-01-20 — 2024-01-25",
      totalAmount: 1500000,
      deposit: 400000,
      status: "confirmed",
      hasContract: false,
    },
    {
      id: "ORD003",
      date: "2024-01-05",
      customerName: "Lê Minh C",
      customerPhone: "0923456789",
      camera: "Fujifilm X-T5",
      rentalPeriod: "2024-01-08 — 2024-01-12",
      totalAmount: 800000,
      deposit: 200000,
      status: "completed",
      hasContract: true,
    },
    {
      id: "ORD004",
      date: "2024-01-14",
      customerName: "Phạm Văn D",
      customerPhone: "0934567890",
      camera: "Nikon Z6 II",
      rentalPeriod: "2024-01-22 — 2024-01-26",
      totalAmount: 1000000,
      deposit: 250000,
      status: "confirmed",
      hasContract: false,
    },
  ];

  const stats = [
    { label: "Tổng đơn thuê", value: 156, icon: <Search />, color: "#2196f3" },
    {
      label: "Đang xử lý",
      value: 23,
      icon: <HourglassEmpty />,
      color: "#ff9800",
    },
    { label: "Đang thuê", value: 45, icon: <CheckCircle />, color: "#4caf50" },
    {
      label: "Đã hoàn thành",
      value: 88,
      icon: <Assignment />,
      color: "#9c27b0",
    },
  ];

  const staffList = [
    { id: "1", name: "Nhân viên A" },
    { id: "2", name: "Nhân viên B" },
    { id: "3", name: "Nhân viên C" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "renting":
        return "success";
      case "completed":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "renting":
        return "Đang thuê";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssignStaff = () => {
    setAssignDialogOpen(true);
    handleMenuClose();
  };

  const handleCreateContract = () => {
    setContractDialogOpen(true);
    handleMenuClose();
  };

  const handleViewContract = () => {
    // Navigate to contract page or open contract viewer
    navigate(`/manager/contracts/${selectedBooking?.id}`);
    handleMenuClose();
  };

  const handleAssignConfirm = () => {
    console.log(
      "Assign staff:",
      selectedStaff,
      "to booking:",
      selectedBooking?.id
    );
    setAssignDialogOpen(false);
    setSelectedStaff("");
  };

  const handleContractConfirm = () => {
    console.log("Create contract for booking:", selectedBooking?.id);
    // Navigate to contract creation page with booking data
    navigate(`/manager/contracts/create?bookingId=${selectedBooking?.id}`);
    setContractDialogOpen(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.camera.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      selectedTab === 0 ||
      (selectedTab === 1 && booking.status === "pending") ||
      (selectedTab === 2 && booking.status === "confirmed") ||
      (selectedTab === 3 && booking.status === "renting") ||
      (selectedTab === 4 && booking.status === "completed") ||
      (selectedTab === 5 && booking.status === "cancelled");

    return matchesSearch && matchesTab;
  });

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
            Quản lý Đơn thuê
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Quản lý tất cả đơn thuê camera trong hệ thống
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat, index) => (
            <Paper
              key={index}
              sx={{
                flex: {
                  xs: "1 1 100%",
                  sm: "1 1 calc(50% - 12px)",
                  md: "1 1 calc(25% - 18px)",
                },
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Main Content */}
        <Paper sx={{ p: 3 }}>
          {/* Search and Filter */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "#999" }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ minWidth: 120 }}
            >
              LỌC
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              sx={{
                minWidth: 150,
                bgcolor: "#2196f3",
                "&:hover": { bgcolor: "#1976d2" },
              }}
            >
              XUẤT BÁO CÁO
            </Button>
          </Box>

          {/* Tabs */}
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
          >
            <Tab label={`TẤT CẢ (${bookings.length})`} />
            <Tab label="CHỜ XÁC NHẬN (1)" />
            <Tab label="ĐÃ XÁC NHẬN (2)" />
            <Tab label="ĐANG THUÊ (1)" />
            <Tab label="HOÀN THÀNH (1)" />
            <Tab label="ĐÃ HỦY (0)" />
          </Tabs>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Camera</TableCell>
                  <TableCell>Thời gian thuê</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hợp đồng</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, color: "#2196f3" }}>
                        {booking.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        {booking.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "#2196f3" }}
                        >
                          {booking.customerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {booking.customerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {booking.customerPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{booking.camera}</TableCell>
                    <TableCell>{booking.rentalPeriod}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: "#2196f3" }}>
                        ₫{booking.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        Cọc: ₫{booking.deposit.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {booking.hasContract ? (
                        <Chip
                          icon={<Description />}
                          label="Đã có"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          label="Chưa có"
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuClick(e, booking)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleAssignStaff}>
            <Assignment sx={{ mr: 1, fontSize: 20 }} /> Phân công nhân viên
          </MenuItem>
          {selectedBooking?.hasContract ? (
            <MenuItem onClick={handleViewContract}>
              <Description sx={{ mr: 1, fontSize: 20 }} /> Xem hợp đồng
            </MenuItem>
          ) : (
            <MenuItem onClick={handleCreateContract}>
              <Description sx={{ mr: 1, fontSize: 20 }} /> Tạo hợp đồng
            </MenuItem>
          )}
          <MenuItem onClick={handleMenuClose}>
            <CheckCircle sx={{ mr: 1, fontSize: 20 }} /> Xác nhận đơn
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Xem chi tiết</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
            <Cancel sx={{ mr: 1, fontSize: 20 }} /> Hủy đơn
          </MenuItem>
        </Menu>

        {/* Assign Staff Dialog */}
        <Dialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Phân công nhân viên kiểm tra</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                Đơn thuê: <strong>{selectedBooking?.id}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Chọn nhân viên</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  label="Chọn nhân viên"
                >
                  {staffList.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={handleAssignConfirm}
              variant="contained"
              disabled={!selectedStaff}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Contract Dialog */}
        <Dialog
          open={contractDialogOpen}
          onClose={() => setContractDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Tạo hợp đồng thuê</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                Bạn có chắc chắn muốn tạo hợp đồng cho đơn thuê này?
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Mã đơn:</strong> {selectedBooking?.id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khách hàng:</strong> {selectedBooking?.customerName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Camera:</strong> {selectedBooking?.camera}
                </Typography>
                <Typography variant="body2">
                  <strong>Thời gian:</strong> {selectedBooking?.rentalPeriod}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContractDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={handleContractConfirm}
              variant="contained"
              startIcon={<Description />}
            >
              Tạo hợp đồng
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BookingManagement;
