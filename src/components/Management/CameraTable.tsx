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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import type { Camera } from "../../types/product.types";
import { colors } from "../../theme/colors";

interface CameraTableProps {
  cameras: Camera[];
  onView: (camera: Camera) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (camera: Camera) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const CameraTable: React.FC<CameraTableProps> = ({
  cameras,
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
          {cameras.map((camera) => (
            <TableRow
              key={camera.id}
              sx={{
                "&:hover": { bgcolor: colors.neutral[50] },
                transition: "background-color 0.2s",
              }}
            >
              <TableCell>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {Array.isArray(camera.media) && camera.media.length > 0 ? (
                    camera.media.slice(0, 3).map((m, idx) => {
                      const url =
                        typeof m === "string" ? m : m && (m.url || "");
                      return url ? (
                        <Box
                          key={`${camera.id}-${idx}`}
                          component="img"
                          src={url}
                          alt={`${camera.brand} ${camera.model} ${idx + 1}`}
                          sx={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 1,
                            border: `1px solid ${colors.neutral[200]}`,
                            bgcolor: colors.neutral[100],
                          }}
                        />
                      ) : (
                        <Box
                          key={`${camera.id}-${idx}`}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            bgcolor: colors.neutral[200],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          📷
                        </Box>
                      );
                    })
                  ) : (
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        bgcolor: colors.neutral[200],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      📷
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {camera.brand}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{camera.model}</Typography>
                {camera.variant && (
                  <Typography variant="caption" color="text.secondary">
                    {camera.variant}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {camera.serialNumber ? (
                  <Chip
                    label={camera.serialNumber}
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
                  {formatCurrency(camera.baseDailyRate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(camera.estimatedValueVnd)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${camera.depositPercent}%`}
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
                    onClick={() => onView(camera)}
                    sx={{
                      color: colors.neutral[900],
                      "&:hover": { bgcolor: colors.primary.lighter },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(camera)}
                    sx={{
                      color: colors.neutral[900],
                      "&:hover": { bgcolor: colors.primary.lighter },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(camera)}
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
