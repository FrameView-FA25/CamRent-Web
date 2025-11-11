import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  HourglassEmpty,
  Assignment,
  CheckCircle,
} from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";
import { useStaffBookings } from "../../hooks/useStaffBookings";
import { StatsCard } from "../../components/Staff/StatsCard";
import { BookingsTable } from "../../components/Staff/BookingsTable";
import { BookingDetailDialog } from "../../components/Staff/BookingDetailDialog";
import { CompleteConfirmDialog } from "../../components/Staff/CompleteConfirmDialog";
import { InspectionDialog } from "../../components/Staff/InspectionDialog";
import {
  getItemsDisplay,
  formatCurrency,
  formatDateRange,
} from "../../utils/Staff/bookingHelpers";

const MyAssignments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [inspectionType, setInspectionType] = useState(1); // 1 = Before Rental, 2 = After Return
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { bookings, loading, error } = useStaffBookings();

  const stats = [
    {
      label: "Tổng đơn được gán",
      value: bookings.length,
      icon: <Assignment />,
      color: "#2196f3",
    },
    {
      label: "Đang xử lý",
      value: bookings.filter((b) => b.status === 1).length,
      icon: <HourglassEmpty />,
      color: "#ff9800",
    },
    {
      label: "Đã xác nhận",
      value: bookings.filter((b) => b.status === 2).length,
      icon: <CheckCircle />,
      color: "#4caf50",
    },
    {
      label: "Đã hoàn thành",
      value: bookings.filter((b) => b.status === 4).length,
      icon: <CheckCircle />,
      color: "#9c27b0",
    },
    {
      label: "Quá hạn",
      value: bookings.filter((b) => b.status === 8).length,
      icon: <CheckCircle />,
      color: "#f44336",
    },
  ];

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleInspectionClick = (booking: Booking) => {
    setSelectedBooking(booking);
    // Xác định loại inspection dựa vào trạng thái booking
    // Status 1 (Processing) = Before Rental
    // Status 2 (Confirmed) = After Return (có thể điều chỉnh logic này)
    setInspectionType(booking.status === 1 ? 1 : 1); // Mặc định là kiểm tra trước cho thuê
    setInspectionDialogOpen(true);
  };

  const handleInspectionSuccess = () => {
    setSnackbarMessage("Kiểm tra thiết bị đã được lưu thành công!");
    setSnackbarOpen(true);
    // Có thể reload lại danh sách bookings nếu cần
  };

  const handleCompleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = () => {
    if (selectedBooking) {
      // TODO: Implement API call to update booking status
      setSnackbarMessage(`Đơn hàng ${selectedBooking.id} đã được cập nhật!`);
      setSnackbarOpen(true);
      setCompleteDialogOpen(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const itemsText = getItemsDisplay(booking);
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemsText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.statusText.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="error">{error}</Alert>
        </Container>
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
        <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
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
          <BookingsTable
            bookings={filteredBookings}
            onViewDetail={handleViewDetail}
            onComplete={handleCompleteClick}
            onInspection={handleInspectionClick}
            getItemsDisplay={getItemsDisplay}
            formatCurrency={formatCurrency}
            formatDateRange={formatDateRange}
          />
        </Paper>

        {/* Detail Dialog */}
        <BookingDetailDialog
          open={detailDialogOpen}
          booking={selectedBooking}
          onClose={() => setDetailDialogOpen(false)}
          getItemsDisplay={getItemsDisplay}
          formatCurrency={formatCurrency}
          formatDateRange={formatDateRange}
        />

        {/* Complete Confirmation Dialog */}
        <CompleteConfirmDialog
          open={completeDialogOpen}
          booking={selectedBooking}
          onClose={() => setCompleteDialogOpen(false)}
          onConfirm={handleCompleteConfirm}
          getItemsDisplay={getItemsDisplay}
        />

        {/* Inspection Dialog */}
        <InspectionDialog
          open={inspectionDialogOpen}
          booking={selectedBooking}
          inspectionType={inspectionType}
          onClose={() => setInspectionDialogOpen(false)}
          onSuccess={handleInspectionSuccess}
        />

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
