import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  TablePagination,
  Avatar,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { getRoleLabel } from "../../../utils/roleUtils";
import { toast } from "react-toastify";
import { userService, type User } from "../../../services/user.service";
import CreateUserDialog from "../../../components/Modal/Admin/CreateUserDialog";
import UpdateUserDialog from "../../../components/Modal/Admin/UpdateUserDialog";

const STATUS_LABELS: Record<string, string> = {
  Active: "Hoạt động",
  Ban: "Đã khóa",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "success";
    case "Ban":
      return "error";
    default:
      return "default";
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
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
  const colors = [
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
    colors.length;
  return colors[index];
};

const AccountManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const fetchUsers = async (pageNum: number = 1, pageSize: number = 50) => {
    try {
      setLoading(true);
      setError(null);

      const data = await userService.getUsers(pageNum, pageSize);
      setUsers(data.items);
      setTotal(data.total);
      setCurrentPage(data.page);
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách người dùng";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, rowsPerPage);
  }, []);

  const handleRefresh = () => {
    fetchUsers(currentPage, rowsPerPage);
  };

  const handleCreateSuccess = () => {
    fetchUsers(currentPage, rowsPerPage);
  };

  const handleUpdateSuccess = () => {
    fetchUsers(currentPage, rowsPerPage);
  };

  const handleEditClick = () => {
    if (selectedUser) {
      setUpdateDialogOpen(true);
      setAnchorEl(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      const newStatus = selectedUser.status === "Active" ? "Ban" : "Active";

      await userService.updateUser(selectedUser.id, {
        phone: selectedUser.phone,
        fullName: selectedUser.fullName,
        status: newStatus,
      });

      toast.success(
        newStatus === "Ban"
          ? "Đã khóa tài khoản thành công"
          : "Đã kích hoạt tài khoản thành công"
      );

      fetchUsers(currentPage, rowsPerPage);
      handleMenuClose();
    } catch (err) {
      console.error("Error toggling user status:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái tài khoản";
      toast.error(errorMessage);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    fetchUsers(newPage + 1, rowsPerPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchUsers(1, newRowsPerPage);
  };

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: string | null
  ) => {
    if (newRole !== null) {
      setSelectedRole(newRole);
      setPage(0);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.roles.includes(selectedRole));
    }

    // Filter by search term
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query) ||
          user.roles.some((role) =>
            getRoleLabel(role).toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [users, searchTerm, selectedRole]);

  // Count users by role
  const roleStats = useMemo(() => {
    return {
      all: users.length,
      Admin: users.filter((u) => u.roles.includes("Admin")).length,
      BranchManager: users.filter((u) => u.roles.includes("BranchManager"))
        .length,
      Staff: users.filter((u) => u.roles.includes("Staff")).length,
      Renter: users.filter((u) => u.roles.includes("Renter")).length,
      Owner: users.filter((u) => u.roles.includes("Owner")).length,
    };
  }, [users]);

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              bgcolor: "#FF5722",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PeopleIcon sx={{ color: "white", fontSize: 30 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1F2937",
              }}
            >
              Quản lý người dùng
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Quản lý tất cả người dùng trong hệ thống
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              bgcolor: "#FF5722",
              "&:hover": { bgcolor: "#F4511E" },
              textTransform: "none",
              borderRadius: 2,
              px: 3,
            }}
          >
            Tạo người dùng mới
          </Button>
          <IconButton
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#6B7280" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Role Filter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FilterListIcon sx={{ color: "#6B7280" }} />
            <ToggleButtonGroup
              value={selectedRole}
              exclusive
              onChange={handleRoleChange}
              aria-label="role filter"
              sx={{
                flexWrap: "wrap",
                gap: 1,
                "& .MuiToggleButton-root": {
                  border: "1px solid #E5E7EB",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  color: "#6B7280",
                  "&.Mui-selected": {
                    bgcolor: "#FF5722",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#F4511E",
                    },
                  },
                  "&:hover": {
                    bgcolor: "#F9FAFB",
                  },
                },
              }}
            >
              <ToggleButton value="all">
                Tất cả
                <Chip
                  label={roleStats.all}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor:
                      selectedRole === "all"
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    color: selectedRole === "all" ? "white" : "#6B7280",
                  }}
                />
              </ToggleButton>
              <ToggleButton value="Admin">
                {getRoleLabel("Admin")}
                <Chip
                  label={roleStats.Admin}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor:
                      selectedRole === "Admin"
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    color: selectedRole === "Admin" ? "white" : "#6B7280",
                  }}
                />
              </ToggleButton>
              <ToggleButton value="BranchManager">
                {getRoleLabel("BranchManager")}
                <Chip
                  label={roleStats.BranchManager}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor:
                      selectedRole === "BranchManager"
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    color:
                      selectedRole === "BranchManager" ? "white" : "#6B7280",
                  }}
                />
              </ToggleButton>
              <ToggleButton value="Staff">
                {getRoleLabel("Staff")}
                <Chip
                  label={roleStats.Staff}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor:
                      selectedRole === "Staff"
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    color: selectedRole === "Staff" ? "white" : "#6B7280",
                  }}
                />
              </ToggleButton>
              <ToggleButton value="Renter">
                {getRoleLabel("Renter")}
                <Chip
                  label={roleStats.Renter}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor:
                      selectedRole === "Renter"
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    color: selectedRole === "Renter" ? "white" : "#6B7280",
                  }}
                />
              </ToggleButton>
              <ToggleButton value="Owner">
                {getRoleLabel("Owner")}
                <Chip
                  label={roleStats.Owner}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor:
                      selectedRole === "Owner"
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    color: selectedRole === "Owner" ? "white" : "#6B7280",
                  }}
                />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <CircularProgress sx={{ color: "#FF5722" }} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <PeopleIcon
                          sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ color: "#6B7280", mb: 1 }}
                        >
                          {searchTerm || selectedRole !== "all"
                            ? "Không tìm thấy người dùng nào"
                            : "Chưa có người dùng nào"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                        >
                          {searchTerm || selectedRole !== "all"
                            ? "Thử tìm kiếm hoặc lọc với điều kiện khác"
                            : "Danh sách người dùng sẽ hiển thị ở đây"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} hover>
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
                                bgcolor: getAvatarColor(user.id),
                                width: 40,
                                height: 40,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(user.fullName)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>
                                {user.fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280", fontSize: "0.75rem" }}
                              >
                                ID: {user.id.slice(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.roles.map((role, index) => (
                            <Chip
                              key={index}
                              label={getRoleLabel(role)}
                              size="small"
                              sx={{
                                bgcolor: "#EFF6FF",
                                color: "#3B82F6",
                                mr: 0.5,
                                mb: 0.5,
                              }}
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_LABELS[user.status] || user.status}
                            size="small"
                            color={
                              getStatusColor(user.status) as
                                | "success"
                                | "warning"
                                | "error"
                                | "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, user)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!searchTerm &&
              selectedRole === "all" &&
              filteredUsers.length > 0 && (
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} của ${
                      count !== -1 ? count : `nhiều hơn ${to}`
                    }`
                  }
                  sx={{
                    borderTop: "1px solid #E5E7EB",
                    "& .MuiTablePagination-select": {
                      borderRadius: 1,
                    },
                    "& .MuiTablePagination-selectIcon": {
                      color: "#FF5722",
                    },
                    "& .MuiTablePagination-actions button": {
                      color: "#FF5722",
                      "&:disabled": {
                        color: "#9CA3AF",
                      },
                    },
                  }}
                />
              )}
          </>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedUser?.status === "Active" ? (
            <>
              <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
              Khóa tài khoản
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              Kích hoạt
            </>
          )}
        </MenuItem>
      </Menu>

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <UpdateUserDialog
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleUpdateSuccess}
        user={selectedUser}
      />
    </Box>
  );
};

export default AccountManagement;
