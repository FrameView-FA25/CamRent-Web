import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Button,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Search,
  Refresh,
  Assignment,
  HourglassEmpty,
  LocalShipping,
  CheckCircleOutline,
  TaskAlt,
  Visibility,
  PlaylistAddCheck,
} from "@mui/icons-material";
import { fetchStaffBookings } from "../../services/booking.service";
import type { Booking } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { useNavigate } from "react-router-dom";
import ModalInspection from "../../components/Modal/ModalInspection";

const MyAssignments: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    const { bookings: fetchedBookings, error: fetchError } =
      await fetchStaffBookings();

    if (fetchError) {
      setError(fetchError);
    } else {
      setBookings(fetchedBookings);
    }
    setLoading(false);
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

  const handleViewDetail = (booking: Booking) => {
    navigate(`/staff/booking/${booking.id}`);
  };

  const handleOpenInspection = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setInspectionModalOpen(true);
  };

  const handleCloseInspection = () => {
    setInspectionModalOpen(false);
    setSelectedBookingId(null);
  };

  const handleInspectionSuccess = () => {
    loadAssignments();
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.renterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.items.some((item) =>
          getItemName(item).toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesTab =
        selectedTab === 0 ||
        (selectedTab === 1 && booking.status === 0) ||
        (selectedTab === 2 && booking.status === 1) ||
        (selectedTab === 3 && booking.status === 2) ||
        (selectedTab === 4 && booking.status === 3);

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchQuery, selectedTab]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredBookings, page, rowsPerPage]);

  // Mini chart data generator
  const generateChartData = (count: number) => {
    return Array.from(
      { length: 7 },
      () => Math.floor(Math.random() * count) + count / 2
    );
  };

  // Render mini chart
  const renderMiniChart = (data: number[], color: string) => {
    const max = Math.max(...data, 1); // Đảm bảo max >= 1 để tránh chia cho 0
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (value / max) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        width="80"
        height="40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const statsCards = [
    {
      title: "Tất cả",
      value: bookings.length.toString(),
      icon: <Assignment sx={{ fontSize: 24 }} />,
      chart: generateChartData(bookings.length),
      color: "#0284C7",
    },
    {
      title: "Chờ xác nhận",
      value: bookings.filter((b) => b.status === 0).length.toString(),
      icon: <HourglassEmpty sx={{ fontSize: 24 }} />,
      chart: generateChartData(bookings.filter((b) => b.status === 0).length),
      color: "#F97316",
    },
    {
      title: "Đã xác nhận",
      value: bookings.filter((b) => b.status === 1).length.toString(),
      icon: <CheckCircleOutline sx={{ fontSize: 24 }} />,
      chart: generateChartData(bookings.filter((b) => b.status === 1).length),
      color: "#1D4ED8",
    },
    {
      title: "Đang giao",
      value: bookings.filter((b) => b.status === 2).length.toString(),
      icon: <LocalShipping sx={{ fontSize: 24 }} />,
      chart: generateChartData(bookings.filter((b) => b.status === 2).length),
      color: "#4F46E5",
    },
    {
      title: "Hoàn thành",
      value: bookings.filter((b) => b.status === 3).length.toString(),
      icon: <TaskAlt sx={{ fontSize: 24 }} />,
      chart: generateChartData(bookings.filter((b) => b.status === 3).length),
      color: "#059669",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Assignment sx={{ color: "white", fontSize: 30 }} />
            </Box>
            Công việc của tôi
          </Typography>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            Danh sách đơn thuê được phân công
          </Typography>
        </Box>

        {/* Stats Cards - Giống Dashboard Manager */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          {statsCards.map((card, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                flex: {
                  xs: "1 1 100%",
                  sm: "1 1 calc(50% - 12px)",
                  lg: "1 1 calc(20% - 19.2px)",
                },
                p: 2.5,
                borderRadius: 3,
                bgcolor: "white",
                border: "1px solid #E5E7EB",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6B7280", mb: 1, fontSize: "0.875rem" }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    {card.value}
                  </Typography>
                </Box>
                {renderMiniChart(card.chart, card.color)}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã đơn, ID khách hàng, thiết bị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#F97316" }} />
                </InputAdornment>
              ),
            }}
            sx={{
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
          <IconButton
            onClick={loadAssignments}
            disabled={loading}
            sx={{
              bgcolor: "#FFF7ED",
              color: "#F97316",
              "&:hover": {
                bgcolor: "#FFEDD5",
              },
              "&:disabled": {
                bgcolor: "#F3F4F6",
                color: "#9CA3AF",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#F97316" }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}
        >
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "#E5E7EB",
              bgcolor: "#F9FAFB",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#6B7280",
                minHeight: 56,
                "&.Mui-selected": {
                  color: "#F97316",
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#F97316",
                height: 3,
              },
            }}
          >
            <Tab label={`Tất cả (${bookings.length})`} />
            <Tab
              label={`Chờ xác nhận (${
                bookings.filter((b) => b.status === 0).length
              })`}
            />
            <Tab
              label={`Đã xác nhận (${
                bookings.filter((b) => b.status === 1).length
              })`}
            />
            <Tab
              label={`Đang giao (${
                bookings.filter((b) => b.status === 2).length
              })`}
            />
            <Tab
              label={`Hoàn thành (${
                bookings.filter((b) => b.status === 3).length
              })`}
            />
          </Tabs>
        </Paper>

        {/* Table */}
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
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 8 }}>
                      <CircularProgress sx={{ color: "#F97316" }} />
                      <Typography
                        sx={{ mt: 2, color: "#6B7280", fontSize: "0.875rem" }}
                      >
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 8 }}>
                      <Assignment
                        sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }}
                      />
                      <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                        Chưa có công việc nào
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                      >
                        Bạn chưa được phân công đơn thuê nào
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
                          <Typography
                            variant="caption"
                            sx={{ color: "#9CA3AF" }}
                          >
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
                                SL: {item.quantity}
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
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility fontSize="small" />}
                              onClick={() => handleViewDetail(booking)}
                              sx={{
                                borderColor: "#F97316",
                                color: "#F97316",
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                  bgcolor: "#FFF7ED",
                                  borderColor: "#F97316",
                                },
                              }}
                            >
                              Xem
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PlaylistAddCheck fontSize="small" />}
                              onClick={() => handleOpenInspection(booking.id)}
                              sx={{
                                bgcolor: "#0284C7",
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                  bgcolor: "#0369A1",
                                },
                              }}
                            >
                              Kiểm tra
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {!loading && filteredBookings.length > 0 && (
            <TablePagination
              component="div"
              count={filteredBookings.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
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
      </Container>

      {/* Inspection Modal */}
      {selectedBookingId && (
        <ModalInspection
          open={inspectionModalOpen}
          onClose={handleCloseInspection}
          bookingId={selectedBookingId}
          onSuccess={handleInspectionSuccess}
        />
      )}
    </Box>
  );
};

export default MyAssignments;
