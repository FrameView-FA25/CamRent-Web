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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Imports from separated files
import type { Booking, Staff } from "../../types/booking.types";
import { fetchBookings, fetchStaffList } from "../../services/booking.service";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
  getBookingType,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { BOOKING_STATS } from "../../constants/booking.constants";
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

  useEffect(() => {
    loadBookings();
    loadStaff();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const { bookings: fetchedBookings, error: fetchError } =
      await fetchBookings();

    if (fetchError) {
      setError(fetchError);
      if (fetchError.includes("Unauthorized")) {
        navigate("/login");
      }
    } else {
      // Filter out bookings với statusText = "Giỏ hàng"
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

  const stats = BOOKING_STATS.map((stat) => ({
    ...stat,
    value:
      stat.statusFilter === null
        ? bookings.length
        : bookings.filter((b) => b.statusText === stat.statusFilter).length,
    icon: React.createElement(stat.icon),
  }));

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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setAssignLoading(false);
      return;
    }

    if (success) {
      const selectedStaffInfo = staffList.find(
        (s) => s.userId === selectedStaff
      );

      console.log(
        "Successfully assigned staff:",
        selectedStaffInfo?.fullName,
        "(ID:",
        selectedStaff,
        ")",
        "to booking:",
        selectedBooking.id
      );

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                // Có thể thêm field để đánh dấu đã assign
                // assignedStaffId: selectedStaff,
                // assignedStaffName: selectedStaffInfo?.fullName,
              }
            : booking
        )
      );

      // Close dialog và reset state
      setAssignDialogOpen(false);
      setSelectedStaff("");
      setAssignLoading(false);

      // Show toast -
      toast.success("Gán nhân viên thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  const handleContractConfirm = () => {
    console.log("Create contract for booking:", selectedBooking?.id);
    navigate(`/manager/contracts/create?bookingId=${selectedBooking?.id}`);
    setContractDialogOpen(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (booking.statusText === "Giỏ hàng") {
      return false;
    }
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
      (selectedTab === 4 && booking.status === 3) ||
      (selectedTab === 5 && booking.status === 4);

    return matchesSearch && matchesTab;
  });

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
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: "#1F2937", mb: 0.5 }}
            >
              Quản lý Đơn thuê
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Quản lý tất cả đơn thuê camera trong hệ thống
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
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
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                flex: "1 1 calc(25% - 18px)",
                minWidth: 250,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: `${stat.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #E5E7EB",
          }}
        >
          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo mã đơn, ID khách hàng, thiết bị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#F9FAFB",
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                  },
                  "&.Mui-focused": {
                    bgcolor: "white",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Tabs */}
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "#E5E7EB",
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#6B7280",
                "&.Mui-selected": {
                  color: "#F97316",
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#F97316",
                height: 3,
                borderRadius: "3px 3px 0 0",
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
              label={`Đang thuê (${
                bookings.filter((b) => b.status === 2).length
              })`}
            />
            <Tab
              label={`Hoàn thành (${
                bookings.filter((b) => b.status === 3).length
              })`}
            />
            <Tab
              label={`Đã hủy (${
                bookings.filter((b) => b.status === 4).length
              })`}
            />
          </Tabs>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Mã đơn
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Loại thuê
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Thiết bị
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Thời gian thuê
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Tổng tiền
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Cọc
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#6B7280",
                      bgcolor: "#F9FAFB",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" sx={{ color: "#9CA3AF" }}>
                        Không tìm thấy đơn thuê nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const statusInfo = getStatusInfo(booking.statusText);
                    return (
                      <TableRow
                        key={booking.id}
                        sx={{
                          "&:hover": {
                            bgcolor: "#FFF7ED",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 600, color: "#F97316" }}
                          >
                            {booking.id.slice(0, 8)}
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
                              border: "1px solid #FDBA74",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {booking.items.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#1F2937" }}
                              >
                                {getItemName(item)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                Số lượng: {item.quantity} |{" "}
                                {formatCurrency(item.unitPrice)}
                              </Typography>
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#1F2937" }}>
                            {formatDate(booking.pickupAt)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6B7280" }}>
                            đến {formatDate(booking.returnAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 700, color: "#F97316" }}
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
                            sx={{ fontWeight: 600, color: "#1F2937" }}
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
                              borderRadius: 2,
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
