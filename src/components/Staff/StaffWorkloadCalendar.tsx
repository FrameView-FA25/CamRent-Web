import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  CalendarToday,
  Assignment,
  CheckCircle,
  LocalShipping,
  AssignmentReturn,
  Refresh,
  TrendingUp,
  TrendingFlat,
  TrendingDown,
  Visibility,
} from "@mui/icons-material";
import {
  staffService,
  type StaffWorkloadResponse,
} from "../../services/staff.service";
import { colors } from "../../theme/colors";
import StaffScheduleDialog from "./StaffScheduleDialog";

const StaffWorkloadCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [workloadData, setWorkloadData] =
    useState<StaffWorkloadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (selectedDate) {
      loadWorkload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadWorkload = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const startOfDay = selectedDate.startOf("day").toISOString();
      const endOfDay = selectedDate.endOf("day").toISOString();

      const data = await staffService.getStaffWorkload(startOfDay, endOfDay);
      setWorkloadData(data);
      setPage(0);
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu workload");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = (staffId: string, staffName: string) => {
    setSelectedStaff({ id: staffId, name: staffName });
    setScheduleDialogOpen(true);
  };

  const getAvatarColor = (staffId: string): string => {
    const palette = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    const index =
      staffId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      palette.length;
    return palette[index];
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getWorkloadLevel = (
    total: number
  ): { color: string; label: string; icon: JSX.Element } => {
    if (total === 0)
      return {
        color: "#10B981",
        label: "Rảnh",
        icon: <TrendingDown sx={{ fontSize: 16 }} />,
      };
    if (total <= 3)
      return {
        color: "#3B82F6",
        label: "Bình thường",
        icon: <TrendingFlat sx={{ fontSize: 16 }} />,
      };
    if (total <= 6)
      return {
        color: "#F59E0B",
        label: "Bận",
        icon: <TrendingUp sx={{ fontSize: 16 }} />,
      };
    return {
      color: "#EF4444",
      label: "Rất bận",
      icon: <TrendingUp sx={{ fontSize: 16 }} />,
    };
  };

  const getTotalWorkload = (staff: any) => {
    return (
      staff.assignedBookings +
      staff.assignedVerifications +
      staff.todayPickupBookings +
      staff.todayReturnBookings
    );
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

  const paginatedStaff = workloadData?.staffs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const summaryStats = workloadData
    ? {
        totalStaff: workloadData.staffs.length,
        totalBookings: workloadData.staffs.reduce(
          (sum, s) => sum + s.assignedBookings,
          0
        ),
        totalVerifications: workloadData.staffs.reduce(
          (sum, s) => sum + s.assignedVerifications,
          0
        ),
        totalPickups: workloadData.staffs.reduce(
          (sum, s) => sum + s.todayPickupBookings,
          0
        ),
        totalReturns: workloadData.staffs.reduce(
          (sum, s) => sum + s.todayReturnBookings,
          0
        ),
      }
    : null;

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, p: 3, bgcolor: "white" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: colors.primary.lighter,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarToday
                sx={{ color: colors.primary.main, fontSize: 24 }}
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1F2937" }}
              >
                Lịch làm việc nhân viên
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                {workloadData?.branchName ||
                  "Theo dõi workload của từng nhân viên"}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Chọn ngày"
                value={selectedDate}
                onChange={(value) =>
                  setSelectedDate(value ? dayjs(value) : null)
                }
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 200 },
                  },
                }}
              />
            </LocalizationProvider>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadWorkload}
              disabled={loading}
              sx={{
                textTransform: "none",
                borderColor: colors.primary.main,
                color: colors.primary.main,
                "&:hover": {
                  borderColor: colors.primary.dark,
                  bgcolor: colors.primary.lighter,
                },
              }}
            >
              Làm mới
            </Button>
          </Stack>
        </Stack>

        {/* Summary Stats */}
        {summaryStats && !loading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            {/* ...existing summary stats code... */}
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
            <Typography sx={{ mt: 2, color: "#6B7280" }}>
              Đang tải dữ liệu workload...
            </Typography>
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <>
            {!workloadData || workloadData.staffs.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CalendarToday sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                  Không có dữ liệu workload
                </Typography>
                <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                  Chọn ngày khác để xem workload của nhân viên
                </Typography>
              </Box>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
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
                            width: "20%",
                          }}
                        >
                          Nhân viên
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            fontSize: "0.875rem",
                          }}
                        >
                          Đơn hàng
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            fontSize: "0.875rem",
                          }}
                        >
                          Xác nhận
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            fontSize: "0.875rem",
                          }}
                        >
                          Hàng nhận hôm nay
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            fontSize: "0.875rem",
                          }}
                        >
                          Hàng trả hôm nay
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            fontSize: "0.875rem",
                          }}
                        >
                          Tổng công việc
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            fontSize: "0.875rem",
                          }}
                        >
                          Chi tiết
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedStaff?.map((staff) => {
                        const totalWorkload = getTotalWorkload(staff);
                        const workloadLevel = getWorkloadLevel(totalWorkload);

                        return (
                          <TableRow
                            key={staff.staffId}
                            sx={{
                              "&:hover": {
                                bgcolor: colors.primary.lighter,
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: getAvatarColor(staff.staffId),
                                    fontSize: "0.875rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  {getInitials(staff.staffName)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      color: "#1F2937",
                                      fontSize: "0.9375rem",
                                    }}
                                  >
                                    {staff.staffName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#6B7280",
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    {staff.staffId.slice(0, 8)}...
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={<Assignment sx={{ fontSize: 16 }} />}
                                label={staff.assignedBookings}
                                size="small"
                                sx={{
                                  bgcolor: "#EFF6FF",
                                  color: "#1E40AF",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                                label={staff.assignedVerifications}
                                size="small"
                                sx={{
                                  bgcolor: "#F0FDF4",
                                  color: "#065F46",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={<LocalShipping sx={{ fontSize: 16 }} />}
                                label={staff.todayPickupBookings}
                                size="small"
                                sx={{
                                  bgcolor: "#FFFBEB",
                                  color: "#92400E",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={
                                  <AssignmentReturn sx={{ fontSize: 16 }} />
                                }
                                label={staff.todayReturnBookings}
                                size="small"
                                sx={{
                                  bgcolor: "#F5F3FF",
                                  color: "#5B21B6",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "1.125rem",
                                  color: workloadLevel.color,
                                }}
                              >
                                {totalWorkload}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem chi tiết lịch làm việc">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleViewSchedule(
                                      staff.staffId,
                                      staff.staffName
                                    )
                                  }
                                  sx={{
                                    color: colors.primary.main,
                                    "&:hover": {
                                      bgcolor: colors.primary.lighter,
                                    },
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {workloadData && workloadData.staffs.length > 0 && (
                  <TablePagination
                    component="div"
                    count={workloadData.staffs.length}
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
                        color: colors.primary.main,
                      },
                      "& .MuiTablePagination-actions button": {
                        color: colors.primary.main,
                        "&:disabled": {
                          color: "#9CA3AF",
                        },
                      },
                    }}
                  />
                )}
              </Paper>
            )}
          </>
        )}
      </Paper>

      {/* Schedule Dialog */}
      {selectedStaff && (
        <StaffScheduleDialog
          open={scheduleDialogOpen}
          onClose={() => {
            setScheduleDialogOpen(false);
            setSelectedStaff(null);
          }}
          staffId={selectedStaff.id}
          staffName={selectedStaff.name}
          selectedDate={selectedDate?.toISOString() || ""}
        />
      )}
    </Box>
  );
};

export default StaffWorkloadCalendar;
