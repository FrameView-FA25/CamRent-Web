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
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Snackbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { cameraService } from "../../services/camera.service";

interface ModalAddCameraProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void; // Callback sau khi thêm thành công để refresh danh sách
}

// Interface cho form data theo API POST /api/Cameras
export interface CameraFormData {
  brand: string; // Thương hiệu camera
  model: string; // Model camera
  variant: string; // Phiên bản
  serialNumber: string; // Số serial
  estimatedValueVnd: number; // Giá trị ước tính
  specsJson: string; // Thông số kỹ thuật
  mediaFiles?: File[]; // Danh sách file ảnh upload
}

export default function ModalAddCamera({
  open,
  onClose,
  onAdd,
}: ModalAddCameraProps) {
  // State quản lý form data
  const [formData, setFormData] = useState<CameraFormData>({
    brand: "",
    model: "",
    variant: "",
    serialNumber: "",
    estimatedValueVnd: 0,
    specsJson: "",
    mediaFiles: [],
  });

  // State quản lý preview ảnh
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // State quản lý loading, lỗi và thành công
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // State quản lý toast thông báo
  const [openSnackbar, setOpenSnackbar] = useState(false);

  /**
   * Xử lý thay đổi input text
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Xử lý thay đổi số (number input)
   */
  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Xử lý chọn file ảnh
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    // Kiểm tra loại file
    const validFiles = newFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        setError(`File ${file.name} không phải là ảnh`);
      }
      return isImage;
    });

    if (validFiles.length === 0) return;

    // Cập nhật formData với files mới
    setFormData((prev) => ({
      ...prev,
      mediaFiles: [...(prev.mediaFiles || []), ...validFiles],
    }));

    // Tạo preview cho ảnh
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Clear error nếu có
    if (errors.mediaFiles) {
      setErrors((prev) => ({ ...prev, mediaFiles: "" }));
    }
  };

  /**
   * Xóa ảnh đã chọn
   */
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles?.filter((_, i) => i !== index) || [],
    }));

    // Revoke object URL để giải phóng bộ nhớ
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Validate form trước khi submit
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.brand.trim()) {
      newErrors.brand = "Thương hiệu là bắt buộc";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Model là bắt buộc";
    }
    if (!formData.variant.trim()) {
      newErrors.variant = "Phiên bản là bắt buộc";
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Số serial là bắt buộc";
    }
    if (!formData.estimatedValueVnd || formData.estimatedValueVnd <= 0) {
      newErrors.estimatedValueVnd = "Giá trị ước tính phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý submit form - Gọi API tạo camera
   */
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Gọi API tạo camera
      await cameraService.createCamera(formData);

      // Hiển thị toast thông báo thành công
      setSuccess("Thêm camera thành công!");
      setOpenSnackbar(true);

      // Gọi callback để refresh danh sách
      onAdd();

      // Đóng modal sau khi thêm thành công
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err) {
      // Xử lý lỗi
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi thêm camera";
      setError(errorMessage);
      console.error("Lỗi khi thêm camera:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đóng modal và reset form
   */
  const handleClose = () => {
    // Revoke tất cả object URLs để giải phóng bộ nhớ
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    // Reset form về giá trị mặc định
    setFormData({
      brand: "",
      model: "",
      variant: "",
      serialNumber: "",
      estimatedValueVnd: 0,
      specsJson: "",
      mediaFiles: [],
    });
    setImagePreviews([]);
    setError("");
    setSuccess("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Thêm Camera mới
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Thương hiệu & Model */}
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
              placeholder="VD: Canon, Sony, Nikon..."
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
              placeholder="VD: Alpha A7 IV, EOS R5..."
            />
          </Box>

          {/* Phiên bản & Số Serial */}
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
              error={!!errors.variant}
              helperText={errors.variant}
              required
              placeholder="VD: Body Only, Kit 24-70mm..."
            />
            <TextField
              fullWidth
              label="Số Serial"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              error={!!errors.serialNumber}
              helperText={errors.serialNumber}
              required
              placeholder="VD: SN20251110A7IV001"
            />
          </Box>

          {/* Giá trị ước tính */}
          <TextField
            fullWidth
            label="Giá trị ước tính"
            name="estimatedValueVnd"
            type="number"
            value={formData.estimatedValueVnd || ""}
            onChange={(e) =>
              handleNumberChange("estimatedValueVnd", e.target.value)
            }
            error={!!errors.estimatedValueVnd}
            helperText={errors.estimatedValueVnd}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₫</InputAdornment>
              ),
            }}
            placeholder="48000000"
          />

          {/* Thông số kỹ thuật */}
          <TextField
            fullWidth
            label="Thông số kỹ thuật"
            name="specsJson"
            value={formData.specsJson}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="VD: Full-frame 33MP, 4K 60fps, 5-axis IBIS..."
          />

          {/* Upload ảnh */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Hình ảnh camera
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Chọn ảnh
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            {/* Hiển thị preview ảnh */}
            {imagePreviews.length > 0 && (
              <ImageList
                sx={{ inlineSize: "100%", maxBlockSize: 300 }}
                cols={3}
                rowHeight={164}
              >
                {imagePreviews.map((preview, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      loading="lazy"
                      style={{ blockSize: "164px", objectFit: "cover" }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            {imagePreviews.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Chưa có ảnh nào được chọn
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Thêm Camera"}
        </Button>
      </DialogActions>

      {/* Toast thông báo thành công */}
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
