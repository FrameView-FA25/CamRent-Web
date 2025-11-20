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
  TextField,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { colors } from "../../theme/colors";
import { getVerificationStatusInfo } from "../../utils/verification.utils";
import type { Verification } from "../../types/verification.types";

interface UpdateStatusDialogProps {
  open: boolean;
  onClose: () => void;
  verification: Verification | null;
  onUpdate: (status: string, note: string) => Promise<boolean>;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  open,
  onClose,
  verification,
  onUpdate,
}) => {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (verification) {
      setStatus(verification.status);
      setNote(verification.notes || "");
    }
  }, [verification]);

  const handleUpdate = async () => {
    if (!status) return;

    setLoading(true);
    const success = await onUpdate(status, note);
    setLoading(false);

    if (success) {
      setStatus("");
      setNote("");
      onClose();
    }
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Assigned", label: "Assigned" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ];

  const selectedStatusInfo = getVerificationStatusInfo(status);
  const StatusIcon = selectedStatusInfo.icon;
  const currentItem = verification?.items?.[0];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: colors.text.primary }}>
        Update Verification Status
      </DialogTitle>

      <DialogContent>
        {currentItem && (
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mb: 1 }}
            >
              Item
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentItem.itemName}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              {currentItem.itemType} • ID: {currentItem.itemId.slice(0, 8)}...
            </Typography>
          </Box>
        )}

        {/* Status Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
            renderValue={(value) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StatusIcon size={16} color={selectedStatusInfo.color} />
                <span>{value}</span>
              </Box>
            )}
          >
            {statusOptions.map((option) => {
              const info = getVerificationStatusInfo(option.value);
              const Icon = info.icon;
              return (
                <MenuItem key={option.value} value={option.value}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Icon size={16} color={info.color} />
                    <Typography>{option.label}</Typography>
                    <Chip
                      size="small"
                      sx={{
                        ml: "auto",
                        bgcolor: info.bgcolor,
                        color: info.color,
                        fontWeight: 600,
                      }}
                      label={option.label}
                    />
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Note TextField */}
        <TextField
          fullWidth
          label="Note (Optional)"
          multiline
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this status update..."
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: colors.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.primary.main,
              },
            },
          }}
        />

        {/* Helper Text */}
        <Typography
          variant="caption"
          sx={{ color: colors.text.secondary, display: "block", mt: 1 }}
        >
          This note will be visible to the owner
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={!status || loading}
          sx={{
            bgcolor: colors.primary.main,
            "&:hover": { bgcolor: colors.primary.dark },
          }}
        >
          {loading ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusDialog;
