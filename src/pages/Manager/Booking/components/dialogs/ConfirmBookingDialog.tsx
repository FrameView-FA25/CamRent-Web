import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { Booking } from "@/types/booking.types";

interface ConfirmBookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onConfirm: () => void;
  loading?: boolean;
  type: "confirm" | "cancel";
}

export const ConfirmBookingDialog: React.FC<ConfirmBookingDialogProps> = ({
  open,
  onClose,
  booking,
  onConfirm,
  loading = false,
  type,
}) => {
  const isConfirm = type === "confirm";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 600,
          color: "#1F2937",
        }}
      >
        {isConfirm ? (
          <>
            <CheckCircle size={24} color="#10B981" />
            Xác nhận đơn hàng
          </>
        ) : (
          <>
            <AlertCircle size={24} color="#EF4444" />
            Hủy đơn hàng
          </>
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
            {isConfirm
              ? "Bạn có chắc chắn muốn xác nhận đơn hàng này?"
              : "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."}
          </Typography>

          {booking && (
            <Paper
              sx={{
                p: 2,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                <strong>Mã đơn:</strong> {booking.id.slice(0, 8)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                <strong>Khách hàng:</strong> {booking.renterName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                <strong>Tổng tiền:</strong> {formatCurrency(booking.totalPrice)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                <strong>Ngày đặt:</strong> {formatDate(booking.bookingDate)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#1F2937" }}>
                <strong>Trạng thái hiện tại:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {booking.status}
                </Box>
              </Typography>
            </Paper>
          )}

          {!isConfirm && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#FEE2E2",
                borderRadius: 2,
                display: "flex",
                gap: 1,
                alignItems: "start",
              }}
            >
              <AlertCircle
                size={20}
                color="#EF4444"
                style={{ flexShrink: 0 }}
              />
              <Typography variant="body2" sx={{ color: "#991B1B" }}>
                Khi hủy đơn, khách hàng sẽ được thông báo và có thể yêu cầu hoàn
                tiền.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: isConfirm ? "#10B981" : "#EF4444",
            color: "white",
            "&:hover": {
              bgcolor: isConfirm ? "#059669" : "#DC2626",
            },
            "&:disabled": {
              bgcolor: "#E5E7EB",
            },
          }}
        >
          {loading ? "Đang xử lý..." : isConfirm ? "Xác nhận" : "Hủy đơn"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
