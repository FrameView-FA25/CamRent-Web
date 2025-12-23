import React from "react";
import { Dialog, DialogContent, Box, Typography, Button } from "@mui/material";
import { TaskAlt } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmDialog: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "#FFF7ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            mb: 3,
          }}
        >
          <TaskAlt sx={{ color: "#F97316", fontSize: 50 }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}>
          Xác nhận hoàn tất?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
          Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này không?
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "#E5E7EB",
              color: "#6B7280",
              textTransform: "none",
              fontWeight: 600,
              minWidth: 120,
              "&:hover": {
                borderColor: "#9CA3AF",
                bgcolor: "#F9FAFB",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{
              bgcolor: "#F97316",
              textTransform: "none",
              fontWeight: 600,
              minWidth: 120,
              "&:hover": {
                bgcolor: "#EA580C",
              },
            }}
          >
            Xác nhận
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;


