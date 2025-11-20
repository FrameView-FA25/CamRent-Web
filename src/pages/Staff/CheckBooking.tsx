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
  CircularProgress,
  Button,
  Tab,
  Tabs,
  Tooltip,
  alpha,
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
  Clear,
} from "@mui/icons-material";
import { fetchStaffBookings } from "../../services/booking.service";
import type { Booking } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { useNavigate } from "react-router-dom";
import CheckBookingDialog from "../../components/Modal/CheckBookingDialog";
import { createInspection } from "../../services/inspection.service";
import { toast } from "react-toastify";

const CheckBookings: React.FC = () => {
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

  const handleInspectionSuccess = async (data: any) => {
    try {
      // Tạo FormData từ dữ liệu form
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      // Gọi API tạo inspection
      const res = await createInspection(formData);
      if (res?.success === false)
        throw new Error(res.message || "Tạo kiểm tra thất bại");

      toast.success("Tạo kiểm tra thiết bị thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      await loadAssignments();
      setInspectionModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi tạo kiểm tra:", err);
      const errorMessage = err.message || "Có lỗi xảy ra khi tạo kiểm tra";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.renterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.items.some((item) =>
          (item.itemName || getItemName(item))
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      const matchesTab =
        selectedTab === 0 ||
        (selectedTab === 1 && booking.status === "0") ||
        (selectedTab === 2 && booking.status === "1") ||
        (selectedTab === 3 && booking.status === "2") ||
        (selectedTab === 4 && booking.status === "3");

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchQuery, selectedTab]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredBookings, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "0").length,
      confirmed: bookings.filter((b) => b.status === "1").length,
      delivering: bookings.filter((b) => b.status === "2").length,
      completed: bookings.filter((b) => b.status === "3").length,
    };
  }, [bookings]);

  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        minHeight: "100vh",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  bgcolor: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
                }}
              >
                <Assignment sx={{ color: "white", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 0.5,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                  }}
                >
                  Công việc của tôi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#6B7280", fontSize: "0.95rem" }}
                >
                  Danh sách đơn thuê được phân công
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={loadAssignments}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: "#F97316",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    bgcolor: "#FFF7ED",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#F97316" }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(5, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Tất cả
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#111827", mt: 0.5 }}
                >
                  {stats.total}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#3B82F6", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Assignment sx={{ color: "#3B82F6", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Chờ xác nhận
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#F59E0B", mt: 0.5 }}
                >
                  {stats.pending}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#F59E0B", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HourglassEmpty sx={{ color: "#F59E0B", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Đã xác nhận
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#10B981", mt: 0.5 }}
                >
                  {stats.confirmed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#10B981", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleOutline sx={{ color: "#10B981", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Đang giao
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#4F46E5", mt: 0.5 }}
                >
                  {stats.delivering}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#4F46E5", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalShipping sx={{ color: "#4F46E5", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Hoàn thành
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#3B82F6", mt: 0.5 }}
                >
                  {stats.completed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#3B82F6", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TaskAlt sx={{ color: "#3B82F6", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid #E5E7EB",
            display: "flex",
            gap: 2,
            alignItems: "center",
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
                  <Search sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F9FAFB",
                "& fieldset": {
                  borderColor: "#E5E7EB",
                },
                "&:hover fieldset": {
                  borderColor: "#F97316",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#F97316",
                  borderWidth: 2,
                },
              },
            }}
          />
          {searchQuery && (
            <IconButton
              onClick={() => setSearchQuery("")}
              sx={{
                color: "#6B7280",
                "&:hover": { bgcolor: "#F3F4F6", color: "#F97316" },
              }}
            >
              <Clear />
            </IconButton>
          )}
        </Paper>

        {/* Error */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FEF2F2",
              border: "1px solid #FEE2E2",
            }}
          >
            <Typography color="error" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Paper>
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
                bookings.filter((b) => b.status === "0").length
              })`}
            />
            <Tab
              label={`Đã xác nhận (${
                bookings.filter((b) => b.status === "1").length
              })`}
            />
            <Tab
              label={`Đang giao (${
                bookings.filter((b) => b.status === "2").length
              })`}
            />
            <Tab
              label={`Hoàn thành (${
                bookings.filter((b) => b.status === "3").length
              })`}
            />
          </Tabs>
        </Paper>

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Mã đơn
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      textAlign: "center",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Thiết bị
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Thời gian thuê
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Tổng tiền
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      textAlign: "center",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
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
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                      <Assignment
                        sx={{ fontSize: 64, color: "#E5E7EB", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#374151", mb: 1, fontWeight: 600 }}
                      >
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
                            bgcolor: "#F9FAFB",
                          },
                          transition: "background-color 0.2s ease",
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              maxWidth: 200,
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "#111827",
                              wordBreak: "break-word",
                            }}
                          >
                            {booking.id.length > 20
                              ? `${booking.id.substring(0, 20)}...`
                              : booking.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {booking.items.slice(0, 2).map((item, idx) => (
                              <Chip
                                key={idx}
                                label={item.itemName || getItemName(item)}
                                size="small"
                                sx={{
                                  bgcolor: "#F3F4F6",
                                  color: "#374151",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            ))}
                            {booking.items.length > 2 && (
                              <Chip
                                label={`+${booking.items.length - 2}`}
                                size="small"
                                sx={{
                                  bgcolor: "#DBEAFE",
                                  color: "#3B82F6",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#111827",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            }}
                          >
                            {formatDate(booking.pickupAt)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6B7280", fontSize: "0.8125rem" }}
                          >
                            đến {formatDate(booking.returnAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#111827",
                              fontSize: "0.875rem",
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
                              borderRadius: 2,
                              height: 28,
                              ...(statusInfo.label === "Đã xác nhận"
                                ? {
                                    bgcolor: "#10B981",
                                    color: "#FFFFFF",
                                    boxShadow:
                                      "0 2px 8px rgba(16, 185, 129, 0.3)",
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
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility fontSize="small" />}
                              onClick={() => handleViewDetail(booking)}
                              sx={{
                                borderColor: "#E5E7EB",
                                color: "#374151",
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                                minWidth: 0,
                                px: 1.5,
                                py: 0.75,
                                fontSize: "0.8125rem",
                                "& .MuiButton-startIcon": { mr: 0.5 },
                                "&:hover": {
                                  bgcolor: "#F9FAFB",
                                  borderColor: "#D1D5DB",
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
                                bgcolor: "#F97316",
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                                minWidth: 0,
                                px: 1.5,
                                py: 0.75,
                                fontSize: "0.8125rem",
                                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.25)",
                                "& .MuiButton-startIcon": { mr: 0.5 },
                                "&:hover": {
                                  bgcolor: "#EA580C",
                                  boxShadow:
                                    "0 4px 12px rgba(249, 115, 22, 0.35)",
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
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng ${
                  count !== -1 ? count : `nhiều hơn ${to}`
                }`
              }
              sx={{
                borderTop: "1px solid #E5E7EB",
                bgcolor: "#F9FAFB",
                px: 2,
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
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  },
              }}
            />
          )}
        </Paper>
      </Container>

      {/* Inspection Modal */}
      {selectedBookingId && (
        <CheckBookingDialog
          open={inspectionModalOpen}
          onClose={handleCloseInspection}
          onSubmit={handleInspectionSuccess}
          defaultValues={{
            verifyId: selectedBookingId,
            items: (
              bookings.find((b) => b.id === selectedBookingId)?.items || []
            ).map((it) => {
              // Chuyển itemType từ string sang format phù hợp
              let itemTypeStr = "1";
              if (it.itemType === "Camera") itemTypeStr = "1";
              else if (it.itemType === "Accessory") itemTypeStr = "2";
              else if (it.itemType === "Combo") itemTypeStr = "3";

              return {
                itemId: it.itemId || "",
                itemName: it.itemName || "",
                itemType: itemTypeStr,
              };
            }),
            ItemType: "",
            Type: "Booking",
          }}
        />
      )}
    </Box>
  );
};

export default CheckBookings;
