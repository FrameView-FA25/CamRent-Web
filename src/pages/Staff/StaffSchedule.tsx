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
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { decodeToken } from "../../utils/decodeToken";
import dayjs, { Dayjs } from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  LocalShipping,
  AssignmentReturn,
  Camera,
  ArrowDropDown,
  Refresh,
} from "@mui/icons-material";
import {
  dashboardService,
  type StaffScheduleResponse,
  type StaffScheduleEvent,
  type WorkSlot,
} from "../../services/dashboard.service";
import { colors } from "../../theme/colors";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

// Helper function to get Vietnamese day names
const getVietnameseDayName = (dayIndex: number): string => {
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return dayNames[dayIndex];
};

interface EventCellProps {
  event: StaffScheduleEvent | null;
  onClick?: () => void;
}

const EventCell: React.FC<EventCellProps> = ({ event, onClick }) => {
  if (!event) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FAFAFA",
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "#F3F4F6",
          },
        }}
      />
    );
  }

  const isPick = event.eventType === "BookingPickup";
  const isReturn = event.eventType === "BookingReturn";
  const isVerification = !isPick && !isReturn;
  const color = isPick ? "#10B981" : isReturn ? "#F59E0B" : "#8B5CF6";
  const bgColor = isPick ? "#D1FAE5" : isReturn ? "#FEF3C7" : "#EDE9FE";

  // Rút gọn tiêu đề cho event kiểm tra
  const displayTitle =
    isVerification && event.title.length > 15
      ? `${event.title.substring(0, 15)}...`
      : event.title;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {event.title}
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Thời gian: {dayjs(event.startAt).format("HH:mm")}
          </Typography>
          {event.bookingId && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Mã đơn: {event.bookingId}
            </Typography>
          )}
          {event.verificationId && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Mã kiểm tra: {event.verificationId}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
      enterDelay={300}
    >
      <Box
        onClick={onClick}
        sx={{
          height: "100%",
          width: "100%",
          maxWidth: "100%",
          border: `2px solid ${color}`,
          borderRadius: 1,
          backgroundColor: bgColor,
          p: 0.75,
          cursor: "pointer",
          transition: "all 0.2s",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transform: "scale(1.02)",
            zIndex: 1,
          },
        }}
      >
        <Stack spacing={0.3} sx={{ overflow: "hidden", width: "100%" }}>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ minWidth: 0, width: "100%" }}
          >
            {isPick ? (
              <LocalShipping sx={{ fontSize: 13, color, flexShrink: 0 }} />
            ) : isReturn ? (
              <AssignmentReturn sx={{ fontSize: 13, color, flexShrink: 0 }} />
            ) : (
              <Camera sx={{ fontSize: 13, color, flexShrink: 0 }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color,
                fontSize: "0.65rem",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              {displayTitle}
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              color: "#6B7280",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dayjs(event.startAt).format("HH:mm")}
          </Typography>
        </Stack>
      </Box>
    </Tooltip>
  );
};

const StaffSchedule: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Dayjs>(
    dayjs().startOf("isoWeek")
  );
  const [scheduleData, setScheduleData] =
    useState<StaffScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yearMenuAnchor, setYearMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [weekMenuAnchor, setWeekMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Lấy staffId từ token
  const staffId = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.userId || decoded?.id || decoded?.sub || null;
  }, []);

  // Tính toán tuần hiện tại
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, "day"));
  }, [currentWeekStart]);

  const weekRange = useMemo(() => {
    const start = currentWeekStart.format("DD/MM");
    const end = currentWeekStart.add(6, "day").format("DD/MM");
    return `${start} - ${end}`;
  }, [currentWeekStart]);

  useEffect(() => {
    loadWorkSlots();
  }, []);

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]);

  const loadWorkSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await dashboardService.getWorkSlots();
      setWorkSlots(slots.filter((slot) => slot.isActive));
    } catch (err: unknown) {
      console.error("Failed to load work slots:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách ca làm việc";
      setError(errorMessage);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadSchedule = async () => {
    if (!staffId) {
      setError("Không tìm thấy thông tin nhân viên");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fromDate = currentWeekStart.toISOString();
      const toDate = currentWeekStart.add(7, "day").toISOString();
      const data = await dashboardService.getStaffSchedule(
        staffId,
        fromDate,
        toDate
      );
      setScheduleData(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải lịch làm việc";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => prev.subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => prev.add(1, "week"));
  };

  const handleToday = () => {
    setCurrentWeekStart(dayjs().startOf("isoWeek"));
  };

  const handleYearClick = (event: React.MouseEvent<HTMLElement>) => {
    setYearMenuAnchor(event.currentTarget);
  };

  const handleYearClose = () => {
    setYearMenuAnchor(null);
  };

  const handleYearSelect = (year: number) => {
    const newDate = currentWeekStart.year(year);
    setCurrentWeekStart(newDate);
    handleYearClose();
  };

  const handleWeekClick = (event: React.MouseEvent<HTMLElement>) => {
    setWeekMenuAnchor(event.currentTarget);
  };

  const handleWeekClose = () => {
    setWeekMenuAnchor(null);
  };

  const handleWeekSelect = (weekStart: Dayjs) => {
    setCurrentWeekStart(weekStart);
    handleWeekClose();
  };

  const yearOptions = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const weekOptions = useMemo(() => {
    const yearStart = dayjs().startOf("year").startOf("isoWeek");
    const yearEnd = dayjs().endOf("year");
    const weeks = [];
    let currentWeek = yearStart;

    while (
      currentWeek.isBefore(yearEnd) ||
      currentWeek.isSame(yearEnd, "week")
    ) {
      const weekEnd = currentWeek.add(6, "day");
      weeks.push({
        weekStart: currentWeek,
        label: `${currentWeek.format("DD/MM")} To ${weekEnd.format("DD/MM")}`,
      });
      currentWeek = currentWeek.add(1, "week");
    }

    return weeks;
  }, []);

  // Map events to calendar grid
  const getEventForSlotAndDay = (
    slotIndex: number,
    dayIndex: number
  ): StaffScheduleEvent | null => {
    if (!scheduleData || !workSlots.length) return null;

    const targetDay = weekDays[dayIndex];
    const slot = workSlots.find((s) => s.slotIndex === slotIndex);
    if (!slot) return null;

    const startHour = parseInt(slot.startTime.split(":")[0]);
    const endHour = parseInt(slot.endTime.split(":")[0]);

    return (
      scheduleData.find((event) => {
        const eventDate = dayjs(event.startAt);
        const eventHour = eventDate.hour();

        return (
          eventDate.isSame(targetDay, "day") &&
          eventHour >= startHour &&
          eventHour < endHour
        );
      }) || null
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
          Thời khóa biểu tuần
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6B7280",
          }}
        >
          Lịch làm việc của bạn theo tuần và các ca đã được phân công
        </Typography>
      </Box>

      {/* Week Navigation */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Chip
              label={currentWeekStart.year()}
              onClick={handleYearClick}
              deleteIcon={
                <ArrowDropDown sx={{ color: "#FFFFFF !important" }} />
              }
              onDelete={handleYearClick}
              sx={{
                fontWeight: 600,
                backgroundColor: colors.primary.light,
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: "1rem",
                height: 36,
                "&:hover": {
                  backgroundColor: colors.primary.main,
                },
              }}
            />
            <Menu
              anchorEl={yearMenuAnchor}
              open={Boolean(yearMenuAnchor)}
              onClose={handleYearClose}
            >
              {yearOptions.map((year) => (
                <MenuItem
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  selected={year === currentWeekStart.year()}
                >
                  {year}
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={handlePreviousWeek} size="small">
              <ChevronLeft />
            </IconButton>
            <Chip
              label={weekRange}
              onClick={handleWeekClick}
              deleteIcon={
                <ArrowDropDown sx={{ color: "#FFFFFF !important" }} />
              }
              onDelete={handleWeekClick}
              sx={{
                fontWeight: 600,
                backgroundColor: colors.primary.light,
                color: "#FFFFFF",
                minWidth: 140,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: colors.primary.main,
                },
              }}
            />
            <Menu
              anchorEl={weekMenuAnchor}
              open={Boolean(weekMenuAnchor)}
              onClose={handleWeekClose}
              PaperProps={{
                style: {
                  maxHeight: 400,
                },
              }}
            >
              {weekOptions.map((week, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleWeekSelect(week.weekStart)}
                  selected={week.weekStart.isSame(currentWeekStart, "day")}
                >
                  {week.label}
                </MenuItem>
              ))}
            </Menu>
            <IconButton onClick={handleNextWeek} size="small">
              <ChevronRight />
            </IconButton>
          </Stack>

          <Tooltip title="Về tuần hiện tại" arrow>
            <IconButton
              onClick={handleToday}
              sx={{
                backgroundColor: colors.primary.light,
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: colors.primary.main,
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {loading || loadingSlots ? (
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
      ) : (
        <Paper
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflow: "auto",
          }}
        >
          {/* Calendar Grid */}
          <Box sx={{ minWidth: 900 }}>
            {/* Header Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "140px repeat(7, 1fr)",
                borderBottom: "2px solid #E5E7EB",
                backgroundColor: "#F9FAFB",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "0.875rem",
                }}
              >
                CA
              </Box>
              {weekDays.map((day, index) => {
                const isToday = day.isSame(dayjs(), "day");
                const isSaturday = index === 5;
                const isSunday = index === 6;
                const dayOfWeek = day.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

                return (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderLeft: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: 600,
                        color: isToday
                          ? colors.primary.main
                          : isSaturday
                          ? "#3B82F6"
                          : isSunday
                          ? "#EF4444"
                          : "#6B7280",
                        fontSize: "0.75rem",
                      }}
                    >
                      {getVietnameseDayName(dayOfWeek)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? colors.primary.main : "#1F2937",
                      }}
                    >
                      {day.format("DD/MM")}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Time Slots Rows */}
            {workSlots.map((slot) => (
              <Box
                key={slot.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "140px repeat(7, 1fr)",
                  borderBottom: "1px solid #E5E7EB",
                  "&:hover": {
                    backgroundColor: "#FAFAFA",
                  },
                }}
              >
                {/* Slot Label */}
                <Box
                  sx={{
                    p: 2,
                    borderRight: "1px solid #E5E7EB",
                    backgroundColor: "#F9FAFB",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ca {slot.slotIndex}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9CA3AF",
                      fontSize: "0.7rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {slot.startTime.substring(0, 5)}-
                    {slot.endTime.substring(0, 5)}
                  </Typography>
                </Box>

                {/* Event Cells */}
                {weekDays.map((_, dayIndex) => (
                  <Box
                    key={dayIndex}
                    sx={{
                      borderLeft: "1px solid #E5E7EB",
                      p: 0.5,
                      height: 70,
                      display: "flex",
                    }}
                  >
                    <EventCell
                      event={getEventForSlotAndDay(slot.slotIndex, dayIndex)}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              p: 2,
              borderTop: "2px solid #E5E7EB",
              backgroundColor: "#F9FAFB",
            }}
          >
            <Stack direction="row" spacing={3} justifyContent="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#D1FAE5",
                    border: "2px solid #10B981",
                    borderRadius: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Lấy hàng
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#FEF3C7",
                    border: "2px solid #F59E0B",
                    borderRadius: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Trả hàng
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#EDE9FE",
                    border: "2px solid #8B5CF6",
                    borderRadius: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Kiểm tra
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default StaffSchedule;
