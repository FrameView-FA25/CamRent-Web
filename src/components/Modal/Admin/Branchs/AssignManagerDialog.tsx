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

interface AssignManagerDialogProps {
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

const AssignManagerDialog: React.FC<AssignManagerDialogProps> = ({
  open,
  onClose,
  branch,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managerList, setManagerList] = useState<UnassignedStaff[]>([]);
  const [selectedManager, setSelectedManager] =
    useState<UnassignedStaff | null>(null);

  useEffect(() => {
    if (open) {
      // Check nếu branch đã có manager
      if (branch?.managerName) {
        setError(`Chi nhánh này đã có quản lý: ${branch.managerName}`);
        toast.error(`Chi nhánh "${branch.name}" đã có quản lý`, {
          position: "top-right",
          autoClose: 3000,
        });
        // Không fetch danh sách manager
        setManagerList([]);
        setSelectedManager(null);
      } else {
        fetchUnassignedManagers();
        setSelectedManager(null);
        setError(null);
      }
    }
  }, [open, branch]);

  const fetchUnassignedManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchService.getUnassignedManager();
      console.log("Unassigned managers data:", data);
      setManagerList(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách quản lý chưa phân công";
      setError(message);
      toast.error("Coming soon");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedManager || !branch) {
      setError("Vui lòng chọn quản lý");
      return;
    }

    // Double check nếu branch đã có manager
    if (branch.managerName) {
      const message = `Chi nhánh "${branch.name}" đã có quản lý: ${branch.managerName}`;
      setError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await branchService.assignManagerToBranch(
        branch.id,
        selectedManager.userId
      );

      toast.success(
        `Đã gán ${selectedManager.fullName} làm quản lý chi nhánh ${branch.name}`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );

      onSuccess();
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể gán quản lý";
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
    setSelectedManager(null);
    setError(null);
    onClose();
  };

  // Nếu branch đã có manager, disable dialog
  const hasManager = branch?.managerName;

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
        Gán quản lý cho chi nhánh
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {branch && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: hasManager ? "#FEE2E2" : "#FFF7ED",
              borderRadius: 2,
              border: `1px solid ${hasManager ? "#FCA5A5" : "#FFEDD5"}`,
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
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 1 }}>
              {[
                branch.address?.district,
                branch.address?.province,
                branch.address?.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </Typography>
            {hasManager && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: "#FFF",
                  borderRadius: 1,
                  border: "1px solid #FCA5A5",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#DC2626",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Quản lý hiện tại:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#DC2626", fontWeight: 500 }}
                >
                  {branch.managerName}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        {!hasManager && (
          <>
            {managerList.length === 0 && !loading ? (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
                Không có quản lý chưa phân công nào
              </Alert>
            ) : (
              <Autocomplete
                options={managerList}
                loading={loading}
                value={selectedManager}
                onChange={(_, newValue) => {
                  setSelectedManager(newValue);
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
                    label="Chọn quản lý"
                    placeholder="Tìm kiếm quản lý chưa phân công..."
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
                  loading ? "Đang tải..." : "Không có quản lý chưa phân công"
                }
              />
            )}

            {selectedManager && (
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
                  Thông tin quản lý được chọn
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: getAvatarColor(selectedManager.userId),
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getInitials(selectedManager.fullName)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedManager.fullName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      {selectedManager.email}
                    </Typography>
                    {selectedManager.phone && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#9CA3AF", display: "block", mt: 0.5 }}
                      >
                        {selectedManager.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
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
          disabled={submitting}
          sx={{
            textTransform: "none",
            color: "#6B7280",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          {hasManager ? "Đóng" : "Hủy"}
        </Button>
        {!hasManager && (
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={
              submitting || !selectedManager || managerList.length === 0
            }
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
            {submitting ? "Đang xử lý..." : "Gán quản lý"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignManagerDialog;
