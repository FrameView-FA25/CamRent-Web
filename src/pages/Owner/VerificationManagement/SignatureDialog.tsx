import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import SignatureCanvas from "react-signature-canvas";

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  signatureRef: React.RefObject<SignatureCanvas | null>;
  onClear: () => void;
  onSave: () => void;
}

export const OwnerSignatureDialog: React.FC<SignatureDialogProps> = ({
  open,
  onClose,
  signatureRef,
  onClear,
  onSave,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: "#1F2937",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        Ký hợp đồng (Chủ sở hữu)
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
          Vui lòng ký tên của bạn vào khung bên dưới để xác nhận hợp đồng xác
          minh thiết bị.
        </Typography>
        <Box
          sx={{
            border: "2px dashed #E5E7EB",
            borderRadius: 2,
            bgcolor: "#F9FAFB",
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            "&:hover": {
              borderColor: "#F97316",
              bgcolor: "#FFF7ED",
            },
          }}
        >
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 700,
              height: 300,
              style: {
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                backgroundColor: "white",
              },
            }}
            penColor="#1F2937"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: "1px solid #E5E7EB" }}>
        <Button
          onClick={onClear}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Xóa chữ ký
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={<CheckCircle />}
          sx={{
            bgcolor: "#F97316",
            "&:hover": {
              bgcolor: "#EA580C",
            },
          }}
        >
          Xác nhận ký
        </Button>
      </DialogActions>
    </Dialog>
  );
};


