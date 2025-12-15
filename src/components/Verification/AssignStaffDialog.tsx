import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  LocalShipping,
  AssignmentReturn,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingFlat,
  TrendingDown,
  CalendarToday,
  Block,
  CheckCircleOutline,
  VerifiedUser,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";
import type { Staff } from "../../types/booking.types";
import {
  staffService,
  type AvailableStaffItem,
} from "../../services/staff.service";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staffList: Staff[];
  onAssign: (staffId: string) => Promise<boolean>;
  verificationDate?: string; // Ngày hẹn xác minh
}

interface StaffWorkloadInfo extends AvailableStaffItem {
  totalWorkload: number;
}

const AssignStaffDialog: React.FC<AssignStaffDialogProps> = ({
  open,
  onClose,
  staffList,
  onAssign,
  verificationDate,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingWorkload, setLoadingWorkload] = useState(false);
  const [workloadData, setWorkloadData] = useState<StaffWorkloadInfo[]>([]);
  const [workloadError, setWorkloadError] = useState<string | null>(null);
  const [showWorkloadDetails, setShowWorkloadDetails] = useState(false);

  useEffect(() => {
    if (open && verificationDate) {
      loadAvailableStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, verificationDate]);

  const loadAvailableStaff = async () => {
    if (!verificationDate) return;

    setLoadingWorkload(true);
    setWorkloadError(null);

    try {
      const date = new Date(verificationDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const data = await staffService.getAvailableStaff(
        startOfDay.toISOString(),
        endOfDay.toISOString(),
        "verification" // Chỉ check availability cho verification
      );

      // Transform data and calculate total workload
      const workloadInfo: StaffWorkloadInfo[] = data.staffs.map((staff) => ({
        ...staff,
        totalWorkload:
          staff.assignedBookings +
          staff.assignedVerifications +
          staff.todayPickupBookings +
          staff.todayReturnBookings,
      }));

      // Sort: available staff first, then by workload (ascending)
      workloadInfo.sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.totalWorkload - b.totalWorkload;
      });

      setWorkloadData(workloadInfo);

      // Auto-select first available staff if none selected
      if (!selectedStaffId && workloadInfo.length > 0) {
        const firstAvailable = workloadInfo.find((s) => s.isAvailable);
        if (firstAvailable) {
          setSelectedStaffId(firstAvailable.staffId);
        }
      }
    } catch (err: any) {
      setWorkloadError(
        err?.message || "Không thể tải thông tin nhân viên khả dụng"
      );
      console.error(err);
    } finally {
      setLoadingWorkload(false);
    }
  };

  const getWorkloadLevel = (
    total: number,
    isAvailable: boolean
  ): { color: string; label: string; icon: JSX.Element; bgColor: string } => {
    if (!isAvailable) {
      return {
        color: "#DC2626",
        label: "Không khả dụng",
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: "#FEE2E2",
      };
    }

    if (total === 0)
      return {
        color: "#10B981",
        label: "Rảnh",
        icon: <TrendingDown sx={{ fontSize: 16 }} />,
        bgColor: "#F0FDF4",
      };
    if (total <= 3)
      return {
        color: "#3B82F6",
        label: "Bình thường",
        icon: <TrendingFlat sx={{ fontSize: 16 }} />,
        bgColor: "#EFF6FF",
      };
    if (total <= 6)
      return {
        color: "#F59E0B",
        label: "Bận",
        icon: <TrendingUp sx={{ fontSize: 16 }} />,
        bgColor: "#FFFBEB",
      };
    return {
      color: "#EF4444",
      label: "Rất bận",
      icon: <TrendingUp sx={{ fontSize: 16 }} />,
      bgColor: "#FEF2F2",
    };
  };

  const getStaffWorkload = (staffId: string): StaffWorkloadInfo | undefined => {
    return workloadData.find((w) => w.staffId === staffId);
  };

  const selectedStaffWorkload = selectedStaffId
    ? getStaffWorkload(selectedStaffId)
    : null;
  const selectedStaffLevel = selectedStaffWorkload
    ? getWorkloadLevel(
        selectedStaffWorkload.totalWorkload,
        selectedStaffWorkload.isAvailable
      )
    : null;

  // Count available and unavailable staff
  const availableCount = workloadData.filter((s) => s.isAvailable).length;
  const unavailableCount = workloadData.length - availableCount;

  const handleAssign = async () => {
    if (!selectedStaffId) return;

    // Check if selected staff is available
    const staffInfo = getStaffWorkload(selectedStaffId);
    if (staffInfo && !staffInfo.isAvailable) {
      return; // Don't proceed if staff is not available
    }

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
    setWorkloadData([]);
    setWorkloadError(null);
    setShowWorkloadDetails(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <VerifiedUser sx={{ color: colors.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Gán nhân viên xác minh thiết bị
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Verification Date Info */}
          {verificationDate && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <CalendarToday sx={{ fontSize: 18, color: "#6B7280" }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1F2937" }}
                >
                  Thông tin xác minh
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Ngày hẹn xác minh:{" "}
                <strong>
                  {new Date(verificationDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Giờ hẹn:{" "}
                <strong>
                  {new Date(verificationDate).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </Typography>
            </Paper>
          )}

          {/* Availability Summary */}
          {!loadingWorkload && workloadData.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "#ECFDF5",
                borderRadius: 2,
                border: "1px solid #A7F3D0",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<CheckCircleOutline />}
                  label={`${availableCount} Nhân viên khả dụng`}
                  size="small"
                  sx={{
                    bgcolor: "#10B981",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                {unavailableCount > 0 && (
                  <Chip
                    icon={<Block />}
                    label={`${unavailableCount} Không khả dụng`}
                    size="small"
                    sx={{
                      bgcolor: "#EF4444",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Paper>
          )}

          {/* Workload Summary Toggle */}
          {verificationDate && (
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                onClick={() => setShowWorkloadDetails(!showWorkloadDetails)}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  bgcolor: "#FAFAFA",
                  "&:hover": {
                    bgcolor: "#F5F5F5",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1F2937" }}
                >
                  📊 Xem tình trạng công việc nhân viên ({workloadData.length}{" "}
                  nhân viên)
                </Typography>
                <IconButton size="small">
                  {showWorkloadDetails ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={showWorkloadDetails}>
                <Divider />
                <Box sx={{ p: 2 }}>
                  {loadingWorkload && (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <CircularProgress size={32} />
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "#6B7280" }}
                      >
                        Đang tải thông tin nhân viên...
                      </Typography>
                    </Box>
                  )}

                  {workloadError && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      {workloadError}
                    </Alert>
                  )}

                  {!loadingWorkload &&
                    !workloadError &&
                    workloadData.length === 0 && (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Không có dữ liệu nhân viên cho ngày này
                      </Alert>
                    )}

                  {!loadingWorkload &&
                    !workloadError &&
                    workloadData.length > 0 && (
                      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                        <Stack spacing={1.5}>
                          {workloadData.map((staff) => {
                            const level = getWorkloadLevel(
                              staff.totalWorkload,
                              staff.isAvailable
                            );
                            const isSelected =
                              selectedStaffId === staff.staffId;

                            return (
                              <Paper
                                key={staff.staffId}
                                elevation={0}
                                sx={{
                                  p: 2,
                                  border: isSelected
                                    ? `2px solid ${colors.primary.main}`
                                    : "1px solid #E5E7EB",
                                  borderRadius: 2,
                                  bgcolor: isSelected
                                    ? colors.primary.lighter
                                    : level.bgColor,
                                  transition: "all 0.2s",
                                  cursor: staff.isAvailable
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: staff.isAvailable ? 1 : 0.6,
                                  "&:hover": staff.isAvailable
                                    ? {
                                        borderColor: colors.primary.main,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                      }
                                    : {},
                                }}
                                onClick={() =>
                                  staff.isAvailable &&
                                  setSelectedStaffId(staff.staffId)
                                }
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  mb={1.5}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={1}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 600,
                                          color: "#1F2937",
                                        }}
                                      >
                                        {staff.staffName}
                                      </Typography>
                                      {staff.isAvailable && (
                                        <CheckCircleOutline
                                          sx={{
                                            fontSize: 16,
                                            color: "#10B981",
                                          }}
                                        />
                                      )}
                                    </Stack>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#6B7280" }}
                                    >
                                      Tổng: {staff.totalWorkload} công việc
                                    </Typography>
                                  </Box>
                                  <Chip
                                    icon={level.icon}
                                    label={level.label}
                                    size="small"
                                    sx={{
                                      bgcolor: level.color + "20",
                                      color: level.color,
                                      fontWeight: 600,
                                    }}
                                  />
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    icon={<Assignment sx={{ fontSize: 14 }} />}
                                    label={`${staff.assignedBookings} Bookings`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 24,
                                      bgcolor: "#EFF6FF",
                                      color: "#1E40AF",
                                    }}
                                  />
                                  <Chip
                                    icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                    label={`${staff.assignedVerifications} Xác nhận`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 24,
                                      bgcolor: "#F0FDF4",
                                      color: "#065F46",
                                    }}
                                  />
                                  <Chip
                                    icon={
                                      <LocalShipping sx={{ fontSize: 14 }} />
                                    }
                                    label={`${staff.todayPickupBookings} Pickups`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 24,
                                      bgcolor: "#FFFBEB",
                                      color: "#92400E",
                                    }}
                                  />
                                  <Chip
                                    icon={
                                      <AssignmentReturn sx={{ fontSize: 14 }} />
                                    }
                                    label={`${staff.todayReturnBookings} Returns`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 24,
                                      bgcolor: "#F5F3FF",
                                      color: "#5B21B6",
                                    }}
                                  />
                                </Stack>

                                {/* Show conflicts if any */}
                                {(staff.conflictingVerifications > 0 ||
                                  staff.conflictingBookings > 0) && (
                                  <Alert
                                    severity="warning"
                                    sx={{ mt: 1, py: 0.5 }}
                                  >
                                    <Typography variant="caption">
                                      ⚠️ Xung đột:{" "}
                                      {staff.conflictingVerifications > 0 &&
                                        `${staff.conflictingVerifications} verification`}
                                      {staff.conflictingVerifications > 0 &&
                                        staff.conflictingBookings > 0 &&
                                        ", "}
                                      {staff.conflictingBookings > 0 &&
                                        `${staff.conflictingBookings} booking`}
                                    </Typography>
                                  </Alert>
                                )}
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                </Box>
              </Collapse>
            </Paper>
          )}

          {/* Staff Selection Dropdown */}
          <FormControl fullWidth>
            <InputLabel>Chọn nhân viên</InputLabel>
            <Select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              label="Chọn nhân viên"
              disabled={loading}
              sx={{
                borderRadius: 2,
              }}
            >
              {staffList.length === 0 ? (
                <MenuItem disabled>Không có nhân viên</MenuItem>
              ) : (
                staffList.map((staff) => {
                  const workload = getStaffWorkload(staff.userId);
                  const level = workload
                    ? getWorkloadLevel(
                        workload.totalWorkload,
                        workload.isAvailable
                      )
                    : null;
                  const isAvailable = workload?.isAvailable ?? true;

                  return (
                    <MenuItem
                      key={staff.userId}
                      value={staff.userId}
                      disabled={!isAvailable}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ width: "100%" }}
                      >
                        <Box>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {staff.fullName}
                            </Typography>
                            {isAvailable && (
                              <CheckCircleOutline
                                sx={{ fontSize: 14, color: "#10B981" }}
                              />
                            )}
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            {staff.email}
                          </Typography>
                        </Box>
                        {level && (
                          <Chip
                            label={level.label}
                            size="small"
                            sx={{
                              bgcolor: level.color + "20",
                              color: level.color,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Stack>
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>

          {/* Selected Staff Workload Alert */}
          {selectedStaffWorkload && selectedStaffLevel && (
            <Alert
              severity={
                !selectedStaffWorkload.isAvailable
                  ? "error"
                  : selectedStaffWorkload.totalWorkload === 0
                  ? "success"
                  : selectedStaffWorkload.totalWorkload <= 3
                  ? "info"
                  : selectedStaffWorkload.totalWorkload <= 6
                  ? "warning"
                  : "error"
              }
              icon={selectedStaffLevel.icon}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Nhân viên đã chọn: {selectedStaffWorkload.staffName}
              </Typography>
              <Typography variant="caption">
                Trạng thái: <strong>{selectedStaffLevel.label}</strong>
                {selectedStaffWorkload.isAvailable &&
                  ` (${selectedStaffWorkload.totalWorkload} công việc trong ngày)`}
              </Typography>
            </Alert>
          )}
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
          disabled={
            !selectedStaffId || loading || !selectedStaffWorkload?.isAvailable
          }
          sx={{
            bgcolor: colors.primary.main,
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: colors.primary.dark,
            },
            "&:disabled": {
              bgcolor: "#E5E7EB",
            },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
              Đang gán...
            </>
          ) : (
            "Xác nhận gán"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignStaffDialog;
