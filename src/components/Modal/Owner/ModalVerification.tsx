import { useState, useEffect, useMemo } from "react";
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Extension as AccessoryIcon,
} from "@mui/icons-material";
import type {
  CreateVerificationRequest,
  VerificationItem,
  UnverifiedDevice,
  VerificationItemType,
} from "../../../types/verification.types";
import { verificationService } from "../../../services/verification.service";
import type { Branch } from "../../../types/branch.types";

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  inspectionDate?: string;
  branchId?: string;
  items?: string;
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

// Khởi tạo form rỗng mặc định
const getEmptyForm = (): CreateVerificationRequest => ({
  name: "",
  phoneNumber: "",
  inspectionDate: "",
  notes: "",
  branchId: "",
  items: [],
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
  // Danh sách thiết bị chưa xác minh từ API mới
  const [unverifiedDevices, setUnverifiedDevices] = useState<
    UnverifiedDevice[]
  >([]);
  // Danh sách ID thiết bị được chọn
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(
    new Set()
  );
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Chuẩn hóa dữ liệu khởi tạo (đặc biệt khi ở chế độ chỉnh sửa)
  const computedInitialForm = useMemo(() => {
    if (isEditMode && initialData) {
      const items =
        initialData.items && initialData.items.length > 0
          ? initialData.items.map((item: VerificationItem) => ({
              ...item,
              itemType: normalizeItemType(item.itemType),
            }))
          : [];

      return {
        ...getEmptyForm(),
        ...initialData,
        inspectionDate: initialData.inspectionDate || "",
        items,
      };
    }

    return getEmptyForm();
  }, [initialData, isEditMode]);

  // Lọc thiết bị theo loại
  const cameraOptions = useMemo(
    () => unverifiedDevices.filter((device) => device.itemType === "Camera"),
    [unverifiedDevices]
  );

  const accessoryOptions = useMemo(
    () => unverifiedDevices.filter((device) => device.itemType === "Accessory"),
    [unverifiedDevices]
  );

  // Cập nhật các field cấp 1 của form
  const handleInputChange = (
    field: keyof CreateVerificationRequest,
    value: string
  ) => {
    setFormData((prev: CreateVerificationRequest) => ({
      ...prev,
      [field]: value,
    }));

    // Validate realtime cho một số field cơ bản
    setErrors((prev) => {
      const next: FormErrors = { ...prev };

      if (field === "name") {
        const trimmed = value.trim();
        if (!trimmed) {
          next.name = "Vui lòng nhập tên";
        } else if (trimmed.length < 3) {
          next.name = "Tên phải có ít nhất 3 ký tự";
        } else {
          next.name = undefined;
        }
      } else if (field === "inspectionDate") {
        next.inspectionDate = undefined;
      } else if (field === "branchId") {
        next.branchId = undefined;
      } else if (field === "phoneNumber") {
        next.phoneNumber = undefined;
      }

      return next;
    });
  };

  // Xử lý riêng cho số điện thoại: chỉ cho nhập số, giới hạn độ dài
  const handlePhoneNumberChange = (value: string) => {
    // Loại bỏ mọi ký tự không phải số
    const numeric = value.replace(/\D/g, "");
    // Giới hạn 10 ký tự
    const limited = numeric.slice(0, 10);

    setFormData((prev: CreateVerificationRequest) => ({
      ...prev,
      phoneNumber: limited,
    }));

    // Validate realtime cho số điện thoại
    let phoneError: string | undefined;
    if (!limited) {
      phoneError = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(limited)) {
      phoneError = "Số điện thoại phải có 10 số và bắt đầu bằng 0";
    }

    setErrors((prev) => ({
      ...prev,
      phoneNumber: phoneError,
    }));
  };

  // Xử lý chọn/bỏ chọn thiết bị
  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDeviceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });

    // Xóa lỗi items khi đã chọn ít nhất 1 thiết bị
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: undefined }));
    }
  };

  // Xử lý chọn tất cả camera
  const handleSelectAllCameras = (checked: boolean) => {
    setSelectedDeviceIds((prev) => {
      const newSet = new Set(prev);
      cameraOptions.forEach((device) => {
        if (checked) {
          newSet.add(device.itemId);
        } else {
          newSet.delete(device.itemId);
        }
      });
      return newSet;
    });
  };

  // Xử lý chọn tất cả phụ kiện
  const handleSelectAllAccessories = (checked: boolean) => {
    setSelectedDeviceIds((prev) => {
      const newSet = new Set(prev);
      accessoryOptions.forEach((device) => {
        if (checked) {
          newSet.add(device.itemId);
        } else {
          newSet.delete(device.itemId);
        }
      });
      return newSet;
    });
  };

  // Xóa một thiết bị đã chọn từ Chip
  const handleRemoveDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(deviceId);
      return newSet;
    });
  };

  // Mở modal sẽ load lại dữ liệu form + fetch danh sách thiết bị chưa xác minh
  useEffect(() => {
    if (!open) return;

    setFormData(computedInitialForm);

    // Khôi phục danh sách thiết bị đã chọn khi edit
    if (isEditMode && initialData?.items) {
      const initialIds = new Set(
        initialData.items.map((item) => item.itemId).filter(Boolean)
      );
      setSelectedDeviceIds(initialIds);
    } else {
      setSelectedDeviceIds(new Set());
    }

    const fetchUnverifiedDevices = async () => {
      setDevicesLoading(true);
      setDevicesError(null);

      try {
        const devices = await verificationService.getOwnerUnverifiedDevices();
        setUnverifiedDevices(devices);
      } catch (err) {
        console.error("Lỗi tải danh sách thiết bị:", err);
        setUnverifiedDevices([]);
        setDevicesError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách thiết bị chưa xác minh"
        );
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchUnverifiedDevices();
  }, [open, computedInitialForm, isEditMode, initialData]);

  // Validate toàn bộ form, trả về true nếu hợp lệ
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 số và bắt đầu bằng 0";
    }

    if (!formData.inspectionDate) {
      newErrors.inspectionDate = "Vui lòng chọn ngày kiểm tra";
    }

    if (!formData.branchId) {
      newErrors.branchId = "Vui lòng chọn chi nhánh";
    }

    if (selectedDeviceIds.size === 0) {
      newErrors.items = "Vui lòng chọn ít nhất một thiết bị";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate và submit form lên parent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Chuyển đổi selectedDeviceIds thành items array
      const items: VerificationItem[] = Array.from(selectedDeviceIds)
        .map((deviceId) => {
          const device = unverifiedDevices.find((d) => d.itemId === deviceId);
          if (!device) return null;
          return {
            itemId: device.itemId,
            itemName: device.itemName,
            itemType: device.itemType as VerificationItemType,
          };
        })
        .filter((item): item is VerificationItem => item !== null);

      // Chuyển đổi inspectionDate sang định dạng ISO 8601
      const submitData: CreateVerificationRequest = {
        ...formData,
        inspectionDate: new Date(formData.inspectionDate).toISOString(),
        items,
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
    setSelectedDeviceIds(new Set());
    setMessage(null);
    setIsLoading(false);
    setErrors({});
    onClose();
  };

  // Kiểm tra xem tất cả camera có được chọn không
  const allCamerasSelected =
    cameraOptions.length > 0 &&
    cameraOptions.every((device) => selectedDeviceIds.has(device.itemId));

  // Kiểm tra xem tất cả phụ kiện có được chọn không
  const allAccessoriesSelected =
    accessoryOptions.length > 0 &&
    accessoryOptions.every((device) => selectedDeviceIds.has(device.itemId));

  // Danh sách thiết bị đã chọn để hiển thị
  const selectedDevices = useMemo(() => {
    return Array.from(selectedDeviceIds)
      .map((id) => unverifiedDevices.find((d) => d.itemId === id))
      .filter((device): device is UnverifiedDevice => device !== undefined);
  }, [selectedDeviceIds, unverifiedDevices]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
            <Box sx={{ display: "flex", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Tên người yêu cầu"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name || " "}
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
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                error={Boolean(errors.phoneNumber)}
                helperText={errors.phoneNumber || " "}
                disabled={isLoading}
                placeholder="0123456789"
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
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
            </Box>
            <Box sx={{ display: "flex", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Ngày kiểm tra"
                type="datetime-local"
                value={formData.inspectionDate}
                onChange={(e) =>
                  handleInputChange("inspectionDate", e.target.value)
                }
                error={Boolean(errors.inspectionDate)}
                helperText={errors.inspectionDate || " "}
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
                error={Boolean(errors.branchId)}
                disabled={isLoading || isLoadingBranches}
                helperText={
                  errors.branchId ||
                  (isLoadingBranches ? "Đang tải danh sách chi nhánh..." : "")
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
            </Box>

            {/* Danh sách thiết bị đã chọn */}
            {selectedDevices.length > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                  Đã chọn ({selectedDevices.length} thiết bị)
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedDevices.map((device) => (
                    <Chip
                      key={device.itemId}
                      icon={
                        device.itemType === "Camera" ? (
                          <CameraIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <AccessoryIcon sx={{ fontSize: 18 }} />
                        )
                      }
                      label={device.itemName}
                      onDelete={() => handleRemoveDevice(device.itemId)}
                      color={
                        device.itemType === "Camera" ? "primary" : "secondary"
                      }
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Danh sách thiết bị để chọn */}
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
                  Chọn thiết bị cần xác minh
                </Typography>
              </Box>

              {devicesError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {devicesError}
                </Alert>
              )}

              {devicesLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>
                    Đang tải danh sách thiết bị...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#F8FAFC",
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
                  {/* Camera Section */}
                  {cameraOptions.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "#1976D2",
                          }}
                        >
                          <CameraIcon sx={{ fontSize: 20 }} />
                          Camera ({cameraOptions.length})
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allCamerasSelected}
                              onChange={(e) =>
                                handleSelectAllCameras(e.target.checked)
                              }
                              disabled={isLoading}
                              size="small"
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                              Chọn tất cả
                            </Typography>
                          }
                        />
                      </Box>
                      <Divider sx={{ mb: 1.5 }} />
                      <FormGroup>
                        {cameraOptions.map((device) => (
                          <FormControlLabel
                            key={device.itemId}
                            control={
                              <Checkbox
                                checked={selectedDeviceIds.has(device.itemId)}
                                onChange={() =>
                                  handleDeviceToggle(device.itemId)
                                }
                                disabled={isLoading}
                              />
                            }
                            label={device.itemName}
                            sx={{
                              "&:hover": {
                                bgcolor: "#EFF6FF",
                                borderRadius: 1,
                              },
                              px: 1,
                              py: 0.5,
                            }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}

                  {/* Accessory Section */}
                  {accessoryOptions.length > 0 && (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "#9C27B0",
                          }}
                        >
                          <AccessoryIcon sx={{ fontSize: 20 }} />
                          Phụ kiện ({accessoryOptions.length})
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allAccessoriesSelected}
                              onChange={(e) =>
                                handleSelectAllAccessories(e.target.checked)
                              }
                              disabled={isLoading}
                              size="small"
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                              Chọn tất cả
                            </Typography>
                          }
                        />
                      </Box>
                      <Divider sx={{ mb: 1.5 }} />
                      <FormGroup>
                        {accessoryOptions.map((device) => (
                          <FormControlLabel
                            key={device.itemId}
                            control={
                              <Checkbox
                                checked={selectedDeviceIds.has(device.itemId)}
                                onChange={() =>
                                  handleDeviceToggle(device.itemId)
                                }
                                disabled={isLoading}
                              />
                            }
                            label={device.itemName}
                            sx={{
                              "&:hover": {
                                bgcolor: "#F3E5F5",
                                borderRadius: 1,
                              },
                              px: 1,
                              py: 0.5,
                            }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}

                  {/* No devices available */}
                  {cameraOptions.length === 0 &&
                    accessoryOptions.length === 0 && (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                        }}
                      >
                        <Typography color="text.secondary">
                          Không có thiết bị chưa xác minh
                        </Typography>
                      </Box>
                    )}
                </Box>
              )}

              {errors.items && (
                <Typography
                  sx={{
                    color: "#EF4444",
                    fontSize: 12,
                    mt: 0.5,
                    ml: 1.5,
                  }}
                >
                  {errors.items}
                </Typography>
              )}
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
            disabled={isLoading || devicesLoading}
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
