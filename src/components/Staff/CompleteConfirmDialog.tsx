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
import { CheckCircle } from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";

interface CompleteConfirmDialogProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirm: () => void;
  getItemsDisplay: (booking: Booking) => string;
}

export const CompleteConfirmDialog: React.FC<CompleteConfirmDialogProps> = ({
  open,
  booking,
  onClose,
  onConfirm,
  getItemsDisplay,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Xác nhận hoàn thành</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn cập nhật trạng thái của đơn hàng này?
          </Typography>
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Mã đơn:</strong> {booking?.id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Khách hàng:</strong>{" "}
              {booking?.renter?.fullName || "Unknown"}
            </Typography>
            <Typography variant="body2">
              <strong>Thiết bị:</strong>{" "}
              {booking ? getItemsDisplay(booking) : "N/A"}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
        >
          Xác nhận hoàn thành
        </Button>
      </DialogActions>
    </Dialog>
  );
};
