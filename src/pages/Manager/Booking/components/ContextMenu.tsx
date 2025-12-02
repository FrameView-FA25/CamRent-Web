import React from "react";
import { Menu, MenuItem } from "@mui/material";
import {
  Assignment,
  Description,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

interface ContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAssignStaff: () => void;
  onCreateContract: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  anchorEl,
  onClose,
  onAssignStaff,
  onCreateContract,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minWidth: 220,
        },
      }}
    >
      <MenuItem
        onClick={onAssignStaff}
        sx={{
          py: 1.5,
          "&:hover": {
            bgcolor: "#FFF7ED",
            color: "#F97316",
          },
        }}
      >
        <Assignment sx={{ mr: 1.5, fontSize: 20 }} /> Phân công nhân viên
      </MenuItem>
      <MenuItem
        onClick={onCreateContract}
        sx={{
          py: 1.5,
          "&:hover": {
            bgcolor: "#FFF7ED",
            color: "#F97316",
          },
        }}
      >
        <Description sx={{ mr: 1.5, fontSize: 20 }} /> Tạo hợp đồng
      </MenuItem>
      <MenuItem
        onClick={onClose}
        sx={{
          py: 1.5,
          "&:hover": {
            bgcolor: "#FFF7ED",
            color: "#F97316",
          },
        }}
      >
        <CheckCircle sx={{ mr: 1.5, fontSize: 20 }} /> Xác nhận đơn
      </MenuItem>
      <MenuItem
        onClick={onClose}
        sx={{
          py: 1.5,
          "&:hover": {
            bgcolor: "#FFF7ED",
            color: "#F97316",
          },
        }}
      >
        Xem chi tiết
      </MenuItem>
      <MenuItem
        onClick={onClose}
        sx={{
          py: 1.5,
          color: "#EF4444",
          "&:hover": {
            bgcolor: "#FEE2E2",
          },
        }}
      >
        <Cancel sx={{ mr: 1.5, fontSize: 20 }} /> Hủy đơn
      </MenuItem>
    </Menu>
  );
};
