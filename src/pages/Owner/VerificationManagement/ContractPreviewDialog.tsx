import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { FileDownload as FileDownloadIcon } from "@mui/icons-material";

interface ContractPreviewDialogProps {
  open: boolean;
  pdfUrl: string | null;
  currentContractId: string | null;
  onClose: () => void;
  onDownload: () => void;
  onOpenSignature: () => void;
}

export function ContractPreviewDialog({
  open,
  pdfUrl,
  currentContractId,
  onClose,
  onDownload,
  onOpenSignature,
}: ContractPreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#1E293B" }}>
        Xem trước hợp đồng
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ p: 0, position: "relative", bgcolor: "#000000", flex: 1 }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Verification Contract Preview"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div
            style={{
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              fontStyle: "italic",
            }}
          >
            Không có dữ liệu hợp đồng
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#64748B",
            "&:hover": {
              bgcolor: "#F1F5F9",
            },
          }}
        >
          Đóng
        </Button>
        <Button
          onClick={onDownload}
          variant="contained"
          disabled={!pdfUrl}
          startIcon={<FileDownloadIcon />}
          sx={{
            bgcolor: "#F97316",
            "&:hover": {
              bgcolor: "#EA580C",
            },
            "&:disabled": {
              bgcolor: "#FCDAD0",
            },
          }}
        >
          Tải về
        </Button>
        <Button
          onClick={onOpenSignature}
          variant="contained"
          disabled={!pdfUrl || !currentContractId}
          sx={{
            bgcolor: "#F97316",
            "&:hover": {
              bgcolor: "#EA580C",
            },
            "&:disabled": {
              bgcolor: "#FCDAD0",
            },
          }}
        >
          Ký hợp đồng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
