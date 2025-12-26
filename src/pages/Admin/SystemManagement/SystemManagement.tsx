import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import { EditOutlined, Add as AddIcon } from "@mui/icons-material";
import {
  moneyPlatformSettingsService,
  type MoneyPlatformSettingsResponse,
  type MoneyPlatformSettingsRequest,
} from "@/services/moneyPlatformSettings.service";

const SystemManagement: React.FC = () => {
  const [settings, setSettings] = useState<MoneyPlatformSettingsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<MoneyPlatformSettingsRequest>({
    upfrontPercent: 0,
    platformFeePercent: 0,
    ownerSharePercent: 0,
    lateFeeFirstNDays: 0,
    lateFeeFactorFirstN: 0,
    lateFeeFactorAfter: 0,
    downtimeFactor: 0,
    cancelTimeMinutes: 0,
    isActive: true,
  });

  // Lấy danh sách cấu hình
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await moneyPlatformSettingsService.getAll();
      setSettings(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Không thể tải cấu hình hệ thống",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Mở modal tạo mới
  const handleCreate = () => {
    // Kiểm tra xem đã có cấu hình chưa
    if (settings.length > 0) {
      setSnackbar({
        open: true,
        message:
          "Hệ thống đã có cấu hình. Vui lòng chỉnh sửa cấu hình hiện có.",
        severity: "error",
      });
      return;
    }

    setEditingId(null);
    setFormData({
      upfrontPercent: 0,
      platformFeePercent: 0,
      ownerSharePercent: 0,
      lateFeeFirstNDays: 0,
      lateFeeFactorFirstN: 0,
      lateFeeFactorAfter: 0,
      downtimeFactor: 0,
      cancelTimeMinutes: 0,
      isActive: true,
    });
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (record: MoneyPlatformSettingsResponse) => {
    setEditingId(record.id);
    setFormData({
      upfrontPercent: record.upfrontPercent,
      platformFeePercent: record.platformFeePercent,
      ownerSharePercent: record.ownerSharePercent,
      lateFeeFirstNDays: record.lateFeeFirstNDays,
      lateFeeFactorFirstN: record.lateFeeFactorFirstN,
      lateFeeFactorAfter: record.lateFeeFactorAfter,
      downtimeFactor: record.downtimeFactor,
      cancelTimeMinutes: record.cancelTimeMinutes,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  // Xử lý thay đổi input
  const handleInputChange = (
    field: keyof MoneyPlatformSettingsRequest,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await moneyPlatformSettingsService.update(editingId, formData);
        setSnackbar({
          open: true,
          message: "Cập nhật cấu hình thành công",
          severity: "success",
        });
      } else {
        await moneyPlatformSettingsService.create(formData);
        setSnackbar({
          open: true,
          message: "Tạo cấu hình mới thành công",
          severity: "success",
        });
      }
      setModalVisible(false);
      fetchSettings();
    } catch (error) {
      setSnackbar({
        open: true,
        message: editingId ? "Cập nhật thất bại" : "Tạo mới thất bại",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Card>
        <CardHeader
          title="Quản lý cấu hình hệ thống"
          action={
            settings.length === 0 ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  color: "white",
                }}
              >
                Tạo cấu hình mới
              </Button>
            ) : null
          }
        />
        <CardContent>
          {loading && settings.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : settings.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Alert severity="info">
                Chưa có cấu hình hệ thống. Vui lòng tạo cấu hình mới.
              </Alert>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Phần trăm đặt trước</TableCell>
                    <TableCell>Phí nền tảng</TableCell>
                    <TableCell>Phần chủ sở hữu</TableCell>
                    <TableCell>Ngày phí trễ đầu</TableCell>
                    <TableCell>Hệ số phí trễ đầu</TableCell>
                    <TableCell>Hệ số phí trễ sau</TableCell>
                    <TableCell>Hệ số downtime</TableCell>
                    <TableCell>Thời gian hủy (phút)</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settings.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {(row.upfrontPercent * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {(row.platformFeePercent * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {(row.ownerSharePercent * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{row.lateFeeFirstNDays}</TableCell>
                      <TableCell>{row.lateFeeFactorFirstN}</TableCell>
                      <TableCell>{row.lateFeeFactorAfter}</TableCell>
                      <TableCell>{row.downtimeFactor}</TableCell>
                      <TableCell>{row.cancelTimeMinutes}</TableCell>
                      <TableCell>
                        <Switch checked={row.isActive} disabled />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(row)}
                        >
                          <EditOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Cập nhật cấu hình" : "Tạo cấu hình mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Phần trăm đặt trước (0-1)"
              type="number"
              fullWidth
              required
              value={formData.upfrontPercent}
              onChange={(e) =>
                handleInputChange("upfrontPercent", parseFloat(e.target.value))
              }
              inputProps={{ step: 0.01, min: 0, max: 1 }}
            />

            <TextField
              label="Phí nền tảng (0-1)"
              type="number"
              fullWidth
              required
              value={formData.platformFeePercent}
              onChange={(e) =>
                handleInputChange(
                  "platformFeePercent",
                  parseFloat(e.target.value)
                )
              }
              inputProps={{ step: 0.01, min: 0, max: 1 }}
            />

            <TextField
              label="Phần chủ sở hữu (0-1)"
              type="number"
              fullWidth
              required
              value={formData.ownerSharePercent}
              onChange={(e) =>
                handleInputChange(
                  "ownerSharePercent",
                  parseFloat(e.target.value)
                )
              }
              inputProps={{ step: 0.01, min: 0, max: 1 }}
            />

            <TextField
              label="Số ngày phí trễ đầu tiên"
              type="number"
              fullWidth
              required
              value={formData.lateFeeFirstNDays}
              onChange={(e) =>
                handleInputChange("lateFeeFirstNDays", parseInt(e.target.value))
              }
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Hệ số phí trễ đầu tiên"
              type="number"
              fullWidth
              required
              value={formData.lateFeeFactorFirstN}
              onChange={(e) =>
                handleInputChange(
                  "lateFeeFactorFirstN",
                  parseFloat(e.target.value)
                )
              }
              inputProps={{ step: 0.1, min: 0 }}
            />

            <TextField
              label="Hệ số phí trễ sau đó"
              type="number"
              fullWidth
              required
              value={formData.lateFeeFactorAfter}
              onChange={(e) =>
                handleInputChange(
                  "lateFeeFactorAfter",
                  parseFloat(e.target.value)
                )
              }
              inputProps={{ step: 0.1, min: 0 }}
            />

            <TextField
              label="Hệ số downtime"
              type="number"
              fullWidth
              required
              value={formData.downtimeFactor}
              onChange={(e) =>
                handleInputChange("downtimeFactor", parseFloat(e.target.value))
              }
              inputProps={{ step: 0.1, min: 0 }}
            />

            <TextField
              label="Thời gian hủy (phút)"
              type="number"
              fullWidth
              required
              value={formData.cancelTimeMinutes}
              onChange={(e) =>
                handleInputChange("cancelTimeMinutes", parseInt(e.target.value))
              }
              inputProps={{ min: 0 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                />
              }
              label="Trạng thái kích hoạt"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVisible(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : editingId ? (
              "Cập nhật"
            ) : (
              "Tạo mới"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemManagement;
