import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  CalendarToday,
  Assignment,
  CheckCircle,
  LocalShipping,
  AssignmentReturn,
  Refresh,
} from "@mui/icons-material";
import {
  staffService,
  type StaffWorkloadResponse,
} from "../../services/staff.service";
import { colors } from "../../theme/colors";

const StaffWorkloadCalendar: React.FC = () => {
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(7, "day"));
  const [workloadData, setWorkloadData] =
    useState<StaffWorkloadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fromDate && toDate) {
      loadWorkload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const loadWorkload = async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);

    try {
      const data = await staffService.getStaffWorkload(
        fromDate.toISOString(),
        toDate.toISOString()
      );
      setWorkloadData(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu workload");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (staffId: string): string => {
    const palette = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    const index =
      staffId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      palette.length;
    return palette[index];
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getWorkloadLevel = (
    total: number
  ): { color: string; label: string } => {
    if (total === 0) return { color: "#10B981", label: "Rảnh" };
    if (total <= 3) return { color: "#3B82F6", label: "Bình thường" };
    if (total <= 6) return { color: "#F59E0B", label: "Bận" };
    return { color: "#EF4444", label: "Rất bận" };
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 3, bgcolor: "white" }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: colors.primary.lighter,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarToday sx={{ color: colors.primary.main, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
              Lịch làm việc nhân viên
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {workloadData?.branchName ||
                "Theo dõi workload của từng nhân viên"}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadWorkload}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderColor: colors.primary.main,
            color: colors.primary.main,
            "&:hover": {
              borderColor: colors.primary.dark,
              bgcolor: colors.primary.lighter,
            },
          }}
        >
          Làm mới
        </Button>
      </Stack>

      {/* Date Range Picker */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <DatePicker
            label="Từ ngày"
            value={fromDate}
            onChange={(value) => setFromDate(value ? dayjs(value) : null)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
          />
          <DatePicker
            label="Đến ngày"
            value={toDate}
            onChange={(value) => setToDate(value ? dayjs(value) : null)}
            minDate={fromDate || undefined}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
          />
        </Stack>
      </LocalizationProvider>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress sx={{ color: colors.primary.main }} />
          <Typography sx={{ mt: 2, color: "#6B7280" }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {/* Workload Cards */}
      {!loading && (!workloadData || workloadData.staffs.length === 0) && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CalendarToday sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#6B7280" }}>
            Không có dữ liệu workload
          </Typography>
        </Box>
      )}

      {!loading && workloadData && workloadData.staffs.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 2,
          }}
        >
          {workloadData.staffs.map((staff) => {
            const totalWorkload =
              staff.assignedBookings +
              staff.assignedVerifications +
              staff.todayPickupBookings +
              staff.todayReturnBookings;
            const workloadLevel = getWorkloadLevel(totalWorkload);

            return (
              <Card
                key={staff.staffId}
                elevation={0}
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: colors.primary.main,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  {/* Staff Info */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 45,
                          height: 45,
                          bgcolor: getAvatarColor(staff.staffId),
                          fontSize: "1rem",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(staff.staffName)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: "#1F2937" }}>
                          {staff.staffName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          ID: {staff.staffId.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={workloadLevel.label}
                      size="small"
                      sx={{
                        bgcolor: workloadLevel.color + "20",
                        color: workloadLevel.color,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Workload Stats */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 1.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1.5,
                        bgcolor: "#F3F4F6",
                        borderRadius: 1.5,
                      }}
                    >
                      <Assignment sx={{ fontSize: 20, color: "#3B82F6" }} />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#1F2937" }}
                        >
                          {staff.assignedBookings}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Bookings
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1.5,
                        bgcolor: "#F3F4F6",
                        borderRadius: 1.5,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 20, color: "#10B981" }} />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#1F2937" }}
                        >
                          {staff.assignedVerifications}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Xác nhận
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1.5,
                        bgcolor: "#F3F4F6",
                        borderRadius: 1.5,
                      }}
                    >
                      <LocalShipping sx={{ fontSize: 20, color: "#F59E0B" }} />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#1F2937" }}
                        >
                          {staff.todayPickupBookings}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Pickups hôm nay
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1.5,
                        bgcolor: "#F3F4F6",
                        borderRadius: 1.5,
                      }}
                    >
                      <AssignmentReturn
                        sx={{ fontSize: 20, color: "#8B5CF6" }}
                      />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#1F2937" }}
                        >
                          {staff.todayReturnBookings}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Returns hôm nay
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default StaffWorkloadCalendar;
