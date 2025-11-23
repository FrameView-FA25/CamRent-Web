import React, { useState, useEffect } from "react";
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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  LocalShipping,
  Edit,
  PhotoCamera,
  QrCodeScanner,
  TaskAlt,
  AccessTime,
  Payment,
  CheckCircleOutline,
} from "@mui/icons-material";
import { fetchBookingById } from "../../services/booking.service";
import type { Booking } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
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
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [deliveryPhotos, setDeliveryPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      loadBookingDetail();
    }
  }, [id]);

  const loadBookingDetail = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const { booking: fetchedBooking, error: fetchError } =
      await fetchBookingById(id);

    if (fetchError) {
      setError(fetchError);
    } else {
      setBooking(fetchedBooking);
    }
    setLoading(false);
  };

  const handleUpdateStatus = () => {
    setUpdateDialogOpen(false);
    setConfirmDialogOpen(true);
  };

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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setDeliveryPhotos([...deliveryPhotos, ...Array.from(event.target.files)]);
    }
  };

  const getStatusNumber = (statusText: string): number => {
    const statusMap: Record<string, number> = {
      "Chờ xác nhận": 0,
      "Đã xác nhận": 1,
      "Đang thuê": 2,
      "Hoàn thành": 3,
      "Đã hủy": 4,
    };
    return statusMap[statusText] ?? 0;
  };

  const getActiveStep = (status: number) => {
    switch (status) {
      case 0:
        return 0; // Pending
      case 1:
        return 1; // Confirmed
      case 2:
        return 2; // Delivering
      case 3:
        return 3; // Delivered
      case 4:
        return 4; // Completed
      default:
        return 0;
    }
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

  const statusInfo = getStatusInfo(booking.statusText);
  const statusNumber = getStatusNumber(booking.statusText);
  const canUpdateStatus = statusNumber >= 1 && statusNumber < 3;

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
                  label={statusInfo.label}
                  color={statusInfo.color}
                  icon={
                    statusInfo.label === "Đã xác nhận" ? (
                      <CheckCircleOutline
                        sx={{
                          fontSize: 18,
                          color: "#10B981 !important",
                        }}
                      />
                    ) : undefined
                  }
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    ...(statusInfo.label === "Đã xác nhận"
                      ? {
                          bgcolor: "#10B981",
                          color: "#FFFFFF",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                          "&:hover": {
                            bgcolor: "#059669",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                          },
                          background:
                            "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                          border: "none",
                          transition: "all 0.3s ease",
                        }
                      : {}),
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                Mã đơn: {booking.id}
              </Typography>
            </Box>
            {canUpdateStatus && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setUpdateDialogOpen(true)}
                sx={{
                  bgcolor: "#F97316",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    bgcolor: "#EA580C",
                  },
                }}
              >
                Cập nhật trạng thái
              </Button>
            )}
          </Box>
        </Box>

        {/* Stepper */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Stepper activeStep={getActiveStep(statusNumber)} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
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
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#6B7280",
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Left Column */}
          <Box sx={{ flex: 1 }}>
            {/* Customer Info */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
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
                      {booking.renter?.phoneNumber || "N/A"}
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
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
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
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1 }}>
            {/* Equipment List */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
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
                        Đơn giá
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
                        Tiền cọc
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1F2937" }}
                      >
                        {formatCurrency(item.depositAmount)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#1F2937", fontWeight: 600 }}
                      >
                        Thành tiền
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: "#F97316" }}
                      >
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            {/* Payment Summary */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Tổng tiền thuê
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
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
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Tiền cọc
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(booking.snapshotDepositAmount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Phí vận chuyển
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(0)}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "#FFF7ED",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    Tổng cộng
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#F97316" }}
                  >
                    {formatCurrency(
                      booking.snapshotRentalTotal +
                        booking.snapshotDepositAmount
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Update Status Dialog */}
        <Dialog
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#1F2937", pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                <Edit sx={{ color: "#F97316", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Cập nhật trạng thái
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Ghi nhận tiến độ giao hàng
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Alert
              severity="info"
              icon={<QrCodeScanner />}
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: "#E0F2FE",
                "& .MuiAlert-icon": {
                  color: "#0284C7",
                },
              }}
            >
              Vui lòng quét mã QR hoặc chụp ảnh bàn giao thiết bị
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ghi chú giao hàng"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả tình trạng thiết bị, ghi chú đặc biệt..."
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#F97316",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#F97316",
                  },
                },
              }}
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#1F2937", mb: 2 }}
              >
                Ảnh bàn giao ({deliveryPhotos.length})
              </Typography>

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-delivery-photos"
                type="file"
                multiple
                onChange={handlePhotoUpload}
              />
              <label htmlFor="upload-delivery-photos">
                <Button
                  fullWidth
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  sx={{
                    borderColor: "#F97316",
                    color: "#F97316",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "#FFF7ED",
                      borderColor: "#F97316",
                    },
                  }}
                >
                  Chụp / Tải ảnh lên
                </Button>
              </label>

              {deliveryPhotos.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "#F9FAFB",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {deliveryPhotos.length} ảnh đã tải lên
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setUpdateDialogOpen(false)}
              variant="outlined"
              sx={{
                borderColor: "#E5E7EB",
                color: "#6B7280",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#9CA3AF",
                  bgcolor: "#F9FAFB",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={!notes || deliveryPhotos.length === 0}
              sx={{
                bgcolor: "#F97316",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#EA580C",
                },
                "&:disabled": {
                  bgcolor: "#E5E7EB",
                  color: "#9CA3AF",
                },
              }}
            >
              Tiếp tục
            </Button>
          </DialogActions>
        </Dialog>

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
