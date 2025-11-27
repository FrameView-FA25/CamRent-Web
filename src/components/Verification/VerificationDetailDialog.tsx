import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Paper,
  ImageList,
  ImageListItem,
} from "@mui/material";
import {
  X,
  Calendar,
  MapPin,
  User,
  Phone,
  Package,
  UserCheck,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Edit,
  UserPlus,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { Verification } from "../../types/verification.types";
import AssignStaffDialog from "./AssignStaffDialog";
import UpdateStatusDialog from "./UpdateStatusDialog";
import { useVerifications } from "../../hooks/useVerifications";

interface VerificationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  verification: Verification | null;
  onRefresh: () => void;
}

const VerificationDetailDialog: React.FC<VerificationDetailDialogProps> = ({
  open,
  onClose,
  verification,
  onRefresh,
}) => {
  const { staffList, assignStaff, updateStatus } = useVerifications();
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  if (!verification) return null;

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        color: string;
        bgColor: string;
        icon: React.ReactElement;
      }
    > = {
      pending: {
        label: "Chờ xử lý",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: <Clock size={16} />,
      },
      approved: {
        label: "Đã duyệt",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <CheckCircle size={16} />,
      },
      rejected: {
        label: "Từ chối",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <XCircle size={16} />,
      },
    };
    return (
      statusMap[status.toLowerCase()] || {
        label: status,
        color: colors.neutral[600],
        bgColor: colors.neutral[100],
        icon: <FileText size={16} />,
      }
    );
  };

  const getInspectionStatusIcon = (passed: boolean | null) => {
    if (passed === true)
      return <CheckCircle size={16} color={colors.status.success} />;
    if (passed === false)
      return <XCircle size={16} color={colors.status.error} />;
    return <Clock size={16} color={colors.neutral[400]} />;
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

  const handleAssignStaff = async (staffId: string) => {
    const success = await assignStaff(verification.id, staffId);
    if (success) {
      onRefresh();
      setOpenAssignDialog(false);
    }
    return success;
  };

  const handleUpdateStatus = async (status: string, note: string) => {
    const success = await updateStatus(verification.id, status, note);
    if (success) {
      onRefresh();
      setOpenUpdateDialog(false);
      onClose();
    }
    return success;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Chi tiết yêu cầu xác minh
              </Typography>
              <Chip
                icon={statusInfo.icon}
                label={statusInfo.label}
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
            <IconButton onClick={onClose}>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: colors.background.default,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Thông tin chung
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {/* Người yêu cầu */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <User size={16} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Người yêu cầu
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: colors.primary.lighter,
                        color: colors.primary.main,
                        fontSize: 14,
                      }}
                    >
                      {verification.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {verification.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Số điện thoại */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Phone size={16} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Số điện thoại
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {verification.phoneNumber}
                  </Typography>
                </Box>

                {/* Ngày kiểm tra */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Calendar size={16} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Ngày kiểm tra
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatDate(verification.inspectionDate)}
                  </Typography>
                </Box>

                {/* Nhân viên phụ trách */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <UserCheck size={16} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Nhân viên phụ trách
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
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

                {/* Chi nhánh */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Building2 size={16} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Chi nhánh
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {verification.branchName || "Chưa có"}
                  </Typography>
                </Box>

                {/* Địa chỉ - full width */}
                <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <MapPin size={16} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Địa chỉ
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {verification.address}
                  </Typography>
                </Box>

                {/* Ghi chú - full width */}
                {verification.notes && (
                  <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
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
                        variant="caption"
                        sx={{ color: colors.text.secondary, fontWeight: 600 }}
                      >
                        Ghi chú
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
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
              </Box>
            </Paper>

            {/* Items List */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: colors.background.default,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Danh sách sản phẩm ({verification.items.length})
              </Typography>
              <Stack spacing={1.5}>
                {verification.items.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      bgcolor: colors.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${colors.border.light}`,
                    }}
                  >
                    <Package size={20} color={colors.primary.main} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: colors.text.primary }}
                      >
                        {item.itemName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        ID: {item.itemId.slice(0, 13)}...
                      </Typography>
                    </Box>
                    <Chip
                      label={item.itemType}
                      size="small"
                      sx={{
                        bgcolor:
                          item.itemType === "Camera"
                            ? colors.primary.lighter
                            : colors.status.infoLight,
                        color:
                          item.itemType === "Camera"
                            ? colors.primary.main
                            : colors.status.info,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Inspections */}
            {verification.inspections &&
              verification.inspections.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: colors.background.default,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
                  >
                    Kết quả kiểm tra ({verification.inspections.length})
                  </Typography>
                  <Stack spacing={2}>
                    {verification.inspections.map((inspection) => (
                      <Paper
                        key={inspection.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: `1px solid ${colors.border.light}`,
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          {getInspectionStatusIcon(inspection.passed)}
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                color: colors.text.primary,
                                mb: 0.5,
                              }}
                            >
                              {inspection.itemName} - {inspection.section}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: colors.text.secondary }}
                            >
                              {inspection.itemType} • {inspection.label}
                            </Typography>
                          </Box>
                          <Chip
                            label={
                              inspection.passed === true
                                ? "Đạt"
                                : inspection.passed === false
                                ? "Không đạt"
                                : "Chưa kiểm tra"
                            }
                            size="small"
                            sx={{
                              bgcolor:
                                inspection.passed === true
                                  ? colors.status.successLight
                                  : inspection.passed === false
                                  ? colors.status.errorLight
                                  : colors.neutral[100],
                              color:
                                inspection.passed === true
                                  ? colors.status.success
                                  : inspection.passed === false
                                  ? colors.status.error
                                  : colors.text.secondary,
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.secondary,
                                fontWeight: 600,
                              }}
                            >
                              Giá trị
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.primary }}
                            >
                              {inspection.value}
                            </Typography>
                          </Box>
                          {inspection.notes && (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.secondary,
                                  fontWeight: 600,
                                }}
                              >
                                Ghi chú
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text.primary }}
                              >
                                {inspection.notes}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Media */}
                        {inspection.media && inspection.media.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.secondary,
                                fontWeight: 600,
                                display: "block",
                                mb: 1,
                              }}
                            >
                              Hình ảnh ({inspection.media.length})
                            </Typography>
                            <ImageList cols={3} gap={8}>
                              {inspection.media.map((media) => (
                                <ImageListItem key={media.id}>
                                  <img
                                    src={media.url}
                                    alt={media.label}
                                    loading="lazy"
                                    style={{
                                      borderRadius: 8,
                                      objectFit: "cover",
                                    }}
                                  />
                                </ImageListItem>
                              ))}
                            </ImageList>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UserPlus size={18} />}
            onClick={() => setOpenAssignDialog(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Phân công nhân viên
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit size={18} />}
            onClick={() => setOpenUpdateDialog(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cập nhật trạng thái
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Staff Dialog */}
      <AssignStaffDialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        staffList={staffList}
        onAssign={handleAssignStaff}
      />

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        verification={verification}
        onUpdate={handleUpdateStatus}
      />
    </>
  );
};

export default VerificationDetailDialog;
