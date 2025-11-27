import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import { CameraAlt as CameraIcon, Add as AddIcon } from "@mui/icons-material";
import { colors } from "../../theme/colors";

interface ProductEmptyStateProps {
  type?: "camera" | "accessory";
  onAddNew?: () => void;
}

const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({
  type = "camera",
  onAddNew,
}) => {
  const isCamera = type === "camera";
  const heading = isCamera
    ? "Chưa có camera nào trong chi nhánh"
    : "Chưa có phụ kiện nào trong chi nhánh";
  const buttonLabel = isCamera ? "Thêm Camera Đầu Tiên" : "Thêm Phụ Kiện Đầu Tiên";

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
      <CameraIcon sx={{ fontSize: 64, color: colors.neutral[300], mb: 2 }} />
      <Typography
        variant="h6"
        sx={{ color: colors.text.secondary, mb: 2, fontWeight: 600 }}
      >
        {heading}
      </Typography>
      {onAddNew && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddNew}
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
          {buttonLabel}
        </Button>
      )}
    </Paper>
  );
};

export default ProductEmptyState;
