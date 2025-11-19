import React from "react";
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";

interface ProductSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${colors.border.light}`,
        bgcolor: colors.background.paper,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo model, brand hoặc serial number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.primary.main, fontSize: 24 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "none",
              },
            },
            "& input::placeholder": {
              color: colors.text.secondary,
              opacity: 0.7,
            },
          }}
        />
        <IconButton
          onClick={onRefresh}
          sx={{
            bgcolor: colors.background.default,
            "&:hover": {
              bgcolor: colors.neutral[100],
            },
          }}
        >
          <RefreshIcon sx={{ color: colors.primary.main }} />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default ProductSearchBar;
