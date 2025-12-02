import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import type { Booking } from "../../../../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getBookingType,
} from "../../../../../utils/booking.utils";

interface CreateContractDialogProps {
  open: boolean;
  onClose: () => void;
  selectedBooking: Booking | null;
  loading: boolean;
  onConfirm: () => void;
}

export const CreateContractDialog: React.FC<CreateContractDialogProps> = ({
  open,
  onClose,
  selectedBooking,
  loading,
  onConfirm,
}) => {
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
      <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
        Tạo hợp đồng thuê
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
            Bạn có chắc chắn muốn tạo hợp đồng cho đơn thuê này?
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#F9FAFB",
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>Mã đơn:</strong> {selectedBooking?.id.slice(0, 8)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>Loại:</strong>{" "}
              {selectedBooking && getBookingType(selectedBooking.type)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>Tổng tiền:</strong>{" "}
              <span style={{ color: "#F97316", fontWeight: 700 }}>
                {selectedBooking &&
                  formatCurrency(selectedBooking.snapshotRentalTotal)}
              </span>
            </Typography>
            <Typography variant="body2" sx={{ color: "#1F2937" }}>
              <strong>Thời gian:</strong>{" "}
              {selectedBooking &&
                `${formatDate(selectedBooking.pickupAt)} - ${formatDate(
                  selectedBooking.returnAt
                )}`}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
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
            bgcolor: "#F97316",
            "&:hover": {
              bgcolor: "#EA580C",
            },
            "&:disabled": {
              bgcolor: "#E5E7EB",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            <>
              <Description sx={{ mr: 1 }} /> Tạo hợp đồng
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
