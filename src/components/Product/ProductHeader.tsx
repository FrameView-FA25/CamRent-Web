import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Stack,
  CircularProgress,
  Paper,
  Fade,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import { Sparkles } from "lucide-react";
import { colors } from "../../theme/colors";
import AISearchDialog from "./AISearchDialog";
import type { AISearchResult } from "../../services/ai.service";

interface ProductHeaderProps {
  currentTab: number;
  onTabChange: (newTab: number) => void;
  totalCameras: number;
  totalAccessories: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  compareCount: number;
  onAISearch: (results: AISearchResult[]) => void;
  isAISearching?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  currentTab,
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
  const [showSearchTip, setShowSearchTip] = useState(false);

  const handleAISearch = (results: AISearchResult[]) => {
    setOpenAISearch(false);
    onAISearch(results);
  };

  return (
    <>
      <Box
        sx={{
          py: 12,
          position: "relative",
          overflow: "hidden",
          background: colors.primary.dark,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/bg-product.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Title Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Khám phá thiết bị
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.95)",
                mb: 1,
                fontWeight: 500,
              }}
            >
              Cho thuê thiết bị camera chuyên nghiệp cho dự án của bạn
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
              }}
            >
              {currentTab === 0
                ? `${totalCameras} camera có sẵn`
                : `${totalAccessories} phụ kiện có sẵn`}
              {compareCount > 0 && (
                <Chip
                  label={`${compareCount} trong danh sách so sánh`}
                  size="small"
                  sx={{
                    ml: 2,
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 700,
                    backdropFilter: "blur(10px)",
                  }}
                />
              )}
            </Typography>
          </Box>

          {/* Tabs - Centered */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                p: 0.5,
                display: "inline-flex",
              }}
            >
              <Tabs
                value={currentTab}
                onChange={(_, newValue) => onTabChange(newValue)}
                sx={{
                  minHeight: "auto",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 16,
                    minWidth: 160,
                    color: "rgba(255,255,255,0.8)",
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    bgcolor: "#000000",
                    "&:hover": {
                      bgcolor: "white",
                      color: colors.primary.main,
                    },
                  },
                  "& .Mui-selected": {
                    bgcolor: "white !important",
                    color: `${colors.primary.main} !important`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                }}
              >
                <Tab label={`Cameras (${totalCameras})`} />
                <Tab label={`Phụ kiện (${totalAccessories})`} />
              </Tabs>
            </Paper>
          </Box>

          {/* Search Box - Centered */}
          <Box
            sx={{
              maxWidth: 600,
              mx: "auto",
              position: "relative",
            }}
          >
            <Paper
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: "visible",
                bgcolor: "white",
              }}
            >
              <Stack
                direction="row"
                spacing={0}
                alignItems="stretch"
                sx={{ position: "relative" }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm camera, ống kính, phụ kiện..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setShowSearchTip(true)}
                  onBlur={() => setTimeout(() => setShowSearchTip(false), 200)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: grey[500], fontSize: 24 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px 0 0 12px",
                      py: 0.5,
                      fontSize: "0.95rem",
                      height: "48px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 1,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />

                {/* AI Search Button */}
                <Button
                  variant="contained"
                  onClick={() => setOpenAISearch(true)}
                  disabled={isAISearching}
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    minWidth: 140,
                    height: "48px",
                    px: 3,
                    borderRadius: "0 12px 12px 0",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    boxShadow: "none",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      bgcolor: "black",
                      boxShadow: "none",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      transition: "left 0.5s",
                    },
                    "&:hover::before": {
                      left: "100%",
                    },
                  }}
                >
                  {isAISearching ? (
                    <>
                      <CircularProgress
                        size={18}
                        sx={{ color: "white", mr: 1 }}
                      />
                      Đang tìm...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} style={{ marginRight: 8 }} />
                      AI Search
                    </>
                  )}
                </Button>
              </Stack>

              {/* Search Tip - Appears below when focused */}
              <Fade in={showSearchTip}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2.5,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: `2px solid ${colors.primary.main}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: colors.primary.lighter,
                        borderRadius: "50%",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={20} color={colors.primary.main} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: grey[800],
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        💡 Mẹo tìm kiếm thông minh
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: grey[600], lineHeight: 1.5 }}
                      >
                        Sử dụng <strong>AI Search</strong> để tìm camera phù hợp
                        nhất với nhu cầu, ngân sách và trình độ của bạn!
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Fade>
            </Paper>
          </Box>
        </Container>
      </Box>

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
