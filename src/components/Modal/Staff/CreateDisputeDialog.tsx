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
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [downtimeDays, setDowntimeDays] = useState<number | "">("");

  const handleChange = (field: keyof CreateDisputeRequest, value: string) => {
    // Special handling for title selection: keep a separate selectedTitle state and set canonical title value
    if (field === "title") {
      setSelectedTitle(value);
      // If user selected a preset title, sync into formData immediately.
      // For "other", we'll wait for the user to type the custom title into the text input.
      setFormData((prev) => ({
        ...prev,
        title: value === "other" ? prev.title : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedTitle) {
      setError("Vui lòng chọn tiêu đề");
      return;
    }
    if (selectedTitle === "other") {
      if (!customTitle || !customTitle.trim()) {
        setError("Vui lòng nhập tiêu đề khác");
        return;
      }
      // sync custom title into formData
      setFormData((prev) => ({ ...prev, title: customTitle.trim() }));
    }
    if (selectedTitle === "downtime") {
      if (downtimeDays === "" || downtimeDays < 0) {
        setError("Vui lòng nhập số ngày gián đoạn hợp lệ");
        return;
      }
      // sync into formData
      setFormData((prev) => ({ ...prev, downtimeDays: Number(downtimeDays) }));
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
      // Map severity từ tiếng Anh sang tiếng Việt theo yêu cầu API (backend may expect localized values)
      const severityMap: Record<string, string> = {
        Low: "Thấp",
        Medium: "Trung bình",
        High: "Cao",
      };

      const requestData: CreateDisputeRequest = {
        bookingId: bookingId,
        title: selectedTitle === "other" ? customTitle.trim() : selectedTitle,
        description: formData.description.trim(),
        severity: severityMap[formData.severity] || formData.severity,
        downtimeDays:
          selectedTitle === "downtime" ? Number(downtimeDays || 0) : undefined,
      };

      await onSubmit(requestData);
      handleClose();
    } catch (err) {
      console.error("Error creating dispute:", err);
      let errorMessage = "Có lỗi xảy ra khi tạo tranh chấp";
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else {
        try {
          const parsed = JSON.parse(JSON.stringify(err));
          errorMessage =
            parsed?.detail || parsed?.title || parsed?.message || errorMessage;
        } catch {
          // keep generic message
        }
      }
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
      setSelectedTitle("");
      setCustomTitle("");
      setDowntimeDays("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo Bồi Thường Mới</DialogTitle>
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
            value={selectedTitle}
            onChange={(e) => handleChange("title", e.target.value)}
            fullWidth
            required
            size="small"
          >
            <MenuItem value="downtime">Thời gian giãn đoạn</MenuItem>
            <MenuItem value="late">Trả muộn</MenuItem>
            <MenuItem value="other">Khác</MenuItem>
          </TextField>

          {selectedTitle === "downtime" && (
            <TextField
              label="Số ngày gián đoạn"
              type="number"
              value={downtimeDays}
              onChange={(e) =>
                setDowntimeDays(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              fullWidth
              required
              size="small"
              inputProps={{ min: 0 }}
            />
          )}

          {selectedTitle === "other" && (
            <TextField
              label="Tiêu đề khác"
              value={customTitle}
              onChange={(e) => {
                const v = e.target.value;
                setCustomTitle(v);
                setFormData((prev) => ({ ...prev, title: v }));
                setError(null);
              }}
              fullWidth
              required
              size="small"
              placeholder="Nhập tiêu đề tranh chấp"
            />
          )}

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
          {isSubmitting ? "Đang tạo..." : "Tạo mục bồi thường"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDisputeDialog;
