import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { X, Eye, EyeOff } from "lucide-react";
import { colors } from "../../../theme/colors";

interface AddStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.email.includes("@")) return "Invalid email format";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.fullName.trim()) return "Full name is required";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/Branchs/StaffRegister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Add staff error:", errorText);

        // Try to parse error message
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Failed to add staff");
        } catch {
          throw new Error(`Failed to add staff: ${response.status}`);
        }
      }

      // Success
      setFormData({
        email: "",
        phone: "",
        password: "",
        fullName: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding staff:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: "",
        phone: "",
        password: "",
        fullName: "",
      });
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
          color: colors.text.primary,
        }}
      >
        Thêm nhân viên mới
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
                  borderColor: colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary.main,
                },
              },
            }}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            disabled={loading}
            placeholder="staff@example.com"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary.main,
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
                  borderColor: colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary.main,
                },
              },
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Mật khẩu *"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            disabled={loading}
            placeholder="Tối thiểu 6 ký tự"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary.main,
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
            bgcolor: colors.primary.main,
            "&:hover": { bgcolor: colors.primary.dark },
            minWidth: 120,
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Thêm nhân viên"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStaffDialog;
