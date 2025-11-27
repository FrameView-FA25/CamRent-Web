import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { colors } from "../../theme/colors";
import InspectionListItem from "./InspectionListItem";
import type { Verification } from "../../types/verification.types";

interface VerificationListItemProps {
  verification: Verification;
  onViewDetails: (verification: Verification) => void;
  onRefresh?: () => void;
}

const VerificationListItem: React.FC<VerificationListItemProps> = ({
  verification,
  onViewDetails,
  onRefresh,
}) => {
  const [showInspections, setShowInspections] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusInfo = () => {
    switch (verification.status) {
      case "Approved":
        return {
          label: "Đã duyệt",
          color: colors.status.success,
          bgcolor: colors.status.successLight,
          icon: <CheckCircle size={16} />,
        };
      case "Rejected":
        return {
          label: "Từ chối",
          color: colors.status.error,
          bgcolor: colors.status.errorLight,
          icon: <XCircle size={16} />,
        };
      default:
        return {
          label: "Chờ xử lý",
          color: colors.status.warning,
          bgcolor: colors.status.warningLight,
          icon: <Clock size={16} />,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const hasInspections =
    verification.inspections && verification.inspections.length > 0;
  const pendingInspections =
    verification.inspections?.filter((i) => !i.passed) || [];
  const approvedInspections =
    verification.inspections?.filter((i) => i.passed) || [];

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${colors.border.light}`,
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 2,
          borderColor: colors.border.main,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {verification.name}
                </Typography>
                <Chip
                  icon={statusInfo.icon}
                  label={statusInfo.label}
                  size="small"
                  sx={{
                    bgcolor: statusInfo.bgcolor,
                    color: statusInfo.color,
                    fontWeight: 600,
                    "& .MuiChip-icon": {
                      color: statusInfo.color,
                    },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Phone size={16} color={colors.text.secondary} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    {verification.phoneNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MapPin size={16} color={colors.text.secondary} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    {verification.address}
                  </Typography>
                </Box>
                {verification.branchName && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Building2 size={16} color={colors.text.secondary} />
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      {verification.branchName}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Calendar size={16} color={colors.text.secondary} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    {formatDate(verification.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Button
              variant="outlined"
              startIcon={<Eye size={18} />}
              onClick={() => onViewDetails(verification)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: colors.border.main,
                color: colors.text.primary,
                "&:hover": {
                  borderColor: colors.primary.main,
                  bgcolor: colors.primary.lighter,
                },
              }}
            >
              Xem chi tiết
            </Button>
          </Box>

          {/* Inspections Section */}
          {hasInspections && (
            <>
              <Divider />
              <Box>
                <Button
                  fullWidth
                  onClick={() => setShowInspections(!showInspections)}
                  endIcon={
                    showInspections ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )
                  }
                  sx={{
                    justifyContent: "space-between",
                    textTransform: "none",
                    color: colors.text.primary,
                    bgcolor: colors.background.default,
                    p: 1.5,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: colors.neutral[100],
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ClipboardList size={20} color={colors.text.secondary} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Danh sách Inspections ({verification.inspections?.length})
                    </Typography>
                    {pendingInspections.length > 0 && (
                      <Chip
                        label={`${pendingInspections.length} chưa duyệt`}
                        size="small"
                        sx={{
                          height: 20,
                          bgcolor: colors.status.warningLight,
                          color: colors.status.warning,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    {approvedInspections.length > 0 && (
                      <Chip
                        label={`${approvedInspections.length} đã duyệt`}
                        size="small"
                        sx={{
                          height: 20,
                          bgcolor: colors.status.successLight,
                          color: colors.status.success,
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </Button>

                <Collapse in={showInspections}>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {verification.inspections?.map((inspection) => (
                      <InspectionListItem
                        key={inspection.id}
                        inspection={inspection}
                        verificationId={verification.id}
                        onApprove={onRefresh}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VerificationListItem;
