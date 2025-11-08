import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import type { Booking } from "../../types/booking.types";

interface BookingDetailDialogProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  getItemsDisplay: (booking: Booking) => string;
  formatCurrency: (amount: number) => string;
  formatDateRange: (pickupAt: string, returnAt: string) => string;
}

export const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({
  open,
  booking,
  onClose,
  getItemsDisplay,
  formatCurrency,
  formatDateRange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chi tiết đơn hàng</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5", mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Mã đơn:</strong> {booking?.id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Khách hàng:</strong>{" "}
              {booking?.renter?.fullName || "Unknown"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Email:</strong> {booking?.renter?.email || "N/A"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Số điện thoại:</strong>{" "}
              {booking?.renter?.phoneNumber || "N/A"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Thiết bị:</strong>{" "}
              {booking ? getItemsDisplay(booking) : "N/A"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Thời gian thuê:</strong>{" "}
              {booking
                ? formatDateRange(booking.pickupAt, booking.returnAt)
                : "N/A"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Trạng thái:</strong> {booking?.statusText || "N/A"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Tổng tiền:</strong>{" "}
              {booking ? formatCurrency(booking.snapshotRentalTotal) : "N/A"}
            </Typography>
            <Typography variant="body2">
              <strong>Tiền cọc:</strong>{" "}
              {booking ? formatCurrency(booking.snapshotDepositAmount) : "N/A"}
            </Typography>
          </Paper>

          {booking?.items && booking.items.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: "#f9f9f9", mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Chi tiết thiết bị:
              </Typography>
              {booking.items.map((item, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 1, mb: 0.5 }}>
                  •{" "}
                  {item.camera
                    ? `${item.camera.brand} ${item.camera.model}`
                    : item.accessory
                    ? `${item.accessory.brand} ${item.accessory.model}`
                    : item.combo
                    ? item.combo.name
                    : "Unknown item"}
                  - Số lượng: {item.quantity} - Giá:{" "}
                  {formatCurrency(item.unitPrice)}
                </Typography>
              ))}
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};
