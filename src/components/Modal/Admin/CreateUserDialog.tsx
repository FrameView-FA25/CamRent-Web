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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!formData.email.trim()) return "Vui lòng nhập email";
    if (!formData.email.includes("@")) return "Email không hợp lệ";
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại";
    if (!formData.password.trim()) return "Vui lòng nhập mật khẩu";
    if (formData.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (!formData.fullName.trim()) return "Vui lòng nhập họ và tên";
    if (!formData.role) return "Vui lòng chọn vai trò";
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

      await userService.createUser(formData);

      toast.success("Tạo người dùng mới thành công!");

      // Reset form
      setFormData({
        email: "",
        phone: "",
        password: "",
        fullName: "",
        role: "Staff",
      });
      setShowPassword(false);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo người dùng mới";
      setError(errorMessage);
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
      setShowPassword(false);
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
        Tạo người dùng mới
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

          {/* Email */}
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            disabled={loading}
            placeholder="user@example.com"
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

          {/* Role */}
          <FormControl fullWidth>
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
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  "&:hover": {
                    borderColor: "#DC2626",
                  },
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DC2626",
                },
              }}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {getRoleLabel(role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Password */}
          <TextField
            fullWidth
            label="Mật khẩu tạm *"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            disabled={loading}
            placeholder="Tối thiểu 6 ký tự"
            helperText="Mật khẩu tạm, người dùng sẽ được yêu cầu đổi mật khẩu sau khi đăng nhập"
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
            "Tạo người dùng"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
