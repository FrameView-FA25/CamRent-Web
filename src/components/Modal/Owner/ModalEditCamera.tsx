import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import { cameraService, type Camera } from "../../../services/camera.service";

interface ModalEditCameraProps {
  open: boolean;
  camera: Camera | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface CameraUpdateForm {
  brand: string;
  model: string;
  variant: string;
  serialNumber: string;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number;
  depositCapMaxVnd: number;
  specsJson: string;
}

const DEFAULT_FORM: CameraUpdateForm = {
  brand: "",
  model: "",
  variant: "",
  serialNumber: "",
  baseDailyRate: 0,
  estimatedValueVnd: 0,
  depositPercent: 0,
  depositCapMinVnd: 0,
  depositCapMaxVnd: 0,
  specsJson: "",
};

const formatPercentForInput = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  if (value <= 1) {
    return value * 100;
  }
  return value;
};

const normalizePercentForApi = (value: number) => {
  if (value <= 1) {
    return value;
  }
  return value / 100;
};

export default function ModalEditCamera({
  open,
  camera,
  onClose,
  onUpdated,
}: ModalEditCameraProps) {
  const [formData, setFormData] = useState<CameraUpdateForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (open && camera) {
      setFormData({
        brand: camera.brand || "",
        model: camera.model || "",
        variant: camera.variant || "",
        serialNumber: camera.serialNumber || "",
        baseDailyRate: camera.baseDailyRate || 0,
        estimatedValueVnd: camera.estimatedValueVnd || 0,
        depositPercent: formatPercentForInput(camera.depositPercent),
        depositCapMinVnd: camera.depositCapMinVnd || 0,
        depositCapMaxVnd: camera.depositCapMaxVnd || 0,
        specsJson: camera.specsJson || "",
      });
      setError("");
      setFieldErrors({});
    } else if (!open) {
      setFormData(DEFAULT_FORM);
      setError("");
      setFieldErrors({});
    }
  }, [open, camera]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNumberChange = (name: keyof CameraUpdateForm, value: string) => {
    const parsed = Number(value);
    setFormData((prev) => ({
      ...prev,
      [name]: Number.isNaN(parsed) ? 0 : parsed,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand.trim()) newErrors.brand = "Thương hiệu là bắt buộc";
    if (!formData.model.trim()) newErrors.model = "Model là bắt buộc";
    if (!formData.variant.trim()) newErrors.variant = "Phiên bản là bắt buộc";
    if (!formData.serialNumber.trim())
      newErrors.serialNumber = "Số serial là bắt buộc";
    if (!formData.baseDailyRate || formData.baseDailyRate <= 0) {
      newErrors.baseDailyRate = "Giá thuê theo ngày phải lớn hơn 0";
    }
    if (!formData.estimatedValueVnd || formData.estimatedValueVnd <= 0) {
      newErrors.estimatedValueVnd = "Giá trị ước tính phải lớn hơn 0";
    }
    if (formData.depositPercent < 0 || formData.depositPercent > 100) {
      newErrors.depositPercent = "Phần trăm đặt cọc phải từ 0 đến 100";
    }
    if (formData.depositCapMinVnd < 0) {
      newErrors.depositCapMinVnd = "Mức đặt cọc tối thiểu không hợp lệ";
    }
    if (
      formData.depositCapMaxVnd < 0 ||
      formData.depositCapMaxVnd < formData.depositCapMinVnd
    ) {
      newErrors.depositCapMaxVnd =
        "Mức đặt cọc tối đa phải >= tối thiểu và không âm";
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!camera) return;
    if (!validate()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Partial<Camera> = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        variant: formData.variant.trim(),
        serialNumber: formData.serialNumber.trim(),
        baseDailyRate: formData.baseDailyRate,
        estimatedValueVnd: formData.estimatedValueVnd,
        depositPercent: normalizePercentForApi(formData.depositPercent),
        depositCapMinVnd: formData.depositCapMinVnd,
        depositCapMaxVnd: formData.depositCapMaxVnd,
        specsJson: formData.specsJson,
      };

      await cameraService.updateCamera(camera.id, payload);
      setSuccess("Cập nhật camera thành công!");
      setOpenSnackbar(true);
      onUpdated();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi cập nhật camera";
      setError(message);
      console.error("Update camera failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_FORM);
    setFieldErrors({});
    setError("");
    setSuccess("");
    onClose();
  };

  const isReady = useMemo(() => Boolean(camera), [camera]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#F8FAFC",
          borderBottom: "2px solid #E2E8F0",
          p: 3,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: "#1E293B", mb: 0.5, letterSpacing: "-0.5px" }}
            >
              Cập Nhật Camera
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748B", fontWeight: 500 }}
            >
              Điều chỉnh thông tin chi tiết cho thiết bị của bạn
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              "&:hover": {
                bgcolor: "#FEF2F2",
                borderColor: "#FF6B35",
                color: "#FF6B35",
              },
              transition: "all 0.2s ease",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3,
          bgcolor: "#FFFFFF",
          borderColor: "#E2E8F0",
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: "1px solid #FEE2E2",
              bgcolor: "#FEF2F2",
              "& .MuiAlert-icon": {
                color: "#EF4444",
              },
            }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {!isReady && (
          <Typography sx={{ color: "#94A3B8" }}>
            Vui lòng chọn camera để chỉnh sửa.
          </Typography>
        )}

        {isReady && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                error={!!fieldErrors.brand}
                helperText={fieldErrors.brand}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                error={!!fieldErrors.model}
                helperText={fieldErrors.model}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                label="Phiên bản"
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                error={!!fieldErrors.variant}
                helperText={fieldErrors.variant}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
              <TextField
                fullWidth
                label="Số Serial"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                error={!!fieldErrors.serialNumber}
                helperText={fieldErrors.serialNumber}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                label="Giá thuê / ngày"
                name="baseDailyRate"
                type="number"
                value={formData.baseDailyRate}
                onChange={(e) =>
                  handleNumberChange("baseDailyRate", e.target.value)
                }
                error={!!fieldErrors.baseDailyRate}
                helperText={fieldErrors.baseDailyRate}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
              <TextField
                fullWidth
                label="Giá trị ước tính"
                name="estimatedValueVnd"
                type="number"
                value={formData.estimatedValueVnd}
                onChange={(e) =>
                  handleNumberChange("estimatedValueVnd", e.target.value)
                }
                error={!!fieldErrors.estimatedValueVnd}
                helperText={fieldErrors.estimatedValueVnd}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                label="Phần trăm đặt cọc"
                name="depositPercent"
                type="number"
                value={formData.depositPercent}
                onChange={(e) =>
                  handleNumberChange("depositPercent", e.target.value)
                }
                error={!!fieldErrors.depositPercent}
                helperText={fieldErrors.depositPercent}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
              <TextField
                fullWidth
                label="Đặt cọc tối thiểu"
                name="depositCapMinVnd"
                type="number"
                value={formData.depositCapMinVnd}
                onChange={(e) =>
                  handleNumberChange("depositCapMinVnd", e.target.value)
                }
                error={!!fieldErrors.depositCapMinVnd}
                helperText={fieldErrors.depositCapMinVnd}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
              <TextField
                fullWidth
                label="Đặt cọc tối đa"
                name="depositCapMaxVnd"
                type="number"
                value={formData.depositCapMaxVnd}
                onChange={(e) =>
                  handleNumberChange("depositCapMaxVnd", e.target.value)
                }
                error={!!fieldErrors.depositCapMaxVnd}
                helperText={fieldErrors.depositCapMaxVnd}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#FF6B35" },
                    "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Thông số kỹ thuật"
              name="specsJson"
              value={formData.specsJson}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="VD: Full-frame 33MP, 4K 60fps, 5-axis IBIS..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#FF6B35" },
                  "&.Mui-focused fieldset": { borderColor: "#FF6B35" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#FF6B35" },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          bgcolor: "#F8FAFC",
          borderTop: "1px solid #E2E8F0",
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          disabled={loading}
          sx={{
            borderColor: "#CBD5E1",
            color: "#64748B",
            fontWeight: 600,
            px: 4,
            py: 1.25,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              borderColor: "#94A3B8",
              bgcolor: "#F1F5F9",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading || !isReady}
          startIcon={!loading && <SaveIcon />}
          sx={{
            bgcolor: "#FF6B35",
            color: "#FFFFFF",
            fontWeight: 600,
            px: 4,
            py: 1.25,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#E85D2A",
              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
            },
            "&:disabled": {
              bgcolor: "#FCA58C",
              color: "#FFFFFF",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </DialogActions>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ inlineSize: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
