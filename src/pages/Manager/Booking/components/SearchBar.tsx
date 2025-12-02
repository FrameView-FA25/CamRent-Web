import React from "react";
import {
  Paper,
  TextField,
  IconButton,
  Button,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search, Refresh, FilterList, FileDownload } from "@mui/icons-material";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
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
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        sx={{
          minWidth: 120,
          borderColor: "#E5E7EB",
          color: "#6B7280",
          "&:hover": {
            borderColor: "#F97316",
            bgcolor: "#FFF7ED",
            color: "#F97316",
          },
        }}
      >
        LỌC
      </Button>
      <Button
        variant="contained"
        startIcon={<FileDownload />}
        sx={{
          minWidth: 150,
          bgcolor: "#F97316",
          "&:hover": { bgcolor: "#EA580C" },
        }}
      >
        XUẤT BÁO CÁO
      </Button>
    </Paper>
  );
};
