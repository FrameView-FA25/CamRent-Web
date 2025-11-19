import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { colors } from "../../theme/colors";

interface ProductNoResultsProps {
  onReset: () => void;
}

const ProductNoResults: React.FC<ProductNoResultsProps> = ({ onReset }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        textAlign: "center",
        py: 8,
        borderRadius: 2,
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <SearchIcon sx={{ fontSize: 64, color: colors.neutral[300], mb: 2 }} />
      <Typography
        variant="h6"
        sx={{ color: colors.text.secondary, mb: 2, fontWeight: 600 }}
      >
        Không tìm thấy camera phù hợp
      </Typography>
      <Button
        variant="outlined"
        onClick={onReset}
        sx={{
          borderColor: colors.primary.main,
          color: colors.primary.main,
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          py: 1,
          "&:hover": {
            borderColor: colors.primary.dark,
            bgcolor: colors.primary.lighter,
          },
        }}
      >
        Xóa bộ lọc
      </Button>
    </Paper>
  );
};

export default ProductNoResults;
