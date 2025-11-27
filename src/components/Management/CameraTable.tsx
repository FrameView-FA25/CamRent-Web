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
import type { Camera } from "../../types/product.types";
import { colors } from "../../theme/colors";

interface CameraTableProps {
  cameras: Camera[];
  onView: (camera: Camera) => void;
  onEdit: (camera: Camera) => void;
  onToggleAvailability: (camera: Camera) => void;
}

export const CameraTable: React.FC<CameraTableProps> = ({
  cameras,
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
          {cameras.map((camera) => {
            const imageUrl =
              camera.media && camera.media.length > 0
                ? camera.media[0].url
                : null;

            return (
              <TableRow
                key={camera.id}
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
                    {!imageUrl && camera.brand?.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {camera.brand} {camera.model}
                    </Typography>
                    {camera.variant && (
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        {camera.variant}
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
                    {camera.serialNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.primary.main }}
                  >
                    {formatCurrency(camera.baseDailyRate)}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(camera.isConfirmed)}</TableCell>
                <TableCell>
                  <Tooltip
                    title={camera.isAvailable ? "Đang có sẵn" : "Không có sẵn"}
                  >
                    <Switch
                      checked={camera.isAvailable}
                      onChange={() => onToggleAvailability(camera)}
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
                        onClick={() => onView(camera)}
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
                        onClick={() => onEdit(camera)}
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
