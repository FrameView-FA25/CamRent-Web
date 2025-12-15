import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { branchService } from "../../../../services/branch.service";
import type { Branch, UnassignedStaff } from "../../../../types/branch.types";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
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

const getAvatarColor = (userId?: string): string => {
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

  if (!userId) {
    return colors[0];
  }

  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const AssignStaffDialog: React.FC<AssignStaffDialogProps> = ({
  open,
  onClose,
  branch,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<UnassignedStaff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<UnassignedStaff | null>(
    null
  );

  useEffect(() => {
    if (open) {
      fetchUnassignedStaff();
      setSelectedStaff(null);
      setError(null);
    }
  }, [open]);

  const fetchUnassignedStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchService.getUnassignedStaff();
      console.log("Unassigned staff data:", data);
      setStaffList(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách nhân viên chưa phân công";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff || !branch) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await branchService.assignStaffToBranch(branch.id, selectedStaff.userId);

      toast.success(
        `Đã gán ${selectedStaff.fullName} vào chi nhánh ${branch.name}`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );

      onSuccess();
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể gán nhân viên";
      setError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStaff(null);
    setError(null);
    onClose();
  };

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
          fontSize: "1.25rem",
          pb: 2,
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <PersonAddIcon sx={{ color: "#FF5722" }} />
        Gán nhân viên cho chi nhánh
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {branch && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "#FFF7ED",
              borderRadius: 2,
              border: "1px solid #FFEDD5",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 20, color: "#FF5722" }} />
              <Typography
                variant="body2"
                sx={{ color: "#6B7280", fontWeight: 500 }}
              >
                Chi nhánh
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {branch.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {[
                branch.address?.district,
                branch.address?.province,
                branch.address?.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        {staffList.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
            Không có nhân viên chưa phân công nào
          </Alert>
        ) : (
          <Autocomplete
            options={staffList}
            loading={loading}
            value={selectedStaff}
            onChange={(_, newValue) => {
              setSelectedStaff(newValue);
              setError(null);
            }}
            getOptionLabel={(option) => option.fullName || ""}
            isOptionEqualToValue={(option, value) =>
              option.userId === value.userId
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.userId}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: getAvatarColor(option.userId),
                      width: 36,
                      height: 36,
                      fontSize: "0.875rem",
                    }}
                  >
                    {getInitials(option.fullName)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.fullName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn nhân viên"
                placeholder="Tìm kiếm nhân viên chưa phân công..."
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
            disabled={submitting || loading}
            noOptionsText={
              loading ? "Đang tải..." : "Không có nhân viên chưa phân công"
            }
          />
        )}

        {selectedStaff && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#F9FAFB",
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#6B7280", mb: 1, fontWeight: 500 }}
            >
              Thông tin nhân viên được chọn
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(selectedStaff.userId),
                  width: 48,
                  height: 48,
                }}
              >
                {getInitials(selectedStaff.fullName)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedStaff.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {selectedStaff.email}
                </Typography>
                {selectedStaff.phone && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#9CA3AF", display: "block", mt: 0.5 }}
                  >
                    {selectedStaff.phone}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
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
          disabled={submitting}
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
          onClick={handleAssign}
          disabled={submitting || !selectedStaff || staffList.length === 0}
          startIcon={
            submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PersonAddIcon />
            )
          }
          sx={{
            bgcolor: "#FF5722",
            color: "#FFFFFF",
            "&:hover": { bgcolor: "#F4511E" },
            textTransform: "none",
            minWidth: 140,
            "&:disabled": {
              bgcolor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          {submitting ? "Đang xử lý..." : "Gán nhân viên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignStaffDialog;
