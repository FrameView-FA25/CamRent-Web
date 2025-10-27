// CamRentProductList.tsx
import React, { useState, useMemo } from "react";
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
  Rating,
  Stack,
  Divider,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FilterListIcon from "@mui/icons-material/FilterList";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
}

const ACCENT = amber[400];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();

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
        <Box sx={{ pt: "100%" }} /> {/* giữ tỷ lệ vuông */}
        {product.image ? (
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        ) : (
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
        )}
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
          ${product.price}/day
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="body2" sx={{ color: grey[600], mb: 0.5 }}>
          {product.brand}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: grey[900], mb: 1.25 }}
        >
          {product.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Rating
            value={Math.round(product.rating * 2) / 2}
            precision={0.5}
            readOnly
            sx={{
              "& .MuiRating-iconFilled": { color: ACCENT },
              "& .MuiRating-iconEmpty": { color: grey[300] },
            }}
          />
          <Typography variant="body2" sx={{ color: grey[600], ml: 1 }}>
            ({product.reviews})
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/products/${product.id}`)}
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

  const categories = ["All", "Mirrorless", "DSLR", "Lenses", "Accessories"];

  const products: Product[] = useMemo(
    () => [
      {
        id: 1,
        name: "X-T4",
        brand: "Fujifilm",
        price: 45,
        rating: 4.8,
        reviews: 124,
        image:
          "https://binhminhdigital.com/StoreData/Product/10330/May-anh-Sony-A9%20(2).jpg",
        category: "Mirrorless",
      },
      {
        id: 2,
        name: "Alpha A7 IV",
        brand: "Sony",
        price: 55,
        rating: 4.9,
        reviews: 203,
        image:
          "https://tokyocamera.vn/wp-content/uploads/2021/11/1634813219_IMG_1627574.jpg",
        category: "Mirrorless",
      },
      {
        id: 3,
        name: "EOS R6",
        brand: "Canon",
        price: 50,
        rating: 4.7,
        reviews: 156,
        image:
          "https://cdn.vjshop.vn/may-anh/mirrorless/canon/canon-eos-r6-mark-ii/canon-eos-r6-mark-ii-6-500x500.jpg",
        category: "Mirrorless",
      },
      {
        id: 4,
        name: "Z6 II",
        brand: "Nikon",
        price: 48,
        rating: 4.6,
        reviews: 98,
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL4wSn0hi1MUlXhYW0JMxAy3VmAl9IH1afjw&s",
        category: "Mirrorless",
      },
      {
        id: 5,
        name: "GH6",
        brand: "Panasonic",
        price: 52,
        rating: 4.7,
        reviews: 87,
        image:
          "https://bizweb.dktcdn.net/thumb/1024x1024/100/297/199/products/342481768-5981438308645474-6951211744292669278-n.jpg?v=1682401389670",
        category: "Mirrorless",
      },
      {
        id: 6,
        name: "X-S10",
        brand: "Fujifilm",
        price: 38,
        rating: 4.5,
        reviews: 145,
        image:
          "https://cdn.vjshop.vn/may-anh/mirrorless/fujifilm/fujifilm-x-s10/anh-mo-ta/fujifilm-x-s10-chinh-hang-6.jpg",
        category: "Mirrorless",
      },
      {
        id: 7,
        name: "5D Mark IV",
        brand: "Canon",
        price: 42,
        rating: 4.8,
        reviews: 312,
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP5rbfPXm-qwARnhQVnwZAyFTxanVUy442pw&s",
        category: "DSLR",
      },
      {
        id: 8,
        name: "D850",
        brand: "Nikon",
        price: 46,
        rating: 4.9,
        reviews: 267,
        image: "https://cdn.vjshop.vn/may-anh/dslr/nikon/d850/nikon-d8502.jpg",
        category: "DSLR",
      },
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        (p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)) &&
        (selectedCategory === "All" || p.category === selectedCategory)
    );
  }, [products, searchQuery, selectedCategory]);

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
            <Typography fontWeight={700}>Categories:</Typography>
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

        {/* FLEX layout */}
        <Box
          sx={(theme) => ({
            display: "flex",
            flexWrap: "wrap",
            gap: theme.spacing(3),
          })}
        >
          {filteredProducts.map((product) => (
            <Box
              key={product.id}
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
              <ProductCard product={product} />
            </Box>
          ))}
        </Box>

        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PhotoCameraIcon sx={{ fontSize: 64, color: grey[300], mb: 1 }} />
            <Typography variant="h6" sx={{ color: grey[500] }}>
              No products found
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
