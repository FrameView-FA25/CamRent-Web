import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Stack,
} from "@mui/material";
import {
  MoreVert,
  Warning,
  Error as ErrorIcon,
  Info as InfoIcon,
  Camera,
  AccessTime,
} from "@mui/icons-material";
import type { IssueReport } from "@/types/issueReport.types";
import { formatDate } from "../../../../utils/booking.utils";

interface IssueReportCardProps {
  report: IssueReport;
  onMenuClick: (
    event: React.MouseEvent<HTMLElement>,
    report: IssueReport
  ) => void;
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        label: "Nghiêm trọng",
        color: "#DC2626",
        bgcolor: "#FEE2E2",
        icon: <ErrorIcon sx={{ fontSize: 18 }} />,
      };
    case "major":
      return {
        label: "Quan trọng",
        color: "#F97316",
        bgcolor: "#FFEDD5",
        icon: <Warning sx={{ fontSize: 18 }} />,
      };
    case "minor":
      return {
        label: "Nhỏ",
        color: "#3B82F6",
        bgcolor: "#DBEAFE",
        icon: <InfoIcon sx={{ fontSize: 18 }} />,
      };
    default:
      return {
        label: severity,
        color: "#6B7280",
        bgcolor: "#F3F4F6",
        icon: <InfoIcon sx={{ fontSize: 18 }} />,
      };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "open":
      return { label: "Đang mở", color: "warning" as const };
    case "in_progress":
      return { label: "Đang xử lý", color: "info" as const };
    case "resolved":
      return { label: "Đã giải quyết", color: "success" as const };
    case "closed":
      return { label: "Đã đóng", color: "default" as const };
    default:
      return { label: status, color: "default" as const };
  }
};

export const IssueReportCard: React.FC<IssueReportCardProps> = ({
  report,
  onMenuClick,
}) => {
  const severityConfig = getSeverityConfig(report.severity);
  const statusConfig = getStatusConfig(report.status);

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: severityConfig.color,
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1F2937" }}
              >
                {report.title}
              </Typography>
              <Chip
                icon={severityConfig.icon}
                label={severityConfig.label}
                size="small"
                sx={{
                  bgcolor: severityConfig.bgcolor,
                  color: severityConfig.color,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: 24,
                  "& .MuiChip-icon": {
                    color: severityConfig.color,
                  },
                }}
              />
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
                sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }}
              />
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}
            >
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: "#1F2937" }}
                >
                  {report.reporterName}
                </Box>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 14, color: "#9CA3AF" }} />
                <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                  {formatDate(report.createdAt)}
                </Typography>
              </Box>
            </Box>

            {/* Devices */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {report.devices.map((device, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    bgcolor: "#F9FAFB",
                    borderRadius: 1.5,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "#FFF7ED",
                      color: "#F97316",
                    }}
                  >
                    <Camera sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                    >
                      {device.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", fontSize: "0.7rem" }}
                    >
                      SN: {device.serialNumber}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(e, report);
            }}
            sx={{
              color: "#6B7280",
              "&:hover": {
                color: "#F97316",
                bgcolor: "#FFF7ED",
              },
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Booking Info */}
        <Box
          sx={{
            pt: 1.5,
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
            Mã đơn: {report.bookingCode || report.bookingId.substring(0, 8)}...
          </Typography>
          <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
            ID: {report.id.substring(0, 8)}...
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
