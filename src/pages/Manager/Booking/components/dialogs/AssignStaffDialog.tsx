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
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingFlat,
  TrendingDown,
  CalendarToday,
  Block,
  CheckCircleOutline,
} from "@mui/icons-material";
import type { Booking, Staff } from "@/types/booking.types";
import {
  staffService,
  type AvailableStaffItem,
} from "@/services/staff.service";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  selectedBooking: Booking | null;
  staffList: Staff[];
  selectedStaff: string;
  onStaffChange: (staffId: string) => void;
  loading: boolean;
  onConfirm: () => void;
}

interface StaffWorkloadInfo extends AvailableStaffItem {
  totalWorkload: number;
  conflictingBookings: number;
  conflictingVerifications: number;
}

export const AssignStaffDialog: React.FC<AssignStaffDialogProps> = ({
  open,
  onClose,
  selectedBooking,
  staffList,
  selectedStaff,
  onStaffChange,
  loading,
  onConfirm,
}) => {
  const [loadingWorkload, setLoadingWorkload] = useState(false);
  const [workloadData, setWorkloadData] = useState<StaffWorkloadInfo[]>([]);
  const [workloadError, setWorkloadError] = useState<string | null>(null);
  const [showWorkloadDetails, setShowWorkloadDetails] = useState(false);

  useEffect(() => {
    if (open && selectedBooking) {
      loadAvailableStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedBooking]);

  const loadAvailableStaff = async () => {
    if (!selectedBooking) return;

    setLoadingWorkload(true);
    setWorkloadError(null);

    try {
      // Use booking pickup date as start and return date as end
      const startDate = new Date(selectedBooking.pickupAt);
      const endDate = selectedBooking.returnAt
        ? new Date(selectedBooking.returnAt)
        : new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Default to +1 day if no return date

      const data = await staffService.getAvailableStaff(
        startDate.toISOString(),
        endDate.toISOString(),
        "both" // Check availability for both booking and verification
      );

      // Transform data and calculate total workload
      const workloadInfo: StaffWorkloadInfo[] = data.staffs.map((staff) => ({
        ...staff,
        totalWorkload:
          staff.assignedBookings +
          staff.assignedVerifications +
          staff.todayPickupBookings +
          staff.todayReturnBookings,
        conflictingBookings: staff.conflictingBookings || 0,
        conflictingVerifications: staff.conflictingVerifications || 0,
      }));

      // Sort: available staff first, then by workload (ascending)
      workloadInfo.sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.totalWorkload - b.totalWorkload;
      });

      setWorkloadData(workloadInfo);

      // Auto-select first available staff if none selected
      if (!selectedStaff && workloadInfo.length > 0) {
        const firstAvailable = workloadInfo.find((s) => s.isAvailable);
        if (firstAvailable) {
          onStaffChange(firstAvailable.staffId);
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

  const selectedStaffWorkload = selectedStaff
    ? getStaffWorkload(selectedStaff)
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
  console.log("workloadData", workloadData);
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
        Phân công nhân viên kiểm tra
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Booking Info */}
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
                Thông tin đơn thuê
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Mã đơn: <strong>{selectedBooking?.id.slice(0, 8)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Ngày nhận:{" "}
              <strong>
                {selectedBooking?.pickupAt
                  ? new Date(selectedBooking.pickupAt).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </strong>
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Ngày trả:{" "}
              <strong>
                {selectedBooking?.returnAt
                  ? new Date(selectedBooking.returnAt).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </strong>
            </Typography>
          </Paper>

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
                  label={`${availableCount} Khả dụng`}
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
                      Không có dữ liệu nhân viên cho khoảng thời gian này
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
                          const isSelected = selectedStaff === staff.staffId;

                          return (
                            <Paper
                              key={staff.staffId}
                              elevation={0}
                              sx={{
                                p: 2,
                                border: isSelected
                                  ? `2px solid #F97316`
                                  : "1px solid #E5E7EB",
                                borderRadius: 2,
                                bgcolor: isSelected ? "#FFF7ED" : level.bgColor,
                                transition: "all 0.2s",
                                cursor: staff.isAvailable
                                  ? "pointer"
                                  : "not-allowed",
                                opacity: staff.isAvailable ? 1 : 0.6,
                                "&:hover": staff.isAvailable
                                  ? {
                                      borderColor: "#F97316",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    }
                                  : {},
                              }}
                              onClick={() =>
                                staff.isAvailable &&
                                onStaffChange(staff.staffId)
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
                                      sx={{ fontWeight: 600, color: "#1F2937" }}
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
                                  label={`${staff.conflictingBookings} Bookings`}
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
                                  label={`${staff.conflictingVerifications} Xác nhận`}
                                  size="small"
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: 24,
                                    bgcolor: "#F0FDF4",
                                    color: "#065F46",
                                  }}
                                />
                              </Stack>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
              </Box>
            </Collapse>
          </Paper>

          {/* Staff Selection */}
          <FormControl fullWidth>
            <InputLabel>Chọn nhân viên</InputLabel>
            <Select
              value={selectedStaff}
              onChange={(e) => onStaffChange(e.target.value)}
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
                  ` (${selectedStaffWorkload.totalWorkload} công việc trong khoảng thời gian)`}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={loading}
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
          disabled={
            !selectedStaff || loading || !selectedStaffWorkload?.isAvailable
          }
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
            "Xác nhận"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
