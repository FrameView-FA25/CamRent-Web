import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  QrCodeScanner,
  Refresh,
} from "@mui/icons-material";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}

export default function QRScannerDialog({
  open,
  onClose,
  onScanSuccess,
}: QRScannerDialogProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  useEffect(() => {
    if (open && !scannerRef.current) {
      setError(null); // Reset error khi mở lại
      startScanning();
    } else if (!open && scannerRef.current) {
      stopScanning();
    }

    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      // Thử các cấu hình camera theo thứ tự ưu tiên
      const cameraConfigs = [
        { facingMode: "environment" }, // Camera sau (ưu tiên)
        { facingMode: "user" }, // Camera trước (fallback)
      ];

      let lastError: Error | null = null;

      for (const config of cameraConfigs) {
        try {
          await scanner.start(
            config,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // Quét thành công
              onScanSuccess(decodedText);
              stopScanning();
              onClose();
            },
            (errorMessage) => {
              console.error("Lỗi quét QR:", errorMessage);
            }
          );
          // Nếu start thành công, thoát khỏi loop
          return;
        } catch (err: any) {
          lastError = err;
          // Nếu không phải config cuối cùng, thử config tiếp theo
          if (config !== cameraConfigs[cameraConfigs.length - 1]) {
            try {
              await scanner.stop();
            } catch {
              // Ignore stop errors khi đang thử config khác
            }
            continue;
          }
        }
      }

      // Nếu tất cả config đều fail, throw error
      throw lastError || new Error("Không thể khởi động camera.");
    } catch (err: any) {
      console.error("Error starting scanner:", err);

      let errorMessage = "Không thể khởi động camera.";

      // Xử lý các loại lỗi cụ thể
      if (err?.name || err?.message) {
        const errorName = err.name || "";
        const errorMsg = err.message || "";

        if (
          errorName === "NotAllowedError" ||
          errorName === "PermissionDeniedError" ||
          errorMsg.toLowerCase().includes("permission") ||
          errorMsg.toLowerCase().includes("not allowed")
        ) {
          errorMessage =
            "Quyền truy cập camera bị từ chối. Vui lòng cấp quyền camera trong cài đặt trình duyệt và thử lại.";
        } else if (
          errorName === "NotFoundError" ||
          errorName === "DevicesNotFoundError" ||
          errorMsg.toLowerCase().includes("not found") ||
          errorMsg.toLowerCase().includes("no camera")
        ) {
          errorMessage =
            "Không tìm thấy camera trên thiết bị này. Vui lòng kiểm tra kết nối camera.";
        } else if (
          errorName === "NotReadableError" ||
          errorName === "TrackStartError" ||
          errorMsg.toLowerCase().includes("not readable") ||
          errorMsg.toLowerCase().includes("in use")
        ) {
          errorMessage =
            "Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác đang sử dụng camera và thử lại.";
        } else if (errorMsg) {
          errorMessage = `Lỗi: ${errorMsg}`;
        }
      }

      setError(errorMessage);
      setScanning(false);

      // Cleanup scanner nếu có
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    startScanning();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#F8FAFC",
          borderBottom: "2px solid #E2E8F0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCodeScanner sx={{ color: "#F97316" }} />
          <Typography variant="h6" fontWeight={700}>
            Quét mã QR
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                startIcon={<Refresh />}
                sx={{ textTransform: "none" }}
              >
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Box
          id={containerId}
          sx={{
            width: "100%",
            minHeight: 300,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        {!scanning && !error && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            Đang khởi động camera...
          </Typography>
        )}

        {scanning && !error && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            Đưa mã QR vào khung hình để quét
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{ p: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
      >
        {error && (
          <Button
            onClick={handleRetry}
            variant="contained"
            startIcon={<Refresh />}
            sx={{
              bgcolor: "#F97316",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#EA580C",
              },
            }}
          >
            Thử lại
          </Button>
        )}
        <Button onClick={handleClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
