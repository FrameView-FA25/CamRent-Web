import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  ExpandMore,
  Edit,
  DeleteOutline,
  Visibility,
  Close,
} from "@mui/icons-material";
import type {
  InspectionFormSummaryResponse,
  InspectionFormResponse,
  InspectionFormRowResponse,
} from "@/services/inspection.service";
import type { InspectionListItem } from "./InspectionListDialog";

export interface InspectionFormListDialogProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  forms: InspectionFormSummaryResponse[];
  formDetails?: Map<string, InspectionFormResponse>; // Map formId -> formDetail
  loading?: boolean;
  emptyMessage?: string;
  onClose: () => void;
  onViewForm?: (formId: string) => void;
  onEditItem?: (item: InspectionListItem, formId: string) => void;
  onDeleteItem?: (item: InspectionListItem) => void;
  deletingInspectionId?: string | null;
  itemNameMap?: Map<string, string>; // Map itemId -> itemName
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
          minWidth: 80,
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
          minWidth: 80,
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
        minWidth: 80,
      }}
    />
  );
};

const InspectionFormListDialog: React.FC<InspectionFormListDialogProps> = ({
  open,
  title = "Danh sách phiếu kiểm tra",
  subtitle,
  forms,
  formDetails = new Map(),
  loading,
  emptyMessage = "Chưa có phiếu kiểm tra nào.",
  onClose,
  onViewForm,
  onEditItem,
  onDeleteItem,
  deletingInspectionId,
  itemNameMap = new Map(),
}) => {
  const [expandedFormId, setExpandedFormId] = React.useState<string | false>(
    false
  );
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const handleAccordionChange =
    (formId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedFormId(isExpanded ? formId : false);
    };

  const getItemTypeName = (itemType: number | string): string => {
    // Nếu là string, trả về trực tiếp
    if (typeof itemType === "string") {
      return itemType;
    }
    // Nếu là number, convert sang string
    switch (itemType) {
      case 1:
        return "Camera";
      case 2:
        return "Accessory";
      case 3:
        return "Combo";
      default:
        return "Không xác định";
    }
  };

  const getInspectionTypeName = (type: number | string): string => {
    // Nếu là string, trả về trực tiếp
    if (typeof type === "string") {
      return type;
    }
    // Nếu là number, convert
    return type === 1 ? "Booking" : "Verification";
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
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
          ) : forms.length === 0 ? (
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {forms.map((form) => {
                const formDetail = formDetails.get(form.id);
                const itemName =
                  itemNameMap.get(form.itemId) || "Không xác định";
                const hasRows = formDetail && formDetail.rows.length > 0;

                return (
                  <Accordion
                    key={form.id}
                    expanded={expandedFormId === form.id}
                    onChange={handleAccordionChange(form.id)}
                    sx={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 2,
                      "&:before": { display: "none" },
                      boxShadow: "none",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        bgcolor: "#F9FAFB",
                        borderRadius: 2,
                        "&.Mui-expanded": {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          pr: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {form.templateName}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                              label={itemName}
                              size="small"
                              sx={{
                                bgcolor: "#EFF6FF",
                                color: "#1E40AF",
                                fontWeight: 500,
                              }}
                            />
                            <Chip
                              label={getItemTypeName(form.itemType)}
                              size="small"
                              sx={{
                                bgcolor: "#F3F4F6",
                                color: "#374151",
                              }}
                            />
                            <Chip
                              label={getInspectionTypeName(form.type)}
                              size="small"
                              sx={{
                                bgcolor: "#FEF3C7",
                                color: "#92400E",
                              }}
                            />
                            {form.overallPassed !== null && (
                              <Chip
                                label={form.overallPassed ? "Đạt" : "Không đạt"}
                                size="small"
                                sx={{
                                  bgcolor: form.overallPassed
                                    ? "#F0FDF4"
                                    : "#FEF2F2",
                                  color: form.overallPassed
                                    ? "#10B981"
                                    : "#EF4444",
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Stack>
                          {form.staffName && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6B7280",
                                mt: 0.5,
                                display: "block",
                              }}
                            >
                              Người tạo: {form.staffName}
                            </Typography>
                          )}
                          {formDetail && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6B7280",
                                mt: 0.5,
                                display: "block",
                              }}
                            >
                              Số mục kiểm tra: {formDetail.rows.length}
                            </Typography>
                          )}
                        </Box>
                        {onViewForm && (
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewForm(form.id);
                              }}
                              sx={{
                                border: "1px solid #E5E7EB",
                                color: "#4B5563",
                                "&:hover": {
                                  color: "#1D4ED8",
                                  borderColor: "#1D4ED8",
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      {!formDetail ? (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <CircularProgress size={24} />
                          <Typography
                            variant="body2"
                            sx={{ color: "#6B7280", mt: 1 }}
                          >
                            Đang tải chi tiết...
                          </Typography>
                        </Box>
                      ) : !hasRows ? (
                        <Box
                          sx={{ p: 3, textAlign: "center", color: "#94A3B8" }}
                        >
                          Không có mục kiểm tra nào
                        </Box>
                      ) : (
                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{ border: "none" }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Phần
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Nhãn
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Giá trị
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Ghi chú
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Ảnh
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Trạng thái
                                </TableCell>
                                {(onEditItem || onDeleteItem) && (
                                  <TableCell align="right"></TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {formDetail.rows.map(
                                (row: InspectionFormRowResponse) => {
                                  const value =
                                    row.methods.length > 0
                                      ? row.methods
                                          .map((m) => m.name)
                                          .join(", ")
                                      : row.passed === true
                                      ? "Đạt"
                                      : row.passed === false
                                      ? "Không đạt"
                                      : "";

                                  const inspectionItem: InspectionListItem = {
                                    id: row.inspectionId,
                                    itemName: itemName,
                                    itemType: getItemTypeName(form.itemType),
                                    itemId: form.itemId,
                                    itemTypeValue: form.itemType,
                                    inspectionTypeId: form.inspectionTypeId,
                                    type: getInspectionTypeName(form.type),
                                    section: form.templateName,
                                    label: row.label,
                                    value: value,
                                    notes: row.notes || "",
                                    passed: row.passed ?? null,
                                    media: row.media.map((m) => ({
                                      id: m.id,
                                      url: m.url,
                                      label: m.label,
                                    })),
                                  };

                                  return (
                                    <TableRow key={row.inspectionId} hover>
                                      <TableCell>{form.templateName}</TableCell>
                                      <TableCell>{row.label}</TableCell>
                                      <TableCell>{value || "-"}</TableCell>
                                      <TableCell sx={{ maxWidth: 200 }}>
                                        <Typography
                                          sx={{
                                            color: "#4B5563",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {row.notes || "-"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        {row.media && row.media.length > 0 ? (
                                          <Box sx={{ display: "flex", gap: 1 }}>
                                            {row.media
                                              .slice(0, 2)
                                              .map((media) => (
                                                <Box
                                                  key={media.id}
                                                  component="img"
                                                  src={media.url}
                                                  onClick={() =>
                                                    setPreviewImage(media.url)
                                                  }
                                                  alt={
                                                    media.label || "inspection"
                                                  }
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
                                            {row.media.length > 2 && (
                                              <Chip
                                                label={`+${
                                                  row.media.length - 2
                                                }`}
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
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "#94A3B8" }}
                                          >
                                            -
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        {statusChip(row.passed ?? null)}
                                      </TableCell>
                                      {(onEditItem || onDeleteItem) && (
                                        <TableCell align="right">
                                          <Box sx={{ display: "flex", gap: 1 }}>
                                            {onEditItem && (
                                              <Tooltip title="Chỉnh sửa">
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    onEditItem(
                                                      inspectionItem,
                                                      form.id
                                                    )
                                                  }
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
                                            )}
                                            {onDeleteItem && (
                                              <Tooltip title="Xóa">
                                                <span>
                                                  <IconButton
                                                    size="small"
                                                    disabled={
                                                      deletingInspectionId ===
                                                      row.inspectionId
                                                    }
                                                    onClick={() =>
                                                      onDeleteItem(
                                                        inspectionItem
                                                      )
                                                    }
                                                    sx={{
                                                      border:
                                                        "1px solid #FEE2E2",
                                                      color: "#DC2626",
                                                      bgcolor:
                                                        deletingInspectionId ===
                                                        row.inspectionId
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
                                                    {deletingInspectionId ===
                                                    row.inspectionId ? (
                                                      <CircularProgress
                                                        size={16}
                                                        sx={{
                                                          color: "#DC2626",
                                                        }}
                                                      />
                                                    ) : (
                                                      <DeleteOutline fontSize="small" />
                                                    )}
                                                  </IconButton>
                                                </span>
                                              </Tooltip>
                                            )}
                                          </Box>
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  );
                                }
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
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
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InspectionFormListDialog;
