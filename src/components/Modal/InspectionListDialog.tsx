import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  DialogContentText,
} from "@mui/material";
import { Edit, Close, DeleteOutline } from "@mui/icons-material";

export type InspectionMedia = {
  id: string;
  url: string;
  label?: string;
};

export type InspectionListItem = {
  id: string;
  itemName?: string;
  itemType?: string;
  section: string;
  label: string;
  value?: string;
  notes?: string;
  passed: boolean | null;
  media?: InspectionMedia[];
};

export interface InspectionListDialogProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  inspections: InspectionListItem[];
  loading?: boolean;
  emptyMessage?: string;
  onClose: () => void;
  onEdit: (inspection: InspectionListItem) => void;
  onDelete?: (inspection: InspectionListItem) => void;
  deletingInspectionId?: string | null;
}

const statusChip = (passed: boolean | null) => {
  if (passed === true) {
    return (
      <Chip
        label="Đạt"
        size="small"
        sx={{
          bgcolor: "#F0FDF4",
          color: "#10B981",
          fontWeight: 600,
          minWidth: 96,
        }}
      />
    );
  }
  if (passed === false) {
    return (
      <Chip
        label="Không đạt"
        size="small"
        sx={{
          bgcolor: "#FEF2F2",
          color: "#EF4444",
          fontWeight: 600,
          minWidth: 96,
        }}
      />
    );
  }
  return (
    <Chip
      label="Chưa đánh giá"
      size="small"
      sx={{
        bgcolor: "#E5E7EB",
        color: "#374151",
        fontWeight: 600,
        minWidth: 96,
      }}
    />
  );
};

const InspectionListDialog: React.FC<InspectionListDialogProps> = ({
  open,
  title = "Phiếu kiểm tra",
  subtitle,
  inspections,
  loading,
  emptyMessage = "Chưa có dữ liệu kiểm tra nào.",
  onClose,
  onEdit,
  onDelete,
  deletingInspectionId,
}) => {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {subtitle}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress size={32} sx={{ color: "#F97316" }} />
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : inspections.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "#94A3B8",
                fontStyle: "italic",
              }}
            >
              {emptyMessage}
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                      Thiết bị
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                      Phần
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                      Nhãn
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                      Giá trị
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                      Ghi chú
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                      Ảnh
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "#111827" }}
                    >
                      Trạng thái
                    </TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inspections.map((inspection) => (
                    <TableRow key={inspection.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1F2937" }}
                        >
                          {inspection.itemName || "Không xác định"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#6B7280" }}
                        >
                          {inspection.itemType || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>{inspection.section || "-"}</TableCell>
                      <TableCell>{inspection.label || "-"}</TableCell>
                      <TableCell>{inspection.value || "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          sx={{ color: "#4B5563", fontSize: "0.875rem" }}
                        >
                          {inspection.notes || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {inspection.media && inspection.media.length > 0 ? (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {inspection.media.slice(0, 2).map((media) => (
                              <Box
                                key={media.id}
                                component="img"
                                src={media.url}
                                onClick={() => setPreviewImage(media.url)}
                                alt={media.label || "inspection"}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "1px solid #E5E7EB",
                                  cursor: "pointer",
                                }}
                              />
                            ))}
                            {inspection.media.length > 2 && (
                              <Chip
                                label={`+${inspection.media.length - 2}`}
                                size="small"
                                sx={{
                                  bgcolor: "#E5E7EB",
                                  color: "#374151",
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {statusChip(inspection.passed)}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(inspection)}
                              sx={{
                                border: "1px solid #E5E7EB",
                                color: "#4B5563",
                                "&:hover": {
                                  color: "#F97316",
                                  borderColor: "#F97316",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {onDelete && (
                            <Tooltip title="Xóa phiếu kiểm tra">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={deletingInspectionId === inspection.id}
                                  onClick={() => onDelete(inspection)}
                                  sx={{
                                    border: "1px solid #FEE2E2",
                                    color: "#DC2626",
                                    bgcolor:
                                      deletingInspectionId === inspection.id
                                        ? "#FEE2E2"
                                        : "transparent",
                                    "&:hover": {
                                      bgcolor: "#FEF2F2",
                                    },
                                    "&.Mui-disabled": {
                                      opacity: 0.6,
                                      color: "#DC2626",
                                    },
                                  }}
                                >
                                  {deletingInspectionId === inspection.id ? (
                                    <CircularProgress size={16} sx={{ color: "#DC2626" }} />
                                  ) : (
                                    <DeleteOutline fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Xem ảnh
          </Typography>
          <IconButton onClick={() => setPreviewImage(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previewImage ? (
            <Box
              component="img"
              src={previewImage}
              alt="preview"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <DialogContentText sx={{ p: 3 }}>
              Không tìm thấy hình ảnh.
            </DialogContentText>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InspectionListDialog;

