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
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import {
  cameraService,
  type Camera,
  type Accessory,
} from "../../../services/camera.service";

type DeviceStatus = "pending" | "active" | "inactive" | "unavailable";

interface AdminDevice {
  id: string;
  name: string;
  type: string;
  brand: string;
  branch: string;
  owner: string;
  status: DeviceStatus;
  statusLabel: string;
  statusColor: "default" | "success" | "warning" | "error" | "info";
  highlight: boolean;
  createdAt: string;
}

const STATUS_DISPLAY: Record<
  DeviceStatus,
  { label: string; color: "default" | "success" | "warning" | "error" | "info" }
> = {
  pending: { label: "Chờ duyệt", color: "warning" },
  active: { label: "Đang hoạt động", color: "success" },
  inactive: { label: "Ngừng cho thuê", color: "default" },
  unavailable: { label: "Không khả dụng", color: "error" },
};

const DeviceManagement: React.FC = () => {
  const [cameraDevices, setCameraDevices] = useState<AdminDevice[]>([]);
  const [accessoryDevices, setAccessoryDevices] = useState<AdminDevice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<AdminDevice | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "accessory">("camera");

  const deriveStatus = (
    isConfirmed?: boolean,
    location?: string | null
  ): DeviceStatus => {
    if (!isConfirmed) return "pending";
    // Nếu không có location hoặc đang ở platform -> coi như sẵn sàng
    if (!location || location === "Platform") return "active";
    // Có location khác platform -> đang được giữ/không khả dụng
    return "unavailable";
  };

  const formatBranch = (
    branchName?: string | null,
    branchAddress?: string | null
  ) => {
    const parts = [branchName, branchAddress]
      .map((part) => part?.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(" - ") : "Chưa phân bổ";
  };

  const buildDeviceName = (
    brand?: string | null,
    model?: string | null,
    variant?: string | null
  ) => {
    const parts = [brand, model, variant].filter(Boolean);
    return parts.length ? parts.join(" ") : "Thiết bị không tên";
  };

  const mapCameraToDevice = (camera: Camera): AdminDevice => {
    const status = deriveStatus(camera.isConfirmed, camera.location);
    const { label, color } = STATUS_DISPLAY[status];
    return {
      id: camera.id,
      name: buildDeviceName(camera.brand, camera.model, camera.variant),
      type: "Camera",
      brand: camera.brand || "Không rõ",
      branch: formatBranch(camera.branchName, camera.branchAddress),
      owner: camera.ownerName || "Không rõ",
      status,
      statusLabel: label,
      statusColor: color,
      highlight: status === "pending",
      createdAt: camera.createdAt
        ? new Date(camera.createdAt).toLocaleDateString("vi-VN")
        : "-",
    };
  };

  const mapAccessoryToDevice = (accessory: Accessory): AdminDevice => {
    const status = deriveStatus(accessory.isConfirmed, accessory.location);
    const { label, color } = STATUS_DISPLAY[status];
    return {
      id: accessory.id,
      name: buildDeviceName(accessory.brand, accessory.model, accessory.variant),
      type: "Phụ kiện",
      brand: accessory.brand || "Không rõ",
      branch: formatBranch(accessory.branchName, accessory.branchAddress),
      owner: accessory.ownerName || "Không rõ",
      status,
      statusLabel: label,
      statusColor: color,
      highlight: status === "pending",
      createdAt: accessory.createdAt
        ? new Date(accessory.createdAt).toLocaleDateString("vi-VN")
        : "-",
    };
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cameraResponse, accessoryResponse] = await Promise.all([
        cameraService.getAllCameras(),
        cameraService.getAccessories(),
      ]);

      setCameraDevices(cameraResponse.items.map(mapCameraToDevice));
      setAccessoryDevices(
        (accessoryResponse.items || []).map(mapAccessoryToDevice)
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu thiết bị. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, value: string) => {
    setActiveTab(value as "camera" | "accessory");
    setSearchTerm("");
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    device: AdminDevice
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedDevice(device);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDevice(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const currentDevices =
    activeTab === "camera" ? cameraDevices : accessoryDevices;

  const filteredDevices = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return currentDevices;
    return currentDevices.filter((device) =>
      [device.name, device.type, device.brand, device.branch, device.owner].some(
        (field) => field.toLowerCase().includes(keyword)
      )
    );
  }, [currentDevices, searchTerm]);

  const pendingCount = currentDevices.filter(
    (d) => d.status === "pending"
  ).length;

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
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 0.5,
            }}
          >
            Quản lý thiết bị
          </Typography>
          {pendingCount > 0 && (
            <Typography
              variant="body2"
              sx={{ color: "#F59E0B", fontWeight: 500 }}
            >
              {pendingCount} thiết bị đang chờ phê duyệt
            </Typography>
          )}
        </Box>
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
          Thêm thiết bị
        </Button>
      </Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          borderBottom: "1px solid #E5E7EB",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        }}
      >
        <Tab value="camera" label={`Camera (${cameraDevices.length})`} />
        <Tab value="accessory" label={`Phụ kiện (${accessoryDevices.length})`} />
      </Tabs>

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
            placeholder={
              activeTab === "camera"
                ? "Tìm theo tên, thương hiệu hoặc chi nhánh camera..."
                : "Tìm theo tên, thương hiệu hoặc chi nhánh phụ kiện..."
            }
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
          <Alert severity="error" sx={{ mx: 3, my: 2 }}>
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
                  <TableCell sx={{ fontWeight: 600 }}>Tên thiết bị</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thương hiệu</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Đại lý</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Chủ sở hữu</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      Không có thiết bị nào phù hợp với từ khóa tìm kiếm.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow
                      key={device.id}
                      hover
                      sx={{
                        bgcolor: device.highlight ? "#FFFBEB" : "transparent",
                      }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {device.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CameraIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                          {device.name}
                        </Box>
                      </TableCell>
                      <TableCell>{device.type}</TableCell>
                      <TableCell>{device.brand}</TableCell>
                      <TableCell>{device.branch}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#6B7280" }}>
                          {device.owner}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={device.statusLabel}
                          size="small"
                          color={device.statusColor}
                        />
                      </TableCell>
                      <TableCell>{device.createdAt}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, device)}
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
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedDevice?.status === "pending" && (
          <>
            <MenuItem onClick={handleMenuClose} sx={{ color: "#10B981" }}>
              <ApproveIcon sx={{ mr: 1, fontSize: 20 }} />
              Phê duyệt thiết bị
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
              <RejectIcon sx={{ mr: 1, fontSize: 20 }} />
              Từ chối thiết bị
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Create Device Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Thêm thiết bị mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Tên thiết bị"
              placeholder="Nhập tên thiết bị"
            />
            <FormControl fullWidth>
              <InputLabel>Loại thiết bị</InputLabel>
              <Select label="Loại thiết bị" defaultValue="">
                <MenuItem value="Camera">Máy ảnh</MenuItem>
                <MenuItem value="Drone">Drone</MenuItem>
                <MenuItem value="Action Camera">Action Camera</MenuItem>
                <MenuItem value="Lens">Ống kính</MenuItem>
                <MenuItem value="Accessories">Phụ kiện</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Thương hiệu"
              placeholder="Nhập tên thương hiệu"
            />
            <FormControl fullWidth>
              <InputLabel>Đại lý</InputLabel>
              <Select label="Đại lý" defaultValue="">
                <MenuItem value="Downtown Branch">Chi nhánh trung tâm</MenuItem>
                <MenuItem value="North Branch">Chi nhánh phía Bắc</MenuItem>
                <MenuItem value="South Branch">Chi nhánh phía Nam</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Mô tả"
              placeholder="Nhập mô tả thiết bị"
              multiline
              rows={3}
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
            Thêm thiết bị
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeviceManagement;
