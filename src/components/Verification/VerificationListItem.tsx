import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Avatar,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Package,
  UserCheck,
  Building2,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { Verification } from "../../types/verification.types";

interface VerificationListItemProps {
  verification: Verification;
  onViewDetails: (verification: Verification) => void;
  onRefresh: () => void;
}

const VerificationListItem: React.FC<VerificationListItemProps> = ({
  verification,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; bgColor: string }
    > = {
      pending: {
        label: "Chờ xử lý",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
      },
      approved: {
        label: "Đã duyệt",
        color: colors.status.success,
        bgColor: colors.status.successLight,
      },
      rejected: {
        label: "Từ chối",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
      },
    };
    return (
      statusMap[status.toLowerCase()] || {
        label: status,
        color: colors.neutral[600],
        bgColor: colors.neutral[100],
      }
    );
  };

  const statusInfo = getStatusInfo(verification.status);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${colors.border.light}`,
        overflow: "hidden",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: colors.primary.main,
        },
      }}
    >
      {/* Collapsed View - Basic Info */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          bgcolor: expanded ? colors.neutral[50] : "transparent",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: colors.primary.lighter,
            color: colors.primary.main,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {verification.name.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: colors.text.primary }}
            >
              {verification.name}
            </Typography>
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{
                bgcolor: statusInfo.bgColor,
                color: statusInfo.color,
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Phone size={14} color={colors.text.secondary} />
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {verification.phoneNumber}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Building2 size={14} color={colors.text.secondary} />
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {verification.branchName || "Chưa có chi nhánh"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Package size={14} color={colors.text.secondary} />
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {verification.items.length} sản phẩm
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton
          sx={{
            color: colors.text.secondary,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      {/* Expanded View - More Details */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 3, bgcolor: colors.background.paper }}>
          <Stack spacing={2.5}>
            {/* Inspection Date & Staff */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Calendar size={16} color={colors.text.secondary} />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, fontWeight: 600 }}
                  >
                    Ngày kiểm tra
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: colors.text.primary }}>
                  {formatDate(verification.inspectionDate)}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <UserCheck size={16} color={colors.text.secondary} />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, fontWeight: 600 }}
                  >
                    Nhân viên phụ trách
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: colors.text.primary }}>
                  {verification.staffName || (
                    <Chip
                      label="Chưa phân công"
                      size="small"
                      sx={{
                        bgcolor: colors.status.warningLight,
                        color: colors.status.warning,
                      }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Address */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <MapPin size={16} color={colors.text.secondary} />
                <Typography
                  variant="caption"
                  sx={{ color: colors.text.secondary, fontWeight: 600 }}
                >
                  Địa chỉ
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.text.primary }}>
                {verification.address}
              </Typography>
            </Box>

            {/* Items List */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.text.secondary,
                  fontWeight: 600,
                  display: "block",
                  mb: 1,
                }}
              >
                Danh sách sản phẩm cần kiểm tra
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {verification.items.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.itemName} (${item.itemType})`}
                    size="small"
                    icon={<Package size={14} />}
                    sx={{
                      bgcolor: colors.neutral[50],
                      color: colors.text.primary,
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Inspections Summary */}
            {verification.inspections.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Kết quả kiểm tra
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Chip
                    label={`${
                      verification.inspections.filter((i) => i.passed === true)
                        .length
                    } Đạt`}
                    size="small"
                    sx={{
                      bgcolor: colors.status.successLight,
                      color: colors.status.success,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`${
                      verification.inspections.filter((i) => i.passed === false)
                        .length
                    } Không đạt`}
                    size="small"
                    sx={{
                      bgcolor: colors.status.errorLight,
                      color: colors.status.error,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`${
                      verification.inspections.filter((i) => i.passed === null)
                        .length
                    } Chưa kiểm tra`}
                    size="small"
                    sx={{
                      bgcolor: colors.neutral[100],
                      color: colors.text.secondary,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Notes */}
            {verification.notes && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Ghi chú
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.primary,
                    bgcolor: colors.neutral[50],
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  {verification.notes}
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
              <Button
                variant="contained"
                startIcon={<Eye size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(verification);
                }}
                sx={{
                  bgcolor: colors.primary.main,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: colors.primary.dark,
                  },
                }}
              >
                Xem chi tiết đầy đủ
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default VerificationListItem;
