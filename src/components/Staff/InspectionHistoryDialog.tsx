import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Close, CheckCircle, Cancel } from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";
import type { Inspection } from "../../types/inspection.types";
import { getInspectionsByBooking } from "../../services/inspection.service";
import { getInspectionTypeText } from "../../types/inspection.types";

interface InspectionHistoryDialogProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export const InspectionHistoryDialog: React.FC<
  InspectionHistoryDialogProps
> = ({ open, booking, onClose }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = React.useCallback(async () => {
    if (!booking) return;

    setLoading(true);
    setError(null);

    try {
      const { inspections: data, error: err } = await getInspectionsByBooking(
        booking.id
      );

      if (err) {
        setError(err);
      } else {
        setInspections(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setLoading(false);
    }
  }, [booking]);

  useEffect(() => {
    if (open && booking) {
      fetchInspections();
    }
  }, [open, booking, fetchInspections]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Lịch sử kiểm tra thiết bị
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {booking && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Mã booking: <strong>{booking.id}</strong>
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Khách hàng: <strong>{booking.renter?.fullName || "N/A"}</strong>
            </Typography>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && inspections.length === 0 && (
          <Alert severity="info">
            Chưa có lịch sử kiểm tra thiết bị cho booking này
          </Alert>
        )}

        {!loading && !error && inspections.length > 0 && (
          <Box>
            {inspections.map((inspection, index) => (
              <Paper
                key={inspection.id}
                sx={{
                  p: 3,
                  mb: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Kiểm tra #{index + 1}
                    </Typography>
                    <Chip
                      label={getInspectionTypeText(inspection.type)}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Thực hiện bởi:{" "}
                      <strong>
                        {inspection.performedByUser?.fullName || "N/A"}
                      </strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chi nhánh:{" "}
                      <strong>{inspection.branch?.name || "N/A"}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thời gian:{" "}
                      <strong>
                        {new Date(inspection.createdAt).toLocaleString("vi-VN")}
                      </strong>
                    </Typography>
                  </Box>
                </Box>

                {inspection.notes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Ghi chú chung:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inspection.notes}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Chi tiết kiểm tra:
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Phần kiểm tra</TableCell>
                        <TableCell>Nhãn</TableCell>
                        <TableCell>Giá trị</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inspection.items.map((item, itemIndex) => (
                        <TableRow key={itemIndex}>
                          <TableCell>{item.section}</TableCell>
                          <TableCell>{item.label}</TableCell>
                          <TableCell>{item.value}</TableCell>
                          <TableCell>
                            {item.passed ? (
                              <Chip
                                icon={<CheckCircle />}
                                label="Đạt"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<Cancel />}
                                label="Không đạt"
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {item.notes || <em>Không có</em>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};
