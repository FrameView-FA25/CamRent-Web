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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Visibility,
  Close,
  CheckCircle,
  Cancel,
  MoreVert,
} from "@mui/icons-material";
import {
  getDisputesByBookingId,
  getDisputeById,
  addDisputeItem,
  resolveDispute,
  rejectDispute,
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
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState<"resolve" | "reject">(
    "resolve"
  );
  const [processingDisputeId, setProcessingDisputeId] = useState<string | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDisputeId, setMenuDisputeId] = useState<string | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    disputeId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuDisputeId(disputeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDisputeId(null);
  };

  const handleMenuAction = (action: "view" | "resolve" | "reject") => {
    if (!menuDisputeId) return;

    switch (action) {
      case "view":
        handleViewDetail(menuDisputeId);
        break;
      case "resolve":
        handleOpenResolutionDialog(menuDisputeId, "resolve");
        break;
      case "reject":
        handleOpenResolutionDialog(menuDisputeId, "reject");
        break;
    }
    handleMenuClose();
  };

  const loadDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDisputesByBookingId(bookingId);
      const sortedData = data.sort((a, b) => {
        // Sort by createdAt (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setDisputes(sortedData);
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

  const handleOpenResolutionDialog = (
    disputeId: string,
    type: "resolve" | "reject"
  ) => {
    setProcessingDisputeId(disputeId);
    setResolutionType(type);
    setResolutionDialogOpen(true);
  };

  const handleCloseResolutionDialog = () => {
    setResolutionDialogOpen(false);
    setProcessingDisputeId(null);
  };

  const handleSubmitResolution = async () => {
    if (!processingDisputeId) return;

    try {
      if (resolutionType === "resolve") {
        await resolveDispute(processingDisputeId);
        toast.success("Đã giải quyết tranh chấp thành công");
      } else {
        await rejectDispute(processingDisputeId);
        toast.success("Đã từ chối tranh chấp thành công");
      }
      handleCloseResolutionDialog();
      await loadDisputes();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái tranh chấp");
      console.error(error);
    }
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
  ): "warning" | "info" | "success" | "error" | "default" => {
    switch (status.toLowerCase()) {
      case "open":
        return "warning";
      case "under_review":
        return "info";
      case "resolved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case "open":
        return "Mới được tạo";
      case "under_review":
        return "Đang xử lý";
      case "resolved":
        return "Đã giải quyết";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
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
  const canResolveOrReject = (status: string): boolean => {
    return (
      status.toLowerCase() === "open" || status.toLowerCase() === "under_review"
    );
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
                      flexDirection: "row",
                      alignItems: "center",
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
                          label={getStatusLabel(dispute.status)}
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
                      onClick={(e) => handleMenuOpen(e, dispute.id)}
                      size="small"
                    >
                      <MoreVert />
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction("view")}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        {menuDisputeId &&
          disputes.find((d) => d.id === menuDisputeId) &&
          canResolveOrReject(
            disputes.find((d) => d.id === menuDisputeId)!.status
          ) && (
            <>
              <MenuItem onClick={() => handleMenuAction("resolve")}>
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Giải quyết</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction("reject")}>
                <ListItemIcon>
                  <Cancel fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Từ chối</ListItemText>
              </MenuItem>
            </>
          )}
      </Menu>

      <Dialog
        open={resolutionDialogOpen}
        onClose={handleCloseResolutionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {resolutionType === "resolve"
            ? "Giải quyết tranh chấp"
            : "Từ chối tranh chấp"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {resolutionType === "resolve"
              ? "Bạn có chắc chắn muốn giải quyết tranh chấp này?"
              : "Bạn có chắc chắn muốn từ chối tranh chấp này?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolutionDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitResolution}
            variant="contained"
            color={resolutionType === "resolve" ? "success" : "error"}
          >
            Xác nhận
          </Button>
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
