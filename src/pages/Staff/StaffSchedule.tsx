import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  Grid,
  Tab,
  Tabs,
} from "@mui/material";
import { decodeToken } from "../../utils/decodeToken";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  CalendarToday,
  LocalShipping,
  AssignmentReturn,
  AccessTime,
  Camera,
} from "@mui/icons-material";
import {
  dashboardService,
  type StaffScheduleResponse,
  type StaffScheduleEvent,
} from "../../services/dashboard.service";
import { colors } from "../../theme/colors";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface EventCardProps {
  event: StaffScheduleEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isPick = event.eventType === "BookingPickup";
  const isReturn = event.eventType === "BookingReturn";

  const color = isPick ? "#10B981" : isReturn ? "#F59E0B" : "#8B5CF6";
  const bgColor = isPick ? "#D1FAE5" : isReturn ? "#FEF3C7" : "#EDE9FE";

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderLeft: `4px solid ${color}`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          transform: "translateX(4px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: bgColor,
                color: color,
                width: 40,
                height: 40,
              }}
            >
              {isPick ? (
                <LocalShipping />
              ) : isReturn ? (
                <AssignmentReturn />
              ) : (
                <Camera />
              )}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#1F2937" }}
              >
                {event.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime sx={{ fontSize: 16, color: "#6B7280" }} />
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {dayjs(event.startAt).format("DD/MM/YYYY HH:mm")}
                </Typography>
              </Stack>
            </Box>
            <Chip
              label={isPick ? "Lấy hàng" : isReturn ? "Trả hàng" : "Kiểm tra"}
              size="small"
              sx={{
                bgcolor: bgColor,
                color: color,
                fontWeight: 600,
              }}
            />
          </Stack>

          <Divider />

          {/* Event Info */}
          {event.bookingId && (
            <Typography variant="body2" sx={{ color: "#1F2937" }}>
              <strong>Mã đơn hàng:</strong>{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontFamily: "monospace",
                }}
              >
                {event.bookingId}
              </Typography>
            </Typography>
          )}

          {event.verificationId && (
            <Typography variant="body2" sx={{ color: "#1F2937" }}>
              <strong>Mã kiểm tra:</strong>{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontFamily: "monospace",
                }}
              >
                {event.verificationId}
              </Typography>
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const StaffSchedule: React.FC = () => {
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().add(7, "day"));
  const [scheduleData, setScheduleData] =
    useState<StaffScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Lấy staffId từ token
  const staffId = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.userId || decoded?.id || decoded?.sub || null;
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const loadSchedule = async () => {
    if (!fromDate || !toDate || !staffId) {
      setError("Không tìm thấy thông tin nhân viên");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getStaffSchedule(
        staffId,
        fromDate.toISOString(),
        toDate.toISOString()
      );
      setScheduleData(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải lịch làm việc");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Lọc events theo type
  const pickupEvents = useMemo(() => {
    return scheduleData?.filter((e) => e.eventType === "BookingPickup") || [];
  }, [scheduleData]);

  const returnEvents = useMemo(() => {
    return scheduleData?.filter((e) => e.eventType === "BookingReturn") || [];
  }, [scheduleData]);

  const verificationEvents = useMemo(() => {
    return scheduleData?.filter((e) => e.eventType === "Verification") || [];
  }, [scheduleData]);

  const totalEvents = scheduleData?.length || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#1F2937",
            fontWeight: 700,
            mb: 1,
          }}
        >
          Lịch Làm Việc
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6B7280",
          }}
        >
          Quản lý lịch lấy hàng và trả hàng của bạn
        </Typography>
      </Box>

      {/* Date Range Selector */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 5 }}>
              <DatePicker
                label="Từ ngày"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue as Dayjs | null)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <DatePicker
                label="Đến ngày"
                value={toDate}
                onChange={(newValue) => setToDate(newValue as Dayjs | null)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ color: colors.primary.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {totalEvents}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Sự kiện
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "40vh",
          }}
        >
          <CircularProgress size={48} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : scheduleData ? (
        <Paper
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                px: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                },
              }}
            >
              <Tab
                label={`Lấy hàng (${pickupEvents.length})`}
                icon={<LocalShipping />}
                iconPosition="start"
              />
              <Tab
                label={`Trả hàng (${returnEvents.length})`}
                icon={<AssignmentReturn />}
                iconPosition="start"
              />
              <Tab
                label={`Kiểm tra (${verificationEvents.length})`}
                icon={<Camera />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              {pickupEvents.length > 0 ? (
                pickupEvents.map((event) => (
                  <EventCard
                    key={event.bookingId || event.verificationId}
                    event={event}
                  />
                ))
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Không có lịch lấy hàng trong khoảng thời gian này
                </Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {returnEvents.length > 0 ? (
                returnEvents.map((event) => (
                  <EventCard
                    key={event.bookingId || event.verificationId}
                    event={event}
                  />
                ))
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Không có lịch trả hàng trong khoảng thời gian này
                </Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {verificationEvents.length > 0 ? (
                verificationEvents.map((event) => (
                  <EventCard
                    key={event.bookingId || event.verificationId}
                    event={event}
                  />
                ))
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Không có lịch kiểm tra trong khoảng thời gian này
                </Alert>
              )}
            </TabPanel>
          </Box>
        </Paper>
      ) : null}
    </Container>
  );
};

export default StaffSchedule;
