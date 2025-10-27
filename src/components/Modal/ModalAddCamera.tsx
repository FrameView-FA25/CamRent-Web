import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Typography,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface ModalAddCameraProps {
  open: boolean;
  onClose: () => void;
  onAdd: (camera: CameraFormData) => void;
}

export interface CameraFormData {
  name: string;
  serialNumber: string;
  brandId: number;
  branchId: number;
  description: string;
  advantage: string;
  disadvantage: string;
  suitableFor: string;
  price: number;
  quantity: number;
  status: "Active" | "Inactive";
  image?: File | null;
}

export default function ModalAddCamera({
  open,
  onClose,
  onAdd,
}: ModalAddCameraProps) {
  const [formData, setFormData] = useState<CameraFormData>({
    name: "",
    serialNumber: "",
    brandId: 0,
    branchId: 0,
    description: "",
    advantage: "",
    disadvantage: "",
    suitableFor: "",
    price: 0,
    quantity: 1,
    status: "Active",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Mock data cho brands và branches
  const brands = [
    { id: 1, name: "Canon" },
    { id: 2, name: "Sony" },
    { id: 3, name: "Nikon" },
    { id: 4, name: "Fujifilm" },
  ];

  const branches = [
    { id: 1, name: "Chi nhánh Hà Nội" },
    { id: 2, name: "Chi nhánh TP.HCM" },
    { id: 3, name: "Chi nhánh Đà Nẵng" },
  ];

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

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên máy ảnh là bắt buộc";
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Số seri là bắt buộc";
    }
    if (!formData.brandId || formData.brandId === 0) {
      newErrors.brandId = "Vui lòng chọn thương hiệu";
    }
    if (!formData.branchId || formData.branchId === 0) {
      newErrors.branchId = "Vui lòng chọn chi nhánh";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá thuê phải lớn hơn 0";
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: "",
      serialNumber: "",
      brandId: 0,
      branchId: 0,
      description: "",
      advantage: "",
      disadvantage: "",
      suitableFor: "",
      price: 0,
      quantity: 1,
      status: "Active",
      image: null,
    });
    setImagePreview("");
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
          <Button
            onClick={handleClose}
            color="inherit"
            size="small"
            sx={{ minWidth: "auto" }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Image Upload */}
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
            component="label"
          >
            {imagePreview ? (
              <Box>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    inlineSize: "100%",
                    blockSize: "auto",
                    maxBlockSize: "300px",
                    objectFit: "contain",
                  }}
                />
                <Typography variant="caption" display="block" mt={2}>
                  Nhấp để thay đổi ảnh
                </Typography>
              </Box>
            ) : (
              <Box>
                <PhotoCameraIcon
                  sx={{ fontSize: 60, color: "action.active", mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  Nhấp để tải ảnh lên
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Định dạng: JPG, PNG (Max: 5MB)
                </Typography>
              </Box>
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Box>

          {/* Camera Name & Serial Number */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Tên máy ảnh"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
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
            />
          </Box>

          {/* Brand & Branch */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControl fullWidth error={!!errors.brandId} required>
              <InputLabel>Thương hiệu</InputLabel>
              <Select
                value={formData.brandId}
                label="Thương hiệu"
                onChange={(e) => handleSelectChange("brandId", e.target.value)}
              >
                <MenuItem value={0}>
                  <em>Chọn thương hiệu</em>
                </MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.brandId && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  {errors.brandId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.branchId} required>
              <InputLabel>Chi nhánh</InputLabel>
              <Select
                value={formData.branchId}
                label="Chi nhánh"
                onChange={(e) => handleSelectChange("branchId", e.target.value)}
              >
                <MenuItem value={0}>
                  <em>Chọn chi nhánh</em>
                </MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.branchId && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  {errors.branchId}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Price & Quantity */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Giá thuê/ngày"
              name="price"
              type="number"
              value={formData.price || ""}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₫</InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Số lượng"
              name="quantity"
              type="number"
              value={formData.quantity || ""}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              inputProps={{ min: 1 }}
            />
          </Box>

          {/* Status */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) => handleSelectChange("status", e.target.value)}
              >
                <MenuItem value="Active">Hoạt động</MenuItem>
                <MenuItem value="Inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} /> {/* Spacer for alignment */}
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            required
            multiline
            rows={3}
          />

          {/* Advantage */}
          <TextField
            fullWidth
            label="Ưu điểm"
            name="advantage"
            value={formData.advantage}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Mô tả các ưu điểm của máy ảnh..."
          />

          {/* Disadvantage */}
          <TextField
            fullWidth
            label="Nhược điểm"
            name="disadvantage"
            value={formData.disadvantage}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Mô tả các nhược điểm của máy ảnh..."
          />

          {/* Suitable For */}
          <TextField
            fullWidth
            label="Phù hợp cho"
            name="suitableFor"
            value={formData.suitableFor}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Ví dụ: Chụp ảnh cưới, phong cảnh, chân dung..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} variant="outlined" size="large">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          sx={{ minInlineSize: 120 }}
        >
          Thêm Camera
        </Button>
      </DialogActions>
    </Dialog>
  );
}
