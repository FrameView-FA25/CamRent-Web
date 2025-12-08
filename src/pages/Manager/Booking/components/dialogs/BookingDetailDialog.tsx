import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday,
  AccessTime,
  LocationOn,
  Camera,
  Person,
  Receipt,
  Description,
  CheckCircle,
  Image as ImageIcon,
} from "@mui/icons-material";
import type { Booking } from "@/types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
} from "../../../../../utils/booking.utils";

interface BookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({
  open,
  onClose,
  booking,
}) => {
  if (!booking) return null;

  const statusInfo = getStatusInfo(booking.statusText);

  // Calculate rental days
  const pickupDate = new Date(booking.pickupAt);
  const returnDate = new Date(booking.returnAt);
  const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
  const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Chi tiết đơn thuê
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
            ID: {booking.id}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Status & Type */}
        <Box sx={{ mb: 3, display: "flex", gap: 1 }}>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            icon={
              statusInfo.label === "Đã xác nhận" ? (
                <CheckCircle sx={{ fontSize: 18 }} />
              ) : undefined
            }
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={booking.type === "Rental" ? "Thuê" : booking.type}
            sx={{
              bgcolor: "#FFF7ED",
              color: "#F97316",
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* Left Column - Rental Information */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <CalendarToday sx={{ fontSize: 20 }} />
                Thông tin thuê
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 0.5 }}
                >
                  Ngày nhận
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(booking.pickupAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 0.5 }}
                >
                  Ngày trả
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(booking.returnAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <AccessTime sx={{ fontSize: 16 }} />
                  Thời gian thuê
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {rentalDays} ngày
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <LocationOn sx={{ fontSize: 16 }} />
                  Địa điểm
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {booking.location.district}, {booking.location.province}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {booking.location.country}
                </Typography>
              </Box>
            </Paper>

            {/* Renter Information */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 2,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Person sx={{ fontSize: 20 }} />
                Thông tin khách hàng
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                ID: {booking.renterId}
              </Typography>
            </Paper>
          </Box>

          {/* Right Column - Items & Payment */}
          <Box sx={{ flex: 1 }}>
            {/* Items List */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Camera sx={{ fontSize: 20 }} />
                Sản phẩm ({booking.items.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {booking.items.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 2,
                        bgcolor: "#FFF7ED",
                        color: "#F97316",
                      }}
                    >
                      <Camera />
                    </Avatar>
                    <ListItemText
                      primary={item.itemName || item.itemType}
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            {item.itemType} • ID: {item.itemId.substring(0, 8)}
                            ...
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#F97316", fontWeight: 700, mt: 0.5 }}
                          >
                            {formatCurrency(item.unitPrice)}/ngày
                          </Typography>
                          {item.depositAmount > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280" }}
                            >
                              Cọc: {formatCurrency(item.depositAmount)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Payment Details */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Receipt sx={{ fontSize: 20 }} />
                Chi tiết thanh toán
              </Typography>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Giá thuê cơ bản
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.snapshotBaseDailyRate)}/ngày
                </Typography>
              </Box>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Tổng phí thuê
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.snapshotRentalTotal)}
                </Typography>
              </Box>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Phí nền tảng (
                  {(booking.snapshotPlatformFeePercent * 100).toFixed(0)}%)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(
                    booking.snapshotRentalTotal *
                      booking.snapshotPlatformFeePercent
                  )}
                </Typography>
              </Box>

              <Box
                sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Tiền cọc
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.snapshotDepositAmount)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tổng cộng
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#F97316" }}
                >
                  {formatCurrency(
                    booking.snapshotRentalTotal +
                      booking.snapshotRentalTotal *
                        booking.snapshotPlatformFeePercent +
                      booking.snapshotDepositAmount
                  )}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Contracts Section */}
        {booking.contracts && booking.contracts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Description sx={{ fontSize: 20 }} />
                Hợp đồng ({booking.contracts.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {booking.contracts.slice(0, 3).map((contract, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {contract.branchName || "Chi nhánh"}
                          </Typography>
                          <Chip
                            label={contract.status}
                            size="small"
                            sx={{
                              bgcolor: "#FFF7ED",
                              color: "#F97316",
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            ID: {contract.id.substring(0, 8)}...
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            Tạo: {formatDate(contract.createdAt)}
                          </Typography>
                          {contract.branchAddress && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280" }}
                            >
                              {contract.branchAddress}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {booking.contracts.length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", ml: 2 }}
                  >
                    và {booking.contracts.length - 3} hợp đồng khác...
                  </Typography>
                )}
              </List>
            </Paper>
          </Box>
        )}

        {/* Inspections Section */}
        {booking.inspections && booking.inspections.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <ImageIcon sx={{ fontSize: 20 }} />
                Kiểm định ({booking.inspections.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {booking.inspections.map((inspection, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {inspection.itemName} - {inspection.label}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            Section: {inspection.section} • Value:{" "}
                            {inspection.value}
                          </Typography>
                          {inspection.notes && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280" }}
                            >
                              Ghi chú: {inspection.notes}
                            </Typography>
                          )}
                          {inspection.media && inspection.media.length > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#F97316" }}
                            >
                              {inspection.media.length} ảnh
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
