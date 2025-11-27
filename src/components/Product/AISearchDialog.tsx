import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
} from "@mui/material";
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { AISearchCriteria } from "../../types/aiSearch.type";

interface AISearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (criteria: AISearchCriteria) => void;
}

const AISearchDialog: React.FC<AISearchDialogProps> = ({
  open,
  onClose,
  onSearch,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [criteria, setCriteria] = useState<AISearchCriteria>({
    budget: { min: 0, max: 5000000 },
    purpose: [],
    experience: "Intermediate",
    rentalDuration: { days: 3 },
    features: [],
    accessories: [],
    location: "",
    additionalRequirements: "",
  });

  const purposes = [
    { value: "Outdoor", label: "Ngoại cảnh", icon: "🏞️" },
    { value: "Portrait", label: "Chân dung", icon: "👤" },
    { value: "Wedding", label: "Cưới hỏi", icon: "💒" },
    { value: "Event", label: "Sự kiện", icon: "🎉" },
    { value: "Product", label: "Sản phẩm", icon: "📦" },
    { value: "Video", label: "Quay phim", icon: "🎥" },
    { value: "Sports", label: "Thể thao", icon: "⚽" },
    { value: "Wildlife", label: "Động vật", icon: "🦁" },
  ];

  const features = [
    { value: "Autofocus", label: "Lấy nét tự động" },
    { value: "Image Stabilization", label: "Chống rung" },
    { value: "Weather Sealed", label: "Chống nước bụi" },
    { value: "4K Video", label: "Quay 4K" },
    { value: "High ISO", label: "ISO cao" },
    { value: "Fast Burst", label: "Chụp liên tiếp" },
    { value: "Touch Screen", label: "Màn hình cảm ứng" },
    { value: "WiFi", label: "WiFi/Bluetooth" },
  ];

  const accessories = [
    { value: "Lens", label: "Ống kính", icon: "📷" },
    { value: "Tripod", label: "Chân máy", icon: "🗜️" },
    { value: "Flash", label: "Đèn flash", icon: "💡" },
    { value: "Memory Card", label: "Thẻ nhớ", icon: "💾" },
    { value: "Battery", label: "Pin dự phòng", icon: "🔋" },
    { value: "Camera Bag", label: "Túi đựng", icon: "🎒" },
  ];

  const steps = [
    "Mục đích sử dụng",
    "Ngân sách & Thời gian",
    "Yêu cầu kỹ thuật",
    "Xác nhận",
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSearch = () => {
    onSearch(criteria);
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Bạn muốn chụp gì?
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 1.5,
                }}
              >
                {purposes.map((purpose) => (
                  <Paper
                    key={purpose.value}
                    elevation={0}
                    onClick={() => {
                      const isSelected = criteria.purpose.includes(
                        purpose.value
                      );
                      setCriteria({
                        ...criteria,
                        purpose: isSelected
                          ? criteria.purpose.filter((p) => p !== purpose.value)
                          : [...criteria.purpose, purpose.value],
                      });
                    }}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      border: criteria.purpose.includes(purpose.value)
                        ? `2px solid ${colors.primary.main}`
                        : `2px solid ${colors.border.light}`,
                      borderRadius: 2,
                      bgcolor: criteria.purpose.includes(purpose.value)
                        ? colors.primary.lighter
                        : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: colors.primary.main,
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 32, mb: 0.5 }}>
                      {purpose.icon}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: criteria.purpose.includes(purpose.value)
                          ? colors.primary.main
                          : colors.text.primary,
                      }}
                    >
                      {purpose.label}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Trình độ của bạn?
              </Typography>
              <ToggleButtonGroup
                value={criteria.experience}
                exclusive
                onChange={(_, value) => {
                  if (value) setCriteria({ ...criteria, experience: value });
                }}
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    "&.Mui-selected": {
                      bgcolor: colors.primary.main,
                      color: "black",
                      "&:hover": {
                        bgcolor: colors.primary.main,
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="Beginner">
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Mới bắt đầu
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                      Dễ sử dụng
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="Intermediate">
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Trung cấp
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                      Có kinh nghiệm
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="Professional">
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Chuyên nghiệp
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                      Cao cấp nhất
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Ngân sách của bạn?
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[
                    criteria.budget?.min || 0,
                    criteria.budget?.max || 5000000,
                  ]}
                  onChange={(_, value) => {
                    const [min, max] = value as number[];
                    setCriteria({
                      ...criteria,
                      budget: { min, max },
                    });
                  }}
                  valueLabelDisplay="on"
                  valueLabelFormat={formatCurrency}
                  min={0}
                  max={10000000}
                  step={100000}
                  sx={{
                    color: colors.primary.main,
                    "& .MuiSlider-valueLabel": {
                      bgcolor: colors.primary.main,
                      color: "black",
                      fontWeight: 600,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      flex: 1,
                      mr: 1,
                      bgcolor: colors.background.default,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Tối thiểu
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(criteria.budget?.min || 0)}
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      flex: 1,
                      ml: 1,
                      bgcolor: colors.background.default,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Tối đa
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(criteria.budget?.max || 5000000)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Thuê bao lâu?
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={criteria.rentalDuration?.days || 3}
                onChange={(e) => {
                  setCriteria({
                    ...criteria,
                    rentalDuration: { days: parseInt(e.target.value) || 1 },
                  });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Calendar size={20} color={colors.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontWeight: 600 }}>ngày</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                {[1, 3, 7, 14, 30].map((days) => (
                  <Chip
                    key={days}
                    label={`${days} ngày`}
                    onClick={() => {
                      setCriteria({
                        ...criteria,
                        rentalDuration: { days },
                      });
                    }}
                    sx={{
                      bgcolor:
                        criteria.rentalDuration?.days === days
                          ? colors.primary.main
                          : colors.neutral[100],
                      color:
                        criteria.rentalDuration?.days === days
                          ? "black"
                          : colors.text.secondary,
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor:
                          criteria.rentalDuration?.days === days
                            ? colors.primary.main
                            : colors.neutral[200],
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Khu vực thuê
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập khu vực bạn muốn nhận máy..."
                value={criteria.location}
                onChange={(e) => {
                  setCriteria({ ...criteria, location: e.target.value });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={20} color={colors.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Tính năng cần thiết
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {features.map((feature) => (
                  <Chip
                    key={feature.value}
                    label={feature.label}
                    onClick={() => {
                      const isSelected = criteria.features?.includes(
                        feature.value
                      );
                      setCriteria({
                        ...criteria,
                        features: isSelected
                          ? criteria.features?.filter(
                              (f) => f !== feature.value
                            )
                          : [...(criteria.features || []), feature.value],
                      });
                    }}
                    sx={{
                      bgcolor: criteria.features?.includes(feature.value)
                        ? colors.primary.main
                        : "white",
                      color: criteria.features?.includes(feature.value)
                        ? "black"
                        : colors.text.primary,
                      border: criteria.features?.includes(feature.value)
                        ? "none"
                        : `1px solid ${colors.border.light}`,
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: criteria.features?.includes(feature.value)
                          ? colors.primary.main
                          : colors.neutral[100],
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Phụ kiện đi kèm
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 1.5,
                }}
              >
                {accessories.map((accessory) => (
                  <Paper
                    key={accessory.value}
                    elevation={0}
                    onClick={() => {
                      const isSelected = criteria.accessories?.includes(
                        accessory.value
                      );
                      setCriteria({
                        ...criteria,
                        accessories: isSelected
                          ? criteria.accessories?.filter(
                              (a) => a !== accessory.value
                            )
                          : [...(criteria.accessories || []), accessory.value],
                      });
                    }}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      border: criteria.accessories?.includes(accessory.value)
                        ? `2px solid ${colors.primary.main}`
                        : `2px solid ${colors.border.light}`,
                      borderRadius: 2,
                      bgcolor: criteria.accessories?.includes(accessory.value)
                        ? colors.primary.lighter
                        : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: colors.primary.main,
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 24, mb: 0.5 }}>
                      {accessory.icon}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: criteria.accessories?.includes(accessory.value)
                          ? colors.primary.main
                          : colors.text.primary,
                      }}
                    >
                      {accessory.label}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Yêu cầu bổ sung
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Ví dụ: Cần máy chụp đêm tốt, chống rung ổn định..."
                value={criteria.additionalRequirements}
                onChange={(e) => {
                  setCriteria({
                    ...criteria,
                    additionalRequirements: e.target.value,
                  });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 2 }}
                    >
                      <MessageSquare size={20} color={colors.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: colors.primary.lighter,
                borderRadius: 2,
                border: `2px solid ${colors.primary.main}`,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: colors.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={24} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Xác nhận tìm kiếm AI
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    AI sẽ phân tích và gợi ý camera phù hợp nhất
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{ p: 3, bgcolor: colors.background.default }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Tóm tắt yêu cầu
              </Typography>

              <Stack spacing={2}>
                {criteria.purpose.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Mục đích:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {criteria.purpose.map((p) => (
                        <Chip
                          key={p}
                          label={purposes.find((pur) => pur.value === p)?.label}
                          size="small"
                          sx={{
                            bgcolor: colors.primary.lighter,
                            color: colors.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, fontWeight: 600 }}
                  >
                    Trình độ:
                  </Typography>
                  <Chip
                    label={criteria.experience}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: colors.status.infoLight,
                      color: colors.status.info,
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, fontWeight: 600 }}
                  >
                    Ngân sách:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {formatCurrency(criteria.budget?.min || 0)} -{" "}
                    {formatCurrency(criteria.budget?.max || 5000000)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, fontWeight: 600 }}
                  >
                    Thời gian thuê:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {criteria.rentalDuration?.days} ngày
                  </Typography>
                </Box>

                {criteria.features && criteria.features.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Tính năng:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {criteria.features.map((f) => (
                        <Chip
                          key={f}
                          label={
                            features.find((feat) => feat.value === f)?.label
                          }
                          size="small"
                          sx={{
                            bgcolor: colors.neutral[100],
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {criteria.accessories && criteria.accessories.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Phụ kiện:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {criteria.accessories.map((a) => (
                        <Chip
                          key={a}
                          label={
                            accessories.find((acc) => acc.value === a)?.label
                          }
                          size="small"
                          sx={{
                            bgcolor: colors.neutral[100],
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {criteria.location && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Khu vực:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    >
                      {criteria.location}
                    </Typography>
                  </Box>
                )}

                {criteria.additionalRequirements && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Yêu cầu bổ sung:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        bgcolor: colors.neutral[50],
                        borderRadius: 1,
                      }}
                    >
                      {criteria.additionalRequirements}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
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
                AI Tìm kiếm thông minh
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Để AI giúp bạn tìm camera phù hợp nhất
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowLeft size={18} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Quay lại
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowRight size={18} />}
            disabled={activeStep === 0 && criteria.purpose.length === 0}
            sx={{
              bgcolor: colors.primary.main,
              color: "black",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: colors.primary.dark,
              },
            }}
          >
            Tiếp tục
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<Search size={18} />}
            sx={{
              bgcolor: colors.primary.main,
              color: "black",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                bgcolor: colors.primary.dark,
              },
            }}
          >
            Tìm kiếm với AI
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AISearchDialog;
