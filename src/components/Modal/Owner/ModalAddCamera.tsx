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
  Snackbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { cameraService } from "../../../services/camera.service";

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
  depositPercent: number; // Phần trăm đặt cọc
  depositCapMinVnd: number; // Mức đặt cọc tối thiểu
  depositCapMaxVnd: number; // Mức đặt cọc tối đa
  baseDailyRate: number; // Giá thuê / ngày
  specsJson: string; // Thông số kỹ thuật
  mediaFiles?: File[]; // Danh sách file ảnh upload (nhiều ảnh)
}

export default function ModalAddCamera({
  open,
  onClose,
  onAdd,
}: ModalAddCameraProps) {
  const MAX_IMAGES = 4; // Giới hạn số ảnh tối đa
  // State quản lý form data
  const [formData, setFormData] = useState<CameraFormData>({
    brand: "",
    model: "",
    variant: "",
    serialNumber: "",
    estimatedValueVnd: 0,
    specsJson: "",
    depositPercent: 0,
    depositCapMinVnd: 0,
    depositCapMaxVnd: 0,
    baseDailyRate: 0,
    mediaFiles: [],
  });

  // State quản lý preview nhiều ảnh
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
    // Cộng dồn file mới vào file cũ (nếu có) nhưng giới hạn tối đa MAX_IMAGES
    const oldFiles = formData.mediaFiles || [];
    const uniqueNew = validFiles.filter(
      (f) => !oldFiles.some((of) => of.name === f.name && of.size === f.size)
    );
    const spaceLeft = Math.max(0, MAX_IMAGES - oldFiles.length);
    const toAdd = uniqueNew.slice(0, spaceLeft);
    const mergedFiles = [...oldFiles, ...toAdd];
    if (uniqueNew.length > toAdd.length) {
      setError(`Chỉ được chọn tối đa ${MAX_IMAGES} ảnh`);
    }
    setFormData((prev) => ({ ...prev, mediaFiles: mergedFiles }));
    // Cập nhật previews (chỉ thêm số ảnh hợp lệ còn lại)
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    // Clear error nếu có
    if (errors.mediaFiles) {
      setErrors((prev) => ({ ...prev, mediaFiles: "" }));
    }
    // Reset input value để cho phép chọn lại cùng file
    e.target.value = "";
  };

  /**
   * Xóa ảnh đã chọn
   */
  // Xóa 1 ảnh theo index
  const handleRemoveImage = (idx: number) => {
    setFormData((prev) => {
      const newFiles = prev.mediaFiles
        ? prev.mediaFiles.filter((_, i) => i !== idx)
        : [];
      return { ...prev, mediaFiles: newFiles };
    });
    // Revoke object URL cho ảnh bị xóa
    setImagePreviews((prev) => {
      const urlToRevoke = prev[idx];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      return prev.filter((_, i) => i !== idx);
    });
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
      // ensure we only send up to MAX_IMAGES files
      const payload = {
        ...formData,
        mediaFiles: (formData.mediaFiles || []).slice(0, MAX_IMAGES),
      };
      await cameraService.createCamera(payload as any);

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
      depositPercent: 0,
      depositCapMinVnd: 0,
      depositCapMaxVnd: 0,
      baseDailyRate: 0,
      mediaFiles: [],
    });
    setImagePreviews([]);
    setError("");
    setSuccess("");
    setErrors({});
    onClose();
  };

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
              sx={{
                color: "#1E293B",
                mb: 0.5,
                letterSpacing: "-0.5px",
              }}
            >
              Thêm Camera Mới
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontWeight: 500,
              }}
            >
              Nhập thông tin chi tiết về camera cho thuê
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
        {/* Hiển thị thông báo lỗi nếu có */}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B35",
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B35",
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B35",
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B35",
                },
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
              value={formData.baseDailyRate || ""}
              onChange={(e) =>
                handleNumberChange("baseDailyRate", e.target.value)
              }
              error={!!errors.baseDailyRate}
              helperText={errors.baseDailyRate}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                },
              }}
              placeholder="150000"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B35",
                },
              }}
            />

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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B35",
                },
              }}
            />
          </Box>
          <TextField
            fullWidth
            label="Phần trăm đặt cọc"
            name="depositPercent"
            type="number"
            value={formData.depositPercent || ""}
            onChange={(e) =>
              handleNumberChange("depositPercent", e.target.value)
            }
            error={!!errors.depositPercent}
            helperText={errors.depositPercent}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            placeholder={`${formData.depositPercent || 0}%`}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#FF6B35",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF6B35",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#FF6B35",
              },
            }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#FF6B35",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF6B35",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#FF6B35",
              },
            }}
          />

          {/* Upload ảnh */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              gutterBottom
              sx={{
                color: "#1E293B",
                mb: 2,
              }}
            >
              Hình ảnh camera
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                mb: 2,
                borderColor: "#E2E8F0",
                color: "#64748B",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#FF6B35",
                  bgcolor: "#FFF5F0",
                  color: "#FF6B35",
                },
              }}
              disabled={(formData.mediaFiles || []).length >= MAX_IMAGES}
            >
              {(formData.mediaFiles || []).length >= MAX_IMAGES
                ? `Đã chọn tối đa ${MAX_IMAGES} ảnh`
                : "Chọn ảnh"}
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </Button>

            <Typography variant="caption" sx={{ color: "#64748B", ml: 1 }}>
              {imagePreviews.length || 0}/{MAX_IMAGES} ảnh
            </Typography>

            {/* Hiển thị preview ảnh */}
            {imagePreviews.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {imagePreviews.map((url, idx) => (
                  <Box
                    key={url}
                    sx={{
                      position: "relative",
                      border: "1px solid #E2E8F0",
                      borderRadius: 2,
                      p: 1,
                      bgcolor: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 120,
                      minHeight: 120,
                      maxWidth: 180,
                      maxHeight: 180,
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "160px",
                        objectFit: "contain",
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(idx)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0, 0, 0, 0.6)",
                        color: "#FFFFFF",
                        "&:hover": {
                          bgcolor: "#FF6B35",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {imagePreviews.length === 0 && (
              <Box
                sx={{
                  border: "2px dashed #E2E8F0",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  bgcolor: "#F8FAFC",
                }}
              >
                <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                  Chưa có ảnh nào được chọn
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
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
          disabled={loading}
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
            "Thêm Camera"
          )}
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
