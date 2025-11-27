import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import {
  FileText,
  CheckCircle,
  FileClock,
  XCircle,
  TrendingUp,
  Copy,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { ContractTemplate } from "../../types/contract.types";

interface ContractTemplateStatsProps {
  templates: ContractTemplate[];
}

const ContractTemplateStats: React.FC<ContractTemplateStatsProps> = ({
  templates,
}) => {
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter((t) => t.status === "Active").length;
  const draftTemplates = templates.filter((t) => t.status === "Draft").length;
  const defaultTemplates = templates.filter((t) => t.isDefault).length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const rentalTemplates = templates.filter(
    (t) => t.templateType === "Rental"
  ).length;

  const stats = [
    {
      label: "Tổng mẫu",
      value: totalTemplates,
      icon: <FileText size={24} />,
      color: colors.primary.main,
      bgColor: colors.primary.lighter,
    },
    {
      label: "Đang sử dụng",
      value: activeTemplates,
      icon: <CheckCircle size={24} />,
      color: colors.status.success,
      bgColor: colors.status.successLight,
    },
    {
      label: "Bản nháp",
      value: draftTemplates,
      icon: <FileClock size={24} />,
      color: colors.status.warning,
      bgColor: colors.status.warningLight,
    },
    {
      label: "Mẫu mặc định",
      value: defaultTemplates,
      icon: <XCircle size={24} />,
      color: colors.status.info,
      bgColor: colors.status.infoLight,
    },
    {
      label: "Thuê / Ký gửi",
      value: `${rentalTemplates}/${templates.length - rentalTemplates}`,
      icon: <Copy size={24} />,
      color: colors.neutral[600],
      bgColor: colors.neutral[100],
    },
    {
      label: "Lượt sử dụng",
      value: totalUsage,
      icon: <TrendingUp size={24} />,
      color: colors.status.error,
      bgColor: colors.status.errorLight,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(6, 1fr)",
        },
        gap: 2,
        mb: 3,
      }}
    >
      {stats.map((stat, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${colors.border.light}`,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Stack spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: stat.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
              }}
            >
              {stat.icon}
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: colors.text.primary,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, fontWeight: 500 }}
              >
                {stat.label}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
};

export default ContractTemplateStats;
