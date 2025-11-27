import React from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { amber } from "@mui/material/colors";
import { colors } from "../../theme/colors";
import ProductCard from "./ProductCard";
import type { Camera } from "../../types/product.types";
import type { Accessory } from "../../services/camera.service";

interface ProductGridProps {
  products: (Camera | Accessory)[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  compareCount: number;
  onCompareClick: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  totalProducts,
  compareCount,
  onCompareClick,
}) => {
  // Loading State
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
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
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <PhotoCameraIcon sx={{ fontSize: 64, color: grey[300], mb: 1 }} />
        <Typography variant="h6" sx={{ color: grey[500] }}>
          Không tìm thấy sản phẩm
        </Typography>
      </Box>
    );
  }

  // Products Grid
  return (
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
          Hiển thị {products.length} / {totalProducts} sản phẩm
        </Typography>
        {compareCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CompareArrowsIcon />}
            onClick={onCompareClick}
            sx={{
              borderColor: amber[600],
              color: amber[700],
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: amber[700],
                bgcolor: amber[50],
              },
            }}
          >
            View Compare ({compareCount})
          </Button>
        )}
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
        {products.map((product) => (
          <ProductCard key={product.id} camera={product} />
        ))}
      </Box>
    </>
  );
};

export default ProductGrid;
