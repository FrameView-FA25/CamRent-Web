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
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { X, Eye, EyeOff, Camera } from "lucide-react";
import { authService } from "../../../services/auth.service";
import { colors } from "../../../theme/colors";
import { decodeToken } from "../../../utils/decodeToken";
import { ModalForgotPassword } from "./ModalForgotPassword";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
};

const ModalLogin: React.FC<Props> = ({
  open,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForgot, setOpenForgot] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // authService.login sẽ tự động lưu data vào localStorage
      const response = await authService.login({ email, password });

      console.log("Login successful:", response);

      // Decode token để lấy userID và thông tin khác
      const decodedToken = decodeToken(response.token);

      if (decodedToken) {
        console.log("Decoded Token:", decodedToken);
        console.log(
          "User ID:",
          decodedToken.userId || decodedToken.id || decodedToken.sub
        );

        // Lưu userID vào localStorage nếu cần
        const userId =
          decodedToken.userId || decodedToken.id || decodedToken.sub;
        if (userId) {
          localStorage.setItem("userId", userId);
        }
      }

      // Reset form
      setEmail("");
      setPassword("");

      // Đóng modal
      onClose();

      // Gọi callback để điều hướng
      setTimeout(() => {
        onLoginSuccess?.();
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-title"
      PaperProps={{
        sx: {
          borderRadius: 4, // ~ rounded-2xl
          maxWidth: 480,
          width: "100%",
          boxShadow: 24, // ~ shadow-2xl
        },
      }}
      slotProps={{
        backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.5)" } }, // bg-black/50
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 5 } }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          aria-label="Close login modal"
          sx={{ position: "absolute", right: 12, top: 12, color: "grey.500" }}
        >
          <X size={22} />
        </IconButton>

        {/* Logo + Heading */}
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
            <Camera color={colors.primary.main} size={32} />
          </Box>
          <Typography
            id="login-title"
            variant="h4"
            fontWeight={700}
            color="text.primary"
            gutterBottom
          >
            Chào mừng trở lại
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Đăng nhập để thuê thiết bị cao cấp
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ display: "grid", rowGap: 2.5 }}
        >
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="abcd@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              Mật khẩu
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Button
              variant="text"
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "#F59E0B" } }}
              onClick={() => {
                setOpenForgot(true);
              }}
            >
              Quên mật khẩu
            </Button>
          </Box>

          {/* Login button: yellow rounded-full */}
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={loading || !email || !password}
            sx={{
              bgcolor: colors.primary.main,
              color: "#111827",
              fontWeight: 700,
              py: 1.25,
              borderRadius: 999,
              "&:hover": { bgcolor: colors.primary.light },
              "&:disabled": {
                bgcolor: colors.primary.light,
                color: "#000000",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#111827" }} />
            ) : (
              "Đăng nhập"
            )}
          </Button>

          {/* OR divider */}
          <Box sx={{ position: "relative", my: 1.5 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa có tài khoản?{" "}
              <Typography
                component="button"
                type="button"
                onClick={onSwitchToRegister}
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
                Đăng ký
              </Typography>
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Modal quên mật khẩu */}
      <ModalForgotPassword
        open={openForgot}
        onClose={() => setOpenForgot(false)}
        initialEmail={email}
      />
    </Dialog>
  );
};

export default ModalLogin;
