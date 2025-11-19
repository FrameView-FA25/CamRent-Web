import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import type { VerificationItem } from "../../types/verification.types";
type InspectionDefaultValues = {
  verifyId?: string;
  items?: VerificationItem[];
  ItemId?: string;
  ItemType?: string;
  Type?: string;
  Section?: string;
  Label?: string;
  Value?: string;
  Passed?: boolean;
  Notes?: string;
};

export interface InspectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Partial<InspectionDefaultValues>;
}

const InspectionDialog: React.FC<InspectionDialogProps> = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  // Booking, Type, InspectionTypeId đều lấy từ verify id (mặc định truyền vào defaultValues)
  const verifyId = defaultValues?.verifyId || "";
  // Danh sách thiết bị từ verify
  const items: VerificationItem[] = defaultValues?.items || [];
  const [form, setForm] = React.useState({
    ItemId: "",
    ItemType: defaultValues?.ItemType || "Camera",
    Type: defaultValues?.Type || "Booking",
    Booking: verifyId,
    InspectionTypeId: verifyId,
    Section: defaultValues?.Section || "",
    Label: defaultValues?.Label || "",
    Value: defaultValues?.Value || "",
    Passed: defaultValues?.Passed ?? true,
    Notes: defaultValues?.Notes || "",
    files: undefined as FileList | undefined,
    images: undefined as FileList | undefined,
  });

  React.useEffect(() => {
    setForm((f) => ({
      ...f,
      ItemId: "",
      Booking: defaultValues?.verifyId || "",
      InspectionTypeId: defaultValues?.verifyId || "",
      ItemType: defaultValues?.ItemType || "Camera",
      Type: defaultValues?.Type || "Booking",
      Section: defaultValues?.Section || "",
      Label: defaultValues?.Label || "",
      Value: defaultValues?.Value || "",
      Passed: defaultValues?.Passed ?? true,
      Notes: defaultValues?.Notes || "",
    }));
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    setForm((f) => {
      if (type === "file" && files && name === "images") {
        // Cộng dồn các ảnh đã chọn trước đó
        const oldFiles = f.images ? Array.from(f.images) : [];
        const newFiles = Array.from(files);
        // Loại bỏ trùng lặp theo tên file và size
        const allFiles = [...oldFiles, ...newFiles].filter(
          (file, idx, arr) =>
            arr.findIndex(
              (f2) => f2.name === file.name && f2.size === file.size
            ) === idx
        );
        // Tạo FileList mới từ mảng file
        const dataTransfer = new DataTransfer();
        allFiles.forEach((file) => dataTransfer.items.add(file));
        return { ...f, images: dataTransfer.files };
      }
      return {
        ...f,
        [name]: type === "checkbox" ? checked : type === "file" ? files : value,
      };
    });
  };

  // Preview images
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (form.images && form.images.length > 0) {
      const urls = Array.from(form.images).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [form.images]);

  const handleSubmit = () => {
    if (!form.ItemId) {
      alert("Vui lòng chọn thiết bị!");
      return;
    }
    if (!form.Type) {
      alert("Vui lòng chọn Type!");
      return;
    }
    // Loại bỏ các trường không cần thiết khi gửi lên
    const submitData = { ...form };
    delete submitData.files;
    delete submitData.images;
    onSubmit(submitData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
    >
      <DialogTitle
        sx={{ fontWeight: 700, fontSize: 22, textAlign: "center", pb: 0 }}
      >
        Tạo kiểm tra thiết bị
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mt: 1,
          bgcolor: "#FAFAFA",
          borderRadius: 3,
          p: 3,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <strong style={{ fontSize: 16 }}>Thông tin thiết bị</strong>
        </div>
        <TextField
          select
          label="Thiết bị"
          name="ItemId"
          value={form.ItemId}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">-- Chọn thiết bị --</MenuItem>
          {items.map((it) => (
            <MenuItem key={it.itemId} value={it.itemId}>
              {it.itemName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Loại thiết bị"
          name="ItemType"
          value={form.ItemType}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="Camera">Camera</MenuItem>
          <MenuItem value="Accessory">Accessory</MenuItem>
        </TextField>
        <TextField
          select
          label="Type"
          name="Type"
          value={form.Type}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">--</MenuItem>
          <MenuItem value="Booking">Booking</MenuItem>
          <MenuItem value="Verification">Verification</MenuItem>
        </TextField>
        {/* Bỏ thông tin kiểm tra và Booking ID */}
        {/* Removed Type field as it's not part of the form type */}
        {/* InspectionTypeId được giữ trong form nhưng không hiển thị trên giao diện */}
        <TextField
          label="Section"
          name="Section"
          value={form.Section}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Label"
          name="Label"
          value={form.Label}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Value"
          name="Value"
          value={form.Value}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.Passed}
              onChange={handleChange}
              name="Passed"
            />
          }
          label="Đạt kiểm tra (Passed)"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Ghi chú"
          name="Notes"
          value={form.Notes}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Đã bỏ upload file, chỉ còn upload ảnh */}
        <Button
          variant="outlined"
          component="label"
          sx={{
            borderRadius: 2,
            borderColor: "#0ea5e9",
            color: "#0ea5e9",
            fontWeight: 500,
            width: "fit-content",
            alignSelf: "flex-start",
            mb: 1,
          }}
        >
          Thêm ảnh
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            hidden
            onChange={handleChange}
          />
        </Button>
        {imagePreviews.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`img-${idx}`}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #eee",
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ borderRadius: 2, bgcolor: "#F97316", fontWeight: 600 }}
        >
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InspectionDialog;
