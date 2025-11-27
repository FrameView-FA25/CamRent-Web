import { useState, useEffect, useContext, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import type {
  CreateVerificationRequest,
  VerificationItem,
} from "../../../types/verification.types";
import { cameraService } from "../../../services/camera.service";
import { accessoryService } from "../../../services/accessory.service";
import { CameraContext } from "../../../context/CameraContexts/CameraContext.types";
import type { Branch } from "../../../types/branch.types";
import type { Accessory } from "../../../types/accessory.types";

interface DeviceOption {
  id: string;
  brand?: string;
  model?: string;
  name?: string;
}

interface DeviceOptionSource {
  id: string;
  brand?: string | null;
  model?: string | null;
  name?: string | null;
}

// Chuẩn hóa giá trị itemType từ API/tham số về "Camera" hoặc "Accessory"
const normalizeItemType = (
  value: string | number | undefined
): "Camera" | "Accessory" => {
  if (value === "2" || value === 2 || value === "Accessory") {
    return "Accessory";
  }
  return "Camera";
};

// Trả về chuỗi nhãn dễ đọc từ thông tin thiết bị
const getDeviceLabel = (option?: DeviceOption) => {
  if (!option) return "";
  if (option.brand || option.model) {
    return `${option.brand ?? ""} ${option.model ?? ""}`.trim();
  }
  return option.name ?? "";
};

// Chuyển đổi dữ liệu trả về từ service sang DeviceOption nội bộ
const toDeviceOption = ({
  id,
  brand,
  model,
  name,
}: DeviceOptionSource): DeviceOption => ({
  id,
  brand: brand ?? undefined,
  model: model ?? undefined,
  name: name ?? undefined,
});

// Tạo item rỗng dùng khi thêm thiết bị mới
const getEmptyItem = (): VerificationItem => ({
  itemId: "",
  itemName: "",
  itemType: "Camera",
});

// Khởi tạo form rỗng mặc định
const getEmptyForm = (): CreateVerificationRequest => ({
  name: "",
  phoneNumber: "",
  inspectionDate: "",
  notes: "",
  branchId: "",
  items: [getEmptyItem()],
});

interface ModalVerificationProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVerificationRequest) => Promise<void>;
  branches: Branch[];
  isLoadingBranches: boolean;
  mode?: "create" | "edit";
  initialData?: CreateVerificationRequest | null;
}

export default function ModalVerification({
  open,
  onClose,
  onSubmit,
  branches,
  isLoadingBranches,
  mode = "create",
  initialData,
}: ModalVerificationProps) {
  const isEditMode = mode === "edit";

  // Trạng thái nắm dữ liệu form
  const [formData, setFormData] = useState<CreateVerificationRequest>(
    getEmptyForm()
  );
  // Các option cho camera và phụ kiện
  const [cameraOptions, setCameraOptions] = useState<DeviceOption[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<DeviceOption[]>([]);
  // Cờ loading + lỗi cho từng loại thiết bị
  const [cameraLoading, setCameraLoading] = useState(false);
  const [accessoryLoading, setAccessoryLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [accessoryError, setAccessoryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Thử lấy context camera nếu có (useContext trả undefined nếu không có provider)
  const cameraCtx = useContext(CameraContext);

  // Chuẩn hóa dữ liệu khởi tạo (đặc biệt khi ở chế độ chỉnh sửa)
  const computedInitialForm = useMemo(() => {
    if (isEditMode && initialData) {
      const items =
        initialData.items && initialData.items.length > 0
          ? initialData.items.map((item: VerificationItem) => ({
              ...item,
              itemType: normalizeItemType(item.itemType),
            }))
          : [getEmptyItem()];

      return {
        ...getEmptyForm(),
        ...initialData,
        inspectionDate: initialData.inspectionDate || "",
        items,
      };
    }

    return getEmptyForm();
  }, [initialData, isEditMode]);

  // Cập nhật các field cấp 1 của form
  const handleInputChange = (
    field: keyof CreateVerificationRequest,
    value: string
  ) => {
    setFormData((prev: CreateVerificationRequest) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mở modal sẽ load lại dữ liệu form + fetch camera/phụ kiện
  useEffect(() => {
    // Khi modal mở thì tải lại danh sách camera/phụ kiện
    if (!open) return;
    setFormData(computedInitialForm);
    (async () => {
      // Nếu context đã có danh sách camera thì ưu tiên dùng để tránh gọi API
      if (cameraCtx && Array.isArray(cameraCtx.cameras)) {
        const contextOptions = cameraCtx.cameras.map((camera) =>
          toDeviceOption({
            id: camera.id,
            brand: camera.brand,
            model: camera.model,
          })
        );
        if (contextOptions.length) setCameraOptions(contextOptions);
      }
      setCameraLoading(true);
      setAccessoryLoading(true);
      setCameraError(null);
      setAccessoryError(null);
      try {
        const camsResponse = await cameraService.getCamerasByOwner(1, 200);
        const options = (camsResponse?.items ?? []).map((camera) =>
          toDeviceOption({
            id: camera.id,
            brand: camera.brand,
            model: camera.model,
          })
        );
        setCameraOptions(options);
      } catch (err) {
        console.error("Lỗi tải camera:", err);
        setCameraOptions([]);
        setCameraError(
          err instanceof Error ? err.message : "Không thể tải danh sách camera"
        );
      } finally {
        setCameraLoading(false);
      }

      try {
        // Gọi API phụ kiện của chủ sở hữu (yêu cầu token)
        const accessories: Accessory[] =
          await accessoryService.getAccessoriesByOwnerId();
        const options = accessories.map((accessory) =>
          toDeviceOption({
            id: accessory.id,
            brand: accessory.brand,
            model: accessory.model,
          })
        );
        setAccessoryOptions(options);
      } catch (err) {
        console.error("Lỗi tải accessory:", err);
        setAccessoryOptions([]);
        setAccessoryError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách phụ kiện"
        );
      } finally {
        setAccessoryLoading(false);
      }
    })();
  }, [open, computedInitialForm, cameraCtx]);

  // Thêm một dòng thiết bị mới
  const handleAddItem = () => {
    setFormData((prev: CreateVerificationRequest) => ({
      ...prev,
      items: [...(prev.items || []), getEmptyItem()],
    }));
  };

  // Xóa thiết bị theo index
  const handleRemoveItem = (index: number) => {
    setFormData((prev: CreateVerificationRequest) => ({
      ...prev,
      items: prev.items.filter((_: VerificationItem, i: number) => i !== index),
    }));
  };

  // Cập nhật thông tin từng thiết bị (loại, id, tên hiển thị)
  const handleItemChange = (
    index: number,
    field: keyof VerificationItem,
    value: string
  ) => {
    setFormData((prev: CreateVerificationRequest) => {
      const newItems = [...(prev.items || [])];
      const item = { ...(newItems[index] || getEmptyItem()) };

      if (field === "itemType") {
        item.itemType = normalizeItemType(value);
        item.itemId = "";
        item.itemName = "";
      } else if (field === "itemId") {
        item.itemId = value;
      } else if (field === "itemName") {
        item.itemName = value;
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  // Validate và submit form lên parent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate
      if (!formData.name.trim()) {
        throw new Error("Vui lòng nhập tên");
      }
      if (!formData.phoneNumber.trim()) {
        throw new Error("Vui lòng nhập số điện thoại");
      }
      if (!formData.inspectionDate) {
        throw new Error("Vui lòng chọn ngày kiểm tra");
      }
      if (!formData.branchId) {
        throw new Error("Vui lòng chọn chi nhánh");
      }

      // Validate items
      if (!formData.items || formData.items.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một thiết bị");
      }
      for (const it of formData.items) {
        if (!it.itemId) {
          throw new Error("Vui lòng chọn tên cho tất cả thiết bị");
        }
      }

      // Chuyển đổi inspectionDate sang định dạng ISO 8601
      const submitData: CreateVerificationRequest = {
        ...formData,
        inspectionDate: new Date(formData.inspectionDate).toISOString(),
        items: formData.items || [],
      };

      await onSubmit(submitData);

      setMessage({
        type: "success",
        text: isEditMode
          ? "Cập nhật yêu cầu xác minh thành công!"
          : "Tạo yêu cầu xác minh thành công!",
      });

      // Reset form và đóng modal sau 1.5s
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo yêu cầu xác minh",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state khi đóng modal
  const handleClose = () => {
    setFormData(getEmptyForm());
    setMessage(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          pb: 2,
          pr: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: "#1E293B",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                bgcolor: "#FFF5F0",
                p: 1,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isEditMode ? (
                <SaveIcon sx={{ fontSize: 24, color: "#FF6B35" }} />
              ) : (
                <AddIcon sx={{ fontSize: 24, color: "#FF6B35" }} />
              )}
            </Box>
            {isEditMode ? "Cập Nhật Yêu Cầu Xác Minh" : "Tạo Yêu Cầu Xác Minh"}
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              color: "#64748B",
              "&:hover": {
                bgcolor: "#F1F5F9",
                color: "#1E293B",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, pb: 2, bgcolor: "#FFFFFF" }}>
          {message && (
            <Alert
              severity={message.type}
              sx={{
                mb: 3,
                borderRadius: 2,
                border:
                  message.type === "error"
                    ? "1px solid #FEE2E2"
                    : "1px solid #D1FAE5",
                "& .MuiAlert-icon": {
                  color: message.type === "error" ? "#EF4444" : "#10B981",
                },
              }}
            >
              {message.text}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Tên người yêu cầu"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                  "& fieldset": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                    borderWidth: 2,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              required
              disabled={isLoading}
              placeholder="0123456789"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                  "& fieldset": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                    borderWidth: 2,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Ngày kiểm tra"
              type="datetime-local"
              value={formData.inspectionDate}
              onChange={(e) =>
                handleInputChange("inspectionDate", e.target.value)
              }
              required
              disabled={isLoading}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                  "& fieldset": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                    borderWidth: 2,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              select
              label="Chi nhánh"
              value={formData.branchId}
              onChange={(e) => handleInputChange("branchId", e.target.value)}
              required
              disabled={isLoading || isLoadingBranches}
              helperText={
                isLoadingBranches ? "Đang tải danh sách chi nhánh..." : ""
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                  "& fieldset": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#FF6B35",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B35",
                    borderWidth: 2,
                  },
                },
              }}
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Danh sách nhiều thiết bị */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Danh sách thiết bị
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAddItem}
                  startIcon={<AddIcon />}
                >
                  Thêm
                </Button>
              </Box>

              {(formData.items || []).map((it, idx) => (
                <Stack key={idx} direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="Loại"
                    value={it.itemType}
                    onChange={(e) =>
                      handleItemChange(idx, "itemType", e.target.value)
                    }
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="Camera">Camera</MenuItem>
                    <MenuItem value="Accessory">Phụ kiện</MenuItem>
                  </TextField>

                  <TextField
                    select
                    size="small"
                    label="Chọn tên"
                    value={it.itemId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const isCamera =
                        it.itemType === "1" || it.itemType === "Camera";
                      const selected = (
                        isCamera ? cameraOptions : accessoryOptions
                      ).find((option) => option.id === selectedId);
                      handleItemChange(idx, "itemId", selectedId);
                      handleItemChange(
                        idx,
                        "itemName",
                        getDeviceLabel(selected)
                      );
                    }}
                    sx={{ flex: 1 }}
                    slotProps={{
                      select: {
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 48 * 5 + 8,
                            },
                          },
                        },
                      },
                    }}
                    helperText={
                      it.itemType === "1" || it.itemType === "Camera"
                        ? cameraLoading
                          ? "Đang tải camera..."
                          : cameraError
                          ? cameraError
                          : cameraOptions.length === 0
                          ? "Không có camera"
                          : ""
                        : accessoryLoading
                        ? "Đang tải phụ kiện..."
                        : accessoryError
                        ? accessoryError
                        : accessoryOptions.length === 0
                        ? "Không có phụ kiện"
                        : ""
                    }
                  >
                    {it.itemType === "1" || it.itemType === "Camera"
                      ? cameraOptions.length > 0
                        ? cameraOptions.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.brand} {c.model}
                            </MenuItem>
                          ))
                        : [
                            <MenuItem key="no-camera" value="" disabled>
                              Không có camera
                            </MenuItem>,
                          ]
                      : accessoryOptions.length > 0
                      ? accessoryOptions.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.brand} {a.model}
                          </MenuItem>
                        ))
                      : [
                          <MenuItem key="no-acc" value="" disabled>
                            Không có phụ kiện
                          </MenuItem>,
                        ]}
                  </TextField>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(idx)}
                  >
                    Xóa
                  </Button>
                </Stack>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 600,
              color: "#64748B",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#E2E8F0",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : isEditMode ? (
                <SaveIcon />
              ) : (
                <AddIcon />
              )
            }
            sx={{
              bgcolor: "#FF6B35",
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
              "&:hover": {
                bgcolor: "#E85D2A",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
              },
            }}
          >
            {isLoading
              ? isEditMode
                ? "Đang cập nhật..."
                : "Đang tạo..."
              : isEditMode
              ? "Cập nhật yêu cầu"
              : "Tạo yêu cầu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
