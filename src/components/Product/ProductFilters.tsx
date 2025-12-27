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
  // Chuẩn hóa danh sách categories
  const normalizedCategories = React.useMemo(() => {
    const categoryMap = new Map<string, { original: string; count: number }>();

    categories.forEach((cat) => {
      const trimmed = cat.trim();
      const normalized =
        trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

      if (categoryMap.has(normalized)) {
        // Cộng dồn count nếu đã tồn tại
        const existing = categoryMap.get(normalized)!;
        existing.count += itemCounts[cat] || 0;
      } else {
        categoryMap.set(normalized, {
          original: trimmed,
          count: itemCounts[cat] || 0,
        });
      }
    });

    return Array.from(categoryMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([normalized, data]) => ({
        display: normalized,
        value: data.original,
        count: data.count,
      }));
  }, [categories, itemCounts]);

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
        {normalizedCategories.map((cat) => {
          const selected = selectedCategory === cat.value;
          return (
            <Chip
              key={cat.display}
              label={`${cat.display} (${cat.count})`}
              onClick={() => onCategoryChange(cat.value)}
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
