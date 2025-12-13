import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  Divider,
  IconButton,
  Popover,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import { Sparkles, Camera, Package } from "lucide-react";
import { colors } from "../../theme/colors";
import AISearchDialog from "./AISearchDialog";
import type { AISearchResult } from "../../services/ai.service";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addDays } from "date-fns";

interface ProductHeaderProps {
  currentTab: number;
  onTabChange: (tab: number) => void;
  totalCameras: number;
  totalAccessories: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  compareCount: number;
  onAISearch: (results: any[]) => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearDateFilter: () => void;
  isAISearching?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  currentTab,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDateFilter,
  onTabChange,
  totalCameras,
  totalAccessories,
  searchQuery,
  onSearchChange,
  compareCount,
  onAISearch,
  isAISearching = false,
}) => {
  const [openAISearch, setOpenAISearch] = useState(false);
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(
    null
  );
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  const handleAISearch = (results: AISearchResult[]) => {
    setOpenAISearch(false);
    onAISearch(results);
  };

  const formatDateRange = () => {
    if (!startDate) return "Chọn ngày thuê";
    if (!endDate) return `${startDate.toLocaleDateString("vi-VN")} — ...`;
    return `${startDate.toLocaleDateString(
      "vi-VN"
    )} — ${endDate.toLocaleDateString("vi-VN")}`;
  };

  const handleDatePickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDatePickerAnchor(event.currentTarget);
    setSelectingEndDate(false);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
    setSelectingEndDate(false);
  };

  const handleDateSelect = (date: Date | null | unknown) => {
    if (!date) return;

    // Convert to Date object if needed
    const selectedDate = date instanceof Date ? date : new Date(String(date));

    if (!startDate || selectingEndDate) {
      // Selecting end date
      if (startDate && selectedDate >= startDate) {
        onEndDateChange(selectedDate);
        setSelectingEndDate(false);
      } else if (!startDate) {
        // First selection - set as start date
        onStartDateChange(selectedDate);
        setSelectingEndDate(true);
      }
    } else {
      // Selecting start date (reset flow)
      onStartDateChange(selectedDate);
      onEndDateChange(null);
      setSelectingEndDate(true);
    }
  };

  const handleQuickSelect = (days: number) => {
    const start = new Date();
    const end = addDays(start, days);
    onStartDateChange(start);
    onEndDateChange(end);
  };

  const openDatePicker = Boolean(datePickerAnchor);

  return (
    <>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          pt: 3,
          pb: 8,
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          {/* Tabs - Booking.com Style */}
          <Box sx={{ mb: 4 }}>
            <Stack
              direction="row"
              spacing={3}
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                pb: 0,
              }}
            >
              <Box
                onClick={() => onTabChange(0)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 2,
                  px: 2,
                  cursor: "pointer",
                  color: currentTab === 0 ? "white" : "rgba(255,255,255,0.7)",
                  borderBottom:
                    currentTab === 0
                      ? "3px solid white"
                      : "3px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    color: "white",
                  },
                }}
              >
                <Camera size={20} />
                <Typography sx={{ fontWeight: 600 }}>Cameras</Typography>
                <Chip
                  label={totalCameras}
                  size="small"
                  sx={{
                    bgcolor:
                      currentTab === 0 ? "white" : "rgba(255,255,255,0.2)",
                    color: currentTab === 0 ? colors.primary.main : "white",
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              </Box>
              <Box
                onClick={() => onTabChange(1)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 2,
                  px: 2,
                  cursor: "pointer",
                  color: currentTab === 1 ? "white" : "rgba(255,255,255,0.7)",
                  borderBottom:
                    currentTab === 1
                      ? "3px solid white"
                      : "3px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    color: "white",
                  },
                }}
              >
                <Package size={20} />
                <Typography sx={{ fontWeight: 600 }}>Phụ kiện</Typography>
                <Chip
                  label={totalAccessories}
                  size="small"
                  sx={{
                    bgcolor:
                      currentTab === 1 ? "white" : "rgba(255,255,255,0.2)",
                    color: currentTab === 1 ? colors.primary.main : "white",
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Title Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                mb: 1,
              }}
            >
              {currentTab === 0
                ? "Tìm camera hoàn hảo cho dự án của bạn"
                : "Phụ kiện chuyên nghiệp cho mọi nhu cầu"}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {currentTab === 0
                ? `Khám phá ${totalCameras} camera chuyên nghiệp với giá tốt nhất`
                : `Hơn ${totalAccessories} phụ kiện chất lượng cao sẵn sàng cho bạn`}
              {compareCount > 0 && (
                <Chip
                  label={`${compareCount} đang so sánh`}
                  size="small"
                  sx={{
                    bgcolor: "white",
                    color: colors.primary.main,
                    fontWeight: 700,
                  }}
                />
              )}
            </Typography>
          </Box>

          {/* Search Box - Booking.com Style */}
          <Paper
            elevation={4}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "3px solid #FFB700",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0}
              divider={<Divider orientation="vertical" flexItem />}
            >
              {/* Search Input */}
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  placeholder={
                    currentTab === 0
                      ? "Tìm camera, ống kính..."
                      : "Tìm phụ kiện..."
                  }
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 24, color: grey[600] }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      py: 1,
                      fontSize: "1rem",
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 1.5,
                    },
                  }}
                />
              </Box>

              {/* Date Range - Only for cameras */}
              {currentTab === 0 && (
                <Box
                  onClick={handleDatePickerOpen}
                  sx={{
                    flex: 1.2,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: { xs: 1, md: 0 },
                    cursor: "pointer",
                    bgcolor: openDatePicker ? grey[100] : "transparent",
                    "&:hover": {
                      bgcolor: grey[50],
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
                    <CalendarTodayIcon sx={{ color: grey[600] }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: grey[600],
                          fontWeight: 600,
                          display: "block",
                        }}
                      >
                        Ngày thuê
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: grey[900], fontWeight: 600 }}
                      >
                        {formatDateRange()}
                      </Typography>
                    </Box>
                    {(startDate || endDate) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearDateFilter();
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Search Buttons */}
              <Stack direction="row" spacing={0}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {}}
                  sx={{
                    bgcolor: colors.primary.main,
                    color: "white",
                    px: 4,
                    py: 2.5,
                    borderRadius: 0,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    minWidth: 120,
                    "&:hover": {
                      bgcolor: colors.primary.dark,
                    },
                  }}
                >
                  Tìm
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setOpenAISearch(true)}
                  disabled={isAISearching}
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    px: 3,
                    py: 2.5,
                    borderRadius: 0,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    minWidth: 140,
                    "&:hover": {
                      bgcolor: "#1a1a1a",
                    },
                  }}
                >
                  <Sparkles size={20} style={{ marginRight: 8 }} />
                  AI Search
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Date Picker Popover - Full Calendar */}
      <Popover
        open={openDatePicker}
        anchorEl={datePickerAnchor}
        onClose={handleDatePickerClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          mt: 1,
          "& .MuiPaper-root": {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            minWidth: 650,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Quick Select Buttons */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickSelect(0)}
              sx={{
                textTransform: "none",
                borderRadius: 20,
                borderColor: colors.primary.main,
                color: colors.primary.main,
                "&:hover": {
                  bgcolor: colors.primary.lighter,
                  borderColor: colors.primary.main,
                },
              }}
            >
              Ngày chính xác
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickSelect(1)}
              sx={{
                textTransform: "none",
                borderRadius: 20,
              }}
            >
              ± 1 ngày
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickSelect(2)}
              sx={{
                textTransform: "none",
                borderRadius: 20,
              }}
            >
              ± 2 ngày
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickSelect(3)}
              sx={{
                textTransform: "none",
                borderRadius: 20,
              }}
            >
              ± 3 ngày
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickSelect(7)}
              sx={{
                textTransform: "none",
                borderRadius: 20,
              }}
            >
              ± 7 ngày
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Two Calendars Side by Side */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={2}>
              <DateCalendar
                value={selectingEndDate ? endDate : startDate}
                onChange={handleDateSelect}
                minDate={new Date()}
                sx={{
                  "& .MuiPickersDay-root": {
                    "&.Mui-selected": {
                      bgcolor: colors.primary.main,
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                    },
                  },
                }}
              />
              <DateCalendar
                value={selectingEndDate ? endDate : startDate}
                onChange={handleDateSelect}
                minDate={new Date()}
                sx={{
                  "& .MuiPickersDay-root": {
                    "&.Mui-selected": {
                      bgcolor: colors.primary.main,
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                    },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                onClearDateFilter();
                handleDatePickerClose();
              }}
            >
              Xóa
            </Button>
            <Button
              variant="contained"
              onClick={handleDatePickerClose}
              disabled={!startDate || !endDate}
              sx={{
                bgcolor: colors.primary.main,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Áp dụng
            </Button>
          </Stack>
        </Box>
      </Popover>

      {/* AI Search Dialog */}
      <AISearchDialog
        open={openAISearch}
        onClose={() => setOpenAISearch(false)}
        onSearch={handleAISearch}
      />
    </>
  );
};

export default ProductHeader;
