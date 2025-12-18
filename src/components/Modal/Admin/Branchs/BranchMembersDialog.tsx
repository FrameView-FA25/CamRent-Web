import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import type { Branch, UserMembership } from "../../../../types/branch.types";

interface BranchMembersDialogProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  members: UserMembership[];
  onRemoveMember: (member: UserMembership) => void;
}

const BranchMembersDialog: React.FC<BranchMembersDialogProps> = ({
  open,
  onClose,
  branch,
  members,
  onRemoveMember,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "1.1rem",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        Quản lý nhân viên chi nhánh
        {branch && (
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", mt: 0.5, fontWeight: 400 }}
          >
            {branch.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {!branch ? (
          <Typography
            variant="body2"
            sx={{ color: "#9CA3AF", fontStyle: "italic", mt: 1 }}
          >
            Vui lòng chọn chi nhánh.
          </Typography>
        ) : members.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#9CA3AF", fontStyle: "italic", mt: 1 }}
          >
            Chi nhánh này chưa có nhân viên.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {members.map((member) => (
              <Box
                key={member.userId}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  borderRadius: 1,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    {member.fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6B7280", fontSize: "0.8rem" }}
                  >
                    {member.email}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => onRemoveMember(member)}
                  sx={{
                    color: "#DC2626",
                    "&:hover": { bgcolor: "#FEE2E2" },
                  }}
                >
                  <PersonRemoveIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", color: "#6B7280" }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BranchMembersDialog;
