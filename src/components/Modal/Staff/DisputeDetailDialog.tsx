import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import type {
  Dispute,
  AddDisputeItemRequest,
} from "../../../types/booking.types";

export interface DisputeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  dispute: Dispute | null;
  onAddItem?: (disputeId: string, item: AddDisputeItemRequest) => Promise<void>;
}

const DisputeDetailDialog: React.FC<DisputeDetailDialogProps> = ({
  open,
  onClose,
  dispute,
  onAddItem,
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<AddDisputeItemRequest>({
    type: "Money",
    amount: 0,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!dispute) return null;

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

  const handleAddItem = async () => {
    if (!onAddItem) return;

    if (newItem.amount <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }
    if (!newItem.notes.trim()) {
      setError("Vui lòng nhập ghi chú");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddItem(dispute.id, newItem);
      setShowAddItem(false);
      setNewItem({ type: "Money", amount: 0, notes: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Chi tiết Tranh Chấp</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Basic Info */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Mã Tranh Chấp
            </Typography>
            <Typography variant="body1">{dispute.id}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Mã Đơn Hàng
            </Typography>
            <Typography variant="body1">{dispute.bookingId}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tiêu đề
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {dispute.title}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Mô tả
            </Typography>
            <Typography variant="body1">{dispute.description}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Mức độ
              </Typography>
              <Chip
                label={dispute.severity}
                color={getSeverityColor(dispute.severity)}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Trạng thái
              </Typography>
              <Chip
                label={dispute.status}
                color={getStatusColor(dispute.status)}
                size="small"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tổng số tiền bồi thường
            </Typography>
            <Typography variant="h6" color="error">
              {formatCurrency(dispute.totalAmount || 0)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Người tạo
            </Typography>
            <Typography variant="body1">{dispute.createdBy}</Typography>
          </Box>

          {dispute.assignedTo && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Được gán cho
              </Typography>
              <Typography variant="body1">{dispute.assignedTo}</Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Ngày tạo
              </Typography>
              <Typography variant="body2">
                {formatDate(dispute.createdAt)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Cập nhật
              </Typography>
              <Typography variant="body2">
                {formatDate(dispute.updatedAt)}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Items */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6">Danh sách bồi thường</Typography>
              {onAddItem && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddItem(!showAddItem)}
                  size="small"
                  variant="outlined"
                >
                  Thêm
                </Button>
              )}
            </Box>

            {showAddItem && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    select
                    label="Loại"
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="PayOS">PayOS</MenuItem>
                    <MenuItem value="Money">Tiền mặt</MenuItem>
                  </TextField>

                  <TextField
                    label="Số tiền"
                    type="number"
                    value={newItem.amount}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        amount: Number(e.target.value),
                      })
                    }
                    size="small"
                    fullWidth
                  />

                  <TextField
                    label="Ghi chú"
                    value={newItem.notes}
                    onChange={(e) =>
                      setNewItem({ ...newItem, notes: e.target.value })
                    }
                    size="small"
                    multiline
                    rows={2}
                    fullWidth
                  />

                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    <Button
                      onClick={() => {
                        setShowAddItem(false);
                        setNewItem({ type: "Money", amount: 0, notes: "" });
                        setError(null);
                      }}
                      size="small"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleAddItem}
                      variant="contained"
                      size="small"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang thêm..." : "Thêm"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {dispute.items && dispute.items.length > 0 ? (
              <List>
                {dispute.items.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1" fontWeight="medium">
                            {item.type}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(item.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.notes}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {formatDate(item.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có bồi thường nào
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisputeDetailDialog;
