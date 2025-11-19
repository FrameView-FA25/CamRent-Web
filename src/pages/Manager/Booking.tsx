import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  FileDownload,
  CheckCircle,
  Cancel,
  Assignment,
  Description,
  ShoppingCart,
  HourglassEmpty,
  CheckCircleOutline,
  LocalShipping,
  TaskAlt,
  Block,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Imports from separated files
import type { Booking, Staff } from "../../types/booking.types";
import {
  fetchBranchBookings,
  fetchStaffList,
} from "../../services/booking.service";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { createDelivery } from "../../services/booking.service";

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadBookings();
    loadStaff();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const { bookings: fetchedBookings, error: fetchError } =
      await fetchBranchBookings();

    if (fetchError) {
      setError(fetchError);
      if (fetchError.includes("Unauthorized")) {
        navigate("/login");
      }
    } else {
      const validBookings = fetchedBookings.filter(
        (booking) => booking.statusText !== "Giỏ hàng"
      );
      setBookings(validBookings);
    }
    setLoading(false);
  };

  const loadStaff = async () => {
    const { staff, error: fetchError } = await fetchStaffList();

    if (fetchError) {
      console.error("Error loading staff:", fetchError);
    } else {
      setStaffList(staff);
    }
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

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssignStaff = () => {
    setAssignDialogOpen(true);
    handleMenuClose();
  };

  const handleCreateContract = () => {
    setContractDialogOpen(true);
    handleMenuClose();
  };

  const handleAssignConfirm = async () => {
    if (!selectedBooking || !selectedStaff) return;

    setAssignLoading(true);
    const { success, error: deliveryError } = await createDelivery(
      selectedBooking.id,
      selectedStaff
    );

    if (deliveryError) {
      toast.error(`Lỗi phân công nhân viên: ${deliveryError}`, {
        position: "top-right",
        autoClose: 3000,
      });
      setAssignLoading(false);
      return;
    }

    if (success) {
      setAssignDialogOpen(false);
      setSelectedStaff("");
      setAssignLoading(false);

      toast.success("Gán nhân viên thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleContractConfirm = () => {
    navigate(`/manager/contracts/create?bookingId=${selectedBooking?.id}`);
    setContractDialogOpen(false);
  };
  const getStatusNumber = (statusText: string): number => {
    const statusMap: Record<string, number> = {
      "Chờ xác nhận": 0,
      "Đã xác nhận": 1,
      "Đang thuê": 2,
      "Hoàn thành": 3,
      "Đã hủy": 4,
    };
    return statusMap[statusText] ?? -1;
  };
  const filteredBookings = bookings.filter((booking) => {
    if (booking.statusText === "Giỏ hàng") {
      return false;
    }

    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.renterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.items.some((item) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      booking.location.province
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.location.district
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const bookingStatusNumber = getStatusNumber(booking.statusText);
    const matchesTab =
      selectedTab === 0 ||
      (selectedTab === 1 && bookingStatusNumber === 0) ||
      (selectedTab === 2 && bookingStatusNumber === 1) ||
      (selectedTab === 3 && bookingStatusNumber === 2) ||
      (selectedTab === 4 && bookingStatusNumber === 3) ||
      (selectedTab === 5 && bookingStatusNumber === 4);

    return matchesSearch && matchesTab;
  });

  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        <CircularProgress size={60} sx={{ color: "#F97316" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <ToastContainer />
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
              <ShoppingCart sx={{ color: "white", fontSize: 30 }} />
            </Box>
            Quản lý Đơn thuê
          </Typography>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            Quản lý tất cả đơn thuê camera trong hệ thống
          </Typography>
        </Box>

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

        {/* Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            gap: 3,
            mb: 3,
          }}
        >
          {/* Tất cả */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "#E0F2FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCart sx={{ color: "#0284C7", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                {bookings.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Tất cả
              </Typography>
            </Box>
          </Paper>

          {/* Chờ xác nhận */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "#FFF7ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HourglassEmpty sx={{ color: "#F97316", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                {bookings.filter((b) => b.statusText === "Chờ xác nhận").length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Chờ xác nhận
              </Typography>
            </Box>
          </Paper>

          {/* Đã xác nhận */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleOutline sx={{ color: "#1D4ED8", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                {bookings.filter((b) => b.statusText === "Đã xác nhận").length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Đã xác nhận
              </Typography>
            </Box>
          </Paper>

          {/* Đang thuê */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "#E0E7FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalShipping sx={{ color: "#4F46E5", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                {bookings.filter((b) => b.statusText === "Đang thuê").length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Đang thuê
              </Typography>
            </Box>
          </Paper>

          {/* Hoàn thành */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "#D1FAE5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TaskAlt sx={{ color: "#059669", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                {bookings.filter((b) => b.statusText === "Hoàn thành").length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Hoàn thành
              </Typography>
            </Box>
          </Paper>

          {/* Đã hủy */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Block sx={{ color: "#DC2626", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
              >
                {bookings.filter((b) => b.statusText === "Đã hủy").length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Đã hủy
              </Typography>
            </Box>
          </Paper>
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
            onClick={loadBookings}
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
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              minWidth: 120,
              borderColor: "#E5E7EB",
              color: "#6B7280",
              "&:hover": {
                borderColor: "#F97316",
                bgcolor: "#FFF7ED",
                color: "#F97316",
              },
            }}
          >
            LỌC
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            sx={{
              minWidth: 150,
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
            }}
          >
            XUẤT BÁO CÁO
          </Button>
        </Paper>

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
                bookings.filter((b) => b.statusText === "Chờ xác nhận").length
              })`}
            />
            <Tab
              label={`Đã xác nhận (${
                bookings.filter((b) => b.statusText === "Đã xác nhận").length
              })`}
            />
            <Tab
              label={`Đang thuê (${
                bookings.filter((b) => b.statusText === "Đang thuê").length
              })`}
            />
            <Tab
              label={`Hoàn thành (${
                bookings.filter((b) => b.statusText === "Hoàn thành").length
              })`}
            />
            <Tab
              label={`Đã hủy (${
                bookings.filter((b) => b.statusText === "Đã hủy").length
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
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
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
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            {booking.snapshotDepositPercent}%
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
                          <IconButton
                            onClick={(e) => handleMenuClick(e, booking)}
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

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              minWidth: 220,
            },
          }}
        >
          <MenuItem
            onClick={handleAssignStaff}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: "#FFF7ED",
                color: "#F97316",
              },
            }}
          >
            <Assignment sx={{ mr: 1.5, fontSize: 20 }} /> Phân công nhân viên
          </MenuItem>
          <MenuItem
            onClick={handleCreateContract}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: "#FFF7ED",
                color: "#F97316",
              },
            }}
          >
            <Description sx={{ mr: 1.5, fontSize: 20 }} /> Tạo hợp đồng
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: "#FFF7ED",
                color: "#F97316",
              },
            }}
          >
            <CheckCircle sx={{ mr: 1.5, fontSize: 20 }} /> Xác nhận đơn
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: "#FFF7ED",
                color: "#F97316",
              },
            }}
          >
            Xem chi tiết
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              py: 1.5,
              color: "#EF4444",
              "&:hover": {
                bgcolor: "#FEE2E2",
              },
            }}
          >
            <Cancel sx={{ mr: 1.5, fontSize: 20 }} /> Hủy đơn
          </MenuItem>
        </Menu>

        {/* Assign Staff Dialog */}
        <Dialog
          open={assignDialogOpen}
          onClose={() => !assignLoading && setAssignDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
            Phân công nhân viên kiểm tra
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
                Đơn thuê: <strong>{selectedBooking?.id.slice(0, 8)}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Chọn nhân viên</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  label="Chọn nhân viên"
                  disabled={assignLoading}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {staffList.length === 0 ? (
                    <MenuItem disabled>Không có nhân viên</MenuItem>
                  ) : (
                    staffList.map((staff) => (
                      <MenuItem key={staff.userId} value={staff.userId}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {staff.fullName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            {staff.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setAssignDialogOpen(false)}
              disabled={assignLoading}
              sx={{
                color: "#6B7280",
                "&:hover": {
                  bgcolor: "#F3F4F6",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignConfirm}
              variant="contained"
              disabled={!selectedStaff || assignLoading}
              sx={{
                bgcolor: "#F97316",
                "&:hover": {
                  bgcolor: "#EA580C",
                },
                "&:disabled": {
                  bgcolor: "#E5E7EB",
                },
              }}
            >
              {assignLoading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Contract Dialog */}
        <Dialog
          open={contractDialogOpen}
          onClose={() => setContractDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: "#1F2937" }}>
            Tạo hợp đồng thuê
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
                Bạn có chắc chắn muốn tạo hợp đồng cho đơn thuê này?
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#F9FAFB",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                  <strong>Mã đơn:</strong> {selectedBooking?.id.slice(0, 8)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                  <strong>Loại:</strong>{" "}
                  {selectedBooking && getBookingType(selectedBooking.type)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: "#1F2937" }}>
                  <strong>Tổng tiền:</strong>{" "}
                  <span style={{ color: "#F97316", fontWeight: 700 }}>
                    {selectedBooking &&
                      formatCurrency(selectedBooking.snapshotRentalTotal)}
                  </span>
                </Typography>
                <Typography variant="body2" sx={{ color: "#1F2937" }}>
                  <strong>Thời gian:</strong>{" "}
                  {selectedBooking &&
                    `${formatDate(selectedBooking.pickupAt)} - ${formatDate(
                      selectedBooking.returnAt
                    )}`}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setContractDialogOpen(false)}
              sx={{
                color: "#6B7280",
                "&:hover": {
                  bgcolor: "#F3F4F6",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleContractConfirm}
              variant="contained"
              startIcon={<Description />}
              sx={{
                bgcolor: "#F97316",
                "&:hover": {
                  bgcolor: "#EA580C",
                },
              }}
            >
              Tạo hợp đồng
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BookingManagement;
