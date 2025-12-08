import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";
type ProductWithStatus = {
  isConfirmed: boolean;
};

interface ProductStatsProps {
  items: ProductWithStatus[];
  total: number;
}

const ProductStats: React.FC<ProductStatsProps> = ({ items, total }) => {
  const stats = [
    {
      icon: <SearchIcon sx={{ fontSize: 32 }} />,
      count: total,
      label: "Tổng sản phẩm",
      bgColor: colors.primary.lighter,
      iconColor: colors.primary.main,
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      count: items.filter((c) => c.isConfirmed).length,
      label: "Đã xác minh",
      bgColor: colors.status.successLight,
      iconColor: colors.status.success,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        mb: 4,
        flexWrap: "wrap",
      }}
    >
      {stats.map((stat, index) => (
        <Box
          key={index}
          sx={{
            flex: {
              xs: "1 1 calc(50% - 12px)",
              sm: "1 1 calc(25% - 18px)",
            },
            minWidth: 0,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${colors.border.light}`,
              bgcolor: colors.background.paper,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.iconColor,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: colors.text.primary,
                    mb: 0.5,
                  }}
                >
                  {stat.count}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary, fontSize: 14 }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ProductStats;
