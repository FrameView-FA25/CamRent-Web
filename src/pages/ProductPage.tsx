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
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FilterListIcon from "@mui/icons-material/FilterList";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchId: string;
  branch: {
    name: string;
    address: {
      country: string;
      province: string;
      district: string;
      ward: string;
      line1: string;
      line2: string | null;
      postalCode: string;
      latitude: number | null;
      longitude: number | null;
    };
  };
}

const ACCENT = amber[400];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductCard: React.FC<{ camera: Camera }> = ({ camera }) => {
  const navigate = useNavigate();

  const fullAddress = [
    camera.branch.address.line1,
    camera.branch.address.ward,
    camera.branch.address.district,
    camera.branch.address.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      elevation={2}
      sx={{
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
          <CameraAltOutlinedIcon sx={{ fontSize: 64 }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: ACCENT,
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

      <CardContent sx={{ p: 2.5 }}>
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
              {camera.branch.name}
            </Typography>
            {fullAddress && (
              <Typography variant="caption" sx={{ color: grey[600] }}>
                {fullAddress}
              </Typography>
            )}
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
            View Details
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
            Rent Now
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Cameras`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cameras");
        }

        const data = await response.json();
        setCameras(Array.isArray(data) ? data : [data]);
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

  const categories = useMemo(() => {
    const brands = new Set(cameras.map((c) => c.brand));
    return ["All", ...Array.from(brands)];
  }, [cameras]);

  const filteredCameras = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cameras.filter(
      (c) =>
        (c.model.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          (c.variant && c.variant.toLowerCase().includes(q)) ||
          c.branch.name.toLowerCase().includes(q)) &&
        (selectedCategory === "All" || c.brand === selectedCategory)
    );
  }, [cameras, searchQuery, selectedCategory]);

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
            Explore Our Gears
          </Typography>
          <Typography variant="h6" sx={{ color: grey[600], mb: 4 }}>
            Rent professional camera equipment for your next project
          </Typography>

          <Box sx={{ maxWidth: 720 }}>
            <TextField
              fullWidth
              placeholder="Search cameras, lenses, accessories..."
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
                    borderColor: ACCENT,
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
            <Typography fontWeight={700}>Brands:</Typography>
          </Stack>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Stack direction="row" spacing={1}>
            {categories.map((cat) => {
              const selected = selectedCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: selected ? ACCENT : "white",
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
            <CircularProgress sx={{ color: ACCENT }} />
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
                bgcolor: ACCENT,
                color: "black",
                "&:hover": { bgcolor: amber[500] },
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <Box
            sx={(theme) => ({
              display: "flex",
              flexWrap: "wrap",
              gap: theme.spacing(3),
            })}
          >
            {filteredCameras.map((camera) => (
              <Box
                key={camera.id}
                sx={(theme) => ({
                  flex: "1 1 100%",
                  maxWidth: "100%",
                  [theme.breakpoints.up("sm")]: {
                    flex: `1 1 calc(50% - ${theme.spacing(3)})`,
                    maxWidth: `calc(50% - ${theme.spacing(3)})`,
                  },
                  [theme.breakpoints.up("md")]: {
                    flex: `1 1 calc(33.333% - ${theme.spacing(3)})`,
                    maxWidth: `calc(33.333% - ${theme.spacing(3)})`,
                  },
                  [theme.breakpoints.up("lg")]: {
                    flex: `1 1 calc(25% - ${theme.spacing(3)})`,
                    maxWidth: `calc(25% - ${theme.spacing(3)})`,
                  },
                })}
              >
                <ProductCard camera={camera} />
              </Box>
            ))}
          </Box>
        )}

        {!loading && !error && filteredCameras.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PhotoCameraIcon sx={{ fontSize: 64, color: grey[300], mb: 1 }} />
            <Typography variant="h6" sx={{ color: grey[500] }}>
              No cameras found
            </Typography>
          </Box>
        )}
      </Container>

      {/* FOOTER CTA */}
      <Box sx={{ bgcolor: "black", color: "white", py: 8, mt: 6 }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Ready to Start Shooting?
          </Typography>
          <Typography variant="h6" sx={{ color: grey[400], mb: 4 }}>
            Rent professional gear without the commitment of ownership
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: ACCENT,
              color: "black",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              py: 1.25,
              "&:hover": { bgcolor: amber[500] },
            }}
          >
            Browse All Gears
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default ProductPage;
