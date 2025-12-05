import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { X } from "lucide-react";
import { userService, type User } from "../../../services/user.service";
import { toast } from "react-toastify";

interface UpdateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

interface FormData {
  phone: string;
  fullName: string;
}

const UpdateUserDialog: React.FC<UpdateUserDialogProps> = ({
  open,
  onClose,
  onSuccess,
  user,
}) => {
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user data when dialog opens
  useEffect(() => {
    if (user && open) {
      setFormData({
        phone: user.phone || "",
        fullName: user.fullName || "",
      });
      setError(null);
    }
  }, [user, open]);

  const handleChange =
    (field: keyof FormData) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } }
    ) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const validateForm = (): string | null => {
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại";
    if (!formData.fullName.trim()) return "Vui lòng nhập họ và tên";
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await userService.updateUser(user.id, {
        phone: formData.phone,
        fullName: formData.fullName,
        status: user.status, // Giữ nguyên status hiện tại của user
      });

      toast.success("Cập nhật thông tin người dùng thành công!");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật thông tin người dùng";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          color: "#1F2937",
        }}
      >
        Cập nhật thông tin người dùng
        <IconButton onClick={handleClose} disabled={loading}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Full Name */}
          <TextField
            fullWidth
            label="Họ và tên *"
            value={formData.fullName}
            onChange={handleChange("fullName")}
            disabled={loading}
            placeholder="Nguyễn Văn A"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#DC2626",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#DC2626",
                },
              },
            }}
          />

          {/* Phone */}
          <TextField
            fullWidth
            label="Số điện thoại *"
            value={formData.phone}
            onChange={handleChange("phone")}
            disabled={loading}
            placeholder="0912345678"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#DC2626",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#DC2626",
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: "#DC2626",
            "&:hover": { bgcolor: "#B91C1C" },
            minWidth: 120,
            textTransform: "none",
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Cập nhật"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserDialog;
