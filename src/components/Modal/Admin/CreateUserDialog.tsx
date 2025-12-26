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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { X, Eye, EyeOff } from "lucide-react";
import {
  userService,
  type CreateUserRequest,
} from "../../../services/user.service";
import { getRoleLabel } from "../../../utils/roleUtils";
import { toast } from "react-toastify";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: CreateUserRequest["role"];
}

const ROLE_OPTIONS: CreateUserRequest["role"][] = [
  "Staff",
  "BranchManager",
  "Owner",
  "Renter",
  "Admin",
  "Guest",
];

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
    fullName: "",
    role: "Staff",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (field: keyof FormData, value: string) => {
    switch (field) {
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

      case "password":
        if (!value.trim()) return "Vui lòng nhập mật khẩu";
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
        break;

      case "fullName":
        if (!value.trim()) return "Vui lòng nhập họ và tên";
        break;

      default:
        return;
    }
  };

  const handleChange =
    (field: keyof FormData) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } }
    ) => {
      const value = String(e.target.value);

      setFormData((prev) => ({ ...prev, [field]: value }));

      const message = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: message || "" }));
    };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    (Object.keys(formData) as (keyof FormData)[]).forEach((field) => {
      const msg = validateField(field, formData[field]);
      if (msg) newErrors[field] = msg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await userService.createUser(formData);

      toast.success("Tạo người dùng mới thành công!");

      setFormData({
        email: "",
        phone: "",
        password: "",
        fullName: "",
        role: "Staff",
      });
      setErrors({});
      setShowPassword(false);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo người dùng mới";

      toast.error(errorMessage);
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
        role: "Staff",
      });
      setErrors({});
      setShowPassword(false);
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
        Tạo người dùng mới
        <IconButton onClick={handleClose} disabled={loading}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            fullWidth
            label="Họ và tên *"
            value={formData.fullName}
            onChange={handleChange("fullName")}
            error={!!errors.fullName}
            helperText={errors.fullName}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Số điện thoại *"
            value={formData.phone}
            onChange={handleChange("phone")}
            error={!!errors.phone}
            helperText={errors.phone}
            disabled={loading}
            slotProps={{ input: { inputProps: { maxLength: 10 } } }}
          />

          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Vai trò *</InputLabel>
            <Select
              value={formData.role}
              label="Vai trò *"
              onChange={(e) =>
                handleChange("role")({
                  target: { value: e.target.value },
                })
              }
              disabled={loading}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {getRoleLabel(role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Mật khẩu tạm *"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            error={!!errors.password}
            helperText={
              errors.password ||
              "Mật khẩu tạm, người dùng sẽ được yêu cầu đổi mật khẩu sau khi đăng nhập"
            }
            disabled={loading}
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
            bgcolor: "#FF5722",
            "&:hover": { bgcolor: "#F4511E" },
            minWidth: 120,
            textTransform: "none",
            color: "white",
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Tạo người dùng"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
