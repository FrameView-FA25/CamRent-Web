import React from "react";
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import {
  MoreVertical,
  Clock,
  Calendar,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Camera,
  Package,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { Verification } from "../../types/verification.types";

interface VerificationCardProps {
  verification: Verification;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({
  verification,
  onMenuOpen,
}) => {
  const getStatusInfo = (status: Verification["status"]) => {
    const statusMap = {
      Pending: {
        label: "Pending",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: <Clock size={16} />,
      },
      "in-progress": {
        label: "In Progress",
        color: colors.accent.blue,
        bgColor: colors.accent.blueLight,
        icon: <Clock size={16} />,
      },
      approved: {
        label: "Approved",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <Clock size={16} />,
      },
      rejected: {
        label: "Rejected",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <Clock size={16} />,
      },
      completed: {
        label: "Completed",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <Clock size={16} />,
      },
      cancelled: {
        label: "Cancelled",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <Clock size={16} />,
      },
    };
    return statusMap[status];
  };

  const getItemTypeLabel = (itemType: string) => {
    return itemType === "1" || itemType === "Camera" ? "Camera" : "Accessory";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusInfo = getStatusInfo(verification.status);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.border.light}`,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border.light}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: colors.primary.main,
              width: 40,
              height: 40,
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            {verification.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              sx={{ fontWeight: 700, color: colors.text.primary }}
            >
              {verification.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              ID: {verification.id.slice(0, 8)}...
            </Typography>
          </Box>
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            size="small"
            sx={{
              bgcolor: statusInfo.bgColor,
              color: statusInfo.color,
              fontWeight: 600,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Box>

        <IconButton size="small" onClick={onMenuOpen}>
          <MoreVertical size={18} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {/* Phone */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Phone
              size={20}
              color={colors.text.secondary}
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary, display: "block" }}
              >
                Phone Number
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.phoneNumber}
              </Typography>
            </Box>
          </Box>

          {/* Inspection Date */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Calendar
              size={20}
              color={colors.primary.main}
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary, display: "block" }}
              >
                Inspection Date
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {formatDateTime(verification.inspectionDate)}
              </Typography>
            </Box>
          </Box>

          {/* Branch */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <MapPin
              size={20}
              color={colors.accent.blue}
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary, display: "block" }}
              >
                Branch
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.branchName}
              </Typography>
            </Box>
          </Box>

          {/* Staff */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <User
              size={20}
              color={colors.accent.purple}
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary, display: "block" }}
              >
                Assigned Staff
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.staffName || "Not assigned"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Items List */}
        {verification.items && verification.items.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: colors.background.paper,
              borderRadius: 2,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                display: "block",
                mb: 1.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Requested Items ({verification.items.length})
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {verification.items.map((item) => (
                <Box
                  key={item.itemId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: colors.neutral[50],
                    borderRadius: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor:
                        item.itemType === "1" || item.itemType === "Camera"
                          ? colors.primary.lighter
                          : colors.accent.blueLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.itemType === "1" || item.itemType === "Camera" ? (
                      <Camera size={18} color={colors.primary.main} />
                    ) : (
                      <Package size={18} color={colors.accent.blue} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      {item.itemName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      {getItemTypeLabel(item.itemType)}
                    </Typography>
                  </Box>
                  <Chip
                    label={getItemTypeLabel(item.itemType)}
                    size="small"
                    sx={{
                      bgcolor:
                        item.itemType === "1" || item.itemType === "Camera"
                          ? colors.primary.lighter
                          : colors.accent.blueLight,
                      color:
                        item.itemType === "1" || item.itemType === "Camera"
                          ? colors.primary.main
                          : colors.accent.blue,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Address */}
        {verification.address && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: colors.neutral[50],
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: colors.text.secondary, display: "block", mb: 0.5 }}
            >
              Address
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: colors.text.primary }}
            >
              {verification.address}
            </Typography>
          </Box>
        )}

        {/* Notes */}
        {verification.notes && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: colors.status.infoLight,
              borderRadius: 2,
              display: "flex",
              gap: 1.5,
            }}
          >
            <AlertCircle
              size={20}
              color={colors.status.info}
              style={{ flexShrink: 0 }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.text.secondary,
                  display: "block",
                  mb: 0.5,
                }}
              >
                Notes
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.primary }}>
                {verification.notes}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default VerificationCard;
