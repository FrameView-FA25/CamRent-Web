import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { colors } from "../../theme/colors";
import type { Staff } from "../../types/booking.types";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staffList: Staff[];
  onAssign: (staffId: string) => Promise<boolean>;
}

const AssignStaffDialog: React.FC<AssignStaffDialogProps> = ({
  open,
  onClose,
  staffList,
  onAssign,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedStaffId) return;

    setLoading(true);
    const success = await onAssign(selectedStaffId);
    setLoading(false);

    if (success) {
      setSelectedStaffId("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStaffId("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Gán nhân viên
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Chọn nhân viên</InputLabel>
            <Select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              label="Chọn nhân viên"
            >
              {staffList.map((staff) => (
                <MenuItem key={staff.userId} value={staff.userId}>
                  {staff.fullName} - {staff.role || "Staff"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderColor: colors.border.light,
            color: colors.text.primary,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedStaffId || loading}
          sx={{
            bgcolor: colors.primary.main,
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignStaffDialog;
