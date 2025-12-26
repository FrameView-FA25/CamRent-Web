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
import DeleteIcon from "@mui/icons-material/Delete";
import type {
  Dispute,
  AddDisputeItemRequest,
} from "../../../types/booking.types";

export interface DisputeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  dispute: Dispute | null;
  onAddItem?: (disputeId: string, item: AddDisputeItemRequest) => Promise<void>;
  onDeleteItem?: (disputeId: string, itemId: string) => Promise<void>;
}

const DisputeDetailDialog: React.FC<DisputeDetailDialogProps> = ({
  open,
  onClose,
  dispute,
    onAddItem,
    onDeleteItem,
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<AddDisputeItemRequest>({
    type: "Money",
    amount: 0,
    notes: "",
  });
  const [otherType, setOtherType] = useState("");
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

  const getItemTypeLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case "damage":
        return "Thiệt hại";
      case "missing":
        return "Mất thiết bị";
      case "late":
        return "Trễ hẹn";
      case "downtime_fee":
        return "Phí giãn đoạn";
      case "money":
        return "Tiền";
      case "other":
        return "Khác";
      default:
        // Nếu là loại tùy chỉnh khác, giữ nguyên
        return type;
    }
  };

  const getDisputeTitleLabel = (title: string): string => {
    switch (title.toLowerCase()) {
      case "downtime":
        return "Thời gian giãn đoạn";
      case "late":
        return "Trả muộn";
      default:
        return title;
    }
  };

  const handleAddItem = async () => {
    if (!onAddItem) return;

    if (newItem.amount <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }
    if (newItem.type === "Other" && !otherType.trim()) {
      setError("Vui lòng nhập loại bồi thường khi chọn 'Khác'");
      return;
    }
    if (!newItem.notes.trim()) {
      setError("Vui lòng nhập ghi chú");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: AddDisputeItemRequest =
        newItem.type === "Other" && otherType.trim()
          ? { ...newItem, type: otherType.trim() }
          : newItem;

      await onAddItem(dispute.id, payload);
      setShowAddItem(false);
      setNewItem({ type: "Money", amount: 0, notes: "" });
      setOtherType("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!dispute || !onDeleteItem) return;
    const confirmed = window.confirm("Bạn có chắc muốn xóa mục bồi thường này?");
    if (!confirmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onDeleteItem(dispute.id, itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi khi xóa mục bồi thường");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return "N/A";
    }

    try {
      // Xử lý format từ backend: 2025-12-20 03:41:24.903677+00
      // Thay thế khoảng trắng bằng 'T' để tạo ISO format
      const isoString = dateString.replace(" ", "T");
      const date = new Date(isoString);

      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "N/A";
      }

      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "N/A";
    }
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
              {getDisputeTitleLabel(dispute.title)}
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
                label={getStatusLabel(dispute.status)}
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
                    label="Loại bồi thường"
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="Damage">Thiệt hại</MenuItem>
                    <MenuItem value="Missing">Mất thiết bị</MenuItem>
                    <MenuItem value="Late">Trễ hẹn</MenuItem>
                    <MenuItem value="Other">Khác</MenuItem>
                  </TextField>

                  {newItem.type === "Other" && (
                    <TextField
                      label="Nhập loại bồi thường"
                      value={otherType}
                      onChange={(e) => setOtherType(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  )}

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
                        setOtherType("");
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
                            {getItemTypeLabel(item.type)}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(item.amount)}
                            </Typography>
                            {onDeleteItem &&
                              dispute.status.toLowerCase() !== "resolved" && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteItem(item.id)}
                                  disabled={isSubmitting}
                                  aria-label="delete-item"
                                >
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                              )}
                          </Box>
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
