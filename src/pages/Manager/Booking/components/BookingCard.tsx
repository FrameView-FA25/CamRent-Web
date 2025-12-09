import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  MoreVert,
  CheckCircleOutline,
  CalendarToday,
  AccessTime,
  LocationOn,
  Camera,
  Business,
  Person,
  Inventory,
} from "@mui/icons-material";
import type { Booking } from "@/types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
} from "../../../../utils/booking.utils";

interface BookingCardProps {
  booking: Booking;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onMenuClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = getStatusInfo(booking.statusText);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Calculate total days
  const pickupDate = new Date(booking.pickupAt);
  const returnDate = new Date(booking.returnAt);
  const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: "#F97316",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: expanded ? "#FFF7ED" : "white",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* First Row - ID, Status, Type, Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* ID */}
            <Typography
              sx={{
                fontWeight: 700,
                color: "#1F2937",
                fontSize: "0.95rem",
              }}
            >
              {booking.renter?.fullName} - {booking.renter?.phone}
            </Typography>

            {/* Status */}
            <Chip
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
              icon={
                statusInfo.label === "Đã xác nhận" ? (
                  <CheckCircleOutline
                    sx={{
                      fontSize: 16,
                      color: "#10B981 !important",
                    }}
                  />
                ) : undefined
              }
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
                ...(statusInfo.label === "Đã xác nhận"
                  ? {
                      bgcolor: "#10B981",
                      color: "#FFFFFF",
                    }
                  : {}),
              }}
            />

            {/* Type */}
            <Chip
              label={getBookingType(booking.type)}
              size="small"
              sx={{
                bgcolor: "#FFF7ED",
                color: "#F97316",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, booking);
              }}
              sx={{
                color: "#6B7280",
                "&:hover": {
                  color: "#F97316",
                  bgcolor: "#FFF7ED",
                },
              }}
            >
              <MoreVert />
            </IconButton>
            <IconButton
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                color: "#F97316",
              }}
            >
              <ExpandMore />
            </IconButton>
          </Box>
        </Box>

        {/* Second Row - Items Count, Staff, Phone, Branch */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {/* Items Count */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Inventory sx={{ fontSize: 16, color: "#6B7280" }} />
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Số lượng sản phẩm:{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#1F2937" }}>
                {booking.items.length}
              </Box>
            </Typography>
          </Box>

          {/* Staff */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Person sx={{ fontSize: 16, color: "#6B7280" }} />
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Nhân viên phụ trách:{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#1F2937" }}>
                {booking.staffName || "Chưa phân công"}
              </Box>
            </Typography>
          </Box>

          {/* Branch (if available) */}
          {booking.contracts &&
            booking.contracts.length > 0 &&
            booking.contracts[0].branchName && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Business sx={{ fontSize: 16, color: "#6B7280" }} />
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Chi nhánh:{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.contracts[0].branchName}
                  </Box>
                </Typography>
              </Box>
            )}
        </Box>
      </Box>

      {/* Collapsed Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 3, bgcolor: "#FAFAFA" }}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left Column - Product Info */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6B7280",
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Sản phẩm ({booking.items.length})
              </Typography>
              {booking.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Camera sx={{ color: "#F97316", fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#1F2937",
                          mb: 0.5,
                        }}
                      >
                        {item.itemName || item.itemType || "Camera"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#6B7280",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        {item.itemType} • ID: {item.itemId.substring(0, 8)}...
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#F97316",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatCurrency(item.unitPrice)}/ngày
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Middle Column - Rental Info */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6B7280",
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Thông tin thuê
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 16, color: "#F97316" }} />
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Ngày nhận
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937", pl: 3 }}
                  >
                    {formatDate(booking.pickupAt)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 16, color: "#F97316" }} />
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Ngày trả
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937", pl: 3 }}
                  >
                    {formatDate(booking.returnAt)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <AccessTime sx={{ fontSize: 16, color: "#F97316" }} />
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Thời gian thuê
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937", pl: 3 }}
                  >
                    {diffDays} ngày
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocationOn sx={{ fontSize: 16, color: "#F97316" }} />
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Địa điểm
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937", pl: 3 }}
                  >
                    {booking.location.district}, {booking.location.province}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Column - Payment Details */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6B7280",
                  mb: 2,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Chi tiết thanh toán
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Phí thuê
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
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
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Tiền cọc
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(booking.snapshotDepositAmount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Phí nền tảng (
                    {(booking.snapshotPlatformFeePercent * 100).toFixed(0)}%)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(
                      booking.snapshotRentalTotal *
                        booking.snapshotPlatformFeePercent
                    )}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    Tổng cộng
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#F97316" }}
                  >
                    {formatCurrency(
                      booking.snapshotRentalTotal +
                        booking.snapshotDepositAmount +
                        booking.snapshotRentalTotal *
                          booking.snapshotPlatformFeePercent
                    )}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#9CA3AF",
                    display: "block",
                    textAlign: "right",
                    mt: 0.5,
                  }}
                >
                  Giá thuê cơ bản:{" "}
                  {formatCurrency(booking.snapshotBaseDailyRate)}/ngày
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};
