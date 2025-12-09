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
  Typography,
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

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
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
      <DialogTitle>Tạo Dispute Mới</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Booking ID"
            value={bookingId}
            disabled
            fullWidth
            size="small"
          />

          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            fullWidth
            required
            size="small"
            placeholder="Nhập tiêu đề dispute"
          />

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

          <Typography variant="caption" color="text.secondary">
            * Tất cả các trường đều bắt buộc
          </Typography>
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
        >
          {isSubmitting ? "Đang tạo..." : "Tạo Dispute"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDisputeDialog;
