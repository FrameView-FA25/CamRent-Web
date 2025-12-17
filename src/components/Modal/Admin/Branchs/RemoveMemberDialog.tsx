import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Warning as WarningIcon,
  PersonRemove as PersonRemoveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { branchService } from "../../../../services/branch.service";
import type { Branch, UserMembership } from "../../../../types/branch.types";

interface RemoveMemberDialogProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  member: UserMembership | null;
  onSuccess: () => void;
}

const getInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (userId: string): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const RemoveMemberDialog: React.FC<RemoveMemberDialogProps> = ({
  open,
  onClose,
  branch,
  member,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!member || !branch) return;

    try {
      setLoading(true);
      setError(null);

      await branchService.removeMemberFromBranch(branch.id, member.userId);

      toast.success(`Đã xóa ${member.fullName} khỏi chi nhánh ${branch.name}`, {
        position: "top-right",
        autoClose: 3000,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể xóa thành viên";
      setError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  // Kiểm tra xem member có phải là manager của branch không
  const isManager = member?.userId === branch?.managerId;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: "#DC2626",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningIcon />
        Xóa {isManager ? "quản lý" : "nhân viên"} khỏi chi nhánh
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        {member && branch && (
          <>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Bạn có chắc chắn muốn xóa thành viên này khỏi chi nhánh?
              </Typography>
              <Typography variant="caption" sx={{ color: "#92400E" }}>
                Hệ thống sẽ kiểm tra các điều kiện sau trước khi xóa:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <Typography
                  component="li"
                  variant="caption"
                  sx={{ color: "#92400E" }}
                >
                  Booking đang hoạt động
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  sx={{ color: "#92400E" }}
                >
                  Contract đang xử lý
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  sx={{ color: "#92400E" }}
                >
                  Verification đang chờ
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  sx={{ color: "#92400E" }}
                >
                  Inspection đang thực hiện
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  sx={{ color: "#92400E" }}
                >
                  Dispute đang xử lý
                </Typography>
              </Box>
            </Alert>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(member.userId),
                  width: 56,
                  height: 56,
                  fontSize: "1.25rem",
                }}
              >
                {getInitials(member.fullName)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {member.fullName}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    {member.email}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    {member.phone}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "inline-block",
                    px: 1.5,
                    py: 0.5,
                    bgcolor: isManager ? "#DBEAFE" : "#FEF3C7",
                    color: isManager ? "#1E40AF" : "#92400E",
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {isManager ? "Manager" : "Staff"}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                p: 2,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#6B7280", fontWeight: 500, mb: 1 }}
              >
                Chi nhánh
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {branch.name}
              </Typography>
              {branch.address && (
                <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                  {[
                    branch.address.district,
                    branch.address.province,
                    branch.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          borderTop: "1px solid #E5E7EB",
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleRemove}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PersonRemoveIcon />
            )
          }
          sx={{
            bgcolor: "#DC2626",
            color: "#FFFFFF",
            "&:hover": { bgcolor: "#B91C1C" },
            textTransform: "none",
            minWidth: 140,
            "&:disabled": {
              bgcolor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          {loading ? "Đang xử lý..." : "Xóa thành viên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveMemberDialog;
