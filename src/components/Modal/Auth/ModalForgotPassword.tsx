import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
  initialEmail?: string;
};

export const ModalForgotPassword: React.FC<Props> = ({
  open,
  onClose,
  initialEmail = "",
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessageType("success");
      setMessage("Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    setLoading(false);
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
        Quên mật khẩu
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}
        >
          Nhập email tài khoản của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
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
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button onClick={handleClose} color="inherit">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !email}
              sx={{
                bgcolor: "#FF6B35",
                "&:hover": { bgcolor: "#E85D2A" },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Gửi yêu cầu"
              )}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};


