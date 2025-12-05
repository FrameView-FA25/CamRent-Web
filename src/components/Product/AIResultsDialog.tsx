import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  X,
  Sparkles,
  TrendingUp,
  Camera as CameraIcon,
  Package,
  Star,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import type { AISearchResult } from "../../services/ai.service";

interface AIResultsDialogProps {
  open: boolean;
  onClose: () => void;
  results: AISearchResult[];
}

const AIResultsDialog: React.FC<AIResultsDialogProps> = ({
  open,
  onClose,
  results,
}) => {
  const navigate = useNavigate();

  if (!results || results.length === 0) return null;

  const getMatchColor = (score: number) => {
    const percentage = score * 100;
    if (percentage >= 45) return colors.status.success;
    if (percentage >= 35) return colors.status.info;
    if (percentage >= 25) return colors.status.warning;
    return colors.status.error;
  };

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getItemIcon = (itemClass: string) => {
    return itemClass === "Camera" ? (
      <CameraIcon size={32} color={colors.primary.main} />
    ) : (
      <Package size={32} color={colors.status.info} />
    );
  };

  const handleViewDetails = (result: AISearchResult) => {
    if (result.class === "Camera") {
      navigate(`/products/${result.id}`);
    } else {
      // Navigate to accessory detail page
      navigate(`/accessories/${result.id}`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: colors.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Kết quả từ AI
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {results.length} kết quả được tìm thấy
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Info Alert */}
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Kết quả được sắp xếp theo độ phù hợp từ cao đến thấp
            </Typography>
          </Alert>

          {/* Results */}
          <Box>
            <Stack spacing={2}>
              {results.map((result, index) => {
                const matchScore = formatScore(result.score);
                const matchColor = getMatchColor(result.score);

                return (
                  <Card
                    key={result.id}
                    elevation={2}
                    sx={{
                      border:
                        index === 0
                          ? `2px solid ${colors.primary.main}`
                          : `1px solid ${colors.border.light}`,
                      borderRadius: 2,
                      position: "relative",
                      overflow: "visible",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {index === 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: 16,
                          bgcolor: colors.primary.main,
                          color: "black",
                          px: 2,
                          py: 0.5,
                          borderRadius: 999,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontWeight: 700,
                          fontSize: 12,
                          boxShadow: 2,
                        }}
                      >
                        <Star size={14} fill="currentColor" />
                        PHÙ HỢP NHẤT
                      </Box>
                    )}

                    <CardContent sx={{ pt: index === 0 ? 3 : 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                        }}
                      >
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            bgcolor: colors.neutral[100],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getItemIcon(result.class)}
                        </Box>

                        {/* Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                <Chip
                                  label={
                                    result.class === "Camera"
                                      ? "Camera"
                                      : "Phụ kiện"
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      result.class === "Camera"
                                        ? colors.primary.lighter
                                        : colors.status.infoLight,
                                    color:
                                      result.class === "Camera"
                                        ? colors.primary.main
                                        : colors.status.info,
                                    fontWeight: 600,
                                    fontSize: 11,
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: colors.text.primary,
                                  mb: 0.5,
                                }}
                              >
                                {result.name}
                              </Typography>
                            </Box>
                            <Chip
                              icon={<TrendingUp size={14} />}
                              label={`${matchScore}% phù hợp`}
                              sx={{
                                bgcolor: matchColor,
                                color: "white",
                                fontWeight: 700,
                                ml: 2,
                                "& .MuiChip-icon": {
                                  color: "white",
                                },
                              }}
                            />
                          </Box>

                          {/* Match Progress */}
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={matchScore}
                              sx={{
                                height: 6,
                                borderRadius: 999,
                                bgcolor: colors.neutral[100],
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: matchColor,
                                  borderRadius: 999,
                                },
                              }}
                            />
                          </Box>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text.secondary,
                              mb: 2,
                              lineHeight: 1.6,
                            }}
                          >
                            {result.description}
                          </Typography>

                          {/* View Details Button */}
                          <Button
                            fullWidth
                            variant="contained"
                            endIcon={<ArrowRight size={18} />}
                            onClick={() => handleViewDetails(result)}
                            sx={{
                              bgcolor:
                                index === 0 ? colors.primary.main : "black",
                              color: index === 0 ? "black" : "white",
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: 2,
                              "&:hover": {
                                bgcolor:
                                  index === 0
                                    ? colors.primary.dark
                                    : colors.neutral[800],
                              },
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIResultsDialog;
