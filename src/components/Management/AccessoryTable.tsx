import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import type { Accessory } from "../../types/accessory.types";
import { colors } from "../../theme/colors";

interface AccessoryTableProps {
  accessories: Accessory[];
  onView: (accessory: Accessory) => void;
  onEdit: (accessory: Accessory) => void;
  onDelete: (accessory: Accessory) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const AccessoryTable: React.FC<AccessoryTableProps> = ({
  accessories,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={{ fontWeight: 700 }}>Hình ảnh</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Thương hiệu</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Serial Number</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Giá thuê/ngày</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Giá trị ước tính</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Đặt cọc (%)</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accessories.map((accessory) => (
            <TableRow
              key={accessory.id}
              sx={{
                "&:hover": { bgcolor: colors.neutral[50] },
                transition: "background-color 0.2s",
              }}
            >
              <TableCell>
                <Avatar
                  variant="rounded"
                  src={accessory.media[0]?.url}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: colors.neutral[200],
                  }}
                >
                  🎒
                </Avatar>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {accessory.brand}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{accessory.model}</Typography>
                {accessory.variant && (
                  <Typography variant="caption" color="text.secondary">
                    {accessory.variant}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {accessory.serialNumber ? (
                  <Chip
                    label={accessory.serialNumber}
                    size="small"
                    sx={{
                      bgcolor: colors.neutral[100],
                      fontFamily: "monospace",
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Chưa có
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={colors.neutral[900]}
                >
                  {formatCurrency(accessory.baseDailyRate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(accessory.estimatedValueVnd)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${accessory.depositPercent}%`}
                  size="small"
                  sx={{
                    bgcolor: colors.status.warningLight,
                    color: colors.status.warning,
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Box
                  sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onView(accessory)}
                    sx={{
                      color: colors.primary.main,
                      "&:hover": { bgcolor: colors.primary.lighter },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(accessory)}
                    sx={{
                      color: colors.status.info,
                      "&:hover": { bgcolor: colors.status.infoLight },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(accessory)}
                    sx={{
                      color: colors.status.error,
                      "&:hover": { bgcolor: colors.status.errorLight },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
