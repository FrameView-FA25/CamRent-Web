import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Star,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { colors } from "../../theme/colors";
import type { ContractTemplate } from "../../types/contract.types";

interface ContractTemplateListProps {
  templates: ContractTemplate[];
  onView: (template: ContractTemplate) => void;
  onEdit: (template: ContractTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const ContractTemplateList: React.FC<ContractTemplateListProps> = ({
  templates,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {templates.map((template) => (
        <ContractTemplateItem
          key={template.id}
          template={template}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </Box>
  );
};

interface ContractTemplateItemProps {
  template: ContractTemplate;
  onView: (template: ContractTemplate) => void;
  onEdit: (template: ContractTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const ContractTemplateItem: React.FC<ContractTemplateItemProps> = ({
  template,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    });
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${colors.border.light}`,
          transition: "all 0.2s",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderColor: colors.primary.main,
          },
        }}
        onClick={() => onView(template)}
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: colors.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {template.templateName}
                  {template.isDefault && (
                    <Star
                      size={18}
                      fill={colors.status.warning}
                      color={colors.status.warning}
                    />
                  )}
                </Typography>
                <Chip
                  label={typeInfo.label}
                  size="small"
                  sx={{
                    bgcolor: typeInfo.bgColor,
                    color: typeInfo.color,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
                <Chip
                  label={statusInfo.label}
                  size="small"
                  sx={{
                    bgcolor: statusInfo.bgColor,
                    color: statusInfo.color,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {template.description}
              </Typography>

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Hash size={14} color={colors.text.secondary} />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    {template.templateCode}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <User size={14} color={colors.text.secondary} />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    {template.createdBy}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Calendar size={14} color={colors.text.secondary} />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    Cập nhật: {formatDate(template.updatedAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Copy size={14} color={colors.text.secondary} />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    {template.usageCount} lượt sử dụng
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleClick(e);
              }}
              sx={{
                color: colors.text.secondary,
                "&:hover": {
                  bgcolor: colors.neutral[100],
                },
              }}
            >
              <MoreVertical size={20} />
            </IconButton>
          </Box>

          {/* Clause Preview */}
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${colors.border.light}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 600,
                display: "block",
                mb: 1,
              }}
            >
              Điều khoản ({template.clauses.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {template.clauses.slice(0, 3).map((clause) => (
                <Chip
                  key={clause.id}
                  label={clause.title}
                  size="small"
                  sx={{
                    bgcolor: colors.neutral[50],
                    color: colors.text.primary,
                    fontWeight: 500,
                    fontSize: 11,
                  }}
                />
              ))}
              {template.clauses.length > 3 && (
                <Chip
                  label={`+${template.clauses.length - 3} điều khoản`}
                  size="small"
                  sx={{
                    bgcolor: colors.primary.lighter,
                    color: colors.primary.main,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            onView(template);
          }}
        >
          <ListItemIcon>
            <Eye size={18} />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            onEdit(template);
          }}
        >
          <ListItemIcon>
            <Edit size={18} />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            onDuplicate(template.id);
          }}
        >
          <ListItemIcon>
            <Copy size={18} />
          </ListItemIcon>
          <ListItemText>Nhân bản</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            onDelete(template.id);
          }}
          sx={{
            color: colors.status.error,
            "& .MuiListItemIcon-root": {
              color: colors.status.error,
            },
          }}
        >
          <ListItemIcon>
            <Trash2 size={18} />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ContractTemplateList;
