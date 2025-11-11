import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import ModalAddCamera from "../../../components/Modal/ModalAddCamera";
import type { CameraFormData } from "../../../components/Modal/ModalAddCamera";
import { useCameras } from "../../../hooks/useCameras";
import { cameraService } from "../../../services/camera.service";

export default function CameraManagement() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const { cameras, loading, error, refetch } = useCameras();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddCamera = async (cameraData: CameraFormData) => {
    try {
      await cameraService.createCamera(cameraData);
      setSnackbar({
        open: true,
        message: "Camera đã được thêm thành công!",
        severity: "success",
      });
      refetch(); // Refresh the camera list after adding
      setOpenAddModal(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể thêm camera";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minBlockSize: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={refetch}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Camera Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your camera rental listings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenAddModal(true)}
        >
          Thêm Camera mới
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "gird" }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(25% - 12px)" } }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {cameras.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng Camera
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(25% - 12px)" } }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {cameras.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Có sẵn
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(25% - 12px)" } }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="error.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã thuê
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(25% - 12px)" } }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bảo trì
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Camera Grid */}
      {cameras.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có camera nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bắt đầu bằng cách thêm camera đầu tiên của bạn
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
          >
            Thêm Camera mới
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {cameras.map((camera) => {
            const cameraImage =
              camera.media && camera.media.length > 0
                ? camera.media.find((m) => m.isPrimary)?.url ||
                  camera.media[0]?.url
                : "https://via.placeholder.com/400x300?text=No+Image";
            const cameraName =
              `${camera.brand} ${camera.model} ${camera.variant}`.trim();
            const dailyPrice = formatPrice(camera.baseDailyRate);

            return (
              <Card
                key={camera.id}
                sx={{
                  blockSize: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={cameraImage}
                  alt={cameraName}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {cameraName}
                    </Typography>
                    <Chip
                      label="Có sẵn"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    S/N: {camera.serialNumber}
                  </Typography>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Specs: {camera.specsJson}
                    </Typography>
                  </Box>

                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {dailyPrice}/ngày
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Giá trị ước tính: {formatPrice(camera.estimatedValueVnd)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Đặt cọc: {(camera.depositPercent * 100).toFixed(0)}%
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <IconButton color="primary" size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Add Camera Modal */}
      <ModalAddCamera
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddCamera}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ inlineSize: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
