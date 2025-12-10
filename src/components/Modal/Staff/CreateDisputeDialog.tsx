import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";
import type { CreateDisputeRequest } from "../../../types/booking.types";

export interface CreateDisputeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDisputeRequest) => Promise<void>;
  bookingId: string;
}

const CreateDisputeDialog: React.FC<CreateDisputeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  bookingId,
}) => {
  const [formData, setFormData] = useState<CreateDisputeRequest>({
    bookingId,
    title: "",
    description: "",
    severity: "Medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CreateDisputeRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả");
      return;
    }

    // Validate GUID format
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(bookingId)) {
      setError("Mã đơn hàng không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Map severity từ tiếng Anh sang tiếng Việt theo yêu cầu API
      const severityMap: Record<string, string> = {
        Low: "Thấp",
        Medium: "Trung bình",
        High: "Cao",
      };

      const requestData: CreateDisputeRequest = {
        bookingId: bookingId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: severityMap[formData.severity] || formData.severity,
      };

      await onSubmit(requestData);
      handleClose();
    } catch (err: any) {
      console.error("Error creating dispute:", err);
      const errorMessage =
        err?.response?.data?.title ||
        err?.message ||
        "Có lỗi xảy ra khi tạo tranh chấp";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        bookingId,
        title: "",
        description: "",
        severity: "Medium",
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo Tranh Chấp Mới</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Mã Đơn Hàng"
            value={bookingId}
            disabled
            fullWidth
            size="small"
          />

          <TextField
            select
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            fullWidth
            required
            size="small"
          >
            <MenuItem value="Máy ảnh">Máy ảnh</MenuItem>
            <MenuItem value="Ống kính">Ống kính</MenuItem>
            <MenuItem value="Phụ kiện">Phụ kiện</MenuItem>
            <MenuItem value="Trả muộn">Trả muộn</MenuItem>
            <MenuItem value="Hư hỏng thiết bị">Hư hỏng thiết bị</MenuItem>
            <MenuItem value="Mất thiết bị">Mất thiết bị</MenuItem>
            <MenuItem value="Khác">Khác</MenuItem>
          </TextField>

          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            size="small"
            placeholder="Mô tả chi tiết vấn đề"
          />

          <TextField
            select
            label="Mức độ"
            value={formData.severity}
            onChange={(e) => handleChange("severity", e.target.value)}
            fullWidth
            required
            size="small"
          >
            <MenuItem value="Low">Thấp</MenuItem>
            <MenuItem value="Medium">Trung bình</MenuItem>
            <MenuItem value="High">Cao</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ color: "white" }}
        >
          {isSubmitting ? "Đang tạo..." : "Tạo Tranh Chấp"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDisputeDialog;
