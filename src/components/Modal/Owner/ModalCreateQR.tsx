import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  QrCode2 as QrCode2Icon,
  Download as DownloadIcon,
} from "@mui/icons-material";

interface ModalQRCodeProps {
  open: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  cameraId: string;
}

export default function ModalCreateQRCode({
  open,
  onClose,
  qrCodeUrl,
  cameraId,
}: ModalQRCodeProps) {
  // Hàm download QR code
  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `camera-qr-${cameraId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#FF6B35",
          color: "#FFFFFF",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCode2Icon />
          <Typography variant="h6" fontWeight={700}>
            QR Code
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#FFFFFF",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ p: 1, my: 2, textAlign: "center", bgcolor: "#F8FAFC" }}
      >
        {qrCodeUrl && (
          <Box>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                p: 2,
                borderRadius: 2,
                border: "2px solid #E2E8F0",
                display: "inline-block",
              }}
            >
              <img
                src={qrCodeUrl}
                alt="Camera QR Code"
                style={{ display: "block", width: "300px", height: "300px" }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 2,
                color: "#64748B",
                fontFamily: "monospace",
                bgcolor: "#FFFFFF",
                p: 1.5,
                borderRadius: 1,
                border: "1px solid #E2E8F0",
              }}
            >
              Camera ID: {cameraId}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: "#F8FAFC", gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#CBD5E1",
            color: "#64748B",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            "&:hover": {
              borderColor: "#94A3B8",
              bgcolor: "#FFFFFF",
            },
          }}
        >
          Đóng
        </Button>
        <Button
          onClick={handleDownloadQR}
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            bgcolor: "#FF6B35",
            color: "#FFFFFF",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
            "&:hover": {
              bgcolor: "#E85D2A",
              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
            },
          }}
        >
          Tải xuống
        </Button>
      </DialogActions>
    </Dialog>
  );
}
