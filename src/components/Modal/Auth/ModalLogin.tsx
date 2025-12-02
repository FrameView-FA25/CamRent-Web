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
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Login to rent premium camera gear
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
              placeholder="your@email.com"
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
              Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your password"
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
              Forgot Password?
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
              "Login"
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

          {/* Google button: outlined, border-gray-300, hover border black */}
          <Button
            type="button"
            variant="outlined"
            onClick={() => console.log("Google login")}
            sx={{
              borderWidth: 2,
              borderColor: "grey.300",
              color: "text.primary",
              fontWeight: 700,
              py: 1.2,
              borderRadius: 999,
              gap: 1.25,
              "&:hover": { borderColor: "black", bgcolor: "transparent" },
            }}
            startIcon={
              <Box component="span" sx={{ display: "inline-flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Box>
            }
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{" "}
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
                Sign Up
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
