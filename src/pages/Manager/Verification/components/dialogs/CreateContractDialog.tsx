import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import type { Verification } from "@/types/verification.types";

interface CreateContractDialogProps {
  open: boolean;
  onClose: () => void;
  selectedVerification: Verification | null;
  loading: boolean;
  onConfirm: () => void;
}

export const CreateContractDialog: React.FC<CreateContractDialogProps> = ({
  open,
  onClose,
  selectedVerification,
  loading,
  onConfirm,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
        Tạo hợp đồng từ yêu cầu xác minh
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
            Bạn có chắc chắn muốn tạo hợp đồng cho yêu cầu xác minh này?
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#F9FAFB",
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>Mã yêu cầu:</strong>{" "}
              {selectedVerification?.id.slice(0, 8)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>Khách hàng:</strong> {selectedVerification?.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>SĐT:</strong> {selectedVerification?.phoneNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
              <strong>Số thiết bị:</strong>{" "}
              {selectedVerification?.items?.length || 0}
            </Typography>
            <Typography variant="body2" sx={{ color: "#1F2937" }}>
              <strong>Ngày kiểm tra:</strong>{" "}
              {selectedVerification &&
                formatDate(selectedVerification.inspectionDate)}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
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
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: "#F97316",
            "&:hover": {
              bgcolor: "#EA580C",
            },
            "&:disabled": {
              bgcolor: "#E5E7EB",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            <>
              <Description sx={{ mr: 1 }} /> Tạo hợp đồng
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
