import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tooltip,
  Menu,
  Avatar,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDropDown,
  Refresh,
  LocalShipping,
  AssignmentReturn,
  Camera,
  VerifiedUser,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";
import { staffService } from "../../services/staff.service";
import type { StaffScheduleEvent } from "../../services/staff.service";
import { fetchStaffList } from "../../services/booking.service";
import type { Staff } from "../../types/booking.types";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi";
import { dashboardService } from "../../services/dashboard.service";

dayjs.extend(isoWeek);
dayjs.locale("vi");

interface WorkSlot {
  id: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const getVietnameseDayName = (dayIndex: number): string => {
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return dayNames[dayIndex];
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (userId: string): string => {
  const colorsList = [
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
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colorsList.length;
  return colorsList[index];
};

const IndividualStaffSchedule: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Dayjs>(
    dayjs().startOf("isoWeek")
  );
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [scheduleEvents, setScheduleEvents] = useState<StaffScheduleEvent[]>(
    []
  );
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [yearMenuAnchor, setYearMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [weekMenuAnchor, setWeekMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, "day"));
  }, [currentWeekStart]);

  const weekRange = useMemo(() => {
    const start = currentWeekStart.format("DD/MM");
    const end = currentWeekStart.add(6, "day").format("DD/MM");
    return `${start} - ${end}`;
  }, [currentWeekStart]);

  const yearOptions = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const weekOptions = useMemo(() => {
    const yearStart = currentWeekStart.startOf("year").startOf("isoWeek");
    const yearEnd = currentWeekStart.endOf("year");
    const weeks = [];
    let currentWeek = yearStart;

    while (
      currentWeek.isBefore(yearEnd) ||
      currentWeek.isSame(yearEnd, "week")
    ) {
      const weekEnd = currentWeek.add(6, "day");
      weeks.push({
        weekStart: currentWeek,
        label: `${currentWeek.format("DD/MM")} - ${weekEnd.format("DD/MM")}`,
      });
      currentWeek = currentWeek.add(1, "week");
    }

    return weeks;
  }, [currentWeekStart]);

  const selectedStaff = useMemo(() => {
    return staffList.find((s) => s.userId === selectedStaffId);
  }, [staffList, selectedStaffId]);

  useEffect(() => {
    loadStaffList();
    loadWorkSlots();
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      loadStaffSchedule();
    }
  }, [selectedStaffId, currentWeekStart]);

  const loadStaffList = async () => {
    setLoadingStaff(true);
    try {
      const { staff, error } = await fetchStaffList();
      if (error) {
        toast.error("Không thể tải danh sách nhân viên");
      } else {
        setStaffList(staff);
        if (staff.length > 0) {
          setSelectedStaffId(staff[0].userId);
        }
      }
    } catch (err) {
      console.error("Error loading staff list:", err);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoadingStaff(false);
    }
  };
  const loadWorkSlots = async () => {
    setLoading(true);
    try {
      const slots = await dashboardService.getWorkSlots();
      setWorkSlots(slots.filter((slot) => slot.isActive));
    } catch (err: any) {
      console.error("Failed to load work slots:", err);
    } finally {
      setLoading(false);
    }
  };
  const loadStaffSchedule = async () => {
    if (!selectedStaffId) return;

    setLoading(true);
    try {
      const fromDate = currentWeekStart.toISOString();
      const toDate = currentWeekStart.add(7, "day").toISOString();

      const events = await staffService.getStaffSchedule(
        selectedStaffId,
        fromDate,
        toDate
      );
      setScheduleEvents(events);
    } catch (err: any) {
      console.error("Error loading staff schedule:", err);
      toast.error("Không thể tải lịch làm việc");
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

  const getEventForSlotAndDay = (
    slotIndex: number,
    dayIndex: number
  ): StaffScheduleEvent | null => {
    if (!scheduleEvents.length) return null;

    const targetDay = weekDays[dayIndex];
    const slot = workSlots.find((s) => s.slotIndex === slotIndex);
    if (!slot) return null;

    const startHour = parseInt(slot.startTime.split(":")[0]);
    const endHour = parseInt(slot.endTime.split(":")[0]);

    return (
      scheduleEvents.find((event) => {
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

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "BookingPickup":
        return {
          border: "#10B981",
          bg: "#D1FAE5",
          icon: LocalShipping,
        };
      case "BookingReturn":
        return {
          border: "#F59E0B",
          bg: "#FEF3C7",
          icon: AssignmentReturn,
        };
      case "Verification":
        return {
          border: "#8B5CF6",
          bg: "#EDE9FE",
          icon: Camera,
        };
      default:
        return {
          border: "#6B7280",
          bg: "#F3F4F6",
          icon: VerifiedUser,
        };
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            color: "#1F2937",
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          Lịch làm việc cá nhân
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#6B7280",
          }}
        >
          Xem chi tiết lịch làm việc của từng nhân viên
        </Typography>
      </Box>

      {/* Staff Selection & Week Navigation */}
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
          {/* Staff Selection */}
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Chọn nhân viên</InputLabel>
            <Select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              label="Chọn nhân viên"
              disabled={loadingStaff}
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary.light,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary.main,
                },
              }}
              renderValue={(value) => {
                const staff = staffList.find((s) => s.userId === value);
                if (!staff) return "";
                return (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getAvatarColor(staff.userId),
                        fontSize: "0.875rem",
                      }}
                    >
                      {getInitials(staff.fullName)}
                    </Avatar>
                    <Typography>{staff.fullName}</Typography>
                  </Stack>
                );
              }}
            >
              {staffList.map((staff) => (
                <MenuItem key={staff.userId} value={staff.userId}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getAvatarColor(staff.userId),
                        fontSize: "0.875rem",
                      }}
                    >
                      {getInitials(staff.fullName)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {staff.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {staff.email}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Year & Week Selection */}
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
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: "1rem",
                height: 36,
                "&:hover": {
                  backgroundColor: "#EA580C",
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

          {/* Week Navigation */}
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
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                minWidth: 140,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#EA580C",
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

          {/* Refresh Button */}
          <Tooltip title="Làm mới" arrow>
            <IconButton
              onClick={loadStaffSchedule}
              disabled={loading}
              sx={{
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#EA580C",
                },
                "&:disabled": {
                  backgroundColor: "#F3F4F6",
                  color: "#9CA3AF",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Selected Staff Info */}
      {selectedStaff && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: `linear-gradient(135deg, ${colors.primary.lighter} 0%, #FFFFFF 100%)`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: getAvatarColor(selectedStaff.userId),
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              {getInitials(selectedStaff.fullName)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedStaff.fullName}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  📧 {selectedStaff.email}
                </Typography>
                {selectedStaff.phone && (
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    📱 {selectedStaff.phone}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Calendar */}
      {loading || loadingStaff ? (
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
      ) : !selectedStaffId ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Vui lòng chọn nhân viên để xem lịch làm việc
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
          <Box sx={{ minWidth: 1000 }}>
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
                const dayOfWeek = day.day();

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
                          ? "#F97316"
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
                        color: isToday ? "#F97316" : "#1F2937",
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
                  minHeight: "80px",
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
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "#1F2937",
                    }}
                  >
                    Ca {slot.slotIndex}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9CA3AF",
                      fontSize: "0.7rem",
                    }}
                  >
                    {slot.startTime.substring(0, 5)}-
                    {slot.endTime.substring(0, 5)}
                  </Typography>
                </Box>

                {/* Event Cells */}
                {weekDays.map((_, dayIndex) => {
                  const event = getEventForSlotAndDay(slot.slotIndex, dayIndex);
                  const eventColor = event
                    ? getEventColor(event.eventType)
                    : null;
                  const EventIcon = eventColor?.icon;

                  return (
                    <Box
                      key={dayIndex}
                      sx={{
                        borderLeft: "1px solid #E5E7EB",
                        p: 0.5,
                        position: "relative",
                      }}
                    >
                      {event && eventColor && EventIcon && (
                        <Tooltip
                          title={
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {event.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ display: "block" }}
                              >
                                Thời gian:{" "}
                                {dayjs(event.startAt).format("HH:mm")}
                              </Typography>
                              {event.bookingId && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: "block" }}
                                >
                                  Mã đơn: {event.bookingId}
                                </Typography>
                              )}
                              {event.verificationId && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: "block" }}
                                >
                                  Mã kiểm tra: {event.verificationId}
                                </Typography>
                              )}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Card
                            sx={{
                              height: "100%",
                              cursor: "pointer",
                              border: `2px solid ${eventColor.border}`,
                              borderRadius: 1,
                              backgroundColor: eventColor.bg,
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                transform: "scale(1.02)",
                              },
                            }}
                          >
                            <CardContent
                              sx={{ p: 1, "&:last-child": { pb: 1 } }}
                            >
                              <Stack spacing={0.5}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                >
                                  <EventIcon
                                    sx={{
                                      fontSize: 14,
                                      color: eventColor.border,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 600,
                                      color: eventColor.border,
                                      fontSize: "0.7rem",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {event.eventType ===
                                    ("BookingReturn" as any)
                                      ? "Lấy hàng"
                                      : event.eventType ===
                                        ("BookingReturn" as any)
                                      ? "Trả hàng"
                                      : "Kiểm tra"}
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.65rem",
                                    color: "#6B7280",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {dayjs(event.startAt).format("HH:mm")}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Tooltip>
                      )}
                    </Box>
                  );
                })}
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
    </Box>
  );
};

export default IndividualStaffSchedule;
