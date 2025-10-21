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
} from "@mui/material";
import { X, Eye, EyeOff, Camera } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    name: string;
    email: string;
    password: string;
  }) => void;
  onSwitchToLogin?: () => void;
};

const ModalRegister: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      // bạn có thể thay thành toast / helperText tuỳ ý
      alert("Passwords do not match");
      return;
    }
    onSubmit?.({ name, email, password });
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
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join CamRent and start renting premium gear
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{ display: "grid", rowGap: 2.5 }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Full name
            </Typography>
            <TextField
              fullWidth
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
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

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Confirm password
            </Typography>
            <TextField
              fullWidth
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={showPassword ? "text" : "password"}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#FACC15",
              color: "#111827",
              fontWeight: 700,
              py: 1.25,
              borderRadius: 999,
              "&:hover": { bgcolor: "#EAB308" },
            }}
          >
            Create account
          </Button>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            type="button"
            variant="outlined"
            onClick={() => console.log("Google signup")}
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
            Sign up with Google
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
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
                Login
              </Typography>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalRegister;
