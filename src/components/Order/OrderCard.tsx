import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import {
  MoreVertical,
  Eye,
  Camera,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import type { Booking } from "../../types/booking.types";
import { getOrderStatusInfo } from "../../utils/order.utils";

interface OrderCardProps {
  booking: Booking;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ booking, onMenuOpen }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const statusInfo = getOrderStatusInfo(booking.status, booking.statusText);
  const rentalDays = calculateRentalDays(booking.pickupAt, booking.returnAt);
  const platformFee =
    booking.snapshotRentalTotal * booking.snapshotPlatformFeePercent;
  const total =
    booking.snapshotRentalTotal + booking.snapshotDepositAmount + platformFee;

  return (
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
              {booking.items.map((item, index) => (
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
                    }}
                  >
                    <Camera size={24} color={colors.neutral[400]} />
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
              ))}
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
                Giá thuê cơ bản: {formatCurrency(booking.snapshotBaseDailyRate)}
                /ngày
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Eye size={18} />}
              sx={{
                mt: 2,
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
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderCard;
