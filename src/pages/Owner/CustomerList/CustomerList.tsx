import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Avatar,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  Search,
  Visibility,
  Person,
  ShoppingCart,
  AttachMoney,
  CalendarToday,
} from "@mui/icons-material";
import {
  fetchOwnerRenters,
  fetchRenterBookingHistory,
  type RenterInfo,
  type RenterBookingHistory,
} from "../../../services/booking.service";
import { formatCurrency, formatDate } from "../../../utils/booking.utils";
import RenterBookingHistoryDialog from "../../../components/Owner/RenterBookingHistoryDialog";

const CustomerList: React.FC = () => {
  const [renters, setRenters] = useState<RenterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRenter, setSelectedRenter] = useState<RenterInfo | null>(null);
  const [bookingHistory, setBookingHistory] = useState<RenterBookingHistory[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadRenters();
  }, []);

  const loadRenters = async () => {
    setLoading(true);
    setError(null);
    const { renters: fetchedRenters, error: fetchError } =
      await fetchOwnerRenters();

    if (fetchError) {
      setError(fetchError);
    } else {
      setRenters(fetchedRenters);
    }
    setLoading(false);
  };

  const handleViewHistory = async (renter: RenterInfo) => {
    setSelectedRenter(renter);
    setDialogOpen(true);
    setHistoryLoading(true);

    const { bookings, error: historyError } = await fetchRenterBookingHistory(
      renter.renterId
    );

    if (historyError) {
      console.error("Error loading booking history:", historyError);
    } else {
      setBookingHistory(bookings);
    }
    setHistoryLoading(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRenter(null);
    setBookingHistory([]);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter renters based on search query
  const filteredRenters = renters.filter(
    (renter) =>
      renter.renterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renter.renterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renter.renterPhone.includes(searchQuery)
  );

  const paginatedRenters = filteredRenters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Quản lý khách hàng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Danh sách khách hàng đã thuê thiết bị của bạn
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#3b82f6", width: 48, height: 48 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {renters.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng khách hàng
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#10b981", width: 48, height: 48 }}>
              <ShoppingCart />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {renters.reduce((sum, r) => sum + r.totalBookings, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng booking
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#f59e0b", width: 48, height: 48 }}>
              <AttachMoney />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(
                  renters.reduce((sum, r) => sum + r.totalRevenue, 0)
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng doanh thu
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Stack>

      {/* Search */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#64748b" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="error">{error}</Typography>
            <Button onClick={loadRenters} sx={{ mt: 2 }}>
              Thử lại
            </Button>
          </Box>
        ) : paginatedRenters.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="text.secondary">
              {searchQuery
                ? "Không tìm thấy khách hàng phù hợp"
                : "Chưa có khách hàng nào"}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                      Số lần thuê
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                      Tổng doanh thu
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Lần thuê gần nhất
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRenters.map((renter) => (
                    <TableRow
                      key={renter.renterId}
                      hover
                      sx={{ "&:last-child td": { border: 0 } }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0284c7" }}>
                            {renter.renterName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {renter.renterName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {renter.renterEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {renter.renterPhone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          label={renter.totalBookings}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#059669" }}
                        >
                          {formatCurrency(renter.totalRevenue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CalendarToday
                            sx={{ fontSize: 16, color: "#64748b" }}
                          />
                          <Typography variant="body2">
                            {formatDate(renter.lastBookingDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewHistory(renter)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                        >
                          Xem lịch sử
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRenters.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong ${count}`
              }
            />
          </>
        )}
      </Paper>

      {/* Dialog */}
      {selectedRenter && (
        <RenterBookingHistoryDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          renterName={selectedRenter.renterName}
          renterEmail={selectedRenter.renterEmail}
          renterPhone={selectedRenter.renterPhone}
          bookings={bookingHistory}
          loading={historyLoading}
        />
      )}
    </Container>
  );
};

export default CustomerList;
