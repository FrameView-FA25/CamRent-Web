import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  FileDownload,
  CheckCircle,
  Cancel,
  Assignment,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Imports from separated files
import type { Booking } from "../../types/booking.types";
import { fetchBookings } from "../../services/booking.service";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { BOOKING_STATS, STAFF_LIST } from "../../constants/booking.constants";

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const { bookings: fetchedBookings, error: fetchError } =
      await fetchBookings();

    if (fetchError) {
      setError(fetchError);
      if (fetchError.includes("Unauthorized")) {
        navigate("/login");
      }
    } else {
      setBookings(fetchedBookings);
    }
    setLoading(false);
  };

  const stats = BOOKING_STATS.map((stat) => ({
    ...stat,
    value:
      stat.statusFilter === null
        ? bookings.length
        : bookings.filter((b) => b.statusText === stat.statusFilter).length,
    icon: React.createElement(stat.icon),
  }));

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
    navigate(`/manager/contracts/create?bookingId=${selectedBooking?.id}`);
    setContractDialogOpen(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.renterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.items.some((item) =>
        getItemName(item).toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab =
      selectedTab === 0 ||
      (selectedTab === 1 && booking.status === 0) ||
      (selectedTab === 2 && booking.status === 1) ||
      (selectedTab === 3 && booking.status === 2) ||
      (selectedTab === 4 && booking.status === 3) ||
      (selectedTab === 5 && booking.status === 4);

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
              placeholder="Tìm kiếm theo mã đơn, ID khách hàng, thiết bị..."
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
            <Tab
              label={`CHỜ XÁC NHẬN (${
                bookings.filter((b) => b.status === 0).length
              })`}
            />
            <Tab
              label={`ĐÃ XÁC NHẬN (${
                bookings.filter((b) => b.status === 1).length
              })`}
            />
            <Tab
              label={`ĐANG THUÊ (${
                bookings.filter((b) => b.status === 2).length
              })`}
            />
            <Tab
              label={`HOÀN THÀNH (${
                bookings.filter((b) => b.status === 3).length
              })`}
            />
            <Tab
              label={`ĐÃ HỦY (${
                bookings.filter((b) => b.status === 4).length
              })`}
            />
          </Tabs>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Loại thuê</TableCell>
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>Thời gian thuê</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Cọc</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: "#999" }}>
                        Không tìm thấy đơn thuê nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const statusInfo = getStatusInfo(booking.statusText);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 500, color: "#2196f3" }}
                          >
                            {booking.id.slice(0, 8)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {formatDate(booking.pickupAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getBookingType(booking.type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {booking.items.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {getItemName(item)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#999" }}
                              >
                                Số lượng: {item.quantity} |{" "}
                                {formatCurrency(item.unitPrice)}
                              </Typography>
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(booking.pickupAt)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#999" }}>
                            đến {formatDate(booking.returnAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 600, color: "#2196f3" }}
                          >
                            {formatCurrency(booking.snapshotRentalTotal)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            Phí: {booking.snapshotPlatformFeePercent}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>
                            {formatCurrency(booking.snapshotDepositAmount)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {booking.snapshotDepositPercent}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => handleMenuClick(e, booking)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
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
          <MenuItem onClick={handleCreateContract}>
            <Description sx={{ mr: 1, fontSize: 20 }} /> Tạo hợp đồng
          </MenuItem>
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
                Đơn thuê: <strong>{selectedBooking?.id.slice(0, 8)}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Chọn nhân viên</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  label="Chọn nhân viên"
                >
                  {STAFF_LIST.map((staff) => (
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
                  <strong>Mã đơn:</strong> {selectedBooking?.id.slice(0, 8)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Loại:</strong>{" "}
                  {selectedBooking && getBookingType(selectedBooking.type)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tổng tiền:</strong>{" "}
                  {selectedBooking &&
                    formatCurrency(selectedBooking.snapshotRentalTotal)}
                </Typography>
                <Typography variant="body2">
                  <strong>Thời gian:</strong>{" "}
                  {selectedBooking &&
                    `${formatDate(selectedBooking.pickupAt)} - ${formatDate(
                      selectedBooking.returnAt
                    )}`}
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
