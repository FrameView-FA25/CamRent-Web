import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { X, ArrowLeft, Camera as CameraIcon } from "lucide-react";
import { useCompare } from "../../context/CompareContext/CompareContext";
import { colors } from "../../theme/colors";
import type { Camera } from "../../types/product.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (compareIds.length === 0) {
      navigate("/products");
      return;
    }

    fetchCompareData();
  }, [compareIds]);

  const fetchCompareData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = compareIds.map((id) => `ids=${id}`).join("&");
      const response = await fetch(
        `${API_BASE_URL}/Cameras/compare?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comparison data");
      }

      const data = await response.json();
      setCameras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching compare data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const parseSpecs = (specsJson: string | null): Record<string, string> => {
    if (!specsJson) return {};
    try {
      return JSON.parse(specsJson);
    } catch {
      return {};
    }
  };

  // Get all unique spec keys
  const allSpecKeys = Array.from(
    new Set(
      cameras.flatMap((camera) => Object.keys(parseSpecs(camera.specsJson)))
    )
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: colors.background.default,
        }}
      >
        <CircularProgress size={60} sx={{ color: colors.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            onClick={() => navigate("/products")}
            startIcon={<ArrowLeft size={20} />}
            sx={{
              color: colors.text.secondary,
              textTransform: "none",
              fontWeight: 600,
              mb: 2,
              "&:hover": {
                bgcolor: colors.neutral[100],
              },
            }}
          >
            Quay lại sản phẩm
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
              >
                So sánh máy ảnh
              </Typography>
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                So sánh tối đa 3 máy ảnh cùng lúc
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Chip
                label={`${cameras.length} máy ảnh${
                  cameras.length > 1 ? "s" : ""
                } được chọn`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
              <Button
                variant="outlined"
                onClick={clearCompare}
                sx={{
                  borderColor: colors.status.error,
                  color: colors.status.error,
                  "&:hover": {
                    borderColor: colors.status.error,
                    bgcolor: colors.status.errorLight,
                  },
                }}
              >
                Xóa tất cả
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Comparison Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${colors.border.light}` }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: colors.text.primary,
                    fontSize: "1rem",
                    width: 200,
                  }}
                >
                  Tính năng
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Box sx={{ position: "relative" }}>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCompare(camera.id)}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          bgcolor: "white",
                          boxShadow: 1,
                          "&:hover": {
                            bgcolor: colors.status.errorLight,
                            color: colors.status.error,
                          },
                        }}
                      >
                        <X size={16} />
                      </IconButton>

                      {/* Camera Image */}
                      <Box
                        sx={{
                          width: 200,
                          height: 150,
                          borderRadius: 2,
                          overflow: "hidden",
                          mb: 2,
                          mx: "auto",
                          bgcolor: colors.neutral[100],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {camera.media && camera.media.length > 0 ? (
                          <img
                            src={camera.media[0].url}
                            alt={`${camera.brand} ${camera.model}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <CameraIcon size={48} color={colors.neutral[400]} />
                        )}
                      </Box>

                      {/* Camera Name */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: colors.text.primary,
                          mb: 0.5,
                        }}
                      >
                        {camera.brand}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary, mb: 1 }}
                      >
                        {camera.model}
                      </Typography>
                      {camera.variant && (
                        <Chip
                          label={camera.variant}
                          size="small"
                          sx={{
                            bgcolor: colors.primary.lighter,
                            color: colors.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Price */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Giá thuê theo ngày
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: colors.primary.main }}
                    >
                      {formatVnd(camera.baseDailyRate)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Estimated Value */}
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Giá trị ước tính
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Typography variant="body2">
                      {formatVnd(camera.estimatedValueVnd)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Deposit */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Tiền đặt cọc
                </TableCell>
                {cameras.map((camera) => {
                  const calculated =
                    (camera.estimatedValueVnd * camera.depositPercent) / 100;
                  const minCap = camera.depositCapMinVnd ?? 0;
                  const maxCap = camera.depositCapMaxVnd ?? calculated;
                  const deposit = Math.min(
                    Math.max(calculated, minCap),
                    maxCap
                  );

                  return (
                    <TableCell key={camera.id} align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatVnd(deposit)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        ({(camera.depositPercent * 100).toFixed(0)}%)
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Availability */}
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Tình trạng
                </TableCell>
                {cameras.map((camera) => {
                  const available =
                    !camera.location || camera.location === "Platform";
                  return (
                    <TableCell key={camera.id} align="center">
                      <Chip
                        label={available ? "Có sẵn" : "Không có sẵn"}
                        size="small"
                        sx={{
                          bgcolor: available
                            ? colors.status.successLight
                            : colors.status.errorLight,
                          color: available
                            ? colors.status.success
                            : colors.status.error,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Location */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Vị trí
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Typography variant="body2">
                      {camera.branchName || "Chi nhánh trung tâm"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      {camera.branchAddress || "—"}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Owner */}
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Chủ sở hữu
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Typography variant="body2">
                      {camera.ownerName || "Không rõ"}
                    </Typography>
                    {camera.isConfirmed && (
                      <Chip
                        label="Đã xác minh"
                        size="small"
                        sx={{
                          bgcolor: colors.status.successLight,
                          color: colors.status.success,
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Serial Number */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Số Serial
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        color: colors.text.secondary,
                      }}
                    >
                      {camera.serialNumber || "—"}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Specifications */}
              {allSpecKeys.map((key) => (
                <TableRow
                  key={key}
                  sx={{
                    bgcolor:
                      allSpecKeys.indexOf(key) % 2 === 0
                        ? "white"
                        : colors.neutral[50],
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      textTransform: "capitalize",
                    }}
                  >
                    {key}
                  </TableCell>
                  {cameras.map((camera) => {
                    const specs = parseSpecs(camera.specsJson);
                    return (
                      <TableCell key={camera.id} align="center">
                        <Typography variant="body2">
                          {specs[key] || "—"}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* Actions */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Hành động
                </TableCell>
                {cameras.map((camera) => (
                  <TableCell key={camera.id} align="center">
                    <Stack spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/products/${camera.id}`)}
                        sx={{
                          bgcolor: colors.primary.main,
                          "&:hover": { bgcolor: colors.primary.dark },
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      {(!camera.location || camera.location === "Platform") && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: colors.primary.main,
                            color: colors.primary.main,
                          }}
                        >
                          Rent Now
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default ComparePage;
