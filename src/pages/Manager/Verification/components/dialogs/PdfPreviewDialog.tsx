import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { Cancel, FileDownload } from "@mui/icons-material";

interface PdfPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  onSign: () => void;
  onDownload: () => void;
}

export const PdfPreviewDialog: React.FC<PdfPreviewDialogProps> = ({
  open,
  onClose,
  pdfUrl,
  onDownload,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          m: 0,
          maxHeight: "100vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: "#1F2937",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Xem trước hợp đồng</span>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          <Cancel />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ p: 0, overflow: "hidden", height: "calc(100vh - 140px)" }}
      >
        {pdfUrl && (
          <iframe
            src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="PDF Preview"
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: "1px solid #E5E7EB" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Đóng
        </Button>

        <Button
          onClick={onDownload}
          variant="contained"
          startIcon={<FileDownload />}
          sx={{
            bgcolor: "#F97316",
            "&:hover": {
              bgcolor: "#EA580C",
            },
          }}
        >
          Tải về
        </Button>
      </DialogActions>
    </Dialog>
  );
};
