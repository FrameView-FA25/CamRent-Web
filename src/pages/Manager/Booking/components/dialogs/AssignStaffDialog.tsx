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
} from "@mui/icons-material";
import type { Booking, Staff } from "@/types/booking.types";
import { staffService } from "@/services/staff.service";

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

interface StaffWorkloadInfo {
  staffId: string;
  staffName: string;
  assignedBookings: number;
  assignedVerifications: number;
  todayPickupBookings: number;
  todayReturnBookings: number;
  totalWorkload: number;
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
      loadWorkloadForBookingDate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedBooking]);

  const loadWorkloadForBookingDate = async () => {
    if (!selectedBooking) return;

    setLoadingWorkload(true);
    setWorkloadError(null);

    try {
      // Use booking start date as the target date
      const bookingDate = new Date(selectedBooking.startDate);
      const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

      const data = await staffService.getStaffWorkload(
        startOfDay.toISOString(),
        endOfDay.toISOString()
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

      // Sort by workload (ascending - least busy first)
      workloadInfo.sort((a, b) => a.totalWorkload - b.totalWorkload);

      setWorkloadData(workloadInfo);
    } catch (err: any) {
      setWorkloadError(
        err?.message || "Không thể tải thông tin workload của nhân viên"
      );
      console.error(err);
    } finally {
      setLoadingWorkload(false);
    }
  };

  const getWorkloadLevel = (
    total: number
  ): { color: string; label: string; icon: JSX.Element; bgColor: string } => {
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
    ? getWorkloadLevel(selectedStaffWorkload.totalWorkload)
    : null;
  console.log("seleccBooking", selectedBooking);
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
              Ngày thuê:{" "}
              <strong>
                {selectedBooking?.pickupAt
                  ? new Date(selectedBooking.pickupAt).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </strong>
            </Typography>
          </Paper>

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
                      Đang tải thông tin workload...
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
                      Không có dữ liệu workload cho ngày này
                    </Alert>
                  )}

                {!loadingWorkload &&
                  !workloadError &&
                  workloadData.length > 0 && (
                    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                      <Stack spacing={1.5}>
                        {workloadData.map((staff) => {
                          const level = getWorkloadLevel(staff.totalWorkload);
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
                                cursor: "pointer",
                                "&:hover": {
                                  borderColor: "#F97316",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                },
                              }}
                              onClick={() => onStaffChange(staff.staffId)}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1.5}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: "#1F2937" }}
                                  >
                                    {staff.staffName}
                                  </Typography>
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
                                  icon={<LocalShipping sx={{ fontSize: 14 }} />}
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
                    ? getWorkloadLevel(workload.totalWorkload)
                    : null;

                  return (
                    <MenuItem key={staff.userId} value={staff.userId}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ width: "100%" }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {staff.fullName}
                          </Typography>
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
                selectedStaffWorkload.totalWorkload === 0
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
                Trạng thái: <strong>{selectedStaffLevel.label}</strong> (
                {selectedStaffWorkload.totalWorkload} công việc trong ngày)
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
          disabled={!selectedStaff || loading}
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
