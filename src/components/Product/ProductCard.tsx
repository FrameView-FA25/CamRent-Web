import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { Camera } from "../../types/product.types";
import type { Accessory } from "../../services/camera.service";
import { useCompare } from "../../context/CompareContext/CompareContext";
import { toast } from "react-toastify";

interface ProductCardProps {
  camera: Camera | Accessory;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard: React.FC<ProductCardProps> = ({ camera }) => {
  const navigate = useNavigate();
  const { compareIds, addToCompare, removeFromCompare, canAddMore } =
    useCompare();

  const isVerified = camera.isConfirmed ?? false;
  const isAvailable = camera.isAvailable ?? false;
  const isInCompare = compareIds.includes(camera.id);
  const ownerName = camera.branchName || camera.ownerName;

  const getMediaUrl = () => {
    if (
      "media" in camera &&
      Array.isArray(camera.media) &&
      camera.media.length > 0
    ) {
      if (typeof camera.media[0] === "string") {
        return camera.media[0];
      }
      if (typeof camera.media[0] === "object" && camera.media[0] !== null) {
        return (camera.media[0] as { url?: string }).url || null;
      }
    }
    return null;
  };

  const mediaUrl = getMediaUrl();

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isInCompare) {
      removeFromCompare(camera.id);
      toast.info("Removed from compare list");
    } else {
      if (!canAddMore) {
        toast.warning("Maximum 3 cameras can be compared");
        return;
      }
      addToCompare(camera.id);
      toast.success("Added to compare list!");
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        bgcolor: "white",
        transition: "all 0.25s ease",
        cursor: "pointer",
        border: isInCompare
          ? `2px solid ${amber[600]}`
          : "2px solid transparent",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/products/${camera.id}`)}
    >
      {/* Image Section */}
      <Box sx={{ position: "relative", bgcolor: grey[100] }}>
        <Box sx={{ pt: "70%" }} />
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
                display: "block",
              }}
            />
          ) : (
            <CameraAltOutlinedIcon sx={{ fontSize: 64 }} />
          )}
        </Box>

        {/* Verified Badge */}
        <Chip
          icon={
            isVerified ? (
              <VerifiedIcon sx={{ fontSize: 14 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 14 }} />
            )
          }
          label={isVerified ? "Verified" : "Unverified"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: isVerified
              ? "rgba(46, 125, 50, 0.95)"
              : "rgba(211, 47, 47, 0.95)",
            color: "white",
            "& .MuiChip-icon": {
              color: "white",
              ml: 0.5,
            },
          }}
        />

        {/* Available Badge */}
        <Chip
          label={isAvailable ? "Available" : "Unavailable"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: isAvailable
              ? "rgba(255,255,255,0.95)"
              : "rgba(158,158,158,0.95)",
            color: isAvailable ? grey[800] : "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 12,
            border: isAvailable ? `1px solid ${grey[200]}` : "none",
          }}
        />

        {/* Compare Button */}
        <Tooltip title={isInCompare ? "Remove from compare" : "Add to compare"}>
          <IconButton
            onClick={handleToggleCompare}
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              bgcolor: isInCompare ? amber[600] : "rgba(255,255,255,0.95)",
              color: isInCompare ? "white" : grey[800],
              width: 36,
              height: 36,
              boxShadow: 2,
              "&:hover": {
                bgcolor: isInCompare ? amber[700] : "white",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
              border: `1px solid ${isInCompare ? amber[700] : grey[300]}`,
            }}
          >
            {isInCompare ? (
              <RemoveIcon fontSize="small" />
            ) : (
              <AddIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Compare Indicator */}
        {isInCompare && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              bgcolor: amber[600],
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              boxShadow: 2,
            }}
          >
            <CompareArrowsIcon sx={{ fontSize: 14 }} />
            In Compare
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {/* Brand */}
          <Typography variant="body2" sx={{ color: grey[600], mb: 0.5 }}>
            {camera.brand}
          </Typography>

          {/* Model */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: grey[900], mb: 0.5, fontSize: 16 }}
            noWrap
          >
            {camera.model}
            {camera.variant && (
              <Chip
                label={camera.variant}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: 11,
                  borderRadius: 999,
                }}
              />
            )}
          </Typography>

          {/* Serial Number */}
          <Typography
            variant="caption"
            sx={{
              color: grey[500],
              mb: 1,
              display: "block",
              visibility: camera.serialNumber ? "visible" : "hidden",
            }}
          >
            SN: {camera.serialNumber || "Không có"}
          </Typography>

          {/* Location */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              mb: 1,
              gap: 0.5,
            }}
          >
            <LocationOnIcon sx={{ fontSize: 16, color: grey[500], mt: 0.25 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: grey[800] }}
              >
                {camera.branchAddress}
              </Typography>
            </Box>
          </Box>

          {/* Owner */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: grey[500], mr: 0.5 }}>
              Owner:
            </Typography>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: 600, color: grey[800] }}
            >
              {ownerName}
            </Typography>
          </Box>

          {/* Pricing Box */}
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
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
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

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${camera.id}`);
            }}
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
            disabled={!isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              // Handle rental flow
            }}
            sx={{
              bgcolor: isAvailable ? "black" : grey[400],
              color: "white",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              "&:hover": {
                bgcolor: isAvailable ? grey[800] : grey[400],
              },
              "&:disabled": {
                bgcolor: grey[400],
                color: grey[200],
              },
            }}
          >
            {isAvailable ? "Thuê ngay" : "Không có sẵn"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
