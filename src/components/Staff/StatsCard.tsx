import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  color,
}) => {
  return (
    <Paper
      sx={{
        flex: {
          xs: "1 1 100%",
          sm: "1 1 calc(50% - 12px)",
          md: "1 1 calc(33.333% - 16px)",
        },
        p: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          bgcolor: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};
