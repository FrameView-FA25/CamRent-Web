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
const ACCENT = amber[400];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // ...existing code...

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login to add items to cart");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("Id", id || "");
      formData.append("Type", "1"); // 1: Camera, 2: Accessory
      formData.append("Quantity", "1");

      const response = await fetch(`${API_BASE_URL}/Bookings/AddToCart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // ✅ Chỉ check status, không parse response body
      if (response.ok) {
        toast.success("Đã thêm vào giỏ hàng!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        // Lỗi từ server
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  // ...existing code...
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Cameras/${id}`);
        if (!res.ok) throw new Error("Failed to fetch camera details");
        const data = await res.json();
        setCamera(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
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

  if (error || !camera)
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Camera not found"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
      </Container>
    );

  // Specs parsing
  let specs: Record<string, string> | null = null;
  try {
    specs = camera.specsJson ? JSON.parse(camera.specsJson) : null;
  } catch {
    specs = null;
  }

  const gallery = camera.media?.length
    ? camera.media.map((m) => m.url)
    : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"];

  // Deposit calculation
  const calculated = (camera.estimatedValueVnd * camera.depositPercent) / 100;
  const minCap = camera.depositCapMinVnd ?? 0;
  const maxCap = camera.depositCapMaxVnd ?? calculated;
  const deposit = Math.min(Math.max(calculated, minCap), maxCap);

  return (
    <Box sx={{ bgcolor: grey[50], minHeight: "100vh" }}>
      {/* Top Back Button */}
      <Box sx={{ bgcolor: "white", borderBottom: `1px solid ${grey[200]}` }}>
        <Container sx={{ py: 2 }}>
          <Button
            onClick={() => navigate("/products")}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: grey[700],
              textTransform: "none",
              fontWeight: 600,
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
          {/* IMAGE GALLERY */}
          <Box sx={{ flex: 1 }}>
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
                style={{ width: "100%", height: 480, objectFit: "cover" }}
              />

              {/* Availability */}
              <Chip
                label={camera.isAvailable ? "Available" : "Unavailable"}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: camera.isAvailable ? "#b6ffb0" : "#ffc4c4",
                  fontWeight: 700,
                }}
              />
            </Box>

            {/* Thumbnails */}
            <Stack direction="row" spacing={2}>
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
                        ? `2px solid ${ACCENT}`
                        : `2px solid ${grey[300]}`,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img}
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

          {/* INFO PANEL */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ bgcolor: "white", p: 4, borderRadius: 3, boxShadow: 2 }}>
              {/* Title */}
              <Typography variant="h4" fontWeight={700} mb={1}>
                {camera.brand} {camera.model}
              </Typography>

              {camera.variant && (
                <Typography variant="h6" color="text.secondary" mb={2}>
                  {camera.variant}
                </Typography>
              )}

              {/* Owner */}
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <PersonIcon sx={{ color: ACCENT }} />
                <Typography fontWeight={600}>
                  Owner: {camera.ownerName || "Unknown"}
                </Typography>
                {camera.isConfirmed && (
                  <Chip
                    size="small"
                    icon={<VerifiedIcon />}
                    label="Verified Owner"
                    sx={{ bgcolor: "#dfffe0" }}
                  />
                )}
              </Stack>

              {/* Price */}
              <Typography variant="h4" fontWeight={700} mb={1}>
                {formatVnd(camera.baseDailyRate)}
              </Typography>
              <Typography color="text.secondary" mb={3}>
                / day — Estimated value {formatVnd(camera.estimatedValueVnd)}
              </Typography>

              {/* Location */}
              <Stack direction="row" spacing={1} mb={3}>
                <LocationOnIcon sx={{ color: ACCENT }} />
                <Typography>
                  {camera.branchName || "No branch"} —{" "}
                  {camera.branchAddress || "Address not available"}
                </Typography>
              </Stack>

              {/* Deposit */}
              <Divider sx={{ my: 3 }} />
              <Typography fontWeight={700} mb={1}>
                Security Deposit
              </Typography>
              <Typography>{formatVnd(deposit)}</Typography>

              <Divider sx={{ my: 3 }} />

              {/* Buttons */}
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: ACCENT,
                  color: "black",
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                Rent Now
              </Button>

              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FavoriteBorderIcon />}
                  sx={{ borderRadius: 2 }}
                  onClick={handleAddToCart}
                >
                  Add To Cart
                </Button>
                <IconButton sx={{ border: `1px solid ${grey[300]}` }}>
                  <ShareIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* SPECS */}
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
            Specifications
          </Typography>

          {specs ? (
            <Table>
              <TableBody>
                {Object.entries(specs).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 600, width: 200 }}>
                      {key}
                    </TableCell>
                    <TableCell>{String(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary">
              No specifications available.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
