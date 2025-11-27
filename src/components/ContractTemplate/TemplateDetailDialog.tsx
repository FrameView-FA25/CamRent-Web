import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import {
  X,
  Download,
  Edit,
  Copy,
  Star,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { ContractTemplate } from "../../types/contract.types";

interface TemplateDetailDialogProps {
  open: boolean;
  onClose: () => void;
  template: ContractTemplate | null;
}

const TemplateDetailDialog: React.FC<TemplateDetailDialogProps> = ({
  open,
  onClose,
  template,
}) => {
  if (!template) return null;

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; bgColor: string }
    > = {
      Active: {
        label: "Đang dùng",
        color: colors.status.success,
        bgColor: colors.status.successLight,
      },
      Draft: {
        label: "Nháp",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
      },
      Inactive: {
        label: "Không dùng",
        color: colors.neutral[600],
        bgColor: colors.neutral[100],
      },
    };
    return statusMap[status] || statusMap.Active;
  };

  const getTypeInfo = (type: string) => {
    return type === "Rental"
      ? {
          label: "Hợp đồng thuê",
          color: colors.primary.main,
          bgColor: colors.primary.lighter,
        }
      : {
          label: "Hợp đồng ký gửi",
          color: colors.status.info,
          bgColor: colors.status.infoLight,
        };
  };

  const statusInfo = getStatusInfo(template.status);
  const typeInfo = getTypeInfo(template.templateType);

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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {template.templateName}
              </Typography>
              {template.isDefault && (
                <Star
                  size={20}
                  fill={colors.status.warning}
                  color={colors.status.warning}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={typeInfo.label}
                size="small"
                sx={{
                  bgcolor: typeInfo.bgColor,
                  color: typeInfo.color,
                  fontWeight: 600,
                }}
              />
              <Chip
                label={statusInfo.label}
                size="small"
                sx={{
                  bgcolor: statusInfo.bgColor,
                  color: statusInfo.color,
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, fontWeight: 600 }}
              >
                {template.templateCode}
              </Typography>
            </Box>
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
              Thông tin cơ bản
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Mô tả
                </Typography>
                <Typography variant="body1" sx={{ color: colors.text.primary }}>
                  {template.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Hash size={14} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Mã mẫu
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {template.templateCode}
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <User size={14} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Người tạo
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {template.createdBy}
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Calendar size={14} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Ngày tạo
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatDate(template.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Calendar size={14} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Cập nhật
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatDate(template.updatedAt)}
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Copy size={14} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, fontWeight: 600 }}
                    >
                      Lượt sử dụng
                    </Typography>
                  </Box>
                  <Chip
                    label={template.usageCount}
                    size="small"
                    sx={{
                      bgcolor: colors.status.infoLight,
                      color: colors.status.info,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Contract Preview */}
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
              Nội dung hợp đồng
            </Typography>

            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: colors.text.primary,
                  textTransform: "uppercase",
                }}
              >
                {template.title}
              </Typography>
            </Box>

            {/* Introduction */}
            {template.introduction && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.text.primary,
                    whiteSpace: "pre-line",
                    lineHeight: 1.8,
                  }}
                >
                  {template.introduction}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Clauses */}
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
              >
                Các điều khoản ({template.clauses.length})
              </Typography>
              <Stack spacing={3}>
                {template.clauses.map((clause, index) => (
                  <Paper
                    key={clause.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: colors.neutral[50],
                      borderRadius: 2,
                      border: `1px solid ${colors.border.light}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: typeInfo.bgColor,
                          color: typeInfo.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: colors.text.primary,
                          textTransform: "uppercase",
                        }}
                      >
                        {clause.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.primary,
                        whiteSpace: "pre-line",
                        lineHeight: 1.8,
                        ml: 5,
                      }}
                    >
                      {clause.content}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>

            {/* Conclusion */}
            {template.conclusion && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.text.primary,
                      whiteSpace: "pre-line",
                      lineHeight: 1.8,
                      fontStyle: "italic",
                    }}
                  >
                    {template.conclusion}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>

          {/* Signature Section Preview */}
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
              Phần ký kết
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 4,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 1, color: colors.text.primary }}
                >
                  {template.templateType === "Rental"
                    ? "BÊN CHO THUÊ (BÊN A)"
                    : "NỀN TẢNG (BÊN A)"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.text.secondary, fontStyle: "italic" }}
                >
                  (Ký và ghi rõ họ tên)
                </Typography>
                <Box sx={{ mt: 8 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.secondary }}
                  >
                    _____________________
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 1, color: colors.text.primary }}
                >
                  {template.templateType === "Rental"
                    ? "BÊN THUÊ (BÊN B)"
                    : "CHỦ SỞ HỮU (BÊN B)"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.text.secondary, fontStyle: "italic" }}
                >
                  (Ký và ghi rõ họ tên)
                </Typography>
                <Box sx={{ mt: 8 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.secondary }}
                  >
                    _____________________
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Download size={18} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Xuất PDF mẫu
        </Button>
        <Button
          variant="outlined"
          startIcon={<Edit size={18} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Chỉnh sửa
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
  );
};

export default TemplateDetailDialog;
