import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import type { Camera } from "../../types/product.types";
import { toast } from "react-toastify";
import { colors } from "../../theme/colors";
import { useCartContext } from "../../context/CartContext";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows"; // ✅ Import icon
import { useCompare } from "../../context/CompareContext/CompareContext"; // ✅ Import

const ACCENT = amber[400];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const ProductDetailPage: React.FC = () => {
  const { refreshCart } = useCartContext();
  const { compareIds, addToCompare, canAddMore } = useCompare(); // ✅ Get compare context

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // ✅ Check if current camera is already in compare list
  const isInCompare = id ? compareIds.includes(id) : false;
  const SPEC_LABELS: Record<string, string> = {
    sensor: "Cảm biến",
    isoRange: "Dải ISO",
    video: "Quay video",
    stabilization: "Chống rung",
    weight: "Trọng lượng",
  };
  const parseSpecs = (
    rawSpecs: string | Record<string, string> | null | undefined
  ): Record<string, string> | null => {
    if (!rawSpecs) return null;

    try {
      // Nếu backend trả về đã là object rồi
      if (typeof rawSpecs === "object") return rawSpecs;

      let text = rawSpecs.trim();

      // Nếu chỉ là fragment không có { } → bọc lại
      if (!text.startsWith("{")) {
        text = `{${text}}`;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Không parse được specsJson:", error);
      return null;
    }
  };
  const specs = useMemo(
    () => parseSpecs(camera?.specsJson),
    [camera?.specsJson]
  );
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/Cameras/${id}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch camera details: ${res.status}`);
        }

        const data = await res.json();
        setCamera(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching camera:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!camera) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.warning("Please login to add items to cart");
        navigate("/login");
        return;
      }

      setAddingToCart(true);

      const response = await fetch(`${API_BASE_URL}/Bookings/AddToCart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: camera.id,
          type: "Camera",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Add to cart error:", errorText);
        throw new Error(`Failed to add to cart: ${response.status}`);
      }

      // ✅ Success
      toast.success("Đã thêm vào giỏ hàng thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      // ✅ Refresh cart count immediately
      await refreshCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Sản phẩm không tồn tại");
    } finally {
      setAddingToCart(false);
    }
  };
  const handleAddToCompare = () => {
    if (!id) return;

    if (isInCompare) {
      toast.info("Máy ảnh này đã có trong danh sách so sánh");
      return;
    }

    if (!canAddMore) {
      toast.warning("Tối đa 3 máy ảnh có thể được so sánh");
      return;
    }

    addToCompare(id);
    toast.success("Đã thêm vào danh sách so sánh");

    // Navigate back to products page
    setTimeout(() => {
      navigate("/products");
    }, 1000);
  };

  // ✅ Handle "Thuê ngay" - Add to cart then go to checkout
  const handleBuyNow = async () => {
    if (!camera) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.warning("Vui lòng đăng nhập để thuê thiết bị");
        navigate("/login");
        return;
      }

      setBuyingNow(true);

      // Step 1: Try to add to cart (skip error if already in cart)
      const addToCartResponse = await fetch(
        `${API_BASE_URL}/Bookings/AddToCart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: camera.id,
            type: "Camera",
          }),
        }
      );

      // ✅ If item already in cart (400 error), continue to checkout anyway
      if (!addToCartResponse.ok && addToCartResponse.status !== 400) {
        const errorText = await addToCartResponse.text();
        console.error("Add to cart error:", errorText);
        throw new Error(`Failed to add to cart: ${addToCartResponse.status}`);
      }

      // ✅ Refresh cart count
      await refreshCart();

      // Step 2: Get cart items to pass to checkout
      const cartResponse = await fetch(`${API_BASE_URL}/Bookings/GetCard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!cartResponse.ok) {
        throw new Error("Failed to fetch cart");
      }

      const cartData = await cartResponse.json();

      // Step 3: Navigate to checkout with cart items
      navigate("/checkout", {
        state: {
          items: cartData.items || [],
        },
      });

      toast.success("Đang chuyển đến trang thanh toán...", {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Error in buy now:", error);
      toast.error("Không thể xử lý. Vui lòng thử lại");
    } finally {
      setBuyingNow(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: grey[50],
        }}
      >
        <CircularProgress size={60} sx={{ color: ACCENT }} />
      </Box>
    );
  }

  // Error state
  if (error || !camera) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Không tìm thấy máy ảnh"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          startIcon={<ArrowBackIcon />}
          sx={{
            bgcolor: ACCENT,
            "&:hover": { bgcolor: amber[500] },
          }}
        >
          Quay lại sản phẩm
        </Button>
      </Container>
    );
  }

  // Gallery images
  const gallery = camera.media?.length
    ? camera.media.map((m) => m.url)
    : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"];

  // Calculate deposit
  const calculated = (camera.estimatedValueVnd * camera.depositPercent) / 100;
  const minCap = camera.depositCapMinVnd ?? 0;
  const maxCap = camera.depositCapMaxVnd ?? calculated;
  const deposit = Math.min(Math.max(calculated, minCap), maxCap);

  return (
    <Box sx={{ bgcolor: grey[50], minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <Box sx={{ bgcolor: "white", borderBottom: `1px solid ${grey[200]}` }}>
        <Container sx={{ py: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => navigate("/products")}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: grey[700],
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: grey[100],
                },
              }}
            >
              Quay lại sản phẩm
            </Button>

            {/* ✅ Compare Badge */}
            {compareIds.length > 0 && (
              <Chip
                label={`${compareIds.length} camera${
                  compareIds.length > 1 ? "s" : ""
                } in compare`}
                color="primary"
                size="small"
                onClick={() => navigate("/compare")}
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: colors.primary.dark,
                  },
                }}
              />
            )}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 5,
          }}
        >
          {/* LEFT: IMAGE GALLERY */}
          <Box sx={{ flex: 1 }}>
            {/* Main Image */}
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 2,
                position: "relative",
                mb: 2,
              }}
            >
              <img
                src={gallery[selectedImage]}
                alt={`${camera.brand} ${camera.model}`}
                style={{
                  width: "100%",
                  height: 480,
                  objectFit: "cover",
                }}
              />

              {/* Availability Badge */}
              <Chip
                label={camera.isConfirmed ? "Đã xác minh" : "Chưa xác minh"}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: camera.isConfirmed ? "#b6ffb0" : "#ffc4c4",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              />
            </Box>

            {/* Thumbnail Gallery */}
            <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
              {gallery.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  sx={{
                    cursor: "pointer",
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    border:
                      selectedImage === i
                        ? `3px solid ${ACCENT}`
                        : `2px solid ${grey[300]}`,
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: ACCENT,
                    },
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* RIGHT: INFO PANEL */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                bgcolor: "white",
                p: 4,
                borderRadius: 3,
                boxShadow: 2,
              }}
            >
              {/* Product Title */}
              <Typography variant="h4" fontWeight={700} mb={1}>
                {camera.brand} {camera.model}
              </Typography>

              {camera.variant && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight={500}
                  mb={2}
                >
                  {camera.variant}
                </Typography>
              )}

              {/* Serial Number */}
              {camera.serialNumber && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                  sx={{ fontFamily: "monospace" }}
                >
                  SN: {camera.serialNumber}
                </Typography>
              )}

              {/* Owner Info */}
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <PersonIcon sx={{ color: ACCENT }} />
                <Typography fontWeight={600}>
                  Chủ sở hữu: {camera.ownerName || "Camrent Platform"}
                </Typography>
                {camera.isConfirmed && (
                  <Chip
                    size="small"
                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                    label="Đã xác minh"
                    sx={{
                      bgcolor: "#dfffe0",
                      color: "#2e7d32",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>

              {/* Pricing */}
              <Typography variant="h4" fontWeight={700} color={ACCENT} mb={1}>
                {formatVnd(camera.baseDailyRate)}
              </Typography>
              <Typography color="text.secondary" mb={1}>
                một ngày
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Giá ước tính: {formatVnd(camera.estimatedValueVnd)}
              </Typography>

              {/* Location */}
              <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <LocationOnIcon sx={{ color: ACCENT }} />
                <Box>
                  <Typography fontWeight={600}>
                    {camera.branchName || "Thủ Đức"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {camera.branchAddress || "Địa chỉ không có sẵn"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Security Deposit */}
              <Typography variant="h6" fontWeight={700} mb={1}>
                Tiền đặt cọc thiết bị
              </Typography>
              <Typography
                variant="h5"
                fontWeight={600}
                color={grey[800]}
                mb={1}
              >
                {formatVnd(deposit)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {camera.depositPercent}% giá trị ước tính
                {camera.depositCapMinVnd &&
                  ` (tối thiểu: ${formatVnd(camera.depositCapMinVnd)})`}
                {camera.depositCapMaxVnd &&
                  ` (tối đa: ${formatVnd(camera.depositCapMaxVnd)})`}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleBuyNow}
                disabled={buyingNow || !camera.isConfirmed}
                startIcon={
                  buyingNow ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
                sx={{
                  bgcolor: colors.primary.main,
                  color: "white",
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    bgcolor: colors.primary.dark,
                  },
                  "&:disabled": {
                    bgcolor: grey[300],
                    color: grey[600],
                  },
                }}
              >
                {buyingNow ? "Đang xử lý..." : "Thuê ngay"}
              </Button>

              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    addingToCart ? (
                      <CircularProgress size={16} />
                    ) : (
                      <FavoriteBorderIcon />
                    )
                  }
                  onClick={handleAddToCart}
                  sx={{
                    borderRadius: 2,
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: colors.primary.dark,
                      bgcolor: colors.primary.lighter,
                    },
                    "&:disabled": {
                      borderColor: grey[300],
                      color: grey[400],
                    },
                  }}
                >
                  {addingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                </Button>

                <IconButton
                  sx={{
                    border: `1px solid ${grey[300]}`,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: ACCENT,
                      bgcolor: amber[50],
                    },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Stack>
              {/* ✅ Compare Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CompareArrowsIcon />}
                onClick={handleAddToCompare}
                disabled={isInCompare || !canAddMore}
                sx={{
                  borderRadius: 2,
                  borderColor: isInCompare ? grey[300] : amber[600],
                  color: isInCompare ? grey[400] : amber[700],
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  "&:hover": {
                    borderColor: amber[700],
                    bgcolor: amber[50],
                  },
                  "&:disabled": {
                    borderColor: grey[300],
                    color: grey[400],
                  },
                }}
              >
                {isInCompare
                  ? "Đã có trong so sánh"
                  : canAddMore
                  ? `So sánh với các sản phẩm khác (${compareIds.length}/3)`
                  : "Tối đa 3 máy ảnh"}
              </Button>
              {/* Platform Fee Notice */}
              {camera.platformFeePercent > 0 && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  Phí nền tảng: {(camera.platformFeePercent * 100).toFixed(1)}%
                </Alert>
              )}
            </Box>
          </Box>
        </Box>

        {/* SPECIFICATIONS SECTION */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={3}>
            Thông số kỹ thuật
          </Typography>

          {specs ? (
            <Box>
              {/* Alert giới thiệu */}
              <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                Thông số dưới đây chỉ mang tính tham khảo.
              </Alert>

              {/* Container 2 cột */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {Object.entries(specs).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      width: { xs: "100%", sm: "48%" }, // 2 cột trên desktop, 1 cột mobile
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {SPEC_LABELS[key] ?? key}
                    </Typography>

                    <Typography variant="body1" fontWeight={600}>
                      {value as string}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Chưa có thông số kỹ thuật cho máy này.
            </Alert>
          )}
        </Box>

        {/* ADDITIONAL INFO */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2}>
            Thông tin chủ sở hữu
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              📍 Địa chỉ: {camera.location || "Platform"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✅ Trạng thái:{" "}
              {camera.isConfirmed ? "Đã xác minh" : "Chờ xác minh"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🔒 Yêu cầu đặt cọc bảo đảm khi thuê
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ⏰ Áp dụng mức giá thuê theo ngày
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
