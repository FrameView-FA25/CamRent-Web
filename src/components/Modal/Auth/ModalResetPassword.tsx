import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { authService } from "@/services/auth.service";

type Props = {
  open: boolean;
  onClose: () => void;
  email: string;
  token: string;
};

export const ModalResetPassword: React.FC<Props> = ({
  open,
  onClose,
  email,
  token,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !token) {
      setMessageType("error");
      setMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(email, token, newPassword);
      setMessageType("success");
      setMessage("Đặt lại mật khẩu thành công, đang chuyển về trang chủ...");
      // Cho phép page bên ngoài xử lý điều hướng khi đóng modal
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi đặt lại mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    setNewPassword("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
        Đặt lại mật khẩu
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}
        >
          Nhập mật khẩu mới cho tài khoản của bạn.
        </Typography>

        {message && (
          <Alert
            severity={messageType}
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            InputProps={{ readOnly: true }}
          />

          <TextField
            fullWidth
            label="Mật khẩu mới"
            type="password"
            margin="normal"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !newPassword}
              sx={{
                bgcolor: "#FF6B35",
                "&:hover": {
                  bgcolor: "#E85D2A",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};


