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
import { accessoryService } from "../../services/accessory.service";

interface ModalAddAccessoryProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void; // Callback sau khi thêm thành công để refresh danh sách
}

// Interface cho form data theo API POST /api/Accessories
export interface AccessoryFormData {
  brand: string; // Thương hiệu phụ kiện
  model: string; // Model phụ kiện
  variant: string; // Phiên bản
  serialNumber: string; // Số serial
  estimatedValueVnd: number; // Giá trị ước tính
  specsJson: string; // Thông số kỹ thuật
  mediaFiles?: File[]; // Danh sách file ảnh upload
}

export default function ModalAddAccessory({
  open,
  onClose,
  onAdd,
}: ModalAddAccessoryProps) {
  // State quản lý form data
  const [formData, setFormData] = useState<AccessoryFormData>({
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

    // Chỉ lấy ảnh đầu tiên
    const firstFile = validFiles[0];

    // Revoke URL cũ nếu có
    if (imagePreviews.length > 0) {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }

    // Cập nhật formData với file mới (chỉ 1 ảnh)
    setFormData((prev) => ({
      ...prev,
      mediaFiles: [firstFile],
    }));

    // Tạo preview cho ảnh mới
    const newPreview = URL.createObjectURL(firstFile);
    setImagePreviews([newPreview]);

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
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: [],
    }));

    // Revoke object URL để giải phóng bộ nhớ
    if (imagePreviews.length > 0) {
      URL.revokeObjectURL(imagePreviews[0]);
    }
    setImagePreviews([]);
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
   * Xử lý submit form - Gọi API tạo phụ kiện
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
      // Tạo FormData để gửi lên API
      const apiFormData = new FormData();

      apiFormData.append("Brand", formData.brand);
      apiFormData.append("Model", formData.model);
      apiFormData.append("Variant", formData.variant);
      apiFormData.append("SerialNumber", formData.serialNumber);
      apiFormData.append(
        "EstimatedValueVnd",
        formData.estimatedValueVnd.toString()
      );
      apiFormData.append("SpecsJson", formData.specsJson);

      // Thêm file nếu có
      if (formData.mediaFiles && formData.mediaFiles.length > 0) {
        formData.mediaFiles.forEach((file) => {
          apiFormData.append("MediaFiles", file);
        });
      }

      // Gọi API tạo phụ kiện
      await accessoryService.createAccessory(apiFormData);

      // Hiển thị toast thông báo thành công
      setSuccess("Thêm phụ kiện thành công!");
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
        err instanceof Error ? err.message : "Có lỗi xảy ra khi thêm phụ kiện";
      setError(errorMessage);
      console.error("Lỗi khi thêm phụ kiện:", err);
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
              Thêm Phụ Kiện Mới
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontWeight: 500,
              }}
            >
              Nhập thông tin chi tiết về phụ kiện cho thuê
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
              placeholder="VD: Manfrotto, Godox, Rode..."
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
              placeholder="VD: MT055XPRO3, AD200 Pro..."
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
              placeholder="VD: Standard, Pro, Kit..."
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
              placeholder="VD: SN20251110ACC001"
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
            placeholder="5000000"
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
            placeholder="VD: Carbon fiber, Max load 9kg, Height 170cm..."
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
              Hình ảnh phụ kiện
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
            >
              Chọn ảnh
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            {/* Hiển thị preview ảnh */}
            {imagePreviews.length > 0 && (
              <Box
                sx={{
                  position: "relative",
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  p: 2,
                  bgcolor: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                }}
              >
                <img
                  src={imagePreviews[0]}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
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
            "Thêm Phụ Kiện"
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
