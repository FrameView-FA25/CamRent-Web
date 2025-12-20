import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Clear,
  PhotoCamera,
  Assignment,
  VerifiedUser,
} from "@mui/icons-material";
import type { VerificationItem } from "../../../types/verification.types";
import { toast } from "react-toastify";
import {
  getActiveChecklistTemplate,
  createInspectionForm,
  getInspectionFormById,
  updateInspection,
} from "@/services/inspection.service";
import type {
  ChecklistTemplateDetail,
  InspectionMethod,
} from "@/types/inspection.types";

type InspectionDefaultValues = {
  verifyId?: string;
  items?: VerificationItem[];
  branchId?: string;
  handoverType?: number; // 0 = Pickup, 1 = Return (chỉ dùng cho Booking)
};

export type InspectionType = "Booking" | "Verification";

export interface InspectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Partial<InspectionDefaultValues>;
  inspectionType: InspectionType;
}

type ChecklistItem = {
  id: string;
  label: string;
  sectionName: string;
  allowedMethods: InspectionMethod[]; // Phương pháp được phép cho item này
  selectedMethodIds: string[]; // Các phương pháp đã chọn
  passed: boolean;
  notes: string;
  images: File[];
  imagePreviews: string[];
};

const InspectionFormDialog: React.FC<InspectionFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
  inspectionType,
}) => {
  const verifyId = defaultValues?.verifyId || "";
  const items: VerificationItem[] = defaultValues?.items || [];
  const branchId = defaultValues?.branchId;
  const handoverType = defaultValues?.handoverType;

  const [selectedItemId, setSelectedItemId] = React.useState<string>("");
  const [selectedItemType, setSelectedItemType] = React.useState<string>("");

  // Checklist từ template active
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [loadingTemplate, setLoadingTemplate] = React.useState(false);
  const [templateError, setTemplateError] = React.useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] =
    React.useState<ChecklistTemplateDetail | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset khi mở dialog
  React.useEffect(() => {
    if (open) {
      setSelectedItemId("");
      setSelectedItemType("");
      setChecklist([]);
      setActiveTemplate(null);
      setTemplateError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Load template khi đã chọn loại thiết bị
  React.useEffect(() => {
    const loadTemplate = async () => {
      if (!selectedItemType) return;

      const itemTypeNumber =
        selectedItemType === "Camera"
          ? 1
          : selectedItemType === "Accessory"
          ? 2
          : selectedItemType === "Combo"
          ? 3
          : 0;

      if (!itemTypeNumber) {
        setTemplateError("Không xác định được loại thiết bị để tải checklist.");
        return;
      }

      try {
        setLoadingTemplate(true);
        setTemplateError(null);
        const inspectionTypeNumber = inspectionType === "Booking" ? 1 : 2;
        const template = await getActiveChecklistTemplate(
          itemTypeNumber,
          inspectionTypeNumber
        );
        setActiveTemplate(template);
        const rows: ChecklistItem[] = [];
        template.sections.forEach((section) => {
          section.items.forEach((item) => {
            rows.push({
              id: item.id,
              label: item.label,
              sectionName: section.name,
              allowedMethods: item.allowedMethods || [],
              selectedMethodIds: [],
              passed: true,
              notes: "",
              images: [],
              imagePreviews: [],
            });
          });
        });
        setChecklist(rows);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tải checklist từ hệ thống.";
        setTemplateError(message);
        toast.error(message);
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, [inspectionType, selectedItemType]);

  const handleItemSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const itemId = e.target.value;
    setSelectedItemId(itemId);

    const selectedItem = items.find((it) => String(it.itemId) === itemId);
    if (selectedItem) {
      const getItemTypeName = (type: string) => {
        if (type === "1" || type === "Camera") return "Camera";
        if (type === "2" || type === "Accessory") return "Accessory";
        if (type === "3" || type === "Combo") return "Combo";
        return "";
      };
      setSelectedItemType(getItemTypeName(selectedItem.itemType));
    }
  };

  const handleMethodToggle = (itemId: string, methodId: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const isSelected = item.selectedMethodIds.includes(methodId);
          const newMethodIds = isSelected
            ? item.selectedMethodIds.filter((id) => id !== methodId)
            : [...item.selectedMethodIds, methodId];
          return {
            ...item,
            selectedMethodIds: newMethodIds,
          };
        }
        return item;
      })
    );
  };

  const handleCheckAllMethods = (itemId: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            selectedMethodIds: checked
              ? item.allowedMethods.map((m) => m.id)
              : [],
          };
        }
        return item;
      })
    );
  };

  const handleChecklistChange = (
    id: string,
    field: keyof ChecklistItem,
    value: string | boolean
  ) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleImageUpload = (id: string, files: FileList | null) => {
    if (!files) return;

    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const remainingSlots = 3 - item.images.length;
          if (remainingSlots <= 0) {
            toast.error("Chỉ được tải tối đa 3 ảnh cho mỗi mục kiểm tra!");
            return item;
          }

          const filesToAdd = Array.from(files).slice(0, remainingSlots);
          const newFiles = [...item.images, ...filesToAdd];
          const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

          return {
            ...item,
            images: newFiles,
            imagePreviews: newPreviews,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveImage = (itemId: string, imageIndex: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newImages = item.images.filter((_, idx) => idx !== imageIndex);
          const newPreviews = item.imagePreviews.filter(
            (_, idx) => idx !== imageIndex
          );
          // Cleanup object URLs
          item.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
          return {
            ...item,
            images: newImages,
            imagePreviews: newPreviews,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedItemId) {
      toast.error("Vui lòng chọn thiết bị!");
      return;
    }

    if (checklist.length === 0) {
      toast.error("Không có mục kiểm tra nào!");
      return;
    }

    const getItemTypeNumber = (typeName: string): number => {
      switch (typeName) {
        case "Camera":
          return 1;
        case "Accessory":
          return 2;
        case "Combo":
          return 3;
        default:
          return 0;
      }
    };

    try {
      setSubmitting(true);

      const itemTypeNumber = getItemTypeNumber(selectedItemType);
      const inspectionTypeNumber = inspectionType === "Booking" ? 1 : 2;

      // Tạo phiếu kiểm tra
      const createResult = await createInspectionForm({
        itemType: itemTypeNumber,
        itemId: selectedItemId,
        type: inspectionTypeNumber,
        inspectionTypeId: verifyId,
        handoverType:
          inspectionType === "Booking" ? handoverType ?? null : null,
        branchId: branchId ?? null,
        passed: null, // Để backend tự tính
        rows: checklist.map((item) => ({
          itemId: item.id, // Checklist item ID
          methodIds: item.selectedMethodIds,
          passed: item.passed,
          notes: item.notes,
        })),
      });

      // Lấy chi tiết form để có inspection IDs
      const formDetail = await getInspectionFormById(createResult.id);

      // Tạo map từ label đến inspection ID để upload ảnh
      const labelToInspectionId = new Map<string, string>();
      formDetail.rows.forEach((row) => {
        labelToInspectionId.set(row.label, row.inspectionId);
      });

      // Upload ảnh cho từng inspection row
      for (const item of checklist) {
        const inspectionId = labelToInspectionId.get(item.label);

        if (item.images.length > 0 && inspectionId) {
          const formData = new FormData();
          item.images.forEach((file) => {
            formData.append("files", file);
          });

          try {
            await updateInspection(inspectionId, formData);
          } catch (err) {
            console.error(
              `Lỗi upload ảnh cho inspection ${inspectionId}:`,
              err
            );
            toast.warning(
              `Không thể upload ảnh cho mục "${item.label}". Vui lòng thử lại sau.`
            );
          }
        }
      }

      toast.success("Tạo phiếu kiểm tra thành công!");
      onSubmit({
        success: true,
        formId: createResult.id,
        inspectionIds: formDetail.rows.map((r) => r.inspectionId),
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tạo phiếu kiểm tra. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const passedCount = checklist.filter((item) => item.passed).length;
  const failedCount = checklist.length - passedCount;

  // Lấy tất cả phương pháp unique từ tất cả items để hiển thị header
  const allMethods = React.useMemo(() => {
    const methodMap = new Map<string, InspectionMethod>();
    checklist.forEach((item) => {
      item.allowedMethods.forEach((method) => {
        if (!methodMap.has(method.id)) {
          methodMap.set(method.id, method);
        }
      });
    });
    return Array.from(methodMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  }, [checklist]);

  // Cấu hình theo loại inspection
  const inspectionConfig = {
    Booking: {
      title: "Phiếu kiểm tra đơn hàng",
      badgeLabel: "Đơn hàng",
      badgeColor: "#F97316" as const,
      icon: Assignment,
    },
    Verification: {
      title: "Phiếu kiểm tra xác minh thiết bị",
      badgeLabel: "Xác minh",
      badgeColor: "#3B82F6" as const,
      icon: VerifiedUser,
    },
  };

  const config = inspectionConfig[inspectionType];
  const IconComponent = config.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 4, p: 1 },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 22,
          textAlign: "center",
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconComponent sx={{ color: config.badgeColor, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {config.title}
          </Typography>
        </Box>

        <Chip
          label={config.badgeLabel}
          size="small"
          sx={{
            bgcolor: `${config.badgeColor}15`,
            color: config.badgeColor,
            fontWeight: 600,
            border: `1px solid ${config.badgeColor}40`,
          }}
        />
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {/* Chọn thiết bị */}
        <Box sx={{ mb: 3, mt: 2, display: "flex", gap: 2 }}>
          <TextField
            select
            label="Chọn thiết bị"
            value={selectedItemId}
            onChange={handleItemSelect}
            fullWidth
            sx={{ flex: 2 }}
            slotProps={{
              input: {
                sx: {
                  backgroundColor: "#f3f4f6",
                },
              },
            }}
          >
            <MenuItem value="">-- Chọn thiết bị --</MenuItem>
            {items.map((it) => (
              <MenuItem key={String(it.itemId)} value={String(it.itemId)}>
                {it.itemName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Loại thiết bị"
            value={selectedItemType}
            fullWidth
            sx={{ flex: 1 }}
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            slotProps={{
              input: {
                readOnly: true,
                style: { backgroundColor: "#f3f4f6" },
              },
            }}
          />
        </Box>

        {/* Thống kê */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
          <Chip label={`Tổng: ${checklist.length} mục`} color="default" />
          <Chip label={`Đạt: ${passedCount}`} color="success" />
          <Chip label={`Không đạt: ${failedCount}`} color="error" />
          {loadingTemplate && <Chip label="Đang tải checklist..." />}
          {activeTemplate && (
            <Chip
              label={`Checklist: ${activeTemplate.name}`}
              color={activeTemplate.isActive ? "success" : "default"}
            />
          )}
          {templateError && (
            <Chip label={templateError} color="error" variant="outlined" />
          )}
        </Stack>

        {/* Bảng checklist */}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ border: "1px solid #ddd" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F3F4F6" }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "20%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Danh mục
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    width: "5%",
                  }}
                  rowSpan={2}
                >
                  Chọn tất cả
                </TableCell>
                {allMethods.length > 0 ? (
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      border: "1px solid #ddd",
                    }}
                    colSpan={allMethods.length}
                  >
                    Phương pháp thực hiện
                  </TableCell>
                ) : (
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      border: "1px solid #ddd",
                    }}
                  >
                    Phương pháp thực hiện
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "5%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Kết quả
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "20%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Ghi chú
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: "15%",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                  rowSpan={2}
                >
                  Ảnh
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: "#F3F4F6" }}>
                {allMethods.length > 0 ? (
                  allMethods.map((method) => (
                    <TableCell
                      key={method.id}
                      sx={{
                        fontWeight: 600,
                        textAlign: "center",
                        border: "1px solid #ddd",
                        fontSize: "0.75rem",
                      }}
                    >
                      <Tooltip title={method.code}>
                        <span>{method.name}</span>
                      </Tooltip>
                    </TableCell>
                  ))
                ) : (
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                      border: "1px solid #ddd",
                    }}
                  >
                    Không có phương pháp
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {checklist.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={allMethods.length + 5}
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    {loadingTemplate
                      ? "Đang tải checklist..."
                      : templateError
                      ? templateError
                      : "Chưa chọn thiết bị hoặc không có checklist"}
                  </TableCell>
                </TableRow>
              ) : (
                checklist.map((item) => {
                  const allMethodsSelected =
                    item.allowedMethods.length > 0 &&
                    item.allowedMethods.every((m) =>
                      item.selectedMethodIds.includes(m.id)
                    );
                  const someMethodsSelected =
                    item.allowedMethods.some((m) =>
                      item.selectedMethodIds.includes(m.id)
                    ) && !allMethodsSelected;

                  return (
                    <TableRow key={item.id}>
                      <TableCell sx={{ border: "1px solid #ddd" }}>
                        <Typography variant="body2">{item.label}</Typography>
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: "center", border: "1px solid #ddd" }}
                      >
                        {item.allowedMethods.length > 0 ? (
                          <Checkbox
                            checked={allMethodsSelected}
                            indeterminate={someMethodsSelected}
                            onChange={(e) =>
                              handleCheckAllMethods(item.id, e.target.checked)
                            }
                            size="small"
                            color="primary"
                            disabled={item.allowedMethods.length === 0}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      {allMethods.length > 0 ? (
                        allMethods.map((method) => {
                          const isAllowed = item.allowedMethods.some(
                            (m) => m.id === method.id
                          );
                          const isSelected = item.selectedMethodIds.includes(
                            method.id
                          );

                          return (
                            <TableCell
                              key={method.id}
                              sx={{
                                textAlign: "center",
                                border: "1px solid #ddd",
                              }}
                            >
                              {isAllowed ? (
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() =>
                                    handleMethodToggle(item.id, method.id)
                                  }
                                  size="small"
                                  color="primary"
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          );
                        })
                      ) : (
                        <TableCell
                          sx={{ textAlign: "center", border: "1px solid #ddd" }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell
                        sx={{ textAlign: "center", border: "1px solid #ddd" }}
                      >
                        <Checkbox
                          checked={item.passed}
                          onChange={(e) =>
                            handleChecklistChange(
                              item.id,
                              "passed",
                              e.target.checked
                            )
                          }
                          color={item.passed ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd" }}>
                        <TextField
                          size="small"
                          placeholder="Ghi chú..."
                          value={item.notes}
                          onChange={(e) =>
                            handleChecklistChange(
                              item.id,
                              "notes",
                              e.target.value
                            )
                          }
                          fullWidth
                          multiline
                          rows={1}
                        />
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            component="label"
                            size="small"
                            sx={{ color: "#0ea5e9" }}
                          >
                            <PhotoCamera fontSize="small" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={(e) =>
                                handleImageUpload(item.id, e.target.files)
                              }
                            />
                          </IconButton>
                          <Typography variant="caption" color="text.secondary">
                            ({item.imagePreviews.length}/3)
                          </Typography>
                          {item.imagePreviews.map((preview, idx) => (
                            <Box key={idx} sx={{ position: "relative" }}>
                              <img
                                src={preview}
                                alt={`preview-${idx}`}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: "1px solid #ddd",
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveImage(item.id, idx)}
                                sx={{
                                  position: "absolute",
                                  top: -8,
                                  right: -8,
                                  bgcolor: "white",
                                  padding: "2px",
                                  "&:hover": { bgcolor: "#fee" },
                                }}
                              >
                                <Clear sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: 2 }}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || checklist.length === 0}
          sx={{
            borderRadius: 2,
            bgcolor: config.badgeColor,
            color: "white",
            fontWeight: 600,
            "&:hover": {
              bgcolor: config.badgeColor,
              opacity: 0.9,
            },
            "&:disabled": {
              bgcolor: "#ccc",
              color: "#666",
            },
          }}
        >
          {submitting ? "Đang xử lý..." : "Tạo phiếu kiểm tra"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InspectionFormDialog;
