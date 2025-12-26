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

interface FormErrors {
  email?: string;
  phone?: string;
  password?: string;
  fullName?: string;
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateField = (
    field: keyof FormData,
    value: string
  ): string | undefined => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Họ và tên không được để trống";
        if (value.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
        if (value.trim().length > 30)
          return "Họ và tên không được vượt quá 30 ký tự";
        break;
      case "email": {
        if (!value.trim()) return "Vui lòng nhập email";
        const emailRegex =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,}))$/;
        if (!emailRegex.test(value.trim())) return "Email không hợp lệ";
        break;
      }

      case "phone":
        if (!value.trim()) return "Vui lòng nhập số điện thoại";
        if (!/^[0-9]+$/.test(value.trim()))
          return "Số điện thoại chỉ được chứa số";
        if (value.trim().length !== 10)
          return "Số điện thoại phải có đúng 10 chữ số";
        break;
      case "password": {
        if (!value) return "Mật khẩu không được để trống";
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
        if (value.length > 50) return "Mật khẩu không được vượt quá 50 ký tự";
        // Check for at least one letter and one number
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          return "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số";
        }
        break;
      }
    }
    return undefined;
  };

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Validate field on change
      const fieldError = validateField(field, value);
      setFormErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }));

      // Clear general error when user starts typing
      if (error) setError(null);
    };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    setFormErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Vui lòng kiểm tra và sửa các lỗi trong form");
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
          throw new Error(errorJson.message || "Thêm nhân viên thất bại");
        } catch {
          throw new Error(`Thêm nhân viên thất bại: ${response.status}`);
        }
      }

      // Success
      setFormData({
        email: "",
        phone: "",
        password: "",
        fullName: "",
      });
      setFormErrors({});
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding staff:", err);
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
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
      setFormErrors({});
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
            error={!!formErrors.fullName}
            helperText={formErrors.fullName}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: formErrors.fullName
                    ? "#f44336"
                    : colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: formErrors.fullName
                    ? "#f44336"
                    : colors.primary.main,
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
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: formErrors.email
                    ? "#f44336"
                    : colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: formErrors.email
                    ? "#f44336"
                    : colors.primary.main,
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
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: formErrors.phone
                    ? "#f44336"
                    : colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: formErrors.phone
                    ? "#f44336"
                    : colors.primary.main,
                },
              },
            }}
            slotProps={{ input: { inputProps: { maxLength: 10 } } }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Mật khẩu *"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            disabled={loading}
            placeholder="Tối thiểu 6 ký tự, chứa chữ và số"
            error={!!formErrors.password}
            helperText={formErrors.password}
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
                  borderColor: formErrors.password
                    ? "#f44336"
                    : colors.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: formErrors.password
                    ? "#f44336"
                    : colors.primary.main,
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
            color: "white",
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
