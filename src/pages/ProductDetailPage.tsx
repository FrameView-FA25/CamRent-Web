import React, { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import type { Camera } from "../types/product.types";
import { toast } from "react-toastify";
import { colors } from "../theme/colors";
import { useCartContext } from "../context/CartContext";

const ACCENT = amber[400];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const ProductDetailPage: React.FC = () => {
  const { refreshCart } = useCartContext();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

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
      toast.success("Added to cart successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      // ✅ Refresh cart count immediately
      await refreshCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
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
          {error || "Camera not found"}
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
          Back to Products
        </Button>
      </Container>
    );
  }

  // Parse specifications
  let specs: Record<string, string> | null = null;
  try {
    specs = camera.specsJson ? JSON.parse(camera.specsJson) : null;
  } catch {
    specs = null;
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
            Back to Products
          </Button>
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
                label={camera.isAvailable ? "Available" : "Unavailable"}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: camera.isAvailable ? "#b6ffb0" : "#ffc4c4",
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
                  Owner: {camera.ownerName || "Unknown"}
                </Typography>
                {camera.isConfirmed && (
                  <Chip
                    size="small"
                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                    label="Verified"
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
                per day
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Estimated value: {formatVnd(camera.estimatedValueVnd)}
              </Typography>

              {/* Location */}
              <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <LocationOnIcon sx={{ color: ACCENT }} />
                <Box>
                  <Typography fontWeight={600}>
                    {camera.branchName || "No branch assigned"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {camera.branchAddress || "Address not available"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Security Deposit */}
              <Typography variant="h6" fontWeight={700} mb={1}>
                Security Deposit
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
                {camera.depositPercent}% of estimated value
                {camera.depositCapMinVnd &&
                  ` (min: ${formatVnd(camera.depositCapMinVnd)})`}
                {camera.depositCapMaxVnd &&
                  ` (max: ${formatVnd(camera.depositCapMaxVnd)})`}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Button
                fullWidth
                variant="contained"
                disabled={!camera.isAvailable}
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
                {camera.isAvailable ? "Rent Now" : "Currently Unavailable"}
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
                  {addingToCart ? "Adding..." : "Add To Cart"}
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

              {/* Platform Fee Notice */}
              {camera.platformFeePercent > 0 && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  Platform fee: {(camera.platformFeePercent * 100).toFixed(1)}%
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
            Technical Specifications
          </Typography>

          {specs ? (
            <Table>
              <TableBody>
                {Object.entries(specs).map(([key, value]) => (
                  <TableRow
                    key={key}
                    sx={{
                      "&:hover": {
                        bgcolor: grey[50],
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        width: 200,
                        color: grey[700],
                        textTransform: "capitalize",
                      }}
                    >
                      {key}
                    </TableCell>
                    <TableCell sx={{ color: grey[800] }}>
                      {String(value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No specifications available for this product.
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
            Rental Information
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              📍 Location: {camera.location || "Platform"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✅ Status:{" "}
              {camera.isConfirmed ? "Verified" : "Pending verification"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🔒 Security deposit required upon rental
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ⏰ Daily rental rate applies
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
