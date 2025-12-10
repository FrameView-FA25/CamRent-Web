import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Visibility, Close } from "@mui/icons-material";
import {
  getDisputesByBookingId,
  getDisputeById,
  addDisputeItem,
} from "../../../services/dispute.service";
import type {
  Dispute,
  AddDisputeItemRequest,
} from "../../../types/booking.types";
import DisputeDetailDialog from "./DisputeDetailDialog";
import { toast } from "react-toastify";

export interface BookingDisputeListDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}

const BookingDisputeListDialog: React.FC<BookingDisputeListDialogProps> = ({
  open,
  onClose,
  bookingId,
}) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const loadDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDisputesByBookingId(bookingId);
      setDisputes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách disputes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && bookingId) {
      loadDisputes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookingId]);

  const handleViewDetail = async (disputeId: string) => {
    try {
      const dispute = await getDisputeById(disputeId);
      setSelectedDispute(dispute);
      setDetailDialogOpen(true);
    } catch {
      toast.error("Không thể tải chi tiết dispute");
    }
  };

  const handleAddItem = async (
    disputeId: string,
    item: AddDisputeItemRequest
  ) => {
    await addDisputeItem(disputeId, item);
    toast.success(
      "\u0110\u00e3 th\u00eam b\u1ed3i th\u01b0\u1eddng th\u00e0nh c\u00f4ng"
    );
    // Reload dispute detail
    const updatedDispute = await getDisputeById(disputeId);
    setSelectedDispute(updatedDispute);
    await loadDisputes();
  };

  const getSeverityColor = (
    severity: string
  ): "success" | "warning" | "error" | "default" => {
    switch (severity.toLowerCase()) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (
    status: string
  ): "warning" | "info" | "success" | "default" => {
    switch (status.toLowerCase()) {
      case "open":
        return "warning";
      case "inprogress":
        return "info";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Tranh chấp đơn hàng</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : disputes.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Booking này chưa có dispute nào
              </Typography>
            </Box>
          ) : (
            <List>
              {disputes.map((dispute, index) => (
                <React.Fragment key={dispute.id}>
                  {index > 0 && <Divider />}

                  <ListItem
                    sx={{
                      display: "flex",
                      flexDirection: "row", // Thay đổi từ "column" thành "row"
                      alignItems: "center", // Căn giữa theo chiều dọc
                      gap: 2,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flexGrow: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {dispute.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {dispute.description}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={dispute.severity}
                          color={getSeverityColor(dispute.severity)}
                          size="small"
                        />
                        <Chip
                          label={dispute.status}
                          color={getStatusColor(dispute.status)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Tổng: {formatCurrency(dispute.totalAmount || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {formatDate(dispute.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <IconButton
                      onClick={() => handleViewDetail(dispute.id)}
                      size="small"
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <DisputeDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedDispute(null);
        }}
        dispute={selectedDispute}
        onAddItem={handleAddItem}
      />
    </>
  );
};

export default BookingDisputeListDialog;
