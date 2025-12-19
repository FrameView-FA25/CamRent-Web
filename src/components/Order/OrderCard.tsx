import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  MoreVertical,
  Eye,
  Camera,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import type { Booking } from "../../types/booking.types";
import { getOrderStatusInfo } from "../../utils/order.utils";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface OrderCardProps {
  booking: Booking;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onStatusUpdate?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  booking,
  onMenuOpen,
  onStatusUpdate,
}) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportSeverity, setReportSeverity] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
  };

  const formatLocation = (location: Booking["location"]) => {
    return `${location.district}, ${location.province}, ${location.country}`;
  };

  const calculateRentalDays = (pickupAt: string, returnAt: string) => {
    const pickup = new Date(pickupAt);
    const returnDate = new Date(returnAt);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  // Get image URL from media array
  const getImageUrl = (media: any[]): string | null => {
    if (!media || media.length === 0) return null;
    return media[0].url || null;
  };

  // Handle update status to PickedUp
  const handleConfirmPickup = async () => {
    if (
      !window.confirm(
        "Xác nhận bạn đã nhận được thiết bị? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/api/Bookings/${booking.id}/update-status?status=PickedUp`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật trạng thái");
      }

      toast.success("Đã xác nhận nhận thiết bị thành công!");

      // ✅ Reload danh sách sau khi update thành công
      if (onStatusUpdate) {
        await onStatusUpdate();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle report issue

  const handleReportIssue = async () => {
    if (
      !reportTitle.trim() ||
      !reportDescription.trim() ||
      !reportSeverity.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin báo cáo");
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("bookingId", booking.id);
      formData.append("Title", reportTitle);
      formData.append("Description", reportDescription);
      formData.append("Severity", reportSeverity);

      // Append images if any
      reportImages.forEach((image) => {
        formData.append("Images", image);
      });

      const response = await fetch(
        `${API_BASE_URL}/Bookings/${booking.id}/reports`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể tạo báo cáo");
      }

      toast.success("Đã gửi báo cáo thiết bị thành công!");
      setReportDialogOpen(false);
      setReportTitle("");
      setReportDescription("");
      setReportSeverity("");
      setReportImages([]);

      // ✅ Reload danh sách sau khi gửi báo cáo
      if (onStatusUpdate) {
        await onStatusUpdate();
      }
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể gửi báo cáo"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setReportImages(Array.from(files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setReportImages((prev) => prev.filter((_, i) => i !== index));
  };
  const statusInfo = getOrderStatusInfo(booking.status, booking.statusText);
  const rentalDays = calculateRentalDays(booking.pickupAt, booking.returnAt);
  const platformFee =
    booking.snapshotRentalTotal * booking.snapshotPlatformFeePercent;
  const total =
    booking.snapshotRentalTotal + booking.snapshotDepositAmount + platformFee;

  // Determine which action button to show
  const showConfirmPickupButton = booking.status === "Confirmed";
  const showReportButton = booking.status === "PickedUp";

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.border.light}`,
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: colors.neutral[50],
            borderBottom: `1px solid ${colors.border.light}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: colors.text.secondary,
              }}
            >
              ID: {booking.id.slice(0, 8)}...
            </Typography>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              size="small"
              sx={{
                bgcolor: statusInfo.bgColor,
                color: statusInfo.color,
                fontWeight: 600,
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
            <Chip
              label={booking.type}
              size="small"
              variant="outlined"
              sx={{
                borderColor: colors.primary.main,
                color: colors.primary.main,
                fontWeight: 600,
              }}
            />
          </Box>

          <IconButton size="small" onClick={onMenuOpen}>
            <MoreVertical size={18} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left - Products */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.text.secondary,
                  mb: 2,
                }}
              >
                Sản phẩm ({booking.items.length})
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {booking.items.map((item, index) => {
                  const imageUrl = getImageUrl(item.media);

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        bgcolor: colors.neutral[50],
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          bgcolor: colors.neutral[100],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.itemName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const icon = document.createElement("div");
                                icon.innerHTML =
                                  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
                                icon.style.color = colors.neutral[400];
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <Camera size={24} color={colors.neutral[400]} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: colors.text.primary,
                            mb: 0.5,
                          }}
                        >
                          {item.itemName || "Camera"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.secondary,
                            display: "block",
                            fontFamily: "monospace",
                          }}
                        >
                          ID: {item.itemId.slice(0, 13)}...
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(item.unitPrice)}/ngày
                        </Typography>
                      </Box>
                      <Chip
                        label={item.itemType}
                        size="small"
                        sx={{
                          bgcolor: colors.primary.lighter,
                          color: colors.primary.main,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Middle - Rental Info */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.text.secondary,
                  mb: 2,
                }}
              >
                Thông tin thuê
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Calendar
                    size={20}
                    color={colors.primary.main}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                      }}
                    >
                      Ngày nhận
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      {formatDate(booking.pickupAt)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Calendar
                    size={20}
                    color={colors.status.error}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                      }}
                    >
                      Ngày trả
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      {formatDate(booking.returnAt)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Clock
                    size={20}
                    color={colors.accent.blue}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                      }}
                    >
                      Thời gian thuê
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      {rentalDays} ngày
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <MapPin
                    size={20}
                    color={colors.accent.purple}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                      }}
                    >
                      Địa điểm
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      {formatLocation(booking.location)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right - Payment Info */}
            <Box
              sx={{
                width: { xs: "100%", md: "300px" },
                flexShrink: 0,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.text.secondary,
                  mb: 2,
                }}
              >
                Chi tiết thanh toán
              </Typography>

              <Box
                sx={{
                  p: 2.5,
                  bgcolor: colors.neutral[50],
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Phí thuê
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                    }}
                  >
                    {formatCurrency(booking.snapshotRentalTotal)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Tiền cọc
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                    }}
                  >
                    {formatCurrency(booking.snapshotDepositAmount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                    pb: 2,
                    borderBottom: `1px solid ${colors.border.light}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Phí nền tảng (
                    {(booking.snapshotPlatformFeePercent * 100).toFixed(0)}%)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                    }}
                  >
                    {formatCurrency(platformFee)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: colors.text.primary,
                    }}
                  >
                    Tổng cộng
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: colors.primary.main,
                    }}
                  >
                    {formatCurrency(total)}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  Giá thuê cơ bản:{" "}
                  {formatCurrency(booking.snapshotBaseDailyRate)}
                  /ngày
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Eye size={18} />}
                  sx={{
                    borderColor: colors.border.light,
                    color: colors.text.primary,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: colors.primary.main,
                      bgcolor: colors.primary.lighter,
                    },
                  }}
                  onClick={() => navigate(`/renter/my-orders/${booking.id}`)}
                >
                  Xem chi tiết
                </Button>

                {/* Confirm Pickup Button */}
                {showConfirmPickupButton && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle size={18} />}
                    onClick={handleConfirmPickup}
                    disabled={updating}
                    sx={{
                      bgcolor: colors.status.success,
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "#388E3C",
                      },
                      "&:disabled": {
                        bgcolor: colors.neutral[300],
                      },
                    }}
                  >
                    {updating ? "Đang xử lý..." : "Đã nhận máy"}
                  </Button>
                )}

                {/* Report Issue Button */}
                {showReportButton && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AlertCircle size={18} />}
                    onClick={() => setReportDialogOpen(true)}
                    sx={{
                      borderColor: colors.status.warning,
                      color: colors.status.warning,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: colors.status.warning,
                        bgcolor: "#FFF3E0",
                      },
                    }}
                  >
                    Báo cáo thiết bị
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => !updating && setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Báo cáo vấn đề với thiết bị</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            {/* Title Field */}
            <TextField
              fullWidth
              label="Tiêu đề"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Nhập tiêu đề báo cáo..."
              required
            />

            {/* Description Field */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mô tả vấn đề"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải với thiết bị..."
              required
            />

            {/* Severity Field */}
            <TextField
              fullWidth
              select
              label="Mức độ nghiêm trọng"
              value={reportSeverity}
              onChange={(e) => setReportSeverity(e.target.value)}
              SelectProps={{
                native: true,
              }}
              required
              InputLabelProps={{
                shrink: true,
              }}
            >
              <option value="">Chọn mức độ</option>
              <option value="minor">Thấp</option>
              <option value="major">Trung bình</option>
              <option value="critical">Nghiêm trọng</option>
            </TextField>

            {/* Image Upload */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                Tải lên hình ảnh
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>

              {/* Image Previews */}
              {reportImages.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1,
                  }}
                >
                  {reportImages.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        paddingTop: "100%",
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: colors.neutral[100],
                      }}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        <XCircle size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                {reportImages.length} hình ảnh đã chọn
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setReportDialogOpen(false);
              setReportTitle("");
              setReportDescription("");
              setReportSeverity("");
              setReportImages([]);
            }}
            disabled={updating}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReportIssue}
            variant="contained"
            disabled={
              updating ||
              !reportTitle.trim() ||
              !reportDescription.trim() ||
              !reportSeverity.trim()
            }
          >
            {updating ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderCard;
