import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Schedule,
  CheckCircle,
  Cancel,
  Person,
  Refresh,
  CameraAlt,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { colors } from "../../theme/colors";
import { cameraService } from "../../services/camera.service";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi";

dayjs.extend(isoWeek);
dayjs.locale("vi");

// Interfaces
interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string;
  serialNumber: string;
  branchName: string;
  branchAddress: string;
  itemType: string;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  specsJson: string;
  isConfirmed: boolean;
  location: string;
  ownerUserId: string;
  ownerName: string;
  createdAt: string;
  media: Array<{
    id: string;
    url: string;
    contentType: string;
    sizeBytes: number;
    label: string;
  }>;
}

const StaffWorkloadCalendar: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("isoWeek")
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(7, "day"));
  const [availableCameras, setAvailableCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 10 }, (_, i) => dayjs().year() - 5 + i);

  useEffect(() => {
    if (startDate && endDate) {
      loadAvailableCameras();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const loadAvailableCameras = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const cameras = await cameraService.getAvailableCameras(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setAvailableCameras(cameras);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách camera khả dụng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = (weekStart: Dayjs) => {
    return Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  };

  const weekDays = getWeekDays(currentWeekStart);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(currentWeekStart.subtract(1, "week"));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(1, "week"));
  };

  const formatWeekRange = () => {
    const start = currentWeekStart.format("DD/MM");
    const end = currentWeekStart.add(6, "day").format("DD/MM");
    return `${start} - ${end}`;
  };

  const isToday = (date: Dayjs) => {
    return date.isSame(dayjs(), "day");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #E5E7EB",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: "white",
            borderBottom: "2px solid #E5E7EB",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                📅 Thời khóa biểu từng tuần
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Xem lịch làm việc của nhân viên theo tuần
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              {/* Year Selector */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E5E7EB",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary.main,
                    },
                  }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Week Navigation */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  bgcolor: "#F9FAFB",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <IconButton
                  size="small"
                  onClick={goToPreviousWeek}
                  sx={{
                    color: colors.primary.main,
                    "&:hover": {
                      bgcolor: colors.primary.lighter,
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#1F2937",
                    minWidth: 100,
                    textAlign: "center",
                  }}
                >
                  {formatWeekRange()}
                </Typography>

                <IconButton
                  size="small"
                  onClick={goToNextWeek}
                  sx={{
                    color: colors.primary.main,
                    "&:hover": {
                      bgcolor: colors.primary.lighter,
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadAvailableCameras}
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
          </Stack>

          {/* Date Range Pickers */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2,
              bgcolor: "#F9FAFB",
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1F2937", mb: 2 }}
            >
              🔍 Chọn khoảng thời gian để xem camera khả dụng
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={2} alignItems="center">
                <DatePicker
                  label="Ngày bắt đầu"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
                <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>
                  →
                </Typography>
                <DatePicker
                  label="Ngày kết thúc"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Stack>
            </LocalizationProvider>
          </Paper>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
            <Typography sx={{ mt: 2, color: "#6B7280" }}>
              Đang tải danh sách camera khả dụng...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Available Cameras List */}
        {!loading && !error && availableCameras.length > 0 && (
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
            >
              📷 Danh sách camera khả dụng ({availableCameras.length})
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {availableCameras.map((camera) => (
                <Paper
                  key={camera.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid #E5E7EB",
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: colors.primary.main,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* Camera Image */}
                  {camera.media && camera.media.length > 0 && (
                    <Box
                      sx={{
                        width: "100%",
                        height: 150,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        mb: 2,
                        bgcolor: "#F3F4F6",
                      }}
                    >
                      <img
                        src={camera.media[0].url}
                        alt={camera.model}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}

                  {/* Camera Info */}
                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#1F2937",
                        fontSize: "1rem",
                      }}
                    >
                      {camera.brand} {camera.model}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {camera.variant}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={camera.branchName}
                        size="small"
                        sx={{
                          bgcolor: colors.primary.lighter,
                          color: colors.primary.main,
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                      <Chip
                        icon={<CameraAlt sx={{ fontSize: 14 }} />}
                        label={`${camera.baseDailyRate.toLocaleString()}đ/ngày`}
                        size="small"
                        sx={{
                          bgcolor: "#ECFDF5",
                          color: "#065F46",
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#9CA3AF",
                        fontFamily: "monospace",
                      }}
                    >
                      SN: {camera.serialNumber}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && availableCameras.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CameraAlt sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
              Không có camera khả dụng
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              Không tìm thấy camera nào trong khoảng thời gian đã chọn
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StaffWorkloadCalendar;
