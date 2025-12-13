import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Avatar,
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
  Tabs,
  Tab,
} from "@mui/material";
import { UserPlus } from "lucide-react";
import {
  Search,
  Person,
  Email,
  Phone,
  Badge,
  Refresh,
} from "@mui/icons-material";
import { fetchStaffList } from "../../services/booking.service";
import type { Staff } from "../../types/booking.types";
import AddStaffDialog from "../../components/Modal/Manager/AddStaffDialog";
import StaffWorkloadCalendar from "@/components/Staff/StaffWorkloadCalendar";
import { toast } from "react-toastify";
import { colors } from "../../theme/colors";

const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // 0: Staff List, 1: Workload

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStaff(staffList);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = staffList.filter(
        (staff) =>
          staff.fullName.toLowerCase().includes(query) ||
          staff.email.toLowerCase().includes(query) ||
          (staff.phoneNumber?.toLowerCase().includes(query) ?? false) ||
          staff.userId.toLowerCase().includes(query)
      );
      setFilteredStaff(filtered);
    }
    setPage(0);
  }, [searchQuery, staffList]);

  const loadStaff = async () => {
    setLoading(true);
    setError(null);
    const { staff, error: fetchError } = await fetchStaffList();

    if (fetchError) {
      setError(fetchError);
    } else {
      setStaffList(staff);
      setFilteredStaff(staff);
    }
    setLoading(false);
  };

  const handleAddSuccess = () => {
    toast.success("Thêm nhân viên thành công!");
    loadStaff();
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

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string): string => {
    const colorsList = [
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
      userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colorsList.length;
    return colorsList[index];
  };

  const getRoleLabel = (email: string): string => {
    if (email.toLowerCase().includes("delivery")) return "Nhân viên giao hàng";
    if (email.toLowerCase().includes("manager")) return "Quản lý";
    return "Nhân viên";
  };

  const getRoleColor = (email: string): { bgcolor: string; color: string } => {
    if (email.toLowerCase().includes("delivery"))
      return { bgcolor: "#DBEAFE", color: "#1E40AF" };
    if (email.toLowerCase().includes("manager"))
      return { bgcolor: "#FFF7ED", color: "#F97316" };
    return { bgcolor: "#F3F4F6", color: "#6B7280" };
  };

  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
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
                  bgcolor: colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Person sx={{ color: "white", fontSize: 30 }} />
              </Box>
              Quản lý nhân viên
            </Typography>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              Danh sách nhân viên và lịch làm việc
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<UserPlus size={20} />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              bgcolor: colors.primary.main,
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: colors.primary.dark,
              },
            }}
          >
            Thêm nhân viên
          </Button>
        </Box>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              borderBottom: "1px solid #E5E7EB",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                py: 2,
                px: 3,
              },
              "& .Mui-selected": {
                color: colors.primary.main,
              },
              "& .MuiTabs-indicator": {
                bgcolor: colors.primary.main,
                height: 3,
              },
            }}
          >
            <Tab label={`Danh sách nhân viên (${staffList.length})`} />
            <Tab label="Lịch làm việc" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {currentTab === 0 && (
          <>
            {/* Stats Card */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
                mb: 3,
              }}
            >
              {/* Tổng nhân viên */}
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
                  <Search sx={{ color: "#0284C7", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    {staffList.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Tổng nhân viên
                  </Typography>
                </Box>
              </Paper>

              {/* Quản lý */}
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
                  <Person sx={{ color: colors.primary.main, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    {
                      staffList.filter((s) =>
                        s.email.toLowerCase().includes("manager")
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Quản lý
                  </Typography>
                </Box>
              </Paper>

              {/* Nhân viên giao hàng */}
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
                  <Badge sx={{ color: "#059669", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    {
                      staffList.filter((s) =>
                        s.email.toLowerCase().includes("delivery")
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Nhân viên giao hàng
                  </Typography>
                </Box>
              </Paper>

              {/* Nhân viên khác */}
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
                    bgcolor: "#FEF9C3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Person sx={{ color: "#CA8A04", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    {
                      staffList.filter(
                        (s) =>
                          !s.email.toLowerCase().includes("delivery") &&
                          !s.email.toLowerCase().includes("manager")
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Nhân viên khác
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
                placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: colors.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: colors.primary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary.main,
                    },
                  },
                }}
              />
              <IconButton
                onClick={loadStaff}
                disabled={loading}
                sx={{
                  bgcolor: colors.primary.lighter,
                  color: colors.primary.main,
                  "&:hover": {
                    bgcolor: colors.primary.light,
                  },
                  "&:disabled": {
                    bgcolor: "#F3F4F6",
                    color: "#9CA3AF",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: colors.primary.main }}
                  />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Paper>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

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
                        Nhân viên
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1F2937",
                          fontSize: "0.875rem",
                        }}
                      >
                        Vai trò
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1F2937",
                          fontSize: "0.875rem",
                        }}
                      >
                        Email
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1F2937",
                          fontSize: "0.875rem",
                        }}
                      >
                        Số điện thoại
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ textAlign: "center", py: 8 }}
                        >
                          <CircularProgress
                            sx={{ color: colors.primary.main }}
                          />
                          <Typography
                            sx={{
                              mt: 2,
                              color: "#6B7280",
                              fontSize: "0.875rem",
                            }}
                          >
                            Đang tải dữ liệu...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : paginatedStaff.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ textAlign: "center", py: 8 }}
                        >
                          <Person
                            sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ color: "#6B7280", mb: 1 }}
                          >
                            {searchQuery
                              ? "Không tìm thấy nhân viên"
                              : "Chưa có nhân viên nào"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                          >
                            {searchQuery
                              ? "Thử tìm kiếm với từ khóa khác"
                              : "Danh sách nhân viên trống"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStaff.map((staff) => (
                        <TableRow
                          key={staff.userId}
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
                                  width: 45,
                                  height: 45,
                                  bgcolor: getAvatarColor(staff.userId),
                                  fontSize: "1rem",
                                  fontWeight: 700,
                                }}
                              >
                                {getInitials(staff.fullName)}
                              </Avatar>
                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: "#1F2937",
                                    fontSize: "0.9375rem",
                                  }}
                                >
                                  {staff.fullName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getRoleLabel(staff.email)}
                              size="small"
                              sx={{
                                ...getRoleColor(staff.email),
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Email sx={{ fontSize: 18, color: "#9CA3AF" }} />
                              <Typography
                                sx={{ color: "#6B7280", fontSize: "0.875rem" }}
                              >
                                {staff.email || "Chưa có"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Phone sx={{ fontSize: 18, color: "#9CA3AF" }} />
                              <Typography
                                sx={{ color: "#6B7280", fontSize: "0.875rem" }}
                              >
                                {staff.phoneNumber || "Chưa có"}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {!loading && filteredStaff.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredStaff.length}
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
          </>
        )}

        {/* Tab 2: Workload Calendar */}
        {currentTab === 1 && <StaffWorkloadCalendar />}

        {/* Add Staff Dialog */}
        <AddStaffDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          onSuccess={handleAddSuccess}
        />
      </Container>
    </Box>
  );
};

export default StaffManagement;
