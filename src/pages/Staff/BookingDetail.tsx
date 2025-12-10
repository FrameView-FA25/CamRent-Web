import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  Stack,
  Collapse,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  LocalShipping,
  PhotoCamera,
  TaskAlt,
  AccessTime,
  Payment,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import {
  fetchBookingById,
  fetchStaffBookings,
} from "../../services/booking.service";
import type { Booking } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getBookingType,
  format,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";

const steps = [
  "Đơn hàng mới",
  "Đã xác nhận",
  "Đang giao hàng",
  "Đã giao hàng",
  "Hoàn thành",
];

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [deliveryPhotos, setDeliveryPhotos] = useState<File[]>([]);
  const [rentalDetailExpanded, setRentalDetailExpanded] = useState(false);
  const [paidDetailExpanded, setPaidDetailExpanded] = useState(false);
  const [unpaidDetailExpanded, setUnpaidDetailExpanded] = useState(false);

  const loadBookingDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const { booking: fetchedBooking, error: fetchError } =
      await fetchBookingById(id);

    if (fetchError) {
      setError(fetchError);
    } else if (fetchedBooking) {
      let renter = fetchedBooking.renter;

      if (!renter && fetchedBooking.renterId) {
        const { bookings: staffBookings } = await fetchStaffBookings();
        renter =
          staffBookings.find((staffBooking) => staffBooking.id === id)
            ?.renter || null;
      }

      setBooking({ ...fetchedBooking, renter });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadBookingDetail();
  }, [loadBookingDetail]);

  const handleConfirmUpdate = () => {
    console.log("Update booking status:", {
      bookingId: id,
      notes,
      photos: deliveryPhotos,
    });
    alert("Cập nhật trạng thái thành công!");
    setConfirmDialogOpen(false);
    setNotes("");
    setDeliveryPhotos([]);
  };

  const getStatusNumber = (statusText: string): number => {
    const statusMap: Record<string, number> = {
      Pending: 0,
      Confirmed: 1,
      Delivering: 2,
      Delivered: 3,
      Completed: 4,
      Cancelled: -1, // Đơn bị hủy không hiển thị progress
    };
    return statusMap[statusText] ?? 0;
  };

  const getActiveStep = (statusNumber: number) => {
    // Nếu đơn hàng bị hủy, không hiển thị step nào
    if (statusNumber === -1) return -1;

    // Trả về step hiện tại (đã hoàn thành step này)
    // VD: Confirmed (1) -> đã hoàn thành step 0 và step 1
    return statusNumber;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F5F5F5",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#F97316", mb: 2 }} size={60} />
          <Typography sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
            Đang tải thông tin đơn hàng...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/staff/my-assignments")}
              >
                Quay lại
              </Button>
            }
          >
            {error || "Không tìm thấy đơn hàng"}
          </Alert>
        </Container>
      </Box>
    );
  }

  const statusNumber = getStatusNumber(booking.statusText);

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => navigate("/staff/check-booking")}
              sx={{
                bgcolor: "white",
                border: "1px solid #E5E7EB",
                "&:hover": {
                  bgcolor: "#FFF7ED",
                  borderColor: "#F97316",
                },
              }}
            >
              <ArrowBack sx={{ color: "#F97316" }} />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Chi tiết đơn hàng
                <Chip
                  label={booking.statusText}
                  size="small"
                  sx={{
                    bgcolor: statusNumber === -1 ? "#FEE2E2" : "#FFF7ED",
                    color: statusNumber === -1 ? "#DC2626" : "#F97316",
                    fontWeight: 600,
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                Mã đơn: {booking.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stepper - Chỉ hiển thị nếu đơn hàng không bị hủy */}
        {statusNumber !== -1 && (
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Stepper activeStep={getActiveStep(statusNumber)} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index <= statusNumber}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        "&.Mui-active": {
                          color: "#F97316",
                        },
                        "&.Mui-completed": {
                          color: "#059669",
                        },
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: index <= statusNumber ? 600 : 400,
                        fontSize: "0.875rem",
                        color: index <= statusNumber ? "#1F2937" : "#9CA3AF",
                      }}
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: 3,
            mb: 4,
            "& > *": { height: "100%" },
          }}
        >
          {/* Customer Info */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#FFF7ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Person sx={{ color: "#F97316", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Thông tin khách hàng
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Chi tiết người thuê
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Họ và tên
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.renter?.fullName || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <Phone />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Số điện thoại
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.renter?.phone ||
                      booking.renter?.phoneNumber ||
                      "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <Email />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.renter?.email || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <LocationOn />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Địa chỉ giao hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.location
                      ? `${booking.location.district}, ${booking.location.province}`
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Delivery Info */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalShipping sx={{ color: "#4F46E5", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Thông tin giao hàng
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Chi tiết thời gian và địa điểm
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Ngày nhận hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatDate(booking.pickupAt)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Ngày trả hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatDate(booking.returnAt)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Loại thuê
                  </Typography>
                  <Chip
                    label={getBookingType(booking.type)}
                    size="small"
                    sx={{
                      bgcolor: "#FFF7ED",
                      color: "#F97316",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Equipment List */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#D1FAE5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PhotoCamera sx={{ color: "#059669", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Danh sách thiết bị
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {booking.items.length} thiết bị
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {booking.items.map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: "#F9FAFB",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#1F2937", flex: 1 }}
                    >
                      {getItemName(item)}
                    </Typography>
                    <Chip
                      label={`x${item.quantity}`}
                      size="small"
                      sx={{
                        bgcolor: "#FFF7ED",
                        color: "#F97316",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Đơn giá / Ngày
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatCurrency(item.unitPrice)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Tiền cọc thiết bị
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatCurrency(item.depositAmount)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>

          {/* Payment Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Payment sx={{ color: "#0284C7", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Tổng quan thanh toán
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Chi tiết chi phí
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {/* Dropdown cho Tổng tiền thuê */}
              <Box>
                <Box
                  onClick={() => setRentalDetailExpanded(!rentalDetailExpanded)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: rentalDetailExpanded ? "#FFF7ED" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#FFF7ED",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Tổng thanh toán
                    </Typography>
                    {rentalDetailExpanded ? (
                      <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                    ) : (
                      <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(
                      booking.snapshotRentalTotal +
                        booking.snapshotDepositAmount
                    )}
                  </Typography>
                </Box>

                <Collapse in={rentalDetailExpanded}>
                  <Box
                    sx={{
                      mt: 1,
                      ml: 2,
                      pl: 2,
                      borderLeft: "2px solid #F97316",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Tiền thuê thiết bị
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#374151" }}
                        >
                          {formatCurrency(booking.snapshotRentalTotal)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Tiền cọc thiết bị
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#374151" }}
                        >
                          {formatCurrency(booking.snapshotDepositAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              {/* Dropdown cho Đã thanh toán */}
              <Box>
                <Box
                  onClick={() => setPaidDetailExpanded(!paidDetailExpanded)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: paidDetailExpanded ? "#FFF7ED" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#FFF7ED",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Đã thanh toán
                    </Typography>
                    {paidDetailExpanded ? (
                      <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                    ) : (
                      <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(
                      booking.snapshotPlatformFeePercent *
                        booking.snapshotRentalTotal
                    )}
                  </Typography>
                </Box>

                <Collapse in={paidDetailExpanded}>
                  <Box
                    sx={{
                      mt: 1,
                      ml: 2,
                      pl: 2,
                      borderLeft: "2px solid #F97316",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Tiền giữ chỗ (
                          {format(booking.snapshotPlatformFeePercent)} Tổng tiền
                          thuê)
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#374151" }}
                        >
                          {formatCurrency(
                            booking.snapshotPlatformFeePercent *
                              booking.snapshotRentalTotal
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              {/* Dropdown cho Chưa thanh toán */}
              <Box>
                <Box
                  onClick={() => setUnpaidDetailExpanded(!unpaidDetailExpanded)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: unpaidDetailExpanded ? "#FFF7ED" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#FFF7ED",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Chưa thanh toán
                    </Typography>
                    {unpaidDetailExpanded ? (
                      <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                    ) : (
                      <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(
                      booking.snapshotRentalTotal +
                        booking.snapshotDepositAmount -
                        booking.snapshotPlatformFeePercent *
                          booking.snapshotRentalTotal
                    )}
                  </Typography>
                </Box>

                <Collapse in={unpaidDetailExpanded}>
                  <Box
                    sx={{
                      mt: 1,
                      ml: 2,
                      pl: 2,
                      borderLeft: "2px solid #F97316",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Tổng thanh toán - Đã thanh toán
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#374151" }}
                        >
                          {formatCurrency(
                            booking.snapshotRentalTotal +
                              booking.snapshotDepositAmount -
                              booking.snapshotPlatformFeePercent *
                                booking.snapshotRentalTotal
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Confirm Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogContent sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "#FFF7ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 3,
              }}
            >
              <TaskAlt sx={{ color: "#F97316", fontSize: 50 }} />
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
            >
              Xác nhận hoàn tất?
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
              Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này không?
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                onClick={() => setConfirmDialogOpen(false)}
                variant="outlined"
                sx={{
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: 120,
                  "&:hover": {
                    borderColor: "#9CA3AF",
                    bgcolor: "#F9FAFB",
                  },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                variant="contained"
                sx={{
                  bgcolor: "#F97316",
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: 120,
                  "&:hover": {
                    bgcolor: "#EA580C",
                  },
                }}
              >
                Xác nhận
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BookingDetail;
