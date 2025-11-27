import React from "react";
import { Box, Button, Badge, Typography } from "@mui/material";
import { amber } from "@mui/material/colors";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

interface CompareFloatingButtonProps {
  compareCount: number;
  onClick: () => void;
}

const CompareFloatingButton: React.FC<CompareFloatingButtonProps> = ({
  compareCount,
  onClick,
}) => {
  if (compareCount === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 100,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        startIcon={<CompareArrowsIcon />}
        onClick={onClick}
        sx={{
          bgcolor: amber[600],
          color: "white",
          fontWeight: 700,
          px: 3,
          py: 1.5,
          borderRadius: 999,
          boxShadow: 4,
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": {
            bgcolor: amber[700],
            transform: "scale(1.05)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <Badge
          badgeContent={compareCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              right: -8,
              top: -8,
              fontWeight: 700,
            },
          }}
        >
          <Typography sx={{ fontWeight: 700, mr: 1 }}>
            Compare Cameras
          </Typography>
        </Badge>
      </Button>
    </Box>
  );
};

export default CompareFloatingButton;
