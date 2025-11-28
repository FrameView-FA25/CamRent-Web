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
import {
  Close as CloseIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { cameraService, type Camera } from "../../../services/camera.service";

interface ModalEditCameraProps {
  open: boolean;
  camera: Camera | null;
  onClose: () => void;
  onUpdated: (updatedCamera?: Camera) => void;
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

interface MediaItem {
  id?: string;
  url: string;
  type?: string;
}

const MAX_IMAGES = 4;

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

  // State quản lý media
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]); // Media hiện tại từ camera
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]); // ID các media đã chọn xóa
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]); // File ảnh mới upload
  const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]); // Preview ảnh mới

  // Helper function để extract ID từ URL hoặc lấy ID từ media item
  const getMediaId = (mediaItem: any): string => {
    // Nếu có id property, dùng nó
    if (mediaItem?.id) return mediaItem.id;
    // Nếu không, thử extract từ URL (format: .../media/xxx-id.jpg hoặc .../xxx-id)
    if (typeof mediaItem === "string") {
      const match = mediaItem.match(/([^/]+?)(?:\.(jpg|jpeg|png|gif|webp))?$/);
      if (match) return match[1];
      return mediaItem; // Fallback: dùng toàn bộ URL
    }
    if (mediaItem?.url) {
      const match = mediaItem.url.match(
        /([^/]+?)(?:\.(?:jpg|jpeg|png|gif|webp))?$/
      );
      if (match) return match[1];
      return mediaItem.url; // Fallback: dùng toàn bộ URL
    }
    return "";
  };

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

      // Khởi tạo media hiện tại
      const mediaItems: MediaItem[] = [];
      if (camera.media && Array.isArray(camera.media)) {
        camera.media.forEach((m) => {
          if (typeof m === "string") {
            mediaItems.push({
              id: getMediaId(m),
              url: m,
            });
          } else if (m && typeof m === "object") {
            mediaItems.push({
              id: getMediaId(m),
              url: m.url || "",
            });
          }
        });
      }
      setExistingMedia(mediaItems);
      setRemovedMediaIds([]);
      setNewMediaFiles([]);
      setNewMediaPreviews([]);
      setError("");
      setFieldErrors({});
    } else if (!open) {
      setFormData(DEFAULT_FORM);
      setExistingMedia([]);
      setRemovedMediaIds([]);
      setNewMediaFiles([]);
      setNewMediaPreviews((prev) => {
        // Cleanup preview URLs
        prev.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error("Error revoking object URL:", e);
            // Ignore errors when revoking
          }
        });
        return [];
      });
      setError("");
      setFieldErrors({});
    }
  }, [open, camera]);

  // Cleanup preview URLs khi unmount
  useEffect(() => {
    const currentPreviews = newMediaPreviews;
    return () => {
      // Cleanup tất cả preview URLs khi unmount
      currentPreviews.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore errors when revoking
        }
      });
    };
  }, [newMediaPreviews]); // Cleanup khi previews thay đổi hoặc unmount

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

  // Xử lý xóa media cũ
  const handleRemoveExistingMedia = (mediaId: string) => {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  // Xử lý upload media mới
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

    // Kiểm tra số lượng ảnh tổng cộng (media hiện tại - đã xóa + media mới)
    const currentMediaCount = existingMedia.length - removedMediaIds.length;
    const spaceLeft = Math.max(0, MAX_IMAGES - currentMediaCount);
    const toAdd = validFiles.slice(0, spaceLeft);

    if (toAdd.length < validFiles.length) {
      setError(
        `Chỉ được chọn tối đa ${MAX_IMAGES} ảnh (đã có ${currentMediaCount} ảnh)`
      );
    }

    // Cộng dồn file mới
    const mergedFiles = [...newMediaFiles, ...toAdd];
    setNewMediaFiles(mergedFiles);

    // Tạo preview cho ảnh mới
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file));
    setNewMediaPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input value
    e.target.value = "";
  };

  // Xử lý xóa media mới (chưa upload)
  const handleRemoveNewMedia = (index: number) => {
    // Revoke URL của preview bị xóa
    const urlToRevoke = newMediaPreviews[index];
    if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);

    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setNewMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!camera) return;
    if (!validate()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Partial<Camera> & {
        mediaFiles?: File[];
        removeMediaIds?: string[];
      } = {
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
        mediaFiles: newMediaFiles.length > 0 ? newMediaFiles : undefined,
        removeMediaIds:
          removedMediaIds.length > 0 ? removedMediaIds : undefined,
      };

      const updatedCamera = await cameraService.updateCamera(
        camera.id,
        payload
      );
      setSuccess("Cập nhật camera thành công!");
      setOpenSnackbar(true);
      // Pass camera đã update vào callback để cập nhật vào danh sách (giữ nguyên vị trí)
      onUpdated(updatedCamera);
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
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          },
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
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
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

            {/* Quản lý media */}
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

              {/* Hiển thị media hiện tại (chưa bị xóa) */}
              {existingMedia.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 1.5, fontWeight: 600 }}
                  >
                    Ảnh hiện tại
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    {existingMedia.map((media, idx) => (
                      <Box
                        key={media.id || idx}
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
                          src={media.url}
                          alt={`Camera ${idx + 1}`}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "160px",
                            objectFit: "contain",
                          }}
                        />
                        <IconButton
                          onClick={() =>
                            handleRemoveExistingMedia(media.id || "")
                          }
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
                </Box>
              )}

              {/* Upload media mới */}
              <Box>
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
                  disabled={
                    existingMedia.length -
                      removedMediaIds.length +
                      newMediaFiles.length >=
                    MAX_IMAGES
                  }
                >
                  {existingMedia.length -
                    removedMediaIds.length +
                    newMediaFiles.length >=
                  MAX_IMAGES
                    ? `Đã chọn tối đa ${MAX_IMAGES} ảnh`
                    : "Thêm ảnh mới"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </Button>

                <Typography variant="caption" sx={{ color: "#64748B", ml: 1 }}>
                  {existingMedia.length -
                    removedMediaIds.length +
                    newMediaFiles.length}
                  /{MAX_IMAGES} ảnh
                </Typography>

                {/* Hiển thị preview ảnh mới */}
                {newMediaPreviews.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {newMediaPreviews.map((url, idx) => (
                      <Box
                        key={url}
                        sx={{
                          position: "relative",
                          border: "2px dashed #FF6B35",
                          borderRadius: 2,
                          p: 1,
                          bgcolor: "#FFF5F0",
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
                          onClick={() => handleRemoveNewMedia(idx)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255, 107, 53, 0.8)",
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
              </Box>
            </Box>
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
