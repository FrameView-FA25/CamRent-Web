import React from "react";
import {
  Paper,
  TextField,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  Refresh,
  CalendarToday,
  SortByAlpha,
} from "@mui/icons-material";
import type { SortOrder } from "../hooks/useBookingFilters";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  sortOrder,
  onSortChange,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <TextField
        fullWidth
        placeholder="Tìm kiếm theo mã đơn, ID khách hàng, thiết bị..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#F97316" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&:hover fieldset": {
              borderColor: "#F97316",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#F97316",
            },
          },
        }}
      />

      {/* Sort Toggle */}
      <ToggleButtonGroup
        value={sortOrder}
        exclusive
        onChange={(_, newSort) => {
          if (newSort !== null) onSortChange(newSort);
        }}
        sx={{
          flexShrink: 0,
          "& .MuiToggleButton-root": {
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 1,
            borderColor: "#E5E7EB",
            color: "#6B7280",
            "&.Mui-selected": {
              bgcolor: "#F97316",
              color: "white",
              "&:hover": {
                bgcolor: "#EA580C",
              },
            },
          },
        }}
      >
        <ToggleButton value="newest">
          <CalendarToday sx={{ fontSize: 18, mr: 1 }} />
          Mới nhất
        </ToggleButton>
        <ToggleButton value="alphabetical">
          <SortByAlpha sx={{ fontSize: 18, mr: 1 }} />
          A-Z
        </ToggleButton>
      </ToggleButtonGroup>

      <IconButton
        onClick={onRefresh}
        disabled={loading}
        sx={{
          bgcolor: "#FFF7ED",
          color: "#F97316",
          "&:hover": {
            bgcolor: "#FFEDD5",
          },
          "&:disabled": {
            bgcolor: "#F3F4F6",
            color: "#9CA3AF",
          },
        }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "#F97316" }} />
        ) : (
          <Refresh />
        )}
      </IconButton>
    </Paper>
  );
};
