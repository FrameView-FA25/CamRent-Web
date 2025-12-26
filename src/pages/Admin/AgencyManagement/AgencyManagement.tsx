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
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ManageAccounts as ManageAccountsIcon,
  PersonRemove as PersonRemoveIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { branchService } from "../../../services/branch.service";
import type { Branch, UserMembership } from "../../../types/branch.types";
import AssignStaffDialog from "../../../components/Modal/Admin/Branchs/AssignStaffDialog";
import AssignManagerDialog from "../../../components/Modal/Admin/Branchs/AssignManagerDialog";
import RemoveMemberDialog from "../../../components/Modal/Admin/Branchs/RemoveMemberDialog";
import BranchMembersDialog from "../../../components/Modal/Admin/Branchs/BranchMembersDialog";

const formatAddress = (agency: Branch): string => {
  if (!agency.address) return "Chưa cập nhật";
  const { district, province, country } = agency.address;
  return (
    [district, province, country].filter(Boolean).join(", ") || "Chưa cập nhật"
  );
};

const getInitials = (name: string): string => {
  if (!name) return "?";
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

const AgencyManagement: React.FC = () => {
  const [agencies, setAgencies] = useState<Branch[]>([]);
  const [branchMemberships, setBranchMemberships] = useState<{
    [branchId: string]: UserMembership[];
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openAssignManagerDialog, setOpenAssignManagerDialog] = useState(false);
  const [openRemoveMemberDialog, setOpenRemoveMemberDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedMember, setSelectedMember] = useState<UserMembership | null>(
    null
  );
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    province: "",
    district: "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    country?: string;
    province?: string;
    district?: string;
  }>({});

  const [openMembersDialog, setOpenMembersDialog] = useState(false);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchService.getBranches();
      setAgencies(data);

      // Fetch memberships cho tất cả branches
      const groupedMemberships: { [branchId: string]: UserMembership[] } = {};

      // Gọi API cho từng branch để lấy memberships
      await Promise.all(
        data.map(async (branch) => {
          try {
            const memberships =
              await branchService.getBranchMembershipsByBranchId(branch.id);
            groupedMemberships[branch.id] = memberships;
          } catch (err) {
            console.error(
              `Lỗi khi lấy memberships cho branch ${branch.id}:`,
              err
            );
            groupedMemberships[branch.id] = [];
          }
        })
      );

      setBranchMemberships(groupedMemberships);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách chi nhánh";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    branch: Branch
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBranch(branch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setFormData({
      name: "",
      country: "",
      province: "",
      district: "",
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: "",
      country: "",
      province: "",
      district: "",
    });
    setFormErrors({});
    setError(null);
  };

  const handleOpenAssignDialog = () => {
    setOpenAssignDialog(true);
    setAnchorEl(null);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedBranch(null);
  };

  const handleOpenAssignManagerDialog = () => {
    setOpenAssignManagerDialog(true);
    setAnchorEl(null);
  };

  const handleCloseAssignManagerDialog = () => {
    setOpenAssignManagerDialog(false);
    setSelectedBranch(null);
  };

  const handleAssignSuccess = () => {
    fetchAgencies();
  };

  const handleMemberMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    branch: Branch,
    member: UserMembership
  ) => {
    event.stopPropagation();
    setMemberMenuAnchor(event.currentTarget);
    setSelectedBranch(branch);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
  };

  // Mở dialog quản lý nhân viên cho 1 chi nhánh
  const handleOpenMembersDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpenMembersDialog(true);
  };

  // Đóng dialog quản lý nhân viên
  const handleCloseMembersDialog = () => {
    setOpenMembersDialog(false);
    setSelectedBranch(null);
  };

  const handleOpenRemoveMemberDialog = (member?: UserMembership) => {
    if (member) {
      setSelectedMember(member);
    }
    setOpenRemoveMemberDialog(true);
    setMemberMenuAnchor(null);
  };

  const handleCloseRemoveMemberDialog = () => {
    setOpenRemoveMemberDialog(false);
    setSelectedMember(null);
    setSelectedBranch(null);
  };

  const handleRemoveMemberSuccess = () => {
    fetchAgencies();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Vui lòng nhập tên chi nhánh";
    }
    if (!formData.country.trim()) {
      errors.country = "Vui lòng nhập quốc gia";
    }
    if (!formData.province.trim()) {
      errors.province = "Vui lòng nhập tỉnh/thành phố";
    }
    if (!formData.district.trim()) {
      errors.district = "Vui lòng nhập quận/huyện";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBranch = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const branchData = {
        name: formData.name.trim(),
        address: {
          country: formData.country.trim(),
          province: formData.province.trim(),
          district: formData.district.trim(),
        },
      };

      await branchService.createBranch(branchData);
      await fetchAgencies();
      handleCloseDialog();

      toast.success("Tạo chi nhánh thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tạo chi nhánh. Vui lòng thử lại.";
      setError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAgencies = useMemo(() => {
    if (!searchTerm.trim()) return agencies;
    const keyword = searchTerm.trim().toLowerCase();
    return agencies.filter((agency) => {
      return (
        agency.name.toLowerCase().includes(keyword) ||
        formatAddress(agency).toLowerCase().includes(keyword) ||
        agency.managerName?.toLowerCase().includes(keyword)
      );
    });
  }, [agencies, searchTerm]);

  // Helper function để lấy members của branch
  const getBranchMembers = (branchId: string): UserMembership[] => {
    return branchMemberships[branchId] || [];
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
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
            <BusinessIcon sx={{ color: "white", fontSize: 30 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1F2937",
              }}
            >
              Quản lý chi nhánh
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Quản lý tất cả chi nhánh trong hệ thống
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              bgcolor: "#FF5722",
              "&:hover": { bgcolor: "#F4511E" },
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              color: "white",
            }}
          >
            Thêm chi nhánh
          </Button>
          <IconButton
            onClick={fetchAgencies}
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

      {error && !openDialog && (
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
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm chi nhánh..."
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

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "#FF5722" }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tên chi nhánh</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Địa chỉ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quản lý</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAgencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <BusinessIcon
                        sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }}
                      />
                      <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                        {searchTerm
                          ? "Không tìm thấy chi nhánh nào"
                          : "Chưa có chi nhánh nào"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                      >
                        {searchTerm
                          ? "Thử tìm kiếm với từ khóa khác"
                          : "Danh sách chi nhánh sẽ hiển thị ở đây"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgencies.map((agency) => {
                    const members = getBranchMembers(agency.id);
                    const managerMember = members.find(
                      (m) => m.userId === agency.managerId
                    );

                    return (
                      <TableRow key={agency.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>
                            {agency.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#6B7280" }}>
                            {formatAddress(agency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {agency.managerName ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                avatar={
                                  <Avatar
                                    sx={{
                                      bgcolor: getAvatarColor(agency.managerId),
                                      width: 24,
                                      height: 24,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {getInitials(agency.managerName)}
                                  </Avatar>
                                }
                                label={agency.managerName}
                                size="small"
                                sx={{
                                  bgcolor: "#EFF6FF",
                                  color: "#3B82F6",
                                  "& .MuiChip-avatar": {
                                    marginLeft: "4px",
                                  },
                                }}
                              />
                              {managerMember && (
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    handleMemberMenuClick(
                                      e,
                                      agency,
                                      managerMember
                                    )
                                  }
                                  sx={{
                                    opacity: 0.6,
                                    "&:hover": {
                                      opacity: 1,
                                      color: "#DC2626",
                                    },
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#9CA3AF",
                                fontStyle: "italic",
                              }}
                            >
                              Chưa có quản lý
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {members.length > 0 ? (
                            <Box
                              onClick={() => handleOpenMembersDialog(agency)}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer",
                                "&:hover": {
                                  "& .MuiSvgIcon-root": {
                                    color: "#FF5722",
                                  },
                                  "& .MuiTypography-root": {
                                    color: "#FF5722",
                                  },
                                },
                              }}
                            >
                              <PeopleIcon
                                sx={{
                                  color: "#6B7280",
                                  fontSize: 20,
                                  transition: "color 0.2s",
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#6B7280",
                                  fontWeight: 500,
                                  transition: "color 0.2s",
                                }}
                              >
                                {members.length} người
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: "#9CA3AF", fontStyle: "italic" }}
                            >
                              Chưa có nhân viên
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, agency)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Branch Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
        }}
      >
        {!selectedBranch?.managerName && (
          <MenuItem onClick={handleOpenAssignManagerDialog}>
            <ListItemIcon>
              <ManageAccountsIcon sx={{ color: "#3B82F6" }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Gán quản lý</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenAssignDialog}>
          <ListItemIcon>
            <PersonAddIcon sx={{ color: "#FF5722" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gán nhân viên</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Member Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
        }}
      >
        <MenuItem onClick={() => handleOpenRemoveMemberDialog()}>
          <ListItemIcon>
            <PersonRemoveIcon sx={{ color: "#DC2626" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText sx={{ color: "#DC2626" }}>
            Xóa khỏi chi nhánh
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Branch Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          Tạo chi nhánh mới
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Tên chi nhánh"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={submitting}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <TextField
            fullWidth
            label="Quốc gia"
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            error={!!formErrors.country}
            helperText={formErrors.country}
            disabled={submitting}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <TextField
            fullWidth
            label="Tỉnh/Thành phố"
            value={formData.province}
            onChange={(e) => handleInputChange("province", e.target.value)}
            error={!!formErrors.province}
            helperText={formErrors.province}
            disabled={submitting}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <TextField
            fullWidth
            label="Quận/Huyện"
            value={formData.district}
            onChange={(e) => handleInputChange("district", e.target.value)}
            error={!!formErrors.district}
            helperText={formErrors.district}
            disabled={submitting}
            required
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #E5E7EB", gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
            sx={{
              textTransform: "none",
              color: "#6B7280",
              "&:hover": { bgcolor: "#F3F4F6" },
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBranch}
            disabled={submitting}
            sx={{
              bgcolor: "#FF5722",
              "&:hover": { bgcolor: "#F4511E" },
              textTransform: "none",
              minWidth: 120,
              color: "#FFFFFF",
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Tạo chi nhánh"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Staff Dialog */}
      <AssignStaffDialog
        open={openAssignDialog}
        onClose={handleCloseAssignDialog}
        branch={selectedBranch}
        onSuccess={handleAssignSuccess}
      />

      {/* Dialog gán quản lý */}
      <AssignManagerDialog
        open={openAssignManagerDialog}
        onClose={handleCloseAssignManagerDialog}
        branch={selectedBranch}
        onSuccess={handleAssignSuccess}
      />

      {/* Dialog quản lý nhân viên */}
      <BranchMembersDialog
        open={openMembersDialog}
        onClose={handleCloseMembersDialog}
        branch={selectedBranch}
        members={selectedBranch ? getBranchMembers(selectedBranch.id) : []}
        onRemoveMember={(member) => handleOpenRemoveMemberDialog(member)}
      />

      {/* Dialog xóa nhân viên */}
      <RemoveMemberDialog
        open={openRemoveMemberDialog}
        onClose={handleCloseRemoveMemberDialog}
        branch={selectedBranch}
        member={selectedMember}
        onSuccess={handleRemoveMemberSuccess}
      />
    </Box>
  );
};

export default AgencyManagement;
