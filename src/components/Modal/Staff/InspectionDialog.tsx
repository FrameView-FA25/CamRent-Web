import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Clear, PhotoCamera } from "@mui/icons-material";
import type { VerificationItem } from "../../../types/verification.types";
import { toast } from "react-toastify";

type InspectionDefaultValues = {
  verifyId?: string;
  items?: VerificationItem[];
};

export interface InspectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Partial<InspectionDefaultValues>;
}

// Danh sách kiểm tra thiết bị camera (như phiếu bảo dưỡng xe)
const DEFAULT_CHECKLIST = [
  { label: "Vỏ máy (vết xước, móp)" },
  { label: "Ống kính (sạch sẽ, trầy xước)" },
  { label: "Màn hình LCD" },
  { label: "Nút bấm chức năng" },
  { label: "Chụp ảnh" },
  { label: "Quay video" },
  { label: "Pin (dung lượng, tiếp xúc)" },
  { label: "Sạc pin" },
  { label: "Dây cáp kết nối" },
  { label: "Thẻ nhớ" },
];

type ChecklistItem = {
  id: string;
  label: string;
  checkPhysical: boolean; // Kiểm tra vật lý (bên ngoài)
  checkFunction: boolean; // Kiểm tra chức năng
  checkClean: boolean; // Vệ sinh/Làm sạch
  needRepair: boolean; // Cần sửa chữa
  passed: boolean; // Đạt/Không đạt
  notes: string;
  images: File[];
  imagePreviews: string[];
};

const InspectionDialog: React.FC<InspectionDialogProps> = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const verifyId = defaultValues?.verifyId || "";
  const items: VerificationItem[] = defaultValues?.items || [];

  const [selectedItemId, setSelectedItemId] = React.useState<string>("");
  const [selectedItemType, setSelectedItemType] = React.useState<string>("");

  // Khởi tạo checklist
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(
    DEFAULT_CHECKLIST.map((item, idx) => ({
      id: `item-${idx}`,
      label: item.label,
      checkPhysical: false,
      checkFunction: false,
      checkClean: false,
      needRepair: false,
      passed: true,
      notes: "",
      images: [],
      imagePreviews: [],
    }))
  );

  // Reset khi mở dialog
  React.useEffect(() => {
    if (open) {
      setSelectedItemId("");
      setSelectedItemType("");
      setChecklist(
        DEFAULT_CHECKLIST.map((item, idx) => ({
          id: `item-${idx}`,
          label: item.label,
          checkPhysical: false,
          checkFunction: false,
          checkClean: false,
          needRepair: false,
          passed: true,
          notes: "",
          images: [],
          imagePreviews: [],
        }))
      );
    }
  }, [open]);

  const handleItemSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const itemId = e.target.value;
    setSelectedItemId(itemId);

    const selectedItem = items.find((it) => String(it.itemId) === itemId);
    if (selectedItem) {
      const getItemTypeName = (type: string) => {
        if (type === "1" || type === "Camera") return "Camera";
        if (type === "2" || type === "Accessory") return "Accessory";
        if (type === "3" || type === "Combo") return "Combo";
        return "";
      };
      setSelectedItemType(getItemTypeName(selectedItem.itemType));
    }
  };

  const handleChecklistChange = (
    id: string,
    field: keyof ChecklistItem,
    value: string | boolean
  ) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCheckAll = (id: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              checkPhysical: checked,
              checkFunction: checked,
              checkClean: checked,
            }
          : item
      )
    );
  };

  const handleImageUpload = (id: string, files: FileList | null) => {
    if (!files) return;

    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Giới hạn tối đa 3 ảnh
          const remainingSlots = 3 - item.images.length;
          if (remainingSlots <= 0) {
            toast.error("Chỉ được tải tối đa 3 ảnh cho mỗi mục kiểm tra!");
            return item;
          }

          const filesToAdd = Array.from(files).slice(0, remainingSlots);
          const newFiles = [...item.images, ...filesToAdd];
          const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

          return {
            ...item,
            images: newFiles,
            imagePreviews: newPreviews,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveImage = (itemId: string, imageIndex: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newImages = item.images.filter((_, idx) => idx !== imageIndex);
          const newPreviews = item.imagePreviews.filter(
            (_, idx) => idx !== imageIndex
          );
          return {
            ...item,
            images: newImages,
            imagePreviews: newPreviews,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = () => {
    if (!selectedItemId) {
      alert("Vui lòng chọn thiết bị!");
      return;
    }

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

    // Chuyển checklist thành array các inspection items
    const inspectionItems = checklist.map((item) => ({
      ItemId: selectedItemId,
      ItemType: getItemTypeNumber(selectedItemType),
      Type: "Verification",
      Booking: verifyId,
      InspectionTypeId: verifyId,
      Label: item.label,
      CheckPhysical: item.checkPhysical,
      CheckFunction: item.checkFunction,
      CheckClean: item.checkClean,
      NeedRepair: item.needRepair,
      Passed: item.passed,
      Notes: item.notes,
      images: item.images,
    }));

    onSubmit({ items: inspectionItems });
  };

  const passedCount = checklist.filter((item) => item.passed).length;
  const failedCount = checklist.length - passedCount;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 4, p: 1 },
        },
      }}
    >
      <DialogTitle
        sx={{ fontWeight: 700, fontSize: 22, textAlign: "center", pb: 0 }}
      >
        Phiếu kiểm tra thiết bị
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {/* Chọn thiết bị */}
        <Box sx={{ mb: 3, mt: 2, display: "flex", gap: 2 }}>
          <TextField
            select
            label="Chọn thiết bị"
            value={selectedItemId}
            onChange={handleItemSelect}
            fullWidth
            sx={{ flex: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          >
            <MenuItem value="">-- Chọn thiết bị --</MenuItem>
            {items.map((it) => (
              <MenuItem key={String(it.itemId)} value={String(it.itemId)}>
                {it.itemName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Loại thiết bị"
            value={selectedItemType}
            fullWidth
            sx={{ flex: 1 }}
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            slotProps={{
              input: {
                readOnly: true,
                style: { backgroundColor: "#f3f4f6" },
              },
            }}
          />
        </Box>

        {/* Thống kê */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`Tổng: ${checklist.length} mục`} color="default" />
          <Chip label={`Đạt: ${passedCount}`} color="success" />
          <Chip label={`Không đạt: ${failedCount}`} color="error" />
        </Stack>

        {/* Bảng checklist */}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ border: "1px solid #ddd" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F3F4F6" }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "20%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Danh mục
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    width: "5%",
                  }}
                  rowSpan={2}
                >
                  Chọn tất cả
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                  colSpan={4}
                >
                  Phương pháp thực hiện
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "5%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Kết quả
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "20%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Ghi chú
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "15%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Ảnh
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: "#F3F4F6" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    width: "5%",
                  }}
                >
                  Tình trạng vật lý
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    width: "5%",
                  }}
                >
                  Kiểm tra Chức năng
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    width: "5%",
                  }}
                >
                  Vệ sinh
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    width: "5%",
                  }}
                >
                  Hư hỏng
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklist.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ border: "1px solid #ddd" }}>
                    <Typography variant="body2">{item.label}</Typography>
                  </TableCell>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={
                        item.checkPhysical &&
                        item.checkFunction &&
                        item.checkClean
                      }
                      indeterminate={
                        (item.checkPhysical ||
                          item.checkFunction ||
                          item.checkClean) &&
                        !(
                          item.checkPhysical &&
                          item.checkFunction &&
                          item.checkClean
                        )
                      }
                      onChange={(e) =>
                        handleCheckAll(item.id, e.target.checked)
                      }
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={item.checkPhysical}
                      onChange={(e) =>
                        handleChecklistChange(
                          item.id,
                          "checkPhysical",
                          e.target.checked
                        )
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={item.checkFunction}
                      onChange={(e) =>
                        handleChecklistChange(
                          item.id,
                          "checkFunction",
                          e.target.checked
                        )
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={item.checkClean}
                      onChange={(e) =>
                        handleChecklistChange(
                          item.id,
                          "checkClean",
                          e.target.checked
                        )
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={item.needRepair}
                      onChange={(e) =>
                        handleChecklistChange(
                          item.id,
                          "needRepair",
                          e.target.checked
                        )
                      }
                      size="small"
                      color="warning"
                    />
                  </TableCell>
                  <TableCell
                    sx={{ textAlign: "center", border: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={item.passed}
                      onChange={(e) =>
                        handleChecklistChange(
                          item.id,
                          "passed",
                          e.target.checked
                        )
                      }
                      color={item.passed ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ddd" }}>
                    <TextField
                      size="small"
                      placeholder="Ghi chú..."
                      value={item.notes}
                      onChange={(e) =>
                        handleChecklistChange(item.id, "notes", e.target.value)
                      }
                      fullWidth
                      multiline
                      rows={1}
                    />
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ddd" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <IconButton
                        component="label"
                        size="small"
                        sx={{ color: "#0ea5e9" }}
                      >
                        <PhotoCamera fontSize="small" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) =>
                            handleImageUpload(item.id, e.target.files)
                          }
                        />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        ({item.imagePreviews.length}/3)
                      </Typography>
                      {item.imagePreviews.map((preview, idx) => (
                        <Box key={idx} sx={{ position: "relative" }}>
                          <img
                            src={preview}
                            alt={`preview-${idx}`}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid #ddd",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(item.id, idx)}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: "white",
                              padding: "2px",
                              "&:hover": { bgcolor: "#fee" },
                            }}
                          >
                            <Clear sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
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
          Tạo phiếu kiểm tra
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InspectionDialog;
