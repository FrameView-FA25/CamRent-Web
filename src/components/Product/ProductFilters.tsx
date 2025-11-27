import React from "react";
import { Stack, Divider, Typography, Chip } from "@mui/material";
import { grey } from "@mui/material/colors";
import FilterListIcon from "@mui/icons-material/FilterList";
import { colors } from "../../theme/colors";

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  itemCounts?: Record<string, number>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  itemCounts = {},
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ mb: 3, overflowX: "auto", pb: 1 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ color: grey[700], fontWeight: 700 }}
      >
        <FilterListIcon fontSize="small" />
        <Typography fontWeight={700}>Thương hiệu:</Typography>
      </Stack>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Stack direction="row" spacing={1}>
        {categories.map((cat) => {
          const selected = selectedCategory === cat;
          const count = itemCounts[cat] || 0;
          return (
            <Chip
              key={cat}
              label={`${cat} (${count})`}
              onClick={() => onCategoryChange(cat)}
              sx={{
                cursor: "pointer",
                bgcolor: selected ? colors.primary.main : "white",
                color: selected ? "white" : grey[800],
                fontWeight: selected ? 700 : 500,
                borderRadius: 999,
                px: 1,
                "&:hover": {
                  bgcolor: selected ? colors.primary.main : grey[100],
                },
                border: selected ? "none" : `1px solid ${grey[200]}`,
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

export default ProductFilters;
