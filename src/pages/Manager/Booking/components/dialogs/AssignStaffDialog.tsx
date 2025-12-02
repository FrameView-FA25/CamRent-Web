import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { Booking, Staff } from "@/types/booking.types";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  selectedBooking: Booking | null;
  staffList: Staff[];
  selectedStaff: string;
  onStaffChange: (staffId: string) => void;
  loading: boolean;
  onConfirm: () => void;
}

export const AssignStaffDialog: React.FC<AssignStaffDialogProps> = ({
  open,
  onClose,
  selectedBooking,
  staffList,
  selectedStaff,
  onStaffChange,
  loading,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
        Phân công nhân viên kiểm tra
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
            Đơn thuê: <strong>{selectedBooking?.id.slice(0, 8)}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Chọn nhân viên</InputLabel>
            <Select
              value={selectedStaff}
              onChange={(e) => onStaffChange(e.target.value)}
              label="Chọn nhân viên"
              disabled={loading}
              sx={{
                borderRadius: 2,
              }}
            >
              {staffList.length === 0 ? (
                <MenuItem disabled>Không có nhân viên</MenuItem>
              ) : (
                staffList.map((staff) => (
                  <MenuItem key={staff.userId} value={staff.userId}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {staff.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {staff.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
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
          disabled={!selectedStaff || loading}
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
            "Xác nhận"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
