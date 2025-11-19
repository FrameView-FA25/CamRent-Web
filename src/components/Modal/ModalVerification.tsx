import { useState, useEffect, useContext } from "react";
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
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import type {
  CreateVerificationRequest,
  VerificationItem,
} from "../../types/verification.types";
import { cameraService } from "../../services/camera.service";
import { accessoryService } from "../../services/accessory.service";
import { CameraContext } from "../../context/CameraContexts/CameraContext.types";
import type { Branch } from "../../types/branch.types";

interface ModalVerificationProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVerificationRequest) => Promise<void>;
  branches: Branch[];
  isLoadingBranches: boolean;
}

export default function ModalVerification({
  open,
  onClose,
  onSubmit,
  branches,
  isLoadingBranches,
}: ModalVerificationProps) {
  const [formData, setFormData] = useState<CreateVerificationRequest>({
    name: "",
    phoneNumber: "",
    inspectionDate: "",
    notes: "",
    branchId: "",
    items: [{ itemId: "", itemName: "", itemType: 1 }],
  });
  const [cameraOptions, setCameraOptions] = useState<any[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<any[]>([]);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [accessoryLoading, setAccessoryLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [accessoryError, setAccessoryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Try to read camera context if available (safe: useContext returns undefined if provider not present)
  const cameraCtx = useContext(CameraContext);

  const handleInputChange = (
    field: keyof CreateVerificationRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    // load camera & accessory lists when modal opens
    if (!open) return;
    (async () => {
      // If camera context already has cameras, use them to avoid extra fetch
      if (
        cameraCtx &&
        Array.isArray(cameraCtx.cameras) &&
        cameraCtx.cameras.length > 0
      ) {
        setCameraOptions(cameraCtx.cameras);
      }
      setCameraLoading(true);
      setAccessoryLoading(true);
      setCameraError(null);
      setAccessoryError(null);
      try {
        const cams = await cameraService.getCamerasByOwner(1, 200);
        console.log("camera fetch result:", cams);
        // Accept multiple possible shapes from API
        if (cams && (cams as any).items && Array.isArray((cams as any).items)) {
          setCameraOptions((cams as any).items);
        } else if (Array.isArray(cams)) {
          setCameraOptions(cams as any);
        } else if (
          (cams as any).cameras &&
          Array.isArray((cams as any).cameras)
        ) {
          setCameraOptions((cams as any).cameras);
        } else if ((cams as any).data && Array.isArray((cams as any).data)) {
          setCameraOptions((cams as any).data);
        } else {
          // fallback: try to extract any array in object
          const arr = Object.values(cams || {}).find((v) => Array.isArray(v));
          setCameraOptions(Array.isArray(arr) ? (arr as any) : []);
        }
      } catch (err: any) {
        console.error("Lỗi tải camera:", err);
        setCameraOptions([]);
        setCameraError(err?.message || "Không thể tải danh sách camera");
      } finally {
        setCameraLoading(false);
      }

      try {
        // Use accessoryService owner endpoint (requires token) to get owner's accessories
        const acc = await accessoryService.getAccessoriesByOwnerId();
        console.log("accessory fetch result:", acc);
        if (acc && Array.isArray(acc)) {
          setAccessoryOptions(acc as any[]);
        } else if (
          acc &&
          (acc as any).items &&
          Array.isArray((acc as any).items)
        ) {
          setAccessoryOptions((acc as any).items);
        } else if ((acc as any).data && Array.isArray((acc as any).data)) {
          setAccessoryOptions((acc as any).data);
        } else {
          const arr = Object.values(acc || {}).find((v) => Array.isArray(v));
          setAccessoryOptions(Array.isArray(arr) ? (arr as any) : []);
        }
      } catch (err: any) {
        console.error("Lỗi tải accessory:", err);
        setAccessoryOptions([]);
        setAccessoryError(err?.message || "Không thể tải danh sách phụ kiện");
      } finally {
        setAccessoryLoading(false);
      }
    })();
  }, [open]);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { itemId: "", itemName: "", itemType: 1 } as VerificationItem,
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof VerificationItem,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      const item = {
        ...(newItems[index] || { itemId: "", itemName: "", itemType: 1 }),
      } as any;
      item[field] = value;
      // if user changed itemType, clear itemId/name
      if (field === "itemType") {
        item.itemId = "";
        item.itemName = "";
      }
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

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
        text: "Tạo yêu cầu xác minh thành công!",
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

  const handleClose = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      inspectionDate: "",
      notes: "",
      branchId: "",
      items: [],
    });
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
              <AddIcon sx={{ fontSize: 24, color: "#FF6B35" }} />
            </Box>
            Tạo Yêu Cầu Xác Minh
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
              InputLabelProps={{ shrink: true }}
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

            <TextField
              fullWidth
              label="Ghi chú"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              multiline
              rows={3}
              disabled={isLoading}
              placeholder="Nhập ghi chú nếu có..."
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

            {/* Items: multiple */}
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
                      handleItemChange(idx, "itemType", Number(e.target.value))
                    }
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value={1}>Camera</MenuItem>
                    <MenuItem value={2}>Phụ kiện</MenuItem>
                  </TextField>

                  <TextField
                    select
                    size="small"
                    label="Chọn tên"
                    value={it.itemId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (it.itemType === 1) {
                        const selected = cameraOptions.find(
                          (c) => c.id === selectedId
                        );
                        handleItemChange(idx, "itemId", selectedId);
                        handleItemChange(
                          idx,
                          "itemName",
                          selected ? `${selected.brand} ${selected.model}` : ""
                        );
                      } else {
                        const selected = accessoryOptions.find(
                          (a) => a.id === selectedId
                        );
                        handleItemChange(idx, "itemId", selectedId);
                        handleItemChange(
                          idx,
                          "itemName",
                          selected ? `${selected.brand} ${selected.model}` : ""
                        );
                      }
                    }}
                    sx={{ flex: 1 }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          style: { maxHeight: 48 * 5 + 8 }, // show ~5 items, with small padding
                        },
                      },
                    }}
                    helperText={
                      it.itemType === 1
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
                    {it.itemType === 1
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
            {isLoading ? "Đang tạo..." : "Tạo yêu cầu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
