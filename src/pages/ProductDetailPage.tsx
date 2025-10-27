import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Rating,
  Chip,
  Avatar,
  Divider,
  Stack,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const ACCENT = amber[400];

interface ProductData {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  specs: string[];
  includes: string[];
  gallery: string[];
  samplePhotos: string[];
}

// Mock data - thay thế bằng API call thực tế
const productData: Record<string, ProductData> = {
  "1": {
    id: 1,
    name: "Fujifilm X-T4",
    brand: "Fujifilm",
    price: 45,
    rating: 4.8,
    reviews: 124,
    image:
      "https://binhminhdigital.com/StoreData/Product/10330/May-anh-Sony-A9%20(2).jpg",
    category: "Mirrorless",
    description:
      "The Fujifilm X-T4 is a versatile mirrorless camera that combines impressive image quality with advanced video capabilities. Featuring a 26.1MP X-Trans CMOS 4 sensor and X-Processor 4, it delivers exceptional performance in various shooting conditions.",
    specs: [
      "26.1MP X-Trans CMOS 4 Sensor",
      "X-Processor 4 Image Processing Engine",
      "In-Body 5-Axis Image Stabilization",
      "4K 60p Video Recording",
      "15 fps Continuous Shooting",
      "425-point Intelligent Hybrid AF",
    ],
    includes: [
      "Fujifilm X-T4 Camera Body",
      "Rechargeable Battery",
      "Battery Charger",
      "Shoulder Strap",
      "Body Cap",
      "Protective Cover",
    ],
    gallery: [
      "https://binhminhdigital.com/StoreData/Product/10330/May-anh-Sony-A9%20(2).jpg",
      "https://product.hstatic.net/200000354621/product/may-anh-fujifilm-x-t4-kit-18-55-mau-bac-1_4d8855bb7c5a423d821ee2de196d4b18_grande.jpg",
      "https://cdn.vjshop.vn/may-anh/mirrorless/fujifilm/fujifilm-x-t4/fujifilm-x-t4-6-500x500.jpg",
      "https://tokyocamera.vn/wp-content/uploads/2021/11/1634813219_IMG_1627574.jpg",
    ],
    samplePhotos: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    ],
  },
  "2": {
    id: 2,
    name: "Sony Alpha A7 IV",
    brand: "Sony",
    price: 55,
    rating: 4.9,
    reviews: 203,
    image:
      "https://tokyocamera.vn/wp-content/uploads/2021/11/1634813219_IMG_1627574.jpg",
    category: "Mirrorless",
    description:
      "The Sony Alpha A7 IV is a powerful full-frame mirrorless camera designed for both photography and videography. With its advanced autofocus system and impressive dynamic range, it's perfect for professionals and enthusiasts alike.",
    specs: [
      "33MP Full-Frame Exmor R CMOS Sensor",
      "BIONZ XR Image Processing Engine",
      "5-Axis In-Body Image Stabilization",
      "4K 60p 10-bit Video Recording",
      "10 fps Continuous Shooting",
      "759-point Hybrid AF System",
    ],
    includes: [
      "Sony A7 IV Camera Body",
      "NP-FZ100 Rechargeable Battery",
      "AC Adapter",
      "USB Cable",
      "Shoulder Strap",
      "Body Cap & Accessory Shoe Cap",
    ],
    gallery: [
      "https://tokyocamera.vn/wp-content/uploads/2021/11/1634813219_IMG_1627574.jpg",
      "https://binhminhdigital.com/StoreData/Product/10330/May-anh-Sony-A9%20(2).jpg",
      "https://cdn.vjshop.vn/may-anh/mirrorless/fujifilm/fujifilm-x-t4/fujifilm-x-t4-6-500x500.jpg",
    ],
    samplePhotos: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
    ],
  },
};

const reviews = [
  {
    id: 1,
    name: "Alex Thompson",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    date: "2 days ago",
    comment:
      "Absolutely fantastic camera! The image quality is stunning and the autofocus is incredibly fast. Perfect for both photography and video work.",
  },
  {
    id: 2,
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    date: "1 week ago",
    comment:
      "Rented this for a wedding shoot and couldn't be happier. The in-body stabilization is a game-changer. Highly recommend!",
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=7",
    rating: 4,
    date: "2 weeks ago",
    comment:
      "Great camera overall. Battery life could be better, but the image quality more than makes up for it. Will rent again!",
  },
  {
    id: 4,
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    date: "3 weeks ago",
    comment:
      "Professional quality at an affordable rental price. The rental process was smooth and the equipment arrived in perfect condition.",
  },
];

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);

  const product = productData[id || "1"];

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4">Product not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

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
                bgcolor: "white",
                borderRadius: 3,
                overflow: "hidden",
                mb: 2,
                boxShadow: 2,
              }}
            >
              <Box
                component="img"
                src={product.gallery[selectedImage]}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: { xs: 300, md: 500 },
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* Thumbnail Gallery */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                overflowX: "auto",
                pb: 1,
              }}
            >
              {product.gallery.map((img: string, idx: number) => (
                <Box
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  sx={{
                    minWidth: 80,
                    height: 80,
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      selectedImage === idx
                        ? `3px solid ${ACCENT}`
                        : `2px solid ${grey[200]}`,
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right - Product Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ bgcolor: "white", borderRadius: 3, p: 4, boxShadow: 2 }}>
              {/* Brand & Category */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={product.brand}
                  size="small"
                  sx={{
                    bgcolor: grey[100],
                    fontWeight: 600,
                    color: grey[800],
                  }}
                />
                <Chip
                  label={product.category}
                  size="small"
                  sx={{
                    bgcolor: ACCENT,
                    fontWeight: 600,
                    color: "black",
                  }}
                />
              </Stack>

              {/* Product Name */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: grey[900],
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Rating
                  value={product.rating}
                  precision={0.1}
                  readOnly
                  sx={{
                    "& .MuiRating-iconFilled": { color: ACCENT },
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {product.rating}
                </Typography>
                <Typography variant="body2" sx={{ color: grey[600] }}>
                  ({product.reviews} reviews)
                </Typography>
              </Stack>

              {/* Price */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: grey[900],
                    mb: 0.5,
                  }}
                >
                  ${product.price}
                  <Typography
                    component="span"
                    variant="h5"
                    sx={{ color: grey[600], fontWeight: 600, ml: 1 }}
                  >
                    / day
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: grey[600] }}>
                  Weekly and monthly rates available
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: grey[700],
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                {product.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Features */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: grey[900] }}
                >
                  Key Features
                </Typography>
                <Stack spacing={1.5}>
                  {product.specs.map((spec: string, idx: number) => (
                    <Stack key={idx} direction="row" spacing={1.5}>
                      <CheckCircleOutlineIcon
                        sx={{ color: ACCENT, fontSize: 20, mt: 0.2 }}
                      />
                      <Typography variant="body2" sx={{ color: grey[700] }}>
                        {spec}
                      </Typography>
                    </Stack>
                  ))}
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
            <Tab label={`Reviews (${product.reviews})`} />
            <Tab label="Sample Photos" />
            <Tab label="What's Included" />
          </Tabs>

          {/* Reviews Tab */}
          {currentTab === 0 && (
            <Box>
              <Stack spacing={3}>
                {reviews.map((review) => (
                  <Box
                    key={review.id}
                    sx={{
                      p: 3,
                      bgcolor: grey[50],
                      borderRadius: 2,
                      border: `1px solid ${grey[200]}`,
                    }}
                  >
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Avatar src={review.avatar} alt={review.name} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: grey[900] }}
                        >
                          {review.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": { color: ACCENT },
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: grey[600] }}
                          >
                            {review.date}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ color: grey[700] }}>
                      {review.comment}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Sample Photos Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: grey[900] }}
              >
                Photos Captured With This Camera
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {product.samplePhotos.map((photo: string, idx: number) => (
                  <Box
                    key={idx}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      aspectRatio: "1/1",
                      cursor: "pointer",
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={photo}
                      alt={`Sample ${idx + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* What's Included Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: grey[900] }}
              >
                Rental Package Includes
              </Typography>
              <Stack spacing={2}>
                {product.includes.map((item: string, idx: number) => (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <CheckCircleOutlineIcon
                      sx={{ color: ACCENT, fontSize: 24 }}
                    />
                    <Typography variant="body1" sx={{ color: grey[700] }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        {/* Related Products Section (Optional) */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 4, color: grey[900] }}
          >
            Similar Products You Might Like
          </Typography>
          <Typography variant="body1" sx={{ color: grey[600] }}>
            Coming soon...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
