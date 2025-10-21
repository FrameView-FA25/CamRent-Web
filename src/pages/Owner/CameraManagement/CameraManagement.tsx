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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

// Mock data for cameras
const cameras = [
  {
    id: 1,
    name: "Canon EOS R5",
    model: "EOS R5",
    brand: "Canon",
    price: "₫400.000/ngày",
    image: "https://via.placeholder.com/300x200",
    status: "available",
    rating: 4.9,
    totalBookings: 15,
    description: "Máy ảnh mirrorless full-frame chuyên nghiệp",
  },
  {
    id: 2,
    name: "Sony A7 IV",
    model: "A7 IV",
    brand: "Sony",
    price: "₫350.000/ngày",
    image: "https://via.placeholder.com/300x200",
    status: "rented",
    rating: 4.8,
    totalBookings: 12,
    description: "Máy ảnh mirrorless với khả năng quay video 4K",
  },
  {
    id: 3,
    name: "Fujifilm X-T5",
    model: "X-T5",
    brand: "Fujifilm",
    price: "₫300.000/ngày",
    image: "https://via.placeholder.com/300x200",
    status: "maintenance",
    rating: 4.7,
    totalBookings: 8,
    description: "Máy ảnh mirrorless APS-C với thiết kế retro",
  },
  {
    id: 4,
    name: "Nikon Z9",
    model: "Z9",
    brand: "Nikon",
    price: "₫450.000/ngày",
    image: "https://via.placeholder.com/300x200",
    status: "available",
    rating: 4.9,
    totalBookings: 10,
    description: "Máy ảnh mirrorless flagship với hiệu suất cao",
  },
];

export default function CameraManagement() {
  const getStatusColor = (
    status: string
  ): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case "available":
        return "success";
      case "rented":
        return "error";
      case "maintenance":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "rented":
        return "Đã thuê";
      case "maintenance":
        return "Bảo trì";
      default:
        return status;
    }
  };

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
            Quản lý Camera
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý tất cả camera của bạn tại đây
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="large">
          Thêm Camera mới
        </Button>
      </Box>

      {/* Stats */}
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
                {cameras.filter((c) => c.status === "available").length}
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
                {cameras.filter((c) => c.status === "rented").length}
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
                {cameras.filter((c) => c.status === "maintenance").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bảo trì
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Camera Grid */}
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
        {cameras.map((camera) => (
          <Card
            key={camera.id}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="img"
              height="200"
              image={camera.image}
              alt={camera.name}
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
                  {camera.name}
                </Typography>
                <Chip
                  label={getStatusText(camera.status)}
                  size="small"
                  color={getStatusColor(camera.status)}
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {camera.description}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Rating
                  value={camera.rating}
                  precision={0.1}
                  size="small"
                  readOnly
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({camera.totalBookings} lượt thuê)
                </Typography>
              </Box>

              <Typography
                variant="h6"
                color="primary"
                fontWeight="bold"
                gutterBottom
              >
                {camera.price}
              </Typography>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
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
        ))}
      </Box>
    </Box>
  );
}
