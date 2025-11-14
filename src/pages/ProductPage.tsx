import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FilterListIcon from "@mui/icons-material/FilterList";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { cameraService } from "../services/camera.service";
import type { Accessory } from "../services/camera.service";
import { colors } from "../theme/colors";
interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchName: string;
  bookingItemType: number;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number;
  depositCapMaxVnd: number;
  media: string[];
  specsJson: string | null;
  categories: string[];
}

interface CameraResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Camera[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Component ProductCard có thể hiển thị cả Camera và Accessory
const ProductCard: React.FC<{ camera: Camera | Accessory }> = ({ camera }) => {
  const navigate = useNavigate();

  // Xử lý media cho cả Camera và Accessory
  const getMediaUrl = () => {
    if (
      "media" in camera &&
      Array.isArray(camera.media) &&
      camera.media.length > 0
    ) {
      // Accessory case: media là string[]
      if (typeof camera.media[0] === "string") {
        return camera.media[0];
      }
      // Camera case: media là object với url
      if (typeof camera.media[0] === "object" && camera.media[0] !== null) {
        return (camera.media[0] as { url?: string }).url || null;
      }
    }
    return null;
  };

  const mediaUrl = getMediaUrl();

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        transition: "box-shadow .3s",
        "&:hover": { boxShadow: 6 },
        bgcolor: "white",
      }}
    >
      <Box sx={{ position: "relative", bgcolor: grey[100] }}>
        <Box sx={{ pt: "100%" }} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: grey[300],
          }}
        >
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt={`${camera.brand} ${camera.model}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <CameraAltOutlinedIcon sx={{ fontSize: 64 }} />
          )}
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: colors.primary.main,
            color: "black",
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Available
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ color: grey[600], mb: 0.5 }}>
            {camera.brand}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: grey[900], mb: 0.5 }}
          >
            {camera.model}
            {camera.variant && (
              <Chip
                label={camera.variant}
                size="small"
                sx={{ ml: 1, height: 20, fontSize: 11 }}
              />
            )}
          </Typography>

          {camera.serialNumber && (
            <Typography
              variant="caption"
              sx={{ color: grey[500], mb: 1.5, display: "block" }}
            >
              SN: {camera.serialNumber}
            </Typography>
          )}

          <Box
            sx={{ display: "flex", alignItems: "flex-start", mb: 2, gap: 0.5 }}
          >
            <LocationOnIcon sx={{ fontSize: 16, color: grey[500], mt: 0.25 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: grey[800] }}
              >
                {camera.branchName}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: amber[50],
              border: `1px solid ${amber[200]}`,
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              minHeight: 90,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" sx={{ color: grey[600] }}>
                Giá thuê/ngày:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: amber[800] }}
              >
                {formatCurrency(camera.baseDailyRate)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: grey[600] }}>
                Đặt cọc ({camera.depositPercent}%):
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: grey[700] }}
              >
                {formatCurrency(
                  Math.min(
                    Math.max(
                      (camera.estimatedValueVnd * camera.depositPercent) / 100,
                      camera.depositCapMinVnd
                    ),
                    camera.depositCapMaxVnd
                  )
                )}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/products/${camera.id}`)}
            sx={{
              borderColor: grey[300],
              color: grey[800],
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              py: 1,
              "&:hover": {
                borderColor: grey[400],
                bgcolor: grey[50],
              },
            }}
          >
            Xem chi tiết
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "black",
              color: "white",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              "&:hover": { bgcolor: grey[800] },
            }}
          >
            Thuê ngay
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ProductPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCameras, setTotalCameras] = useState(0);
  const [totalAccessories, setTotalAccessories] = useState(0);
  const [currentTab, setCurrentTab] = useState(0); // 0: Cameras, 1: Accessories
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch cameras
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Cameras`, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cameras");
        }

        const data: CameraResponse = await response.json();
        setCameras(data.items || []);
        setTotalCameras(data.total || 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching cameras:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  // Fetch accessories
  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        const data = await cameraService.getAccessories(
          currentPage,
          pageSize,
          searchQuery
        );
        setAccessories(data.items || []);
        setTotalAccessories(data.total || 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching accessories:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentTab === 1) {
      fetchAccessories();
    }
  }, [currentTab, currentPage, searchQuery, pageSize]);

  const categories = useMemo(() => {
    const items = currentTab === 0 ? cameras : accessories;
    const brands = new Set(items.map((c) => c.brand));
    return ["All", ...Array.from(brands)];
  }, [cameras, accessories, currentTab]);

  const filteredCameras = useMemo(() => {
    const items = currentTab === 0 ? cameras : accessories;

    if (!searchQuery) {
      return selectedCategory === "All"
        ? items
        : items.filter((c) => c.brand === selectedCategory);
    }

    const q = searchQuery.toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        (c.model && c.model.toLowerCase().includes(q)) ||
        (c.brand && c.brand.toLowerCase().includes(q)) ||
        (c.variant && c.variant.toLowerCase().includes(q)) ||
        (c.branchName && c.branchName.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All" || c.brand === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [cameras, accessories, searchQuery, selectedCategory, currentTab]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: grey[50] }}>
      {/* HERO */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${grey[100]}, ${grey[200]})`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            Khám phá Thiết bị
          </Typography>
          <Typography variant="h6" sx={{ color: grey[600], mb: 1 }}>
            Cho thuê thiết bị camera chuyên nghiệp cho dự án của bạn
          </Typography>
          <Typography variant="body2" sx={{ color: grey[500], mb: 4 }}>
            {currentTab === 0
              ? `${totalCameras} camera có sẵn`
              : `${totalAccessories} phụ kiện có sẵn`}
          </Typography>

          {/* Tabs để chuyển đổi giữa Cameras và Accessories */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => {
                setCurrentTab(newValue);
                setSelectedCategory("All");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  minWidth: 120,
                },
                "& .Mui-selected": {
                  color: "black !important",
                },
                "& .MuiTabs-indicator": {
                  bgcolor: colors.primary.main,
                  height: 3,
                },
              }}
            >
              <Tab label={`Cameras (${totalCameras})`} />
              <Tab label={`Phụ kiện (${totalAccessories})`} />
            </Tabs>
          </Box>

          <Box sx={{ maxWidth: 720 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm camera, ống kính, phụ kiện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: grey[500] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  py: 0.25,
                  bgcolor: "white",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: grey[300],
                  borderWidth: 2,
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: colors.primary.main,
                  },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* MAIN */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 3, overflowX: "auto", pb: 1 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ color: grey[700], fontWeight: 700 }}
          >
            <FilterListIcon fontSize="small" />
            <Typography fontWeight={700}>Thương hiệu:</Typography>
          </Stack>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Stack direction="row" spacing={1}>
            {categories.map((cat) => {
              const selected = selectedCategory === cat;
              const items = currentTab === 0 ? cameras : accessories;
              const count =
                cat === "All"
                  ? items.length
                  : items.filter((c) => c.brand === cat).length;
              return (
                <Chip
                  key={cat}
                  label={`${cat} (${count})`}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: selected ? colors.primary.main : "white",
                    color: selected ? "black" : grey[800],
                    fontWeight: selected ? 700 : 500,
                    borderRadius: 999,
                    px: 1,
                    "&:hover": { bgcolor: selected ? amber[500] : grey[100] },
                    border: selected ? "none" : `1px solid ${grey[200]}`,
                  }}
                />
              );
            })}
          </Stack>
        </Stack>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "error.main", mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                bgcolor: colors.primary.main,
                color: "black",
                "&:hover": { bgcolor: colors.primary.light },
              }}
            >
              Thử lại
            </Button>
          </Box>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: grey[600] }}>
                Hiển thị {filteredCameras.length} /{" "}
                {currentTab === 0 ? totalCameras : totalAccessories} sản phẩm
              </Typography>
            </Box>
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
              {filteredCameras.map((camera) => (
                <ProductCard key={camera.id} camera={camera} />
              ))}
            </Box>
          </>
        )}

        {!loading && !error && filteredCameras.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PhotoCameraIcon sx={{ fontSize: 64, color: grey[300], mb: 1 }} />
            <Typography variant="h6" sx={{ color: grey[500] }}>
              Không tìm thấy camera
            </Typography>
          </Box>
        )}
      </Container>

      {/* FOOTER CTA */}
      <Box sx={{ bgcolor: "black", color: "white", py: 8, mt: 6 }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Sẵn sàng bắt đầu chụp?
          </Typography>
          <Typography variant="h6" sx={{ color: grey[400], mb: 4 }}>
            Thuê thiết bị chuyên nghiệp mà không cần cam kết sở hữu
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: colors.primary.main,
              color: "black",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              py: 1.25,
              "&:hover": { bgcolor: amber[500] },
            }}
          >
            Xem tất cả thiết bị
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default ProductPage;
