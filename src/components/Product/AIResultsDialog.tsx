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
  Divider,
} from "@mui/material";
import {
  X,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Camera as CameraIcon,
  Star,
  DollarSign,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import type { AISearchResponse } from "../../types/aiSearch.type";
import type { Camera } from "../../types/product.types";

interface AIResultsDialogProps {
  open: boolean;
  onClose: () => void;
  results: AISearchResponse | null;
  cameras: Camera[];
}

const AIResultsDialog: React.FC<AIResultsDialogProps> = ({
  open,
  onClose,
  results,
  cameras,
}) => {
  const navigate = useNavigate();

  if (!results) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return colors.status.success;
    if (score >= 75) return colors.status.info;
    if (score >= 60) return colors.status.warning;
    return colors.status.error;
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
                {results.recommendations.length} camera được đề xuất
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
          {/* Search Summary */}
          <Card
            elevation={0}
            sx={{
              bgcolor: colors.primary.lighter,
              border: `2px solid ${colors.primary.main}`,
            }}
          >
            <CardContent>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {results.searchSummary}
              </Typography>
            </CardContent>
          </Card>

          {/* Tips */}
          {results.tips.length > 0 && (
            <Card elevation={0} sx={{ bgcolor: colors.status.infoLight }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Lightbulb size={18} color={colors.status.info} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: colors.status.info }}
                  >
                    Gợi ý từ AI
                  </Typography>
                </Box>
                <Stack spacing={0.5}>
                  {results.tips.map((tip, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ color: colors.text.primary, pl: 2 }}
                    >
                      • {tip}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          <Divider />

          {/* Recommendations */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Camera được đề xuất
            </Typography>
            <Stack spacing={2}>
              {results.recommendations.map((rec, index) => {
                const camera = cameras.find((c) => c.id === rec.camera);
                if (!camera) return null;

                const matchColor = getMatchColor(rec.matchScore);

                return (
                  <Card
                    key={rec.camera}
                    elevation={2}
                    sx={{
                      border:
                        index === 0
                          ? `2px solid ${colors.primary.main}`
                          : `1px solid ${colors.border.light}`,
                      borderRadius: 2,
                      position: "relative",
                      overflow: "visible",
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
                        ĐỀ XUẤT HÀNG ĐẦU
                      </Box>
                    )}

                    <CardContent sx={{ pt: index === 0 ? 3 : 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        {/* Camera Image */}
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            bgcolor: colors.neutral[100],
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {camera.media && camera.media.length > 0 ? (
                            <img
                              src={
                                typeof camera.media[0] === "string"
                                  ? camera.media[0]
                                  : camera.media[0].url
                              }
                              alt={camera.model}
                              style={{
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
                              <CameraIcon
                                size={32}
                                color={colors.neutral[300]}
                              />
                            </Box>
                          )}
                        </Box>

                        {/* Camera Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: colors.text.secondary }}
                              >
                                {camera.brand}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: colors.text.primary,
                                }}
                              >
                                {camera.model}
                              </Typography>
                            </Box>
                            <Chip
                              icon={<TrendingUp size={14} />}
                              label={`${rec.matchScore}% phù hợp`}
                              sx={{
                                bgcolor: matchColor,
                                color: "white",
                                fontWeight: 700,
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
                              value={rec.matchScore}
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

                          {/* Price */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            <DollarSign
                              size={16}
                              color={colors.text.secondary}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.secondary }}
                            >
                              Giá thuê:
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: colors.primary.main,
                              }}
                            >
                              {formatCurrency(camera.baseDailyRate)}
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ color: colors.text.secondary, ml: 0.5 }}
                              >
                                /ngày
                              </Typography>
                            </Typography>
                          </Box>

                          {/* Reasons */}
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.secondary,
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Lý do đề xuất:
                            </Typography>
                            <Stack spacing={0.5}>
                              {rec.reasons.slice(0, 3).map((reason, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 0.5,
                                  }}
                                >
                                  <CheckCircle
                                    size={14}
                                    color={colors.status.success}
                                    style={{ marginTop: 2, flexShrink: 0 }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ color: colors.text.primary }}
                                  >
                                    {reason}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>

                          {/* Suggested Accessories */}
                          {rec.suggestedAccessories.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.secondary,
                                  fontWeight: 600,
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Phụ kiện đề xuất:
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {rec.suggestedAccessories.map((acc, i) => (
                                  <Chip
                                    key={i}
                                    label={acc}
                                    size="small"
                                    sx={{
                                      bgcolor: colors.neutral[100],
                                      fontWeight: 600,
                                      fontSize: 11,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* Total Estimated Cost */}
                          <Box
                            sx={{
                              mt: 2,
                              p: 1.5,
                              bgcolor: colors.background.default,
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.secondary,
                                fontWeight: 600,
                              }}
                            >
                              Tổng chi phí ước tính:
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                color: colors.text.primary,
                              }}
                            >
                              {formatCurrency(rec.estimatedTotalCost)}
                            </Typography>
                          </Box>

                          {/* View Details Button */}
                          <Button
                            fullWidth
                            variant="contained"
                            endIcon={<ArrowRight size={18} />}
                            onClick={() => {
                              navigate(`/products/${camera.id}`);
                              onClose();
                            }}
                            sx={{
                              mt: 2,
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
                            Xem chi tiết & Thuê ngay
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
