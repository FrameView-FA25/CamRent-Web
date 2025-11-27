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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import { colors } from "../../theme/colors";
import { approveInspection } from "../../services/inspection.service"; // ✅ Import từ service có sẵn
import { toast } from "react-toastify";
import type { Inspection } from "../../types/verification.types";

interface InspectionListItemProps {
  inspection: Inspection;
  verificationId: string;
  onApprove?: () => void;
}

const InspectionListItem: React.FC<InspectionListItemProps> = ({
  inspection,
  onApprove,
}) => {
  const [approving, setApproving] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async () => {
    try {
      setApproving(true);

      // ✅ Sử dụng function từ inspection.service.ts
      await approveInspection(inspection.id, true);

      toast.success("Duyệt inspection thành công!");
      setOpenConfirmDialog(false);
      onApprove?.(); // Refresh data
    } catch (error: any) {
      console.error("Error approving inspection:", error);
      toast.error(error.message || "Không thể duyệt inspection");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setApproving(true);

      // ✅ Từ chối inspection
      await approveInspection(inspection.id, false);

      toast.success("Từ chối inspection thành công!");
      setOpenConfirmDialog(false);
      onApprove?.();
    } catch (error: any) {
      console.error("Error rejecting inspection:", error);
      toast.error(error.message || "Không thể từ chối inspection");
    } finally {
      setApproving(false);
    }
  };

  const getStatusInfo = () => {
    if (inspection.passed) {
      return {
        label: "Đã duyệt",
        color: colors.status.success,
        bgcolor: colors.status.successLight,
        icon: <CheckCircle size={16} />,
      };
    }
    return {
      label: "Chưa duyệt",
      color: colors.status.warning,
      bgcolor: colors.status.warningLight,
      icon: <Clock size={16} />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <>
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
                    Inspection #{inspection.id.slice(0, 8)}
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

                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <User size={16} color={colors.text.secondary} />
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      {inspection.inspectorName || "Unknown Inspector"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Calendar size={16} color={colors.text.secondary} />
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      {formatDate(inspection.inspectionDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons */}
              {!inspection.passed ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={
                      approving ? (
                        <CircularProgress size={16} />
                      ) : (
                        <XCircle size={18} />
                      )
                    }
                    onClick={handleReject}
                    disabled={approving}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: colors.status.error,
                      color: colors.status.error,
                      "&:hover": {
                        borderColor: colors.status.error,
                        bgcolor: colors.status.errorLight,
                      },
                      "&:disabled": {
                        borderColor: colors.neutral[200],
                        color: colors.neutral[400],
                      },
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      approving ? (
                        <CircularProgress size={16} sx={{ color: "white" }} />
                      ) : (
                        <CheckCircle size={18} />
                      )
                    }
                    onClick={() => setOpenConfirmDialog(true)}
                    disabled={approving}
                    sx={{
                      bgcolor: colors.status.success,
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: colors.status.success,
                      },
                      "&:disabled": {
                        bgcolor: colors.neutral[200],
                        color: colors.neutral[400],
                      },
                    }}
                  >
                    Duyệt
                  </Button>
                </Stack>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: colors.status.successLight,
                    borderRadius: 2,
                  }}
                >
                  <CheckCircle size={18} color={colors.status.success} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.status.success, fontWeight: 600 }}
                  >
                    Đã được duyệt
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Notes */}
            {inspection.notes && (
              <>
                <Divider />
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <FileText size={16} color={colors.text.secondary} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.text.secondary }}
                    >
                      Ghi chú:
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.primary,
                      bgcolor: colors.background.default,
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    {inspection.notes}
                  </Typography>
                </Box>
              </>
            )}

            {/* Images */}
            {inspection.images && inspection.images.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.secondary,
                      mb: 1,
                    }}
                  >
                    Hình ảnh inspection:
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(100px, 1fr))",
                      gap: 1,
                    }}
                  >
                    {inspection.images.map((img, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={img}
                        alt={`Inspection ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: `1px solid ${colors.border.light}`,
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Confirm Approve Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !approving && setOpenConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AlertCircle size={24} color={colors.status.warning} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Xác nhận duyệt inspection
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.text.primary }}>
            Bạn có chắc chắn muốn duyệt inspection này không? Hành động này
            không thể hoàn tác.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: colors.background.default,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Inspection ID:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {inspection.id}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            disabled={approving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: colors.text.secondary,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approving}
            variant="contained"
            startIcon={
              approving ? (
                <CircularProgress size={16} sx={{ color: "white" }} />
              ) : (
                <CheckCircle size={18} />
              )
            }
            sx={{
              bgcolor: colors.status.success,
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                bgcolor: colors.status.success,
              },
            }}
          >
            {approving ? "Đang xử lý..." : "Xác nhận duyệt"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InspectionListItem;
