import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Visibility,
  HourglassEmpty,
  Assignment,
} from "@mui/icons-material";
import { fetchStaffBookings } from "../../services/booking.service";
import type { Booking } from "../../types/booking.types";

const MyAssignments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [assignments, setAssignments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings từ API
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const { bookings, error } = await fetchStaffBookings();

        if (error) {
          setSnackbarMessage(error);
          setSnackbarOpen(true);
        } else {
          setAssignments(bookings);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Lỗi tải dữ liệu";
        setSnackbarMessage(errorMsg);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const stats = [
    {
      label: "Tổng đơn được gán",
      value: assignments.length,
      icon: <Assignment />,
      color: "#2196f3",
    },
    {
      label: "Đang xử lý",
      value: assignments.filter((a) => a.status === 2).length, // Status 2 = Đã xác nhận
      icon: <HourglassEmpty />,
      color: "#ff9800",
    },
    {
      label: "Đã hoàn thành",
      value: assignments.filter((a) => a.status === 5).length, // Status 5 = Đã hoàn thành
      icon: <CheckCircle />,
      color: "#4caf50",
    },
  ];

  const getStatusColor = (
    status: number
  ): "warning" | "info" | "success" | "default" | "error" => {
    switch (status) {
      case 1: // Chờ xác nhận
        return "warning";
      case 2: // Đã xác nhận
        return "info";
      case 3: // Đang thuê
        return "info";
      case 4: // Đang kiểm tra
        return "warning";
      case 5: // Đã hoàn thành
        return "success";
      case 6: // Đã hủy
        return "error";
      default:
        return "default";
    }
  };

  const getItemName = (booking: Booking): string => {
    if (booking.items && booking.items.length > 0) {
      const firstItem = booking.items[0];
      if (firstItem.camera) {
        return `${firstItem.camera.brand} ${firstItem.camera.model}`;
      }
      if (firstItem.accessory) {
        return `${firstItem.accessory.brand} ${firstItem.accessory.model}`;
      }
      if (firstItem.combo) {
        return firstItem.combo.name;
      }
    }
    return "N/A";
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleCompleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = () => {
    if (selectedBooking) {
      // Update booking status to completed (status 5)
      setAssignments(
        assignments.map((a) =>
          a.id === selectedBooking.id
            ? { ...a, status: 5, statusText: "Đã hoàn thành" }
            : a
        )
      );
      setSnackbarMessage(
        `Đơn hàng ${selectedBooking.id} đã được đánh dấu hoàn thành!`
      );
      setSnackbarOpen(true);
      setCompleteDialogOpen(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const itemName = getItemName(assignment);
    const renterName = assignment.renter?.fullName || "";

    const matchesSearch =
      assignment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Hiển thị loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
            Đơn hàng được gán
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Danh sách đơn hàng mà quản lý đã gán cho bạn để kiểm tra
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
                  md: "1 1 calc(33.333% - 16px)",
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
          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "#999" }} />,
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Camera</TableCell>
                  <TableCell>Thời gian thuê</TableCell>
                  <TableCell>Ngày được gán</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const itemName = getItemName(assignment);
                  const renterName = assignment.renter?.fullName || "N/A";
                  const renterPhone = assignment.renter?.phoneNumber || "N/A";
                  const pickupDate = formatDateTime(assignment.pickupAt);
                  const returnDate = formatDateTime(assignment.returnAt);

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, color: "#2196f3" }}>
                          {assignment.id.substring(0, 8)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          {pickupDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 32, height: 32, bgcolor: "#2196f3" }}
                          >
                            {renterName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>
                              {renterName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#999" }}
                            >
                              {renterPhone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{itemName}</TableCell>
                      <TableCell>
                        {pickupDate} — {returnDate}
                      </TableCell>
                      <TableCell>{pickupDate}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: "#2196f3" }}>
                          ₫{assignment.snapshotRentalTotal.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          Cọc: ₫
                          {assignment.snapshotDepositAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.statusText}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(assignment)}
                            title="Xem chi tiết"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          {assignment.status === 2 && ( // Status 2 = Đã xác nhận
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteClick(assignment)}
                              title="Hoàn thành"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5", mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Mã đơn:</strong> {selectedBooking?.id.substring(0, 8)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khách hàng:</strong>{" "}
                  {selectedBooking?.renter?.fullName || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong>{" "}
                  {selectedBooking?.renter?.email || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedBooking?.renter?.phoneNumber || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Thiết bị:</strong>{" "}
                  {selectedBooking ? getItemName(selectedBooking) : "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ngày nhận:</strong>{" "}
                  {selectedBooking?.pickupAt
                    ? formatDateTime(selectedBooking.pickupAt)
                    : "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ngày trả:</strong>{" "}
                  {selectedBooking?.returnAt
                    ? formatDateTime(selectedBooking.returnAt)
                    : "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tổng tiền thuê:</strong> ₫
                  {selectedBooking?.snapshotRentalTotal.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tiền cọc:</strong> ₫
                  {selectedBooking?.snapshotDepositAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Trạng thái:</strong> {selectedBooking?.statusText}
                </Typography>
              </Paper>

              {/* Hiển thị danh sách items */}
              {selectedBooking?.items && selectedBooking.items.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Chi tiết thiết bị:
                  </Typography>
                  {selectedBooking.items.map((item, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: "#f9f9f9", mb: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Tên:</strong>{" "}
                        {item.camera
                          ? `${item.camera.brand} ${item.camera.model}`
                          : item.accessory
                          ? `${item.accessory.brand} ${item.accessory.model}`
                          : item.combo?.name || "N/A"}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Số lượng:</strong> {item.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Đơn giá:</strong> ₫
                        {item.unitPrice.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tiền cọc:</strong> ₫
                        {item.depositAmount.toLocaleString()}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Complete Confirmation Dialog */}
        <Dialog
          open={completeDialogOpen}
          onClose={() => setCompleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Xác nhận hoàn thành</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Bạn có chắc chắn đã kiểm tra xong đơn hàng này?
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Mã đơn:</strong> {selectedBooking?.id.substring(0, 8)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khách hàng:</strong>{" "}
                  {selectedBooking?.renter?.fullName || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Thiết bị:</strong>{" "}
                  {selectedBooking ? getItemName(selectedBooking) : "N/A"}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={handleCompleteConfirm}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
            >
              Xác nhận hoàn thành
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MyAssignments;
