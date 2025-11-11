import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import ModalAddCamera from "../../../components/Modal/ModalAddCamera";
import { cameraService } from "../../../services/camera.service";
import type { Camera } from "../../../services/camera.service";

export default function CameraManagement() {
  // State quản lý modal thêm camera
  const [openAddModal, setOpenAddModal] = useState(false);

  // State lưu danh sách camera từ API
  const [cameras, setCameras] = useState<Camera[]>([]);

  // State quản lý trạng thái loading khi gọi API
  const [loading, setLoading] = useState(true);

  // State quản lý thông báo lỗi
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm lấy danh sách camera từ API
   */
  const fetchCameras = async () => {
    // Kiểm tra xem có token không trước khi gọi API
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError(
        "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách camera."
      );
      setLoading(false);
      setCameras([]); // Set mảng rỗng
      return;
    }

    try {
      setLoading(true); // Bắt đầu loading
      setError(null); // Xóa lỗi cũ nếu có

      // Gọi API lấy danh sách camera
      const data = await cameraService.getCamerasByOwner();
      setCameras(data); // Lưu dữ liệu vào state
    } catch (err) {
      // Xử lý lỗi
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải danh sách camera";
      setError(errorMessage);
      console.error("Lỗi khi tải camera:", err);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  /**
   * useEffect: Gọi API lấy danh sách camera khi component được mount
   */
  useEffect(() => {
    fetchCameras();
  }, []); // Array rỗng [] = chỉ chạy 1 lần khi component mount

  /**
   * Hàm xử lý khi thêm camera mới thành công
   * Callback được gọi từ ModalAddCamera sau khi API thành công
   */
  const handleAddCamera = () => {
    // Tải lại danh sách camera sau khi thêm thành công
    fetchCameras();
  };

  /**
   * Hàm xử lý xóa camera
   * @param cameraId - ID của camera cần xóa
   */
  const handleDeleteCamera = async (cameraId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa camera này?")) {
      return;
    }

    try {
      // Gọi API xóa camera
      await cameraService.deleteCamera(cameraId);
      alert("Xóa camera thành công!");

      // Tải lại danh sách camera sau khi xóa
      fetchCameras();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa camera";
      alert(`Lỗi: ${errorMessage}`);
      console.error("Lỗi khi xóa camera:", err);
    }
  };

  /**
   * Hàm format giá tiền VNĐ
   * @param price - Giá tiền cần format
   * @returns Chuỗi giá tiền đã format
   */
  const formatPrice = (price: number) => {
    return `₫${price.toLocaleString("vi-VN")}/ngày`;
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          blockSize: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={fetchCameras}>
            Thử lại
          </Button>
          {!localStorage.getItem("accessToken") && (
            <Button
              variant="outlined"
              onClick={() => (window.location.href = "/")}
            >
              Đăng nhập
            </Button>
          )}
        </Box>
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

      {/* Stats - Thống kê tổng quan */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
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

      {/* Camera Grid - Danh sách camera dạng lưới */}
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
        {cameras.length === 0 ? (
          // Hiển thị khi không có camera
          <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có camera nào. Nhấn "Thêm Camera mới" để bắt đầu.
            </Typography>
          </Box>
        ) : (
          // Hiển thị danh sách camera
          cameras.map((camera) => (
            <Card
              key={camera.id}
              sx={{
                blockSize: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Hình ảnh camera - Hiển thị ảnh đầu tiên trong mảng media hoặc ảnh mặc định */}
              <CardMedia
                component="img"
                sx={{ blockSize: "200px" }}
                image={
                  camera.media && camera.media.length > 0
                    ? typeof camera.media[0] === "string"
                      ? camera.media[0]
                      : camera.media[0].url
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={`${camera.brand} ${camera.model}`}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Tên và trạng thái camera */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {camera.brand} {camera.model}
                  </Typography>
                  <Chip
                    label="Có sẵn"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>

                {/* Thông tin variant và serial number */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phiên bản: {camera.variant}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Serial: {camera.serialNumber}
                </Typography>

                {/* Thông số kỹ thuật */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mt: 1 }}
                >
                  Thông số: {camera.specsJson}
                </Typography>

                {/* Rating giả định - có thể bổ sung sau */}
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 1, mt: 1 }}
                >
                  <Rating value={4.5} precision={0.1} size="small" readOnly />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    (0 lượt thuê)
                  </Typography>
                </Box>

                {/* Giá thuê */}
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  {formatPrice(camera.baseDailyRate)}
                </Typography>

                {/* Giá trị ước tính */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Giá trị: ₫{camera.estimatedValueVnd.toLocaleString("vi-VN")}
                </Typography>

                {/* Thông tin đặt cọc */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Đặt cọc: {(camera.depositPercent * 100).toFixed(0)}%
                </Typography>

                {/* Action buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <IconButton color="primary" size="small" title="Xem chi tiết">
                    <ViewIcon />
                  </IconButton>
                  <IconButton color="primary" size="small" title="Chỉnh sửa">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    title="Xóa"
                    onClick={() => handleDeleteCamera(camera.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Add Camera Modal */}
      <ModalAddCamera
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddCamera}
      />
    </Box>
  );
}
