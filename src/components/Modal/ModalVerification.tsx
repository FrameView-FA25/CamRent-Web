import { useState } from "react";
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
import type { CreateVerificationRequest } from "../../services/verification.service";
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (
    field: keyof CreateVerificationRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

      // Chuyển đổi inspectionDate sang định dạng ISO 8601
      const submitData: CreateVerificationRequest = {
        ...formData,
        inspectionDate: new Date(formData.inspectionDate).toISOString(),
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
