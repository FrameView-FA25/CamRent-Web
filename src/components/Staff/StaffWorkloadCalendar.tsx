import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Collapse,
  Divider,
  Avatar,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Schedule,
  CheckCircle,
  Person,
  Refresh,
  ExpandMore,
  ExpandLess,
  AccessTime,
  CalendarToday,
  Assignment,
  VerifiedUser,
  CheckCircleOutline,
  Block,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { colors } from "../../theme/colors";
import { staffService } from "../../services/staff.service";
import type {
  UnassignedBooking,
  UnassignedVerification,
} from "../../services/staff.service";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

// Interfaces
interface WorkSlot {
  id: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface StaffAvailability {
  staffId: string;
  staffName: string;
  isAvailable: boolean;
  assignedBookings: number;
  assignedVerifications: number;
  todayPickupBookings: number;
  todayReturnBookings: number;
  conflictingBookings: number;
  conflictingVerifications: number;
}

interface Staff {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

const StaffWorkloadCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<WorkSlot | null>(null);
  const [selectedType, setSelectedType] = useState<
    "booking" | "verification" | null
  >(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffAvailability, setStaffAvailability] = useState<
    StaffAvailability[]
  >([]);
  const [unassignedBookings, setUnassignedBookings] = useState<
    UnassignedBooking[]
  >([]);
  const [unassignedVerifications, setUnassignedVerifications] = useState<
    UnassignedVerification[]
  >([]);
  const [selectedBooking, setSelectedBooking] =
    useState<UnassignedBooking | null>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<UnassignedVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  // Load work slots on mount
  useEffect(() => {
    loadWorkSlots();
    loadStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load unassigned items when type selected
  useEffect(() => {
    if (selectedType) {
      if (selectedType === "booking") {
        loadUnassignedBookings();
      } else {
        loadUnassignedVerifications();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  // Load staff availability when booking/verification selected
  useEffect(() => {
    if (
      selectedSlot &&
      selectedDate &&
      (selectedBooking || selectedVerification)
    ) {
      loadStaffAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBooking, selectedVerification, selectedSlot, selectedDate]);

  const loadWorkSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/WorkSlots`, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch work slots");
      }

      const data: WorkSlot[] = await response.json();
      setWorkSlots(data.filter((slot) => slot.isActive));
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách khung giờ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/api/Staff/branch-staff`, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch staff list");
      }

      const data: Staff[] = await response.json();
      setStaffList(data);
    } catch (err: any) {
      console.error("Error loading staff list:", err);
    }
  };

  const loadUnassignedBookings = async () => {
    setLoadingItems(true);

    try {
      const data = await staffService.getUnassignedBookings();
      setUnassignedBookings(data);
    } catch (err: any) {
      console.error("Error loading unassigned bookings:", err);
      toast.error("Không thể tải danh sách booking");
      setUnassignedBookings([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadUnassignedVerifications = async () => {
    setLoadingItems(true);

    try {
      const data = await staffService.getUnassignedVerifications();
      setUnassignedVerifications(data);
    } catch (err: any) {
      console.error("Error loading unassigned verifications:", err);
      toast.error("Không thể tải danh sách verification");
      setUnassignedVerifications([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadStaffAvailability = async () => {
    if (!selectedDate || !selectedSlot) return;

    setLoadingStaff(true);

    try {
      // Calculate start and end datetime for the selected slot and date
      const startDateTime = dayjs(selectedDate)
        .hour(parseInt(selectedSlot.startTime.split(":")[0]))
        .minute(parseInt(selectedSlot.startTime.split(":")[1]))
        .second(0);

      const endDateTime = dayjs(selectedDate)
        .hour(parseInt(selectedSlot.endTime.split(":")[0]))
        .minute(parseInt(selectedSlot.endTime.split(":")[1]))
        .second(0);

      const data = await staffService.getAvailableStaff(
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        selectedType || "both"
      );

      setStaffAvailability(data.staffs);
    } catch (err: any) {
      console.error("Error loading staff availability:", err);
      setStaffAvailability([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSlotClick = (slot: WorkSlot) => {
    setSelectedSlot(slot);
    setSelectedType(null);
    setSelectedBooking(null);
    setSelectedVerification(null);
    setStaffAvailability([]);
    setExpandedStaff(null);
  };

  const handleTypeSelect = (type: "booking" | "verification") => {
    setSelectedType(type);
    setSelectedBooking(null);
    setSelectedVerification(null);
    setStaffAvailability([]);
    setExpandedStaff(null);
  };

  const handleBookingClick = (booking: UnassignedBooking) => {
    setSelectedBooking(booking);
    setSelectedVerification(null);
    setExpandedStaff(null);
  };

  const handleVerificationClick = (verification: UnassignedVerification) => {
    setSelectedVerification(verification);
    setSelectedBooking(null);
    setExpandedStaff(null);
  };

  const handleAssignStaff = async (staffId: string) => {
    setAssigning(true);

    try {
      if (selectedBooking) {
        await staffService.assignStaffToBooking(selectedBooking.id, staffId);
        toast.success(`Đã gán nhân viên cho booking ${selectedBooking.code}`);
        // Reload unassigned bookings
        await loadUnassignedBookings();
        setSelectedBooking(null);
        setStaffAvailability([]);
      } else if (selectedVerification) {
        await staffService.assignStaffToVerification(
          selectedVerification.id,
          staffId
        );
        toast.success(
          `Đã gán nhân viên cho verification ${selectedVerification.code}`
        );
        // Reload unassigned verifications
        await loadUnassignedVerifications();
        setSelectedVerification(null);
        setStaffAvailability([]);
      }
    } catch (err: any) {
      console.error("Error assigning staff:", err);
      toast.error(err?.message || "Không thể gán nhân viên");
    } finally {
      setAssigning(false);
    }
  };

  const handleStaffClick = (staffId: string) => {
    setExpandedStaff(expandedStaff === staffId ? null : staffId);
  };

  const getAvailabilityColor = (staff: StaffAvailability) => {
    if (!staff.isAvailable) {
      return {
        bgcolor: "#FEE2E2",
        borderColor: "#DC2626",
        color: "#991B1B",
      };
    }

    const totalWorkload =
      staff.assignedBookings +
      staff.assignedVerifications +
      staff.todayPickupBookings +
      staff.todayReturnBookings;

    if (totalWorkload === 0)
      return {
        bgcolor: "#D1FAE5",
        borderColor: "#10B981",
        color: "#065F46",
      };
    if (totalWorkload <= 3)
      return {
        bgcolor: "#DBEAFE",
        borderColor: "#3B82F6",
        color: "#1E40AF",
      };
    if (totalWorkload <= 6)
      return {
        bgcolor: "#FEF3C7",
        borderColor: "#F59E0B",
        color: "#92400E",
      };
    return {
      bgcolor: "#FEE2E2",
      borderColor: "#EF4444",
      color: "#991B1B",
    };
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #E5E7EB",
          minHeight: "80vh",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            color: "black",
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
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                📅 Quản lý lịch làm việc nhân viên
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Chọn khung giờ và loại công việc để gán nhân viên
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Chọn ngày"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        bgcolor: "white",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "white",
                          },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => {
                  loadWorkSlots();
                  if (selectedSlot && selectedType && selectedDate) {
                    loadStaffAvailability();
                  }
                }}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: colors.primary.main,
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                  },
                }}
              >
                Làm mới
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Main Content */}
        <Grid container sx={{ height: "calc(100vh - 200px)" }}>
          {/* Left Side - Work Slots */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              borderRight: { md: "1px solid #E5E7EB" },
              overflowY: "auto",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
              >
                ⏰ Khung giờ làm việc
              </Typography>

              {loading && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!loading && !error && (
                <Stack spacing={1.5}>
                  {workSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      elevation={0}
                      sx={{
                        border:
                          selectedSlot?.id === slot.id
                            ? `2px solid ${colors.primary.main}`
                            : "1px solid #E5E7EB",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor:
                          selectedSlot?.id === slot.id
                            ? colors.primary.lighter
                            : "white",
                        "&:hover": {
                          borderColor: colors.primary.main,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                      onClick={() => handleSlotClick(slot)}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              bgcolor:
                                selectedSlot?.id === slot.id
                                  ? colors.primary.main
                                  : "#F3F4F6",
                              color:
                                selectedSlot?.id === slot.id
                                  ? "white"
                                  : colors.primary.main,
                              fontWeight: 700,
                            }}
                          >
                            {slot.slotIndex}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: "#1F2937",
                                fontSize: "0.95rem",
                              }}
                            >
                              Slot {slot.slotIndex}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <AccessTime
                                sx={{ fontSize: 14, color: "#6B7280" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                {slot.startTime.substring(0, 5)} -{" "}
                                {slot.endTime.substring(0, 5)}
                              </Typography>
                            </Stack>
                          </Box>
                          {selectedSlot?.id === slot.id && (
                            <CheckCircle sx={{ color: colors.primary.main }} />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          {/* Middle - Type Selection & Items */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              borderRight: { md: "1px solid #E5E7EB" },
              overflowY: "auto",
            }}
          >
            <Box sx={{ p: 3 }}>
              {!selectedSlot ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "#9CA3AF",
                  }}
                >
                  <Schedule sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Chọn khung giờ
                  </Typography>
                  <Typography variant="body2">
                    Vui lòng chọn một khung giờ bên trái để tiếp tục
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Selected Slot Info */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: colors.primary.lighter,
                      border: `1px solid ${colors.primary.main}`,
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      flexWrap="wrap"
                    >
                      <Chip
                        label={`Slot ${selectedSlot.slotIndex}`}
                        sx={{
                          bgcolor: colors.primary.main,
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarToday
                          sx={{ fontSize: 16, color: "#6B7280" }}
                        />
                        <Typography variant="body2" sx={{ color: "#374151" }}>
                          {selectedDate?.format("DD/MM/YYYY")}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTime sx={{ fontSize: 16, color: "#6B7280" }} />
                        <Typography variant="body2" sx={{ color: "#374151" }}>
                          {selectedSlot.startTime.substring(0, 5)} -{" "}
                          {selectedSlot.endTime.substring(0, 5)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  {/* Type Selection */}
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
                  >
                    🎯 Chọn loại công việc
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        flex: 1,
                        border:
                          selectedType === "booking"
                            ? `2px solid ${colors.primary.main}`
                            : "1px solid #E5E7EB",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor:
                          selectedType === "booking"
                            ? colors.primary.lighter
                            : "white",
                        "&:hover": {
                          borderColor: colors.primary.main,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                      onClick={() => handleTypeSelect("booking")}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 1 }}
                        >
                          <Assignment
                            sx={{
                              color:
                                selectedType === "booking"
                                  ? colors.primary.main
                                  : "#6B7280",
                            }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color:
                                selectedType === "booking"
                                  ? colors.primary.main
                                  : "#1F2937",
                            }}
                          >
                            Booking
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Gán nhân viên xử lý đơn thuê
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card
                      elevation={0}
                      sx={{
                        flex: 1,
                        border:
                          selectedType === "verification"
                            ? `2px solid ${colors.primary.main}`
                            : "1px solid #E5E7EB",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor:
                          selectedType === "verification"
                            ? colors.primary.lighter
                            : "white",
                        "&:hover": {
                          borderColor: colors.primary.main,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                      onClick={() => handleTypeSelect("verification")}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 1 }}
                        >
                          <VerifiedUser
                            sx={{
                              color:
                                selectedType === "verification"
                                  ? colors.primary.main
                                  : "#6B7280",
                            }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color:
                                selectedType === "verification"
                                  ? colors.primary.main
                                  : "#1F2937",
                            }}
                          >
                            Verification
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Gán nhân viên xác minh thiết bị
                        </Typography>
                      </CardContent>
                    </Card>
                  </Stack>

                  {/* Booking/Verification List */}
                  {selectedType && (
                    <>
                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
                      >
                        {selectedType === "booking"
                          ? "📋 Danh sách Booking chưa gán"
                          : "✅ Danh sách Verification chưa gán"}
                      </Typography>

                      {loadingItems && (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <CircularProgress size={32} />
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, color: "#6B7280" }}
                          >
                            Đang tải danh sách...
                          </Typography>
                        </Box>
                      )}

                      {!loadingItems &&
                        selectedType === "booking" &&
                        unassignedBookings.length === 0 && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Không có booking nào chưa được gán nhân viên
                          </Alert>
                        )}

                      {!loadingItems &&
                        selectedType === "verification" &&
                        unassignedVerifications.length === 0 && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Không có verification nào chưa được gán nhân viên
                          </Alert>
                        )}

                      {/* Booking List with Scroll */}
                      {!loadingItems &&
                        selectedType === "booking" &&
                        unassignedBookings.length > 0 && (
                          <Box
                            sx={{
                              maxHeight: "400px",
                              overflowY: "auto",
                              pr: 1,
                              "&::-webkit-scrollbar": {
                                width: "8px",
                              },
                              "&::-webkit-scrollbar-track": {
                                bgcolor: "#F3F4F6",
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                bgcolor: "#D1D5DB",
                                borderRadius: "4px",
                                "&:hover": {
                                  bgcolor: "#9CA3AF",
                                },
                              },
                            }}
                          >
                            <Stack spacing={2}>
                              {unassignedBookings.map((booking) => (
                                <Card
                                  key={booking.id}
                                  elevation={0}
                                  sx={{
                                    border:
                                      selectedBooking?.id === booking.id
                                        ? `2px solid ${colors.primary.main}`
                                        : "1px solid #E5E7EB",
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    bgcolor:
                                      selectedBooking?.id === booking.id
                                        ? colors.primary.lighter
                                        : "white",
                                    "&:hover": {
                                      borderColor: colors.primary.main,
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    },
                                  }}
                                  onClick={() => handleBookingClick(booking)}
                                >
                                  <CardContent>
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="start"
                                    >
                                      <Box sx={{ flex: 1 }}>
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1}
                                          sx={{ mb: 1 }}
                                        >
                                          <Typography
                                            sx={{
                                              fontWeight: 700,
                                              color: colors.primary.main,
                                            }}
                                          >
                                            {booking.code}
                                          </Typography>
                                          <Chip
                                            label={booking.status}
                                            size="small"
                                            sx={{
                                              bgcolor: "#DBEAFE",
                                              color: "#1E40AF",
                                              fontSize: "0.7rem",
                                            }}
                                          />
                                        </Stack>
                                        <Typography
                                          variant="body2"
                                          sx={{ color: "#374151", mb: 0.5 }}
                                        >
                                          👤 {booking.rentẻ}
                                        </Typography>
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={0.5}
                                          sx={{ mb: 0.5 }}
                                        >
                                          <CalendarToday
                                            sx={{
                                              fontSize: 14,
                                              color: "#6B7280",
                                            }}
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "#6B7280" }}
                                          >
                                            {dayjs(booking.startDate).format(
                                              "DD/MM/YYYY"
                                            )}{" "}
                                            -{" "}
                                            {dayjs(booking.endDate).format(
                                              "DD/MM/YYYY"
                                            )}
                                          </Typography>
                                        </Stack>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            color: "#059669",
                                          }}
                                        >
                                          {booking.totalAmount.toLocaleString()}
                                          đ
                                        </Typography>
                                      </Box>
                                      {selectedBooking?.id === booking.id && (
                                        <CheckCircle
                                          sx={{ color: colors.primary.main }}
                                        />
                                      )}
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        )}

                      {/* Verification List with Scroll */}
                      {!loadingItems &&
                        selectedType === "verification" &&
                        unassignedVerifications.length > 0 && (
                          <Box
                            sx={{
                              maxHeight: "400px",
                              overflowY: "auto",
                              pr: 1,
                              "&::-webkit-scrollbar": {
                                width: "8px",
                              },
                              "&::-webkit-scrollbar-track": {
                                bgcolor: "#F3F4F6",
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                bgcolor: "#D1D5DB",
                                borderRadius: "4px",
                                "&:hover": {
                                  bgcolor: "#9CA3AF",
                                },
                              },
                            }}
                          >
                            <Stack spacing={2}>
                              {unassignedVerifications.map((verification) => (
                                <Card
                                  key={verification.id}
                                  elevation={0}
                                  sx={{
                                    border:
                                      selectedVerification?.id ===
                                      verification.id
                                        ? `2px solid ${colors.primary.main}`
                                        : "1px solid #E5E7EB",
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    bgcolor:
                                      selectedVerification?.id ===
                                      verification.id
                                        ? colors.primary.lighter
                                        : "white",
                                    "&:hover": {
                                      borderColor: colors.primary.main,
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    },
                                  }}
                                  onClick={() =>
                                    handleVerificationClick(verification)
                                  }
                                >
                                  <CardContent>
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="start"
                                    >
                                      <Box sx={{ flex: 1 }}>
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1}
                                          sx={{ mb: 1 }}
                                        >
                                          <Typography
                                            sx={{
                                              fontWeight: 700,
                                              color: colors.primary.main,
                                            }}
                                          >
                                            {verification.code}
                                          </Typography>
                                          <Chip
                                            label={verification.status}
                                            size="small"
                                            sx={{
                                              bgcolor: "#FEF3C7",
                                              color: "#92400E",
                                              fontSize: "0.7rem",
                                            }}
                                          />
                                        </Stack>
                                        <Typography
                                          variant="body2"
                                          sx={{ color: "#374151", mb: 0.5 }}
                                        >
                                          👤 {verification.fullName}
                                        </Typography>
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={0.5}
                                          sx={{ mb: 0.5 }}
                                        >
                                          <CalendarToday
                                            sx={{
                                              fontSize: 14,
                                              color: "#6B7280",
                                            }}
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "#6B7280" }}
                                          >
                                            {dayjs(
                                              verification.verificationDate
                                            ).format("DD/MM/YYYY HH:mm")}
                                          </Typography>
                                        </Stack>
                                        <Chip
                                          label={verification.documentType}
                                          size="small"
                                          sx={{
                                            bgcolor: "#E0E7FF",
                                            color: "#3730A3",
                                            fontSize: "0.7rem",
                                          }}
                                        />
                                      </Box>
                                      {selectedVerification?.id ===
                                        verification.id && (
                                        <CheckCircle
                                          sx={{ color: colors.primary.main }}
                                        />
                                      )}
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Right Side - Staff List */}
          <Grid item xs={12} md={4} sx={{ overflowY: "auto" }}>
            <Box sx={{ p: 3 }}>
              {/* Staff List - Show when booking/verification is selected */}
              {selectedBooking || selectedVerification ? (
                <>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
                  >
                    👥 Danh sách nhân viên khả dụng
                  </Typography>

                  {loadingStaff && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "#6B7280" }}
                      >
                        Đang kiểm tra tình trạng nhân viên...
                      </Typography>
                    </Box>
                  )}

                  {!loadingStaff && staffAvailability.length === 0 && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Không có thông tin nhân viên cho khung giờ này
                    </Alert>
                  )}

                  {!loadingStaff && staffAvailability.length > 0 && (
                    <Stack spacing={2}>
                      {staffAvailability.map((staff) => {
                        const colorScheme = getAvailabilityColor(staff);
                        const isExpanded = expandedStaff === staff.staffId;

                        return (
                          <Card
                            key={staff.staffId}
                            elevation={0}
                            sx={{
                              border: `2px solid ${colorScheme.borderColor}`,
                              borderRadius: 2,
                              bgcolor: colorScheme.bgcolor,
                              opacity: staff.isAvailable ? 1 : 0.7,
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Stack spacing={1.5}>
                                {/* Staff Header */}
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.5}
                                  >
                                    <Avatar
                                      sx={{
                                        bgcolor: staff.isAvailable
                                          ? colors.primary.main
                                          : "#9CA3AF",
                                        color: "white",
                                      }}
                                    >
                                      <Person />
                                    </Avatar>
                                    <Box>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <Typography
                                          sx={{
                                            fontWeight: 700,
                                            color: colorScheme.color,
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
                                              color: "#DC2626",
                                            }}
                                          />
                                        )}
                                      </Stack>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: colorScheme.color }}
                                      >
                                        {staff.isAvailable
                                          ? "Khả dụng"
                                          : "Không khả dụng"}
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleStaffClick(staff.staffId)
                                    }
                                  >
                                    {isExpanded ? (
                                      <ExpandLess />
                                    ) : (
                                      <ExpandMore />
                                    )}
                                  </IconButton>
                                </Stack>

                                {/* Workload Summary */}
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    label={`${staff.assignedBookings} Bookings`}
                                    size="small"
                                    sx={{
                                      bgcolor: "white",
                                      color: colorScheme.color,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                  <Chip
                                    label={`${staff.assignedVerifications} Verifications`}
                                    size="small"
                                    sx={{
                                      bgcolor: "white",
                                      color: colorScheme.color,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                  <Chip
                                    label={`${staff.todayPickupBookings} Pickups`}
                                    size="small"
                                    sx={{
                                      bgcolor: "white",
                                      color: colorScheme.color,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                  <Chip
                                    label={`${staff.todayReturnBookings} Returns`}
                                    size="small"
                                    sx={{
                                      bgcolor: "white",
                                      color: colorScheme.color,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                </Stack>

                                {/* Expanded Details */}
                                <Collapse in={isExpanded}>
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: "white",
                                      borderRadius: 1.5,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        color: "#1F2937",
                                        mb: 1,
                                      }}
                                    >
                                      Chi tiết công việc:
                                    </Typography>
                                    <Stack spacing={1}>
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "#6B7280" }}
                                        >
                                          Bookings được gán:
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {staff.assignedBookings}
                                        </Typography>
                                      </Stack>
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "#6B7280" }}
                                        >
                                          Verifications được gán:
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {staff.assignedVerifications}
                                        </Typography>
                                      </Stack>
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "#6B7280" }}
                                        >
                                          Pickups hôm nay:
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {staff.todayPickupBookings}
                                        </Typography>
                                      </Stack>
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "#6B7280" }}
                                        >
                                          Returns hôm nay:
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {staff.todayReturnBookings}
                                        </Typography>
                                      </Stack>

                                      {(staff.conflictingBookings > 0 ||
                                        staff.conflictingVerifications > 0) && (
                                        <>
                                          <Divider sx={{ my: 1 }} />
                                          <Alert
                                            severity="warning"
                                            sx={{ py: 0.5 }}
                                          >
                                            <Typography variant="caption">
                                              ⚠️ Có{" "}
                                              {staff.conflictingBookings +
                                                staff.conflictingVerifications}{" "}
                                              xung đột lịch
                                            </Typography>
                                          </Alert>
                                        </>
                                      )}
                                    </Stack>

                                    {staff.isAvailable && (
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        size="small"
                                        disabled={assigning}
                                        onClick={() =>
                                          handleAssignStaff(staff.staffId)
                                        }
                                        sx={{
                                          mt: 2,
                                          bgcolor: colors.primary.main,
                                          "&:hover": {
                                            bgcolor: colors.primary.dark,
                                          },
                                        }}
                                      >
                                        {assigning
                                          ? "Đang gán..."
                                          : "Gán công việc"}
                                      </Button>
                                    )}
                                  </Box>
                                </Collapse>
                              </Stack>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "#9CA3AF",
                  }}
                >
                  <Person sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Chọn công việc
                  </Typography>
                  <Typography variant="body2">
                    Vui lòng chọn một booking hoặc verification để xem danh sách
                    nhân viên
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StaffWorkloadCalendar;
