import React from "react";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import type { Booking } from "@/types/booking.types";
import { BookingCard } from "./BookingCard";

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
  onMenuClick,
  loading,
}) => {
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 8,
          textAlign: "center",
          bgcolor: "white",
        }}
      >
        <CircularProgress sx={{ color: "#F97316" }} />
        <Typography sx={{ mt: 2, color: "#6B7280", fontSize: "0.875rem" }}>
          Đang tải dữ liệu...
        </Typography>
      </Paper>
    );
  }

  if (paginatedBookings.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 8,
          textAlign: "center",
          bgcolor: "white",
        }}
      >
        <ShoppingCart sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
          Không tìm thấy đơn thuê nào
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
        >
          Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {paginatedBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onMenuClick={onMenuClick}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
            mb: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, newPage) => onPageChange(null, newPage - 1)}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#6B7280",
                fontWeight: 600,
                "&.Mui-selected": {
                  bgcolor: "#F97316",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#EA580C",
                  },
                },
                "&:hover": {
                  bgcolor: "#FFF7ED",
                },
              },
            }}
          />
        </Box>
      )}

      {/* Summary */}
      <Box
        sx={{
          textAlign: "center",
          mt: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          Hiển thị {page * rowsPerPage + 1} -{" "}
          {Math.min((page + 1) * rowsPerPage, filteredBookings.length)} trong
          tổng số {filteredBookings.length} đơn thuê
        </Typography>
      </Box>
    </Box>
  );
};
