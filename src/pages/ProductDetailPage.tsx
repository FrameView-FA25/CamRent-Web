import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const ACCENT = amber[400];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Address {
  country: string;
  province: string;
  district: string;
  ward: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
}

interface Branch {
  name: string;
  address: Address;
  id: string;
  createdAt: string;
  createdByUserId: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
  isDeleted: boolean;
  rowVersion: string;
}

interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchId: string;
  branch: Branch;
  baseDailyRate: number;
  platformFeePercent: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number;
  depositCapMaxVnd: number;
  media: Media[];
  specsJson: string | null;
  categories: Category[];
}
interface Media {
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
  mimeType?: string;
}

interface Category {
  id: string;
  name: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameraDetail = async () => {
      if (!id) {
        setError("Camera ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Cameras/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch camera details");
        }

        const data = await response.json();
        setCamera(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching camera details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameraDetail();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: grey[50],
        }}
      >
        <CircularProgress sx={{ color: ACCENT }} size={60} />
      </Box>
    );
  }

  if (error || !camera) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Camera not found"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
          variant="contained"
          sx={{
            bgcolor: ACCENT,
            color: "black",
            "&:hover": { bgcolor: amber[500] },
          }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const fullAddress = [
    camera.branch.address.line1,
    camera.branch.address.ward,
    camera.branch.address.district,
    camera.branch.address.province,
    camera.branch.address.country,
  ]
    .filter(Boolean)
    .join(", ");

  const totalDailyRate =
    camera.baseDailyRate * (1 + camera.platformFeePercent / 100);
  const calculatedDeposit =
    (camera.estimatedValueVnd * camera.depositPercent) / 100;
  const finalDeposit = Math.min(
    Math.max(calculatedDeposit, camera.depositCapMinVnd),
    camera.depositCapMaxVnd
  );

  // Placeholder images if no media available
  const defaultImages = [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
  ];
  const galleryImages =
    camera.media && camera.media.length > 0
      ? camera.media.map((m) => m.url)
      : defaultImages;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: grey[50] }}>
      {/* Header Navigation */}
      <Box sx={{ bgcolor: "white", borderBottom: `1px solid ${grey[200]}` }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/products")}
            sx={{
              color: grey[700],
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: grey[100] },
            }}
          >
            Back to Products
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Main Product Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 6,
            mb: 8,
          }}
        >
          {/* Left - Image Gallery */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                bgcolor: grey[100],
                borderRadius: 3,
                overflow: "hidden",
                mb: 2,
                boxShadow: 2,
                position: "relative",
              }}
            >
              {galleryImages[selectedImage] ? (
                <Box
                  component="img"
                  src={galleryImages[selectedImage]}
                  alt={`${camera.brand} ${camera.model}`}
                  sx={{
                    width: "100%",
                    height: { xs: 300, md: 500 },
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 300, md: 500 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CameraAltOutlinedIcon
                    sx={{ fontSize: 120, color: grey[300] }}
                  />
                </Box>
              )}
              {/* Available Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: ACCENT,
                  color: "black",
                  px: 2,
                  py: 1,
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                Available
              </Box>
            </Box>

            {/* Thumbnail Gallery - 3 images in a row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {galleryImages.slice(0, 3).map((img: string, idx: number) => (
                <Box
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  sx={{
                    aspectRatio: "1",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      selectedImage === idx
                        ? `3px solid ${ACCENT}`
                        : `2px solid ${grey[200]}`,
                    transition: "all 0.2s",
                    bgcolor: grey[100],
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 3,
                    },
                  }}
                >
                  {img ? (
                    <Box
                      component="img"
                      src={img}
                      alt={`View ${idx + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CameraAltOutlinedIcon
                        sx={{ fontSize: 48, color: grey[300] }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right - Product Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ bgcolor: "white", borderRadius: 3, p: 4, boxShadow: 2 }}>
              {/* Brand */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={camera.brand}
                  size="small"
                  sx={{
                    bgcolor: grey[100],
                    fontWeight: 600,
                    color: grey[800],
                  }}
                />
                {camera.variant && (
                  <Chip
                    label={camera.variant}
                    size="small"
                    sx={{
                      bgcolor: ACCENT,
                      fontWeight: 600,
                      color: "black",
                    }}
                  />
                )}
              </Stack>

              {/* Product Name */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: grey[900],
                  mb: 1,
                }}
              >
                {camera.brand} {camera.model}
              </Typography>

              {/* Serial Number */}
              {camera.serialNumber && (
                <Typography variant="body2" sx={{ color: grey[600], mb: 3 }}>
                  SN: {camera.serialNumber}
                </Typography>
              )}

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: grey[900],
                    }}
                  >
                    {formatCurrency(totalDailyRate)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: grey[600], fontWeight: 500 }}
                  >
                    / day
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: grey[600], mt: 0.5 }}>
                  Base rate: {formatCurrency(camera.baseDailyRate)} + Platform
                  fee: {camera.platformFeePercent}%
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Location Info */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <LocationOnIcon sx={{ color: ACCENT, mt: 0.25 }} />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: grey[900] }}
                    >
                      {camera.branch.name}
                    </Typography>
                    {fullAddress && (
                      <Typography variant="body2" sx={{ color: grey[600] }}>
                        {fullAddress}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Financial Info */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: grey[900] }}
                >
                  Rental Information
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AttachMoneyIcon sx={{ color: ACCENT }} />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: grey[800] }}
                      >
                        Estimated Value
                      </Typography>
                      <Typography variant="body1" sx={{ color: grey[900] }}>
                        {formatCurrency(camera.estimatedValueVnd)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AccountBalanceWalletIcon sx={{ color: ACCENT }} />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: grey[800] }}
                      >
                        Security Deposit ({camera.depositPercent}%)
                      </Typography>
                      <Typography variant="body1" sx={{ color: grey[900] }}>
                        {formatCurrency(finalDeposit)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: grey[600] }}>
                        Range: {formatCurrency(camera.depositCapMinVnd)} -{" "}
                        {formatCurrency(camera.depositCapMaxVnd)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              {/* Benefits */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalShippingOutlinedIcon sx={{ color: ACCENT }} />
                  <Typography variant="body2" sx={{ color: grey[700] }}>
                    Free delivery & pickup in Ho Chi Minh City
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <VerifiedUserOutlinedIcon sx={{ color: ACCENT }} />
                  <Typography variant="body2" sx={{ color: grey[700] }}>
                    Fully insured & professionally maintained
                  </Typography>
                </Stack>
              </Stack>

              {/* Action Buttons */}
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: ACCENT,
                    color: "black",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1.1rem",
                    py: 1.5,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: amber[500],
                    },
                  }}
                >
                  Rent Now
                </Button>
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FavoriteBorderIcon />}
                    sx={{
                      borderColor: grey[300],
                      color: grey[700],
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: grey[400],
                        bgcolor: grey[50],
                      },
                    }}
                  >
                    Save
                  </Button>
                  <IconButton
                    sx={{
                      border: `1px solid ${grey[300]}`,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: grey[50],
                      },
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ bgcolor: "white", borderRadius: 3, p: 4, boxShadow: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              borderBottom: `1px solid ${grey[200]}`,
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: grey[600],
              },
              "& .Mui-selected": {
                color: "black !important",
              },
              "& .MuiTabs-indicator": {
                bgcolor: ACCENT,
                height: 3,
              },
            }}
          >
            <Tab label="Specifications" />
            <Tab label="Categories" />
            <Tab label="Rental Terms" />
          </Tabs>

          {/* Specifications Tab */}
          {currentTab === 0 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: grey[900] }}
              >
                Camera Specifications
              </Typography>
              {camera.specsJson ? (
                <Box
                  component="pre"
                  sx={{
                    bgcolor: grey[50],
                    p: 3,
                    borderRadius: 2,
                    overflow: "auto",
                    color: grey[800],
                  }}
                >
                  {JSON.stringify(JSON.parse(camera.specsJson), null, 2)}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: grey[600] }}>
                  No specifications available for this camera.
                </Typography>
              )}
            </Box>
          )}

          {/* Categories Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: grey[900] }}
              >
                Camera Categories
              </Typography>
              {camera.categories && camera.categories.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {camera.categories.map((category: Category, idx: number) => (
                    <Chip
                      key={idx}
                      label={category.name}
                      sx={{
                        bgcolor: ACCENT,
                        color: "black",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" sx={{ color: grey[600] }}>
                  No categories assigned to this camera.
                </Typography>
              )}
            </Box>
          )}

          {/* Rental Terms Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: grey[900] }}
              >
                Rental Terms & Conditions
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <CheckCircleOutlineIcon
                    sx={{ color: ACCENT, fontSize: 24, mt: 0.5 }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: grey[900] }}
                    >
                      Security Deposit Required
                    </Typography>
                    <Typography variant="body2" sx={{ color: grey[700] }}>
                      A refundable deposit of {formatCurrency(finalDeposit)} is
                      required before rental.
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <CheckCircleOutlineIcon
                    sx={{ color: ACCENT, fontSize: 24, mt: 0.5 }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: grey[900] }}
                    >
                      Daily Rental Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: grey[700] }}>
                      {formatCurrency(totalDailyRate)} per day (includes{" "}
                      {camera.platformFeePercent}% platform fee)
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <CheckCircleOutlineIcon
                    sx={{ color: ACCENT, fontSize: 24, mt: 0.5 }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: grey[900] }}
                    >
                      Equipment Insurance
                    </Typography>
                    <Typography variant="body2" sx={{ color: grey[700] }}>
                      All equipment is fully insured and professionally
                      maintained.
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
