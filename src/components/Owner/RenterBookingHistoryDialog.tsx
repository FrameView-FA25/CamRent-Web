import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Divider,
  Stack,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Phone,
  CalendarToday,
} from "@mui/icons-material";
import type { RenterBookingHistory } from "../../services/booking.service";
import { formatCurrency, formatDate } from "../../utils/booking.utils";

interface RenterBookingHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  bookings: RenterBookingHistory[];
  loading: boolean;
}

const RenterBookingHistoryDialog: React.FC<RenterBookingHistoryDialogProps> = ({
  open,
  onClose,
  renterName,
  renterEmail,
  renterPhone,
  bookings,
  loading,
}) => {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, "success" | "warning" | "error" | "info"> =
      {
        Completed: "success",
        PickedUp: "info",
        Returned: "success",
        Confirmed: "warning",
        Cancelled: "error",
        PendingApproval: "warning",
      };
    return statusMap[status] || "default";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3 },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 22,
          pb: 2,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Lịch sử thuê thiết bị
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Thông tin khách hàng */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 2, color: "#64748b" }}
          >
            Thông tin khách hàng
          </Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AccountCircle sx={{ color: "#64748b", fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Tên:</strong> {renterName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Email sx={{ color: "#64748b", fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Email:</strong> {renterEmail}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Phone sx={{ color: "#64748b", fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Số điện thoại:</strong> {renterPhone}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Danh sách booking */}
        {loading ? (
          <Typography sx={{ textAlign: "center", py: 4 }}>
            Đang tải...
          </Typography>
        ) : bookings.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
          >
            Khách hàng chưa có lịch sử thuê thiết bị
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid #e5e7eb" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Mã booking</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày đặt</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nhận - Trả</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thiết bị</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                    Tổng tiền
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow
                    key={booking.bookingId}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {booking.bookingId.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 16, color: "#64748b" }}
                        />
                        <Typography variant="body2">
                          {formatDate(booking.bookingDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(booking.pickupAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        đến {formatDate(booking.returnAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.statusText}
                        size="small"
                        color={getStatusColor(booking.status)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {booking.items.map((item, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{
                              mb: idx < booking.items.length - 1 ? 0.5 : 0,
                            }}
                          >
                            • {item.itemName} ({item.itemType})
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#059669" }}
                      >
                        {formatCurrency(booking.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenterBookingHistoryDialog;
