import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import { Visibility, CheckCircle, Assignment } from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";
import { getBookingStatusInfo } from "../../types/booking.types";

interface BookingsTableProps {
  bookings: Booking[];
  onViewDetail: (booking: Booking) => void;
  onComplete: (booking: Booking) => void;
  onInspection: (booking: Booking) => void;
  getItemsDisplay: (booking: Booking) => string;
  formatCurrency: (amount: number) => string;
  formatDateRange: (pickupAt: string, returnAt: string) => string;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onViewDetail,
  onComplete,
  onInspection,
  getItemsDisplay,
  formatCurrency,
  formatDateRange,
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã đơn</TableCell>
            <TableCell>Khách hàng</TableCell>
            <TableCell>Camera</TableCell>
            <TableCell>Thời gian thuê</TableCell>
            <TableCell>Ngày được gán</TableCell>
            <TableCell>Tổng tiền</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <Typography sx={{ fontWeight: 500, color: "#2196f3" }}>
                  {booking.id.substring(0, 8)}...
                </Typography>
                <Typography variant="caption" sx={{ color: "#999" }}>
                  {new Date(booking.pickupAt).toLocaleDateString("vi-VN")}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "#2196f3" }}>
                    {booking.renter?.fullName?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 500 }}>
                      {booking.renter?.fullName || "Unknown"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      {booking.renter?.phoneNumber || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{getItemsDisplay(booking)}</TableCell>
              <TableCell>
                {formatDateRange(booking.pickupAt, booking.returnAt)}
              </TableCell>
              <TableCell>
                {new Date(booking.pickupAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 600, color: "#2196f3" }}>
                  {formatCurrency(booking.snapshotRentalTotal)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#999" }}>
                  Cọc: {formatCurrency(booking.snapshotDepositAmount)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getBookingStatusInfo(booking.status).label}
                  color={getBookingStatusInfo(booking.status).color}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => onViewDetail(booking)}
                    title="Xem chi tiết"
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  {(booking.status === 1 || booking.status === 2) && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onInspection(booking)}
                      title="Kiểm tra thiết bị"
                    >
                      <Assignment fontSize="small" />
                    </IconButton>
                  )}
                  {booking.status === 2 && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => onComplete(booking)}
                      title="Cập nhật trạng thái"
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
