import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ModalAddCameraProps {
  open: boolean;
  onClose: () => void;
  onAdd: (camera: CameraFormData) => Promise<void>;
}

export interface CameraFormData {
  brand: string;
  model: string;
  variant: string;
  serialNumber: string;
  estimatedValueVnd: number;
  specsJson: string;
}

export default function ModalAddCamera({
  open,
  onClose,
  onAdd,
}: ModalAddCameraProps) {
  const [formData, setFormData] = useState<CameraFormData>({
    brand: "",
    model: "",
    variant: "",
    serialNumber: "",
    estimatedValueVnd: 0,
    specsJson: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.brand.trim()) {
      newErrors.brand = "Thương hiệu là bắt buộc";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Model là bắt buộc";
    }
    if (!formData.variant.trim()) {
      newErrors.variant = "Variant là bắt buộc";
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Số seri là bắt buộc";
    }
    if (!formData.estimatedValueVnd || formData.estimatedValueVnd <= 0) {
      newErrors.estimatedValueVnd = "Giá trị ước tính phải lớn hơn 0";
    }
    if (!formData.specsJson.trim()) {
      newErrors.specsJson = "Thông số kỹ thuật là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onAdd(formData);
        handleClose();
      } catch (error) {
        console.error("Error adding camera:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      brand: "",
      model: "",
      variant: "",
      serialNumber: "",
      estimatedValueVnd: 0,
      specsJson: "",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Thêm Camera mới
          </Typography>
          <Button
            onClick={handleClose}
            color="inherit"
            size="small"
            sx={{ minInlineSize: "auto" }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Brand, Model & Variant */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Thương hiệu"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              error={!!errors.brand}
              helperText={errors.brand}
              required
              placeholder="Ví dụ: Sony, Canon, Nikon"
            />
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              error={!!errors.model}
              helperText={errors.model}
              required
              placeholder="Ví dụ: Alpha A7 IV"
            />
          </Box>

          {/* Variant & Serial Number */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Variant"
              name="variant"
              value={formData.variant}
              onChange={handleChange}
              error={!!errors.variant}
              helperText={errors.variant}
              required
              placeholder="Ví dụ: Body Only"
            />
            <TextField
              fullWidth
              label="Số seri"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              error={!!errors.serialNumber}
              helperText={errors.serialNumber}
              required
              placeholder="Ví dụ: SN20251110A7IV001"
            />
          </Box>

          {/* Estimated Value */}
          <TextField
            fullWidth
            label="Giá trị ước tính"
            name="estimatedValueVnd"
            type="number"
            value={formData.estimatedValueVnd || ""}
            onChange={handleChange}
            error={!!errors.estimatedValueVnd}
            helperText={errors.estimatedValueVnd}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₫</InputAdornment>
              ),
            }}
            placeholder="Ví dụ: 48000000"
          />

          {/* Specs */}
          <TextField
            fullWidth
            label="Thông số kỹ thuật"
            name="specsJson"
            value={formData.specsJson}
            onChange={handleChange}
            error={!!errors.specsJson}
            helperText={errors.specsJson}
            required
            multiline
            rows={4}
            placeholder="Nhập thông số kỹ thuật của camera. Ví dụ: sensor"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          sx={{ minInlineSize: 120 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Đang thêm...
            </>
          ) : (
            "Thêm Camera"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
