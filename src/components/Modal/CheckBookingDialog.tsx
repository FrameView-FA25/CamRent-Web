import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";

import type { VerificationItem } from "../../types/verification.types";
type CheckBookingDefaultValues = {
  verifyId?: string;
  items?: VerificationItem[];
  ItemId?: string;
  ItemType?: string;
  Type?: string;
  Section?: string;
  Label?: string;
  Value?: string;
  Passed?: boolean | null;
  Notes?: string;
};

export interface CheckBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Partial<CheckBookingDefaultValues>;
}

const CheckBookingDialog: React.FC<CheckBookingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  // Booking, Type, InspectionTypeId đều lấy từ verify id (mặc định truyền vào defaultValues)
  const verifyId = defaultValues?.verifyId || "";
  // Danh sách thiết bị từ verify
  const items: VerificationItem[] = defaultValues?.items || [];
  type FormState = {
    ItemId: string;
    ItemType: string;
    Type: string;
    // Đã loại bỏ trường Booking
    InspectionTypeId: string;
    Section: string;
    Label: string;
    Value: string;
    Passed: boolean | null;
    Notes: string;
    files: FileList | undefined;
    images: FileList | undefined;
  };
  const [form, setForm] = React.useState<FormState>({
    ItemId: "",
    ItemType: defaultValues?.ItemType || "",
    Type: defaultValues?.Type || "Booking",
    // Đã loại bỏ trường Booking
    InspectionTypeId: verifyId,
    Section: defaultValues?.Section || "",
    Label: defaultValues?.Label || "",
    Value: defaultValues?.Value || "",
    Passed: defaultValues?.Passed ?? null,
    Notes: defaultValues?.Notes || "",
    files: undefined,
    images: undefined,
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        ItemId: defaultValues?.ItemId || "",
        InspectionTypeId: defaultValues?.verifyId || "",
        ItemType: defaultValues?.ItemType || "",
        Type: defaultValues?.Type || "Booking",
        Section: defaultValues?.Section || "",
        Label: defaultValues?.Label || "",
        Value: defaultValues?.Value || "",
        Passed: defaultValues?.Passed ?? null,
        Notes: defaultValues?.Notes || "",
        files: undefined,
        images: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    console.log("Change:", name, value);
    setForm((f: FormState) => {
      // Xử lý Passed là boolean
      if (name === "Passed") {
        if (value === "true") return { ...f, Passed: true };
        if (value === "false") return { ...f, Passed: false };
        return { ...f, Passed: null };
      }
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
      // Nếu chọn thiết bị thì tự động fill ItemType
      if (name === "ItemId") {
        // value luôn là string, itemId có thể là string hoặc number
        const selectedItem = items.find((it) => String(it.itemId) === value);
        // Chuyển string thành tên loại thiết bị
        const getItemTypeName = (type: string) => {
          if (type === "1" || type === "Camera") return "Camera";
          if (type === "2" || type === "Accessory") return "Accessory";
          if (type === "3" || type === "Combo") return "Combo";
          return "";
        };
        return {
          ...f,
          ItemId: value,
          ItemType: selectedItem ? getItemTypeName(selectedItem.itemType) : "",
        };
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
    // Chuyển tên loại thiết bị thành số trước khi gửi
    const getItemTypeNumber = (typeName: string): number => {
      switch (typeName) {
        case "Camera":
          return 1;
        case "Accessory":
          return 2;
        case "Combo":
          return 3;
        default:
          return 0;
      }
    };

    // Loại bỏ các trường không cần thiết khi gửi lên
    const submitData: any = { ...form };
    delete submitData.files;

    // Chuyển ItemType từ tên sang số
    submitData.ItemType = getItemTypeNumber(form.ItemType);

    // Convert FileList to array for images (nếu cần upload)
    if (form.images) {
      submitData.images = Array.from(form.images);
    } else {
      delete submitData.images;
    }

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
          value={form.ItemId || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">-- Chọn thiết bị --</MenuItem>
          {items.map((it) => (
            <MenuItem key={String(it.itemId)} value={String(it.itemId)}>
              {it.itemName}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Loại thiết bị"
            name="ItemType"
            value={form.ItemType}
            fullWidth
            InputProps={{ readOnly: true }}
            slotProps={{
              input: {
                style: { backgroundColor: "#f3f4f6", cursor: "not-allowed" },
              },
            }}
            disabled
          />
          <TextField
            label="Type"
            name="Type"
            value={form.Type}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                style: { backgroundColor: "#f3f4f6", cursor: "not-allowed" },
              },
            }}
            disabled
          />
        </Box>

        <TextField
          label="Phần kiểm tra"
          name="Section"
          value={form.Section}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tên kiểm tra"
          name="Label"
          value={form.Label}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Giá trị"
          name="Value"
          value={form.Value}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <FormLabel>Kết quả</FormLabel>
          <RadioGroup
            row
            name="Passed"
            value={
              form.Passed === null
                ? ""
                : form.Passed === true
                  ? "true"
                  : "false"
            }
            onChange={handleChange}
          >
            <FormControlLabel value="true" control={<Radio />} label="Đạt" />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label="Không đạt"
            />
          </RadioGroup>
        </FormControl>
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

export default CheckBookingDialog;
