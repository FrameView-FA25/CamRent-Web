import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Switch,
} from "@mui/material";
import { Eye, Edit } from "lucide-react";
import type { Accessory } from "../../types/product.types";
import { colors } from "../../theme/colors";

interface AccessoryTableProps {
  accessories: Accessory[];
  onView: (accessory: Accessory) => void;
  onEdit: (accessory: Accessory) => void;
  onToggleAvailability: (accessory: Accessory) => void;
}

export const AccessoryTable: React.FC<AccessoryTableProps> = ({
  accessories,
  onView,
  onEdit,
  onToggleAvailability,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusChip = (isConfirmed: boolean) => {
    if (!isConfirmed) {
      return (
        <Chip
          label="Chưa xác minh"
          size="small"
          sx={{
            bgcolor: colors.status.warningLight,
            color: colors.status.warning,
            fontWeight: 600,
          }}
        />
      );
    }
    return (
      <Chip
        label="Đã xác minh"
        size="small"
        sx={{
          bgcolor: colors.status.successLight,
          color: colors.status.success,
          fontWeight: 600,
        }}
      />
    );
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
              Hình ảnh
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
              Thông tin
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
              Serial Number
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
              Giá thuê/ngày
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
              Trạng thái xác minh
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
              Còn hàng
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, color: colors.text.primary }}
              align="center"
            >
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accessories.map((accessory) => {
            const imageUrl =
              accessory.media && accessory.media.length > 0
                ? accessory.media[0].url
                : null;

            return (
              <TableRow
                key={accessory.id}
                sx={{
                  "&:hover": { bgcolor: colors.neutral[50] },
                }}
              >
                <TableCell>
                  <Avatar
                    src={imageUrl || undefined}
                    variant="rounded"
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: colors.neutral[100],
                    }}
                  >
                    {!imageUrl && accessory.brand?.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {accessory.brand} {accessory.model}
                    </Typography>
                    {accessory.variant && (
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        {accessory.variant}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: colors.text.secondary,
                    }}
                  >
                    {accessory.serialNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.primary.main }}
                  >
                    {formatCurrency(accessory.baseDailyRate)}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(accessory.isConfirmed)}</TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      accessory.isAvailable ? "Đang có sẵn" : "Không có sẵn"
                    }
                  >
                    <Switch
                      checked={accessory.isAvailable}
                      onChange={() => onToggleAvailability(accessory)}
                      color="success"
                      size="small"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                  >
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        onClick={() => onView(accessory)}
                        sx={{
                          color: colors.neutral[600],
                          "&:hover": { bgcolor: colors.neutral[100] },
                        }}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(accessory)}
                        sx={{
                          color: colors.primary.main,
                          "&:hover": { bgcolor: colors.primary.lighter },
                        }}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
