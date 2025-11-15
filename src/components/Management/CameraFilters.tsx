import React from "react";
import {
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { colors } from "../../theme/colors";

interface CameraFiltersProps {
  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onSortChange: (sortBy: string, sortDir: "asc" | "desc") => void;
  brands: string[];
}

export const CameraFilters: React.FC<CameraFiltersProps> = ({
  onSearchChange,
  onBrandChange,
  onSortChange,
  brands,
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [sortBy, setSortBy] = React.useState("createdAt");

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
      <TextField
        placeholder="Tìm kiếm theo model, serial number..."
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          onSearchChange(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.neutral[500] }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary.main,
            },
          },
        }}
      />

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Thương hiệu</InputLabel>
        <Select
          value={selectedBrand}
          label="Thương hiệu"
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            onBrandChange(e.target.value);
          }}
          sx={{
            borderRadius: 2,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary.main,
            },
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand} value={brand}>
              {brand}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Sắp xếp</InputLabel>
        <Select
          value={sortBy}
          label="Sắp xếp"
          onChange={(e) => {
            setSortBy(e.target.value);
            onSortChange(e.target.value, "desc");
          }}
          sx={{
            borderRadius: 2,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary.main,
            },
          }}
        >
          <MenuItem value="createdAt">Mới nhất</MenuItem>
          <MenuItem value="baseDailyRate">Giá thuê</MenuItem>
          <MenuItem value="estimatedValueVnd">Giá trị</MenuItem>
          <MenuItem value="brand">Thương hiệu</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};
