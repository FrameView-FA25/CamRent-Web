import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  MoreVert,
  ShoppingCart,
  CheckCircleOutline,
} from "@mui/icons-material";
import type { Booking } from "../../../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
} from "../../../../utils/booking.utils";
import { getItemName } from "../../../../helpers/booking.helper";
import { ROWS_PER_PAGE_OPTIONS } from "../constants";

interface BookingTableProps {
  filteredBookings: Booking[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, booking: Booking) => void;
  loading: boolean;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  filteredBookings,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onMenuClick,
  loading,
}) => {
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F9FAFB" }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                  py: 2,
                }}
              >
                Mã đơn
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Loại thuê
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Thiết bị
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Thời gian thuê
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Tổng tiền
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Cọc
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Trạng thái
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 8 }}>
                  <CircularProgress sx={{ color: "#000000ff" }} />
                  <Typography
                    sx={{ mt: 2, color: "#6B7280", fontSize: "0.875rem" }}
                  >
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 8 }}>
                  <ShoppingCart
                    sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                    Không tìm thấy đơn thuê nào
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                  >
                    Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.statusText);
                return (
                  <TableRow
                    key={booking.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "#FFF7ED",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#000000ff",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {booking.id.slice(0, 8)}...
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                        {formatDate(booking.pickupAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getBookingType(booking.type)}
                        size="small"
                        sx={{
                          bgcolor: "#FFF7ED",
                          color: "#F97316",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {booking.items.map((item, idx) => (
                        <Box key={idx} sx={{ mb: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "#1F2937",
                              fontSize: "0.875rem",
                            }}
                          >
                            {getItemName(item)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            SL: {item.quantity} |{" "}
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "#1F2937", fontSize: "0.875rem" }}
                      >
                        {formatDate(booking.pickupAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6B7280", fontSize: "0.875rem" }}
                      >
                        đến {formatDate(booking.returnAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#000000ff",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {formatCurrency(booking.snapshotRentalTotal)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        Phí: {booking.snapshotPlatformFeePercent}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#1F2937",
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatCurrency(booking.snapshotDepositAmount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {booking.snapshotDepositPercent}%
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                          ...(statusInfo.label === "Đã xác nhận"
                            ? {
                                bgcolor: "#10B981",
                                color: "#FFFFFF",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                                "&:hover": {
                                  bgcolor: "#059669",
                                  boxShadow:
                                    "0 4px 12px rgba(16, 185, 129, 0.4)",
                                },
                                background:
                                  "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                border: "none",
                                transition: "all 0.3s ease",
                              }
                            : {}),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => onMenuClick(e, booking)}
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && filteredBookings.length > 0 && (
        <TablePagination
          component="div"
          count={filteredBookings.length}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
          sx={{
            borderTop: "1px solid #E5E7EB",
            "& .MuiTablePagination-select": {
              borderRadius: 1,
            },
            "& .MuiTablePagination-selectIcon": {
              color: "#F97316",
            },
            "& .MuiTablePagination-actions button": {
              color: "#F97316",
              "&:disabled": {
                color: "#9CA3AF",
              },
            },
          }}
        />
      )}
    </Paper>
  );
};
