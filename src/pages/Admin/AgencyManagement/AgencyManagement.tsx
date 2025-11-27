import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { branchService } from "../../../services/branch.service";
import type { Branch } from "../../../types/branch.types";

const formatAddress = (agency: Branch): string => {
  if (!agency.address) return "Chưa cập nhật";
  const { district, province, country } = agency.address;
  return (
    [district, province, country].filter(Boolean).join(", ") || "Chưa cập nhật"
  );
};

const AgencyManagement: React.FC = () => {
  const [agencies, setAgencies] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await branchService.getBranches();
        setAgencies(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách đại lý. Vui lòng thử lại.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = useMemo(() => {
    if (!searchTerm.trim()) return agencies;
    const keyword = searchTerm.trim().toLowerCase();
    return agencies.filter((agency) => {
      const nameMatch = agency.name?.toLowerCase().includes(keyword);
      const managerMatch =
        agency.managerName?.toLowerCase().includes(keyword) ?? false;
      const addressMatch = formatAddress(agency)
        .toLowerCase()
        .includes(keyword);
      return nameMatch || managerMatch || addressMatch;
    });
  }, [agencies, searchTerm]);

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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1F2937",
          }}
        >
          Quản lý đại lý
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: "#DC2626",
            "&:hover": { bgcolor: "#B91C1C" },
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
        >
          Thêm đại lý
        </Button>
      </Box>

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
            placeholder="Tìm theo tên, địa chỉ hoặc quản lý..."
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

        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="error" />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên đại lý</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Địa chỉ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quản lý</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thành viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAgencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      Không tìm thấy đại lý nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgencies.map((agency) => (
                    <TableRow key={agency.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {agency.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationIcon
                            sx={{ fontSize: 18, color: "#DC2626" }}
                          />
                          {agency.name}
                        </Box>
                      </TableCell>
                      <TableCell>{formatAddress(agency)}</TableCell>
                      <TableCell>{agency.managerName || "Chưa có"}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${
                            agency.userMemberships?.length || 0
                          } thành viên`}
                          size="small"
                          sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={handleMenuClick} size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Create Agency Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Tạo đại lý mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Tên đại lý"
              placeholder="Nhập tên đại lý"
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              placeholder="Nhập địa chỉ đại lý"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Email quản lý"
              type="email"
              placeholder="Nhập email quản lý"
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              color: "#6B7280",
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              bgcolor: "#DC2626",
              "&:hover": { bgcolor: "#B91C1C" },
              textTransform: "none",
            }}
          >
            Thêm đại lý
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgencyManagement;
