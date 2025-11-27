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
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import { Sparkles } from "lucide-react";
import { colors } from "../../theme/colors";
import AISearchDialog from "./AISearchDialog";
import type { AISearchCriteria } from "../../types/aiSearch.type";

interface ProductHeaderProps {
  currentTab: number;
  onTabChange: (newTab: number) => void;
  totalCameras: number;
  totalAccessories: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  compareCount: number;
  onAISearch: (criteria: AISearchCriteria) => void;
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

  const handleAISearch = (criteria: AISearchCriteria) => {
    setOpenAISearch(false);
    onAISearch(criteria);
  };

  return (
    <>
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${grey[100]}, ${grey[200]})`,
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontFamily: "Times New Roman, serif",
            }}
          >
            Khám phá thiết bị
          </Typography>
          <Typography variant="h6" sx={{ color: grey[600], mb: 1 }}>
            Cho thuê thiết bị camera chuyên nghiệp cho dự án của bạn
          </Typography>
          <Typography variant="body2" sx={{ color: grey[500], mb: 4 }}>
            {currentTab === 0
              ? `${totalCameras} camera có sẵn`
              : `${totalAccessories} phụ kiện có sẵn`}
            {compareCount > 0 && (
              <Chip
                label={`${compareCount} in compare list`}
                size="small"
                sx={{
                  ml: 2,
                  bgcolor: amber[100],
                  color: amber[800],
                  fontWeight: 600,
                }}
              />
            )}
          </Typography>

          {/* Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => onTabChange(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  minWidth: 120,
                },
                "& .Mui-selected": {
                  color: "black !important",
                },
                "& .MuiTabs-indicator": {
                  bgcolor: colors.primary.main,
                  height: 3,
                },
              }}
            >
              <Tab label={`Cameras (${totalCameras})`} />
              <Tab label={`Phụ kiện (${totalAccessories})`} />
            </Tabs>
          </Box>

          {/* Search Box with AI */}
          <Box sx={{ maxWidth: 720 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                placeholder="Tìm kiếm camera, ống kính, phụ kiện..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
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
                    bgcolor: "white",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: grey[300],
                    borderWidth: 2,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: colors.primary.main,
                    },
                }}
              />

              {/* AI Search Button */}
              <Tooltip title="Tìm kiếm thông minh với AI">
                <Button
                  variant="contained"
                  onClick={() => setOpenAISearch(true)}
                  disabled={isAISearching}
                  sx={{
                    bgcolor: colors.primary.main,
                    color: "white",
                    minWidth: 160,
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: 3,
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      bgcolor: colors.primary.dark,
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease",
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
                    <CircularProgress
                      size={20}
                      sx={{ color: "black", mr: 1 }}
                    />
                  ) : (
                    <Sparkles size={20} style={{ marginRight: 8 }} />
                  )}
                  {isAISearching ? "Đang tìm..." : "AI Search"}
                </Button>
              </Tooltip>
            </Stack>

            {/* AI Search Info Banner */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: colors.primary.lighter,
                borderRadius: 2,
                border: `1px solid ${colors.primary.main}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Sparkles size={18} color={colors.primary.main} />
              <Typography variant="body2" sx={{ color: grey[700] }}>
                <strong>Mẹo:</strong> Sử dụng AI Search để tìm camera phù hợp
                nhất với nhu cầu, ngân sách và trình độ của bạn!
              </Typography>
            </Box>
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
