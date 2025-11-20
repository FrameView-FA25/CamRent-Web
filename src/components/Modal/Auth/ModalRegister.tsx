import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { X, Eye, EyeOff, Camera, User, Store } from "lucide-react";
import { authService } from "../../../services/auth.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

const ModalRegister: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"renter" | "owner">("renter");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        fullName: fullName.trim(),
        role: accountType === "owner" ? 0 : 0, // Role theo API spec
      };

      if (accountType === "owner") {
        await authService.registerOwner(registerData);
      } else {
        await authService.register(registerData);
      }

      setSuccess(
        `Đăng ký ${
          accountType === "owner" ? "Owner" : "Renter"
        } thành công! Vui lòng đăng nhập.`
      );

      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirm("");

      // Chuyển sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        onSuccess?.();
        onSwitchToLogin?.();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="register-title"
      PaperProps={{
        sx: { borderRadius: 4, maxWidth: 480, width: "100%", boxShadow: 24 },
      }}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.5)" } } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 5 } }}>
        <IconButton
          onClick={onClose}
          aria-label="Close register modal"
          sx={{ position: "absolute", right: 12, top: 12, color: "grey.500" }}
        >
          <X size={22} />
        </IconButton>

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              bgcolor: "black",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Camera color="#FACC15" size={32} />
          </Box>
          <Typography
            id="register-title"
            variant="h4"
            fontWeight={700}
            color="text.primary"
            gutterBottom
          >
            Tạo tài khoản
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tham gia CamRent để thuê thiết bị cao cấp
          </Typography>
        </Box>

        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={accountType}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setAccountType(newValue);
                setError(null);
              }
            }}
            aria-label="account type"
            sx={{
              "& .MuiToggleButton-root": {
                px: 3,
                py: 1,
                border: "2px solid #E5E7EB",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&.Mui-selected": {
                  bgcolor: "#FACC15",
                  color: "#111827",
                  borderColor: "#FACC15",
                  "&:hover": {
                    bgcolor: "#EAB308",
                  },
                },
                "&:not(.Mui-selected)": {
                  color: "#6B7280",
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                  },
                },
              },
            }}
          >
            <ToggleButton value="renter" aria-label="renter">
              <User size={18} style={{ marginRight: 8 }} />
              Người thuê
            </ToggleButton>
            <ToggleButton value="owner" aria-label="owner">
              <Store size={18} style={{ marginRight: 8 }} />
              Chủ thiết bị
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{ display: "grid", rowGap: 2.5 }}
        >
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Họ và tên <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Email <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Số điện thoại <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              type="tel"
              placeholder="0123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Mật khẩu <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Xác nhận mật khẩu <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              disabled={loading}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={loading}
            sx={{
              bgcolor: "#FACC15",
              color: "#111827",
              fontWeight: 700,
              py: 1.25,
              borderRadius: 999,
              "&:hover": { bgcolor: "#EAB308" },
              "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#9CA3AF" }} />
            ) : (
              "Tạo tài khoản"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{" "}
              <Typography
                component="button"
                type="button"
                onClick={onSwitchToLogin}
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  background: "none",
                  border: 0,
                  p: 0,
                  cursor: "pointer",
                  "&:hover": { color: "#F59E0B" },
                }}
              >
                Đăng nhập
              </Typography>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalRegister;
