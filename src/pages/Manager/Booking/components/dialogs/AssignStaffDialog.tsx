import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  Block,
  CheckCircleOutline,
  Person,
  Warning,
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
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

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
      const startDate = new Date(selectedBooking.pickupAt);
      const endDate = selectedBooking.returnAt
        ? new Date(selectedBooking.returnAt)
        : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      const data = await staffService.getAvailableStaff(
        startDate.toISOString(),
        endDate.toISOString(),
        "both"
      );

      // Transform data and calculate total workload
      const workloadInfo: StaffWorkloadInfo[] = data.staffs.map((staff) => ({
        ...staff,
        totalWorkload:
          staff.conflictingBookings +
          staff.conflictingVerifications +
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

  const getStaffWorkload = (staffId: string): StaffWorkloadInfo | undefined => {
    return workloadData.find((w) => w.staffId === staffId);
  };

  const selectedStaffWorkload = selectedStaff
    ? getStaffWorkload(selectedStaff)
    : null;

  // Count available and unavailable staff
  const availableCount = workloadData.filter((s) => s.isAvailable).length;
  const unavailableCount = workloadData.length - availableCount;

  const handleStaffClick = (staffId: string, isAvailable: boolean) => {
    if (isAvailable) {
      onStaffChange(staffId);
      setExpandedStaff(expandedStaff === staffId ? null : staffId);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        Phân công nhân viên kiểm tra
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Box>
          {/* Booking Info */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <CalendarToday sx={{ fontSize: 18, color: "#6B7280" }} />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#374151" }}
              >
                Thông tin đơn thuê
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", minWidth: 80 }}
                >
                  Mã đơn:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#111827" }}
                >
                  {selectedBooking?.id.slice(0, 8)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", minWidth: 80 }}
                >
                  Ngày nhận:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#111827" }}
                >
                  {selectedBooking?.pickupAt
                    ? new Date(selectedBooking.pickupAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "N/A"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", minWidth: 80 }}
                >
                  Ngày trả:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#111827" }}
                >
                  {selectedBooking?.returnAt
                    ? new Date(selectedBooking.returnAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "N/A"}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Availability Summary */}
          {!loadingWorkload && workloadData.length > 0 && (
            <Stack direction="row" spacing={2} mb={3}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  bgcolor: "#F9FAFB",
                  borderRadius: 1.5,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Khả dụng
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "#111827" }}
                    >
                      {availableCount}
                    </Typography>
                  </Box>
                  <CheckCircleOutline sx={{ fontSize: 28, color: "#10B981" }} />
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  bgcolor: "#F9FAFB",
                  borderRadius: 1.5,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Không khả dụng
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "#111827" }}
                    >
                      {unavailableCount}
                    </Typography>
                  </Box>
                  <Block sx={{ fontSize: 28, color: "#EF4444" }} />
                </Stack>
              </Box>
            </Stack>
          )}

          {/* Staff List */}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
          >
            Danh sách nhân viên ({workloadData.length})
          </Typography>

          {loadingWorkload && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={36} />
              <Typography variant="body2" sx={{ mt: 2, color: "#6B7280" }}>
                Đang tải thông tin nhân viên...
              </Typography>
            </Box>
          )}

          {workloadError && (
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              {workloadError}
            </Alert>
          )}

          {!loadingWorkload && !workloadError && workloadData.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 1.5 }}>
              Không có dữ liệu nhân viên cho khoảng thời gian này
            </Alert>
          )}

          {!loadingWorkload && !workloadError && workloadData.length > 0 && (
            <Box
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "#F3F4F6",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#D1D5DB",
                  borderRadius: "3px",
                  "&:hover": {
                    bgcolor: "#9CA3AF",
                  },
                },
              }}
            >
              <Stack spacing={1.5}>
                {workloadData.map((staff) => {
                  const isSelected = selectedStaff === staff.staffId;
                  const isExpanded = expandedStaff === staff.staffId;

                  return (
                    <Paper
                      key={staff.staffId}
                      elevation={0}
                      sx={{
                        border: isSelected
                          ? "2px solid #111827"
                          : "1px solid #E5E7EB",
                        borderRadius: 1.5,
                        transition: "all 0.2s",
                        cursor: staff.isAvailable ? "pointer" : "not-allowed",
                        opacity: staff.isAvailable ? 1 : 0.6,
                        "&:hover": staff.isAvailable
                          ? {
                              borderColor: "#9CA3AF",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }
                          : {},
                      }}
                    >
                      <Box
                        sx={{ p: 2 }}
                        onClick={() =>
                          handleStaffClick(staff.staffId, staff.isAvailable)
                        }
                      >
                        {/* Staff Header */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Avatar
                              sx={{
                                bgcolor: staff.isAvailable
                                  ? "#111827"
                                  : "#9CA3AF",
                                width: 36,
                                height: 36,
                              }}
                            >
                              <Person sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#111827",
                                  }}
                                >
                                  {staff.staffName}
                                </Typography>
                                {staff.isAvailable ? (
                                  <CheckCircleOutline
                                    sx={{
                                      fontSize: 16,
                                      color: "#10B981",
                                    }}
                                  />
                                ) : (
                                  <Block
                                    sx={{
                                      fontSize: 16,
                                      color: "#EF4444",
                                    }}
                                  />
                                )}
                              </Stack>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                {staff.isAvailable ? "Sẵn sàng" : "Có xung đột"}
                              </Typography>
                            </Box>
                          </Stack>

                          <IconButton size="small">
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Stack>

                        {/* Workload Summary */}
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          gap={0.5}
                        >
                          <Chip
                            label={`${staff.conflictingBookings} Bookings`}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 24,
                              bgcolor: "#F3F4F6",
                              color: "#374151",
                              border: "none",
                            }}
                          />
                          <Chip
                            label={`${staff.conflictingVerifications} Verifications`}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 24,
                              bgcolor: "#F3F4F6",
                              color: "#374151",
                              border: "none",
                            }}
                          />
                          <Chip
                            label={`${staff.todayPickupBookings} Pickups`}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 24,
                              bgcolor: "#F3F4F6",
                              color: "#374151",
                              border: "none",
                            }}
                          />
                          <Chip
                            label={`${staff.todayReturnBookings} Returns`}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 24,
                              bgcolor: "#F3F4F6",
                              color: "#374151",
                              border: "none",
                            }}
                          />
                        </Stack>
                      </Box>

                      {/* Expanded Details */}
                      <Collapse in={isExpanded}>
                        <Divider />
                        <Box sx={{ p: 2, bgcolor: "#FAFAFA" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "#374151",
                              display: "block",
                              mb: 1.5,
                            }}
                          >
                            Chi tiết công việc:
                          </Typography>
                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                Bookings xung đột
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600, color: "#111827" }}
                              >
                                {staff.conflictingBookings}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                Verifications xung đột
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600, color: "#111827" }}
                              >
                                {staff.conflictingVerifications}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                Pickups hôm nay
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600, color: "#111827" }}
                              >
                                {staff.todayPickupBookings}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                Returns hôm nay
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600, color: "#111827" }}
                              >
                                {staff.todayReturnBookings}
                              </Typography>
                            </Stack>

                            {(staff.conflictingBookings > 0 ||
                              staff.conflictingVerifications > 0) && (
                              <Alert
                                severity="warning"
                                icon={<Warning fontSize="small" />}
                                sx={{ mt: 1, py: 0.5 }}
                              >
                                <Typography variant="caption">
                                  Có{" "}
                                  {staff.conflictingBookings +
                                    staff.conflictingVerifications}{" "}
                                  công việc xung đột
                                </Typography>
                              </Alert>
                            )}

                            {staff.isAvailable && !isSelected && (
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStaffChange(staff.staffId);
                                }}
                                sx={{
                                  mt: 1,
                                  borderColor: "#D1D5DB",
                                  color: "#374151",
                                  "&:hover": {
                                    borderColor: "#9CA3AF",
                                    bgcolor: "#F9FAFB",
                                  },
                                }}
                              >
                                Chọn nhân viên
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Selected Staff Summary */}
          {selectedStaffWorkload && (
            <Alert
              severity={selectedStaffWorkload.isAvailable ? "success" : "error"}
              icon={
                selectedStaffWorkload.isAvailable ? (
                  <CheckCircleOutline />
                ) : (
                  <Block />
                )
              }
              sx={{ mt: 3, borderRadius: 1.5 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Nhân viên được chọn: {selectedStaffWorkload.staffName}
              </Typography>
              <Typography variant="caption">
                {selectedStaffWorkload.isAvailable
                  ? `${selectedStaffWorkload.totalWorkload} công việc (${selectedStaffWorkload.conflictingBookings} bookings, ${selectedStaffWorkload.conflictingVerifications} verifications xung đột)`
                  : "Nhân viên không khả dụng do có xung đột lịch"}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "#6B7280",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={loading ? null : <CheckCircle />}
          disabled={
            !selectedStaff || loading || !selectedStaffWorkload?.isAvailable
          }
          sx={{
            bgcolor: "#111827",
            fontWeight: 500,
            px: 3,
            "&:hover": {
              bgcolor: "#1F2937",
            },
            "&:disabled": {
              bgcolor: "#E5E7EB",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Xác nhận"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
