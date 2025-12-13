import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Close,
  Assignment,
  CheckCircle,
  LocalShipping,
  AssignmentReturn,
  AccessTime,
  CalendarMonth,
} from "@mui/icons-material";
import {
  staffService,
  type StaffScheduleEvent,
} from "../../services/staff.service";
import { colors } from "../../theme/colors";

interface StaffScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  selectedDate: string;
}

const StaffScheduleDialog: React.FC<StaffScheduleDialogProps> = ({
  open,
  onClose,
  staffId,
  staffName,
  selectedDate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<StaffScheduleEvent[]>([]);

  useEffect(() => {
    if (open && staffId) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staffId, selectedDate]);

  const loadSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      const date = new Date(selectedDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const data = await staffService.getStaffSchedule(
        staffId,
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      // Sort by start time
      data.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );

      setScheduleData(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không thể tải lịch làm việc"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeConfig = (
    eventType: string
  ): {
    icon: React.ReactElement;
    label: string;
    color: string;
    bgColor: string;
  } => {
    switch (eventType) {
      case "Verification":
        return {
          icon: <CheckCircle sx={{ fontSize: 18 }} />,
          label: "Xác nhận",
          color: "#10B981",
          bgColor: "#F0FDF4",
        };
      case "Pickup":
        return {
          icon: <LocalShipping sx={{ fontSize: 18 }} />,
          label: "Nhận hàng",
          color: "#F59E0B",
          bgColor: "#FFFBEB",
        };
      case "Return":
        return {
          icon: <AssignmentReturn sx={{ fontSize: 18 }} />,
          label: "Trả hàng",
          color: "#8B5CF6",
          bgColor: "#F5F3FF",
        };
      case "Booking":
        return {
          icon: <Assignment sx={{ fontSize: 18 }} />,
          label: "Đơn hàng",
          color: "#3B82F6",
          bgColor: "#EFF6FF",
        };
      default:
        return {
          icon: <Assignment sx={{ fontSize: 18 }} />,
          label: eventType,
          color: "#6B7280",
          bgColor: "#F9FAFB",
        };
    }
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: "#1F2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonth sx={{ color: colors.primary.main }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Lịch làm việc - {staffName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {formatDate(selectedDate)}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Summary */}
          {!loading && scheduleData.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: colors.primary.lighter,
                borderRadius: 2,
                border: `1px solid ${colors.primary.light}`,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                📊 Tổng quan công việc
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<Assignment sx={{ fontSize: 14 }} />}
                  label={`${
                    scheduleData.filter((e) => e.eventType === "Booking").length
                  } Đơn hàng`}
                  size="small"
                  sx={{ bgcolor: "white", fontWeight: 600 }}
                />
                <Chip
                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                  label={`${
                    scheduleData.filter((e) => e.eventType === "Verification")
                      .length
                  } Xác nhận`}
                  size="small"
                  sx={{ bgcolor: "white", fontWeight: 600 }}
                />
                <Chip
                  icon={<LocalShipping sx={{ fontSize: 14 }} />}
                  label={`${
                    scheduleData.filter((e) => e.eventType === "Pickup").length
                  } Nhận hàng`}
                  size="small"
                  sx={{ bgcolor: "white", fontWeight: 600 }}
                />
                <Chip
                  icon={<AssignmentReturn sx={{ fontSize: 14 }} />}
                  label={`${
                    scheduleData.filter((e) => e.eventType === "Return").length
                  } Trả hàng`}
                  size="small"
                  sx={{ bgcolor: "white", fontWeight: 600 }}
                />
              </Stack>
            </Paper>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress sx={{ color: colors.primary.main }} />
              <Typography sx={{ mt: 2, color: "#6B7280" }}>
                Đang tải lịch làm việc...
              </Typography>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && scheduleData.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CalendarMonth sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                Không có công việc
              </Typography>
              <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                Nhân viên chưa có lịch làm việc trong ngày này
              </Typography>
            </Box>
          )}

          {/* Schedule List */}
          {!loading && !error && scheduleData.length > 0 && (
            <Stack spacing={2}>
              {scheduleData.map((event, index) => {
                const config = getEventTypeConfig(event.eventType);

                return (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: "1px solid #E5E7EB",
                      borderRadius: 2,
                      bgcolor: config.bgColor,
                      borderLeft: `4px solid ${config.color}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      {/* Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Chip
                          icon={config.icon}
                          label={config.label}
                          size="small"
                          sx={{
                            bgcolor: config.color + "20",
                            color: config.color,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <AccessTime sx={{ fontSize: 16, color: "#6B7280" }} />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1F2937" }}
                          >
                            {formatTime(event.startAt)}
                            {event.startAt !== event.endAt &&
                              ` - ${formatTime(event.endAt)}`}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Title */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: "#1F2937",
                        }}
                      >
                        {event.title}
                      </Typography>

                      {/* IDs */}
                      <Box>
                        {event.bookingId && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "#6B7280",
                              fontFamily: "monospace",
                            }}
                          >
                            Booking ID: {event.bookingId.slice(0, 8)}...
                          </Typography>
                        )}
                        {event.verificationId && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "#6B7280",
                              fontFamily: "monospace",
                            }}
                          >
                            Verification ID: {event.verificationId.slice(0, 8)}
                            ...
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: colors.primary.main,
            "&:hover": {
              bgcolor: colors.primary.dark,
            },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffScheduleDialog;
