import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { Close, Add, Delete } from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";
import type {
  InspectionItem,
  InspectionPayload,
} from "../../types/inspection.types";
import type { Branch } from "../../types/branch.types";
import { createInspection } from "../../services/inspection.service";
import { fetchBranches } from "../../services/branch.service";
import { decodeToken } from "../../utils/decodeToken";

interface InspectionDialogProps {
  open: boolean;
  booking: Booking | null;
  inspectionType: number; // 1 = Before Rental, 2 = After Return
  onClose: () => void;
  onSuccess: () => void;
}

export const InspectionDialog: React.FC<InspectionDialogProps> = ({
  open,
  booking,
  inspectionType,
  onClose,
  onSuccess,
}) => {
  const [notes, setNotes] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [items, setItems] = useState<InspectionItem[]>([
    {
      section: "Thân máy",
      label: "Kiểm tra vỏ ngoài",
      value: "Tốt",
      passed: true,
      notes: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách chi nhánh khi dialog mở
  useEffect(() => {
    if (open) {
      loadBranches();
    }
  }, [open]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    setError(null); // Clear error trước khi load
    try {
      const { branches: data, error: err } = await fetchBranches();
      if (err) {
        console.error("Branch loading error:", err);
        // Không set error ở đây, chỉ log để user vẫn có thể tiếp tục
        // setError(`Không thể tải danh sách chi nhánh: ${err}`);
      } else {
        setBranches(data);
        // Tự động chọn chi nhánh đầu tiên nếu có
        if (data.length > 0) {
          setSelectedBranchId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Exception loading branches:", err);
      // Không set error để user có thể tiếp tục
    } finally {
      setLoadingBranches(false);
    }
  };

  // Reset form khi dialog mở
  useEffect(() => {
    if (open && booking) {
      setNotes("");
      setSelectedBranchId("");
      setItems([
        {
          section: "Thân máy",
          label: "Kiểm tra vỏ ngoài",
          value: "Tốt",
          passed: true,
          notes: "",
        },
      ]);
      setError(null);
    }
  }, [open, booking]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        section: "",
        label: "",
        value: "",
        passed: true,
        notes: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InspectionItem,
    value: string | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!booking) return;

    // Validation
    if (!selectedBranchId) {
      setError("Vui lòng chọn chi nhánh");
      return;
    }

    if (items.length === 0) {
      setError("Vui lòng thêm ít nhất một mục kiểm tra");
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.section || !item.label || !item.value
    );
    if (invalidItems.length > 0) {
      setError("Vui lòng điền đầy đủ thông tin cho tất cả các mục kiểm tra");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Lấy thông tin user từ token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const decodedToken = decodeToken(token);

      // Thử nhiều cách lấy userId
      const userId =
        decodedToken?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        decodedToken?.userId ||
        decodedToken?.sub ||
        decodedToken?.id;

      if (!userId) {
        throw new Error(
          "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại."
        );
      }

      const payload: InspectionPayload = {
        bookingId: booking.id,
        type: inspectionType,
        performedByUserId: userId,
        branchId: selectedBranchId, // Sử dụng branchId đã chọn từ dropdown
        notes: notes,
        items: items,
      };

      const { inspection, error } = await createInspection(payload);

      if (error) {
        setError(error);
        return;
      }

      if (inspection) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    if (inspectionType === 1) {
      return "Kiểm tra thiết bị trước cho thuê";
    } else if (inspectionType === 2) {
      return "Kiểm tra thiết bị sau khi trả";
    }
    return "Kiểm tra thiết bị";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          {getDialogTitle()}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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

        {/* Chọn chi nhánh */}
        <Box sx={{ mb: 3 }}>
          <FormControl
            fullWidth
            required
            error={branches.length === 0 && !loadingBranches}
          >
            <InputLabel>Chi nhánh</InputLabel>
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              label="Chi nhánh"
              disabled={loadingBranches}
            >
              {loadingBranches ? (
                <MenuItem disabled>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Đang tải...
                  </Box>
                </MenuItem>
              ) : branches.length === 0 ? (
                <MenuItem disabled>Không thể tải danh sách chi nhánh</MenuItem>
              ) : (
                branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {branches.length === 0 && !loadingBranches && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                Không thể tải danh sách chi nhánh. Vui lòng kiểm tra kết nối
                mạng và thử lại.
              </Typography>
            )}
          </FormControl>
        </Box>

        {/* Ghi chú chung */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Ghi chú chung
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Nhập ghi chú chung về quá trình kiểm tra..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>

        {/* Danh sách mục kiểm tra */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Mục kiểm tra
            </Typography>
            <Button
              startIcon={<Add />}
              onClick={handleAddItem}
              size="small"
              variant="outlined"
            >
              Thêm mục
            </Button>
          </Box>

          {items.map((item, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
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
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Mục {index + 1}
                </Typography>
                {items.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveItem(index)}
                    size="small"
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Phần kiểm tra"
                  placeholder="VD: Thân máy, Ống kính, Pin..."
                  value={item.section}
                  onChange={(e) =>
                    handleItemChange(index, "section", e.target.value)
                  }
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Nhãn"
                  placeholder="VD: Kiểm tra vỏ ngoài, Chức năng..."
                  value={item.label}
                  onChange={(e) =>
                    handleItemChange(index, "label", e.target.value)
                  }
                  size="small"
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Giá trị"
                  placeholder="VD: Tốt, Bình thường, Có vết xước nhỏ..."
                  value={item.value}
                  onChange={(e) =>
                    handleItemChange(index, "value", e.target.value)
                  }
                  size="small"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.passed}
                      onChange={(e) =>
                        handleItemChange(index, "passed", e.target.checked)
                      }
                    />
                  }
                  label="Đạt"
                />
              </Box>

              <TextField
                fullWidth
                label="Ghi chú"
                placeholder="Ghi chú chi tiết..."
                value={item.notes}
                onChange={(e) =>
                  handleItemChange(index, "notes", e.target.value)
                }
                size="small"
                multiline
                rows={1}
              />
            </Paper>
          ))}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: "#2196f3",
            "&:hover": { bgcolor: "#1976d2" },
          }}
        >
          {loading ? "Đang lưu..." : "Lưu kiểm tra"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
