import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Rule as MethodIcon,
  Visibility as VisibilityIcon,
  PlaylistAddCheck as ChecklistIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { inspectionAdminService } from "@/services/inspectionAdmin.service";
import type {
  ChecklistTemplateDetail,
  ChecklistTemplateSummary,
  InspectionMethod,
  InspectionType,
  ItemType,
  UpsertChecklistTemplateRequest,
  UpsertInspectionMethodRequest,
} from "@/types/inspection.types";
import {
  INSPECTION_TYPE_OPTIONS,
  ITEM_TYPE_OPTIONS,
} from "@/types/inspection.types";

type TabKey = "methods" | "templates";

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

const defaultMethodForm: UpsertInspectionMethodRequest = {
  code: "",
  name: "",
  sortOrder: 0,
  isActive: true,
};

const buildEmptyTemplate = (): UpsertChecklistTemplateRequest => ({
  name: "",
  itemType: 1,
  inspectionType: 1,
  isActive: true,
  sections: [
    {
      name: "Phần 1",
      sortOrder: 1,
      items: [
        {
          label: "Hạng mục 1",
          sortOrder: 1,
          allowedMethodIds: [],
        },
      ],
    },
  ],
});

const getItemTypeLabel = (itemType: string | number): string => {
  // Nếu là string từ API, map trực tiếp
  if (typeof itemType === "string") {
    const stringMap: Record<string, string> = {
      Camera: "Camera",
      Accessory: "Phụ kiện",
      "Phụ kiện": "Phụ kiện",
      Combo: "Combo",
    };
    return stringMap[itemType] || itemType;
  }
  // Nếu là number, tìm trong ITEM_TYPE_OPTIONS
  return (
    ITEM_TYPE_OPTIONS.find((opt) => opt.value === itemType)?.label || "N/A"
  );
};

const getInspectionTypeLabel = (
  inspectionType: string | number | null | undefined
): string => {
  if (!inspectionType) return "N/A";
  // Nếu là string từ API, map trực tiếp
  if (typeof inspectionType === "string") {
    const stringMap: Record<string, string> = {
      Booking: "Booking",
      Verification: "Verification",
    };
    return stringMap[inspectionType] || inspectionType;
  }
  // Nếu là number, tìm trong INSPECTION_TYPE_OPTIONS
  return (
    INSPECTION_TYPE_OPTIONS.find((opt) => opt.value === inspectionType)
      ?.label || "N/A"
  );
};

const InspectionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("methods");

  const [methods, setMethods] = useState<InspectionMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState<boolean>(false);
  const [methodError, setMethodError] = useState<string | null>(null);
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [methodForm, setMethodForm] =
    useState<UpsertInspectionMethodRequest>(defaultMethodForm);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [methodSearch, setMethodSearch] = useState("");

  const [templates, setTemplates] = useState<ChecklistTemplateSummary[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] =
    useState<UpsertChecklistTemplateRequest>(buildEmptyTemplate());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ChecklistTemplateDetail | null>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | "all">("all");
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState<
    InspectionType | "all"
  >("all");
  const [templateSearch, setTemplateSearch] = useState("");

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  // State để lưu lỗi validation
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, severity: ToastState["severity"]) => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const filteredMethods = useMemo(() => {
    const keyword = methodSearch.trim().toLowerCase();
    if (!keyword) return methods;
    return methods.filter(
      (m) =>
        m.code.toLowerCase().includes(keyword) ||
        m.name.toLowerCase().includes(keyword)
    );
  }, [methods, methodSearch]);

  const filteredTemplates = useMemo(() => {
    const keyword = templateSearch.trim().toLowerCase();
    return templates.filter((tpl) => {
      // Xử lý itemType filter
      if (itemTypeFilter !== "all") {
        const tplItemTypeNum =
          typeof tpl.itemType === "string"
            ? ITEM_TYPE_OPTIONS.find((opt) => opt.label === tpl.itemType)?.value
            : tpl.itemType;
        if (tplItemTypeNum !== itemTypeFilter) return false;
      }

      // Xử lý inspectionType filter
      if (inspectionTypeFilter !== "all" && tpl.inspectionType) {
        const tplInspectionTypeNum =
          typeof tpl.inspectionType === "string"
            ? INSPECTION_TYPE_OPTIONS.find(
                (opt) => opt.label === tpl.inspectionType
              )?.value
            : tpl.inspectionType;
        if (tplInspectionTypeNum !== inspectionTypeFilter) return false;
      }

      if (!keyword) return true;
      return tpl.name.toLowerCase().includes(keyword);
    });
  }, [templates, itemTypeFilter, inspectionTypeFilter, templateSearch]);

  const fetchMethods = async () => {
    try {
      setLoadingMethods(true);
      setMethodError(null);
      const data = await inspectionAdminService.listMethods(true);
      setMethods(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách phương pháp kiểm tra.";
      setMethodError(message);
    } finally {
      setLoadingMethods(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      setTemplateError(null);
      const data = await inspectionAdminService.listTemplates(
        itemTypeFilter === "all" ? undefined : itemTypeFilter,
        inspectionTypeFilter === "all" ? undefined : inspectionTypeFilter
      );
      setTemplates(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách checklist.";
      setTemplateError(message);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchTemplateDetail = async (id: string) => {
    try {
      const detail = await inspectionAdminService.getTemplate(id);
      setSelectedTemplate(detail);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết checklist.";
      showToast(message, "error");
    }
  };

  useEffect(() => {
    fetchMethods();
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filters trigger reload
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemTypeFilter, inspectionTypeFilter]);

  const resetMethodForm = () => {
    setMethodForm(defaultMethodForm);
    setEditingMethodId(null);
  };

  const handleSubmitMethod = async () => {
    try {
      if (editingMethodId) {
        await inspectionAdminService.updateMethod(editingMethodId, methodForm);
        showToast("Cập nhật phương pháp thành công", "success");
      } else {
        await inspectionAdminService.createMethod(methodForm);
        showToast("Thêm phương pháp thành công", "success");
      }
      setMethodDialogOpen(false);
      resetMethodForm();
      fetchMethods();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể lưu phương pháp kiểm tra.";
      showToast(message, "error");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    const confirm = window.confirm(
      "Bạn có chắc muốn xóa phương pháp này? Hành động không thể hoàn tác."
    );
    if (!confirm) return;
    try {
      await inspectionAdminService.deleteMethod(id);
      showToast("Đã xóa phương pháp", "success");
      fetchMethods();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể xóa phương pháp kiểm tra.";
      showToast(message, "error");
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm(buildEmptyTemplate());
    setEditingTemplateId(null);
    setItemErrors({}); // Clear errors khi reset
  };

  const handleOpenCreateTemplate = () => {
    resetTemplateForm();
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = async (id: string) => {
    try {
      const detail = await inspectionAdminService.getTemplate(id);
      setEditingTemplateId(id);

      // Helper để convert string sang number cho inspectionType
      const convertInspectionType = (
        value: InspectionType | string | null | undefined
      ): InspectionType | null | undefined => {
        if (value === null || value === undefined) return value;
        if (typeof value === "string") {
          const map: Record<string, InspectionType> = {
            Booking: 1,
            Verification: 2,
          };
          return map[value] ?? null;
        }
        return value;
      };

      // Helper để convert string sang number cho itemType
      const convertItemType = (value: ItemType | string): ItemType => {
        if (typeof value === "string") {
          const map: Record<string, ItemType> = {
            Camera: 1,
            Accessory: 2,
            "Phụ kiện": 2,
            Combo: 3,
          };
          return map[value] ?? 1;
        }
        return value;
      };

      setTemplateForm({
        name: detail.name,
        itemType: convertItemType(detail.itemType),
        inspectionType: convertInspectionType(detail.inspectionType),
        isActive: detail.isActive,
        sections: detail.sections.map((section) => ({
          name: section.name,
          sortOrder: section.sortOrder,
          items: section.items.map((item) => ({
            label: item.label,
            sortOrder: item.sortOrder,
            allowedMethodIds: item.allowedMethods?.map((m) => m.id) ?? [],
          })),
        })),
      });
      setItemErrors({}); // Clear errors khi mở dialog edit
      setTemplateDialogOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin checklist để chỉnh sửa.";
      showToast(message, "error");
    }
  };

  // Hàm validation để kiểm tra trùng lặp
  const validateItem = (
    sectionIdx: number,
    itemIdx: number,
    field: "label" | "sortOrder",
    value: string | number
  ): string | null => {
    const section = templateForm.sections[sectionIdx];
    if (!section) return null;

    if (field === "label") {
      const labelValue = String(value).trim();
      if (!labelValue) {
        return "Tiêu đề hạng mục không được để trống";
      }
      // Kiểm tra trùng với các item khác trong cùng section
      const duplicate = section.items.find(
        (item, idx) => idx !== itemIdx && item.label.trim() === labelValue
      );
      if (duplicate) {
        return "Tiêu đề hạng mục đã tồn tại trong phần này";
      }
    } else if (field === "sortOrder") {
      const orderValue = Number(value);
      if (isNaN(orderValue) || orderValue < 1) {
        return "Thứ tự phải là số nguyên dương";
      }
      // Kiểm tra trùng với các item khác trong cùng section
      const duplicate = section.items.find(
        (item, idx) => idx !== itemIdx && item.sortOrder === orderValue
      );
      if (duplicate) {
        return "Thứ tự đã tồn tại trong phần này";
      }
    }

    return null;
  };

  const handleSubmitTemplate = async () => {
    // Validate tất cả items trước khi submit
    const errors: Record<string, string> = {};

    templateForm.sections.forEach((section, sectionIdx) => {
      section.items.forEach((item, itemIdx) => {
        // Validate label
        const labelError = validateItem(
          sectionIdx,
          itemIdx,
          "label",
          item.label
        );
        if (labelError) {
          errors[`section-${sectionIdx}-item-${itemIdx}-label`] = labelError;
        }

        // Validate sortOrder
        if (item.sortOrder !== undefined) {
          const orderError = validateItem(
            sectionIdx,
            itemIdx,
            "sortOrder",
            item.sortOrder
          );
          if (orderError) {
            errors[`section-${sectionIdx}-item-${itemIdx}-sortOrder`] =
              orderError;
          }
        }
      });
    });

    // Nếu có lỗi, hiển thị và không submit
    if (Object.keys(errors).length > 0) {
      setItemErrors(errors);
      showToast("Vui lòng sửa các lỗi trước khi lưu", "error");
      return;
    }

    try {
      if (editingTemplateId) {
        await inspectionAdminService.updateTemplate(
          editingTemplateId,
          templateForm
        );
        showToast("Cập nhật checklist thành công", "success");
      } else {
        await inspectionAdminService.createTemplate(templateForm);
        showToast("Tạo checklist thành công", "success");
      }
      setTemplateDialogOpen(false);
      resetTemplateForm();
      fetchTemplates();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể lưu checklist.";
      showToast(message, "error");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa checklist này?");
    if (!confirm) return;
    try {
      await inspectionAdminService.deleteTemplate(id);
      showToast("Đã xóa checklist", "success");
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      fetchTemplates();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa checklist.";
      showToast(message, "error");
    }
  };

  const handleToggleTemplateActive = async (
    template: ChecklistTemplateSummary
  ) => {
    try {
      await inspectionAdminService.setTemplateActive(
        template.id,
        !template.isActive
      );
      showToast("Đã cập nhật trạng thái kích hoạt", "success");
      fetchTemplates();
      if (selectedTemplate?.id === template.id) {
        fetchTemplateDetail(template.id);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể thay đổi trạng thái checklist.";
      showToast(message, "error");
    }
  };

  const handleSelectTemplate = (id: string) => {
    fetchTemplateDetail(id);
  };

  const updateSection = (
    idx: number,
    field: "name" | "sortOrder",
    value: string | number
  ) => {
    setTemplateForm((prev) => {
      const sections = [...prev.sections];
      const section = { ...sections[idx], [field]: value };
      sections[idx] = section;
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    setTemplateForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          name: `Phần ${prev.sections.length + 1}`,
          sortOrder: prev.sections.length + 1,
          items: [],
        },
      ],
    }));
  };

  const removeSection = (idx: number) => {
    setTemplateForm((prev) => {
      // Xóa các lỗi validation của section này khi xóa section
      const newErrors = { ...itemErrors };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`section-${idx}-`)) {
          delete newErrors[key];
        } else if (key.startsWith(`section-`)) {
          // Cập nhật lại index cho các section sau
          const match = key.match(/section-(\d+)-/);
          if (match) {
            const sectionIndex = parseInt(match[1]);
            if (sectionIndex > idx) {
              const newKey = key.replace(
                `section-${sectionIndex}-`,
                `section-${sectionIndex - 1}-`
              );
              newErrors[newKey] = newErrors[key];
              delete newErrors[key];
            }
          }
        }
      });
      setItemErrors(newErrors);
      return {
        ...prev,
        sections: prev.sections.filter((_, i) => i !== idx),
      };
    });
  };

  const updateItem = (
    sectionIdx: number,
    itemIdx: number,
    field: "label" | "sortOrder" | "allowedMethodIds",
    value: string | number | string[]
  ) => {
    // Validate nếu là label hoặc sortOrder và value không phải array
    if ((field === "label" || field === "sortOrder") && !Array.isArray(value)) {
      const error = validateItem(sectionIdx, itemIdx, field, value);
      const errorKey = `section-${sectionIdx}-item-${itemIdx}-${field}`;

      setItemErrors((prev) => {
        if (error) {
          return { ...prev, [errorKey]: error };
        } else {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        }
      });
    }

    setTemplateForm((prev) => {
      const sections = [...prev.sections];
      const section = { ...sections[sectionIdx] };
      const items = [...section.items];
      const item = { ...items[itemIdx], [field]: value };
      items[itemIdx] = item;
      section.items = items;
      sections[sectionIdx] = section;
      return { ...prev, sections };
    });
  };

  const addItem = (sectionIdx: number) => {
    setTemplateForm((prev) => {
      const sections = [...prev.sections];
      const section = { ...sections[sectionIdx] };
      section.items = [
        ...section.items,
        {
          label: `Hạng mục ${section.items.length + 1}`,
          sortOrder: section.items.length + 1,
          allowedMethodIds: [],
        },
      ];
      sections[sectionIdx] = section;
      return { ...prev, sections };
    });
  };

  const removeItem = (sectionIdx: number, itemIdx: number) => {
    setTemplateForm((prev) => {
      const sections = [...prev.sections];
      const section = { ...sections[sectionIdx] };
      // Xóa các lỗi validation của item này khi xóa item
      const newErrors = { ...itemErrors };
      Object.keys(newErrors).forEach((key) => {
        if (
          key === `section-${sectionIdx}-item-${itemIdx}-label` ||
          key === `section-${sectionIdx}-item-${itemIdx}-sortOrder`
        ) {
          delete newErrors[key];
        } else if (key.startsWith(`section-${sectionIdx}-item-`)) {
          // Cập nhật lại index cho các item sau
          const match = key.match(/item-(\d+)-/);
          if (match) {
            const currentItemIdx = parseInt(match[1]);
            if (currentItemIdx > itemIdx) {
              const newKey = key.replace(
                `item-${currentItemIdx}-`,
                `item-${currentItemIdx - 1}-`
              );
              newErrors[newKey] = newErrors[key];
              delete newErrors[key];
            }
          }
        }
      });
      setItemErrors(newErrors);
      section.items = section.items.filter((_, i) => i !== itemIdx);
      sections[sectionIdx] = section;
      return { ...prev, sections };
    });
  };

  const renderMethodTab = () => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid #E5E7EB",
        p: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827" mb={0.5}>
            Phương pháp kiểm tra
          </Typography>
          <Typography variant="body2" color="#6B7280">
            Quản lý danh sách phương pháp để gán vào từng hạng mục checklist.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Tìm theo mã hoặc tên phương pháp..."
            value={methodSearch}
            onChange={(e) => setMethodSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMethods}
            sx={{ textTransform: "none" }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetMethodForm();
              setMethodDialogOpen(true);
            }}
            sx={{
              textTransform: "none",
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
            }}
          >
            Thêm phương pháp
          </Button>
        </Stack>
      </Stack>

      {methodError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {methodError}
        </Alert>
      )}

      {loadingMethods ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#F97316" }} />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#F9FAFB" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Mã</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tên phương pháp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Thứ tự</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMethods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    Chưa có phương pháp nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMethods.map((method) => (
                  <TableRow key={method.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MethodIcon
                          fontSize="small"
                          sx={{ color: "#6B7280" }}
                        />
                        <Typography fontWeight={600}>{method.code}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{method.name}</TableCell>
                    <TableCell>{method.sortOrder ?? "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={method.isActive ? "success" : "default"}
                        label={method.isActive ? "Đang dùng" : "Ngưng"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          onClick={() => {
                            setEditingMethodId(method.id);
                            setMethodForm({
                              code: method.code,
                              name: method.name,
                              sortOrder: method.sortOrder,
                              isActive: method.isActive,
                            });
                            setMethodDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteMethod(method.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  const renderTemplateFilters = () => (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{ mb: 2 }}
      alignItems={{ xs: "flex-start", md: "center" }}
    >
      <TextField
        size="small"
        placeholder="Tìm theo tên checklist..."
        value={templateSearch}
        onChange={(e) => setTemplateSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: { md: 260 } }}
      />
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Loại thiết bị</InputLabel>
        <Select
          label="Loại thiết bị"
          value={itemTypeFilter === "all" ? "all" : itemTypeFilter}
          onChange={(e) =>
            setItemTypeFilter(
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as ItemType)
            )
          }
        >
          <MenuItem value="all">Tất cả</MenuItem>
          {ITEM_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Loại kiểm tra</InputLabel>
        <Select
          label="Loại kiểm tra"
          value={inspectionTypeFilter === "all" ? "all" : inspectionTypeFilter}
          onChange={(e) =>
            setInspectionTypeFilter(
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as InspectionType)
            )
          }
        >
          <MenuItem value="all">Tất cả</MenuItem>
          {INSPECTION_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTemplates}
          sx={{ textTransform: "none" }}
        >
          Làm mới
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateTemplate}
          sx={{
            textTransform: "none",
            bgcolor: "#F97316",
            "&:hover": { bgcolor: "#EA580C" },
          }}
        >
          Tạo checklist
        </Button>
      </Stack>
    </Stack>
  );

  const renderTemplateTab = () => (
    <Stack direction="column" spacing={3}>
      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: "1px solid #E5E7EB", p: 3 }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="#111827" mb={0.5}>
              Danh sách checklist
            </Typography>
            <Typography variant="body2" color="#6B7280">
              Cấu hình cấu trúc phiếu kiểm tra cho từng loại thiết bị.
            </Typography>
          </Box>
        </Stack>

        {renderTemplateFilters()}

        {templateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {templateError}
          </Alert>
        )}

        {loadingTemplates ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#F97316" }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tên checklist</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thiết bị</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Loại kiểm tra</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      Chưa có checklist nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((tpl) => (
                    <TableRow key={tpl.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ChecklistIcon
                            fontSize="small"
                            sx={{ color: "#6B7280" }}
                          />
                          <Typography fontWeight={600}>{tpl.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{getItemTypeLabel(tpl.itemType)}</TableCell>
                      <TableCell>
                        {getInspectionTypeLabel(tpl.inspectionType)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={tpl.isActive ? "success" : "default"}
                          label={tpl.isActive ? "Đang áp dụng" : "Đã tắt"}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(tpl.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            onClick={() => handleSelectTemplate(tpl.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            onClick={() => handleEditTemplate(tpl.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={tpl.isActive ? "Tắt kích hoạt" : "Kích hoạt"}
                        >
                          <IconButton
                            color={tpl.isActive ? "success" : "default"}
                            onClick={() => handleToggleTemplateActive(tpl)}
                          >
                            {tpl.isActive ? <CheckIcon /> : <CancelIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: "1px solid #E5E7EB", p: 3 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <VisibilityIcon fontSize="small" sx={{ color: "#6B7280" }} />
          <Typography variant="h6" fontWeight={700}>
            Chi tiết template
          </Typography>
        </Stack>
        {!selectedTemplate ? (
          <Typography variant="body2" color="#6B7280">
            Chọn một checklist để xem cấu trúc chi tiết.
          </Typography>
        ) : (
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {selectedTemplate.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ my: 1.5 }} flexWrap="wrap">
              <Chip
                size="small"
                label={getItemTypeLabel(selectedTemplate.itemType)}
              />
              <Chip
                size="small"
                label={getInspectionTypeLabel(selectedTemplate.inspectionType)}
              />
              <Chip
                size="small"
                color={selectedTemplate.isActive ? "success" : "default"}
                label={selectedTemplate.isActive ? "Đang áp dụng" : "Đã tắt"}
              />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {selectedTemplate.sections.map((section) => (
                <Box
                  key={section.id}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 1.5,
                    p: 1.5,
                    bgcolor: "#F9FAFB",
                  }}
                >
                  <Typography fontWeight={700}>{section.name}</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {section.items.map((item) => (
                      <Box key={item.id} sx={{ pl: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          • {item.label}
                        </Typography>
                        {item.allowedMethods?.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {item.allowedMethods.map((m) => (
                              <Chip
                                key={m.id}
                                size="small"
                                label={m.name}
                                sx={{ mt: 0.5 }}
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Stack>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{
          mb: 3,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
          "& .Mui-selected": { color: "#F97316" },
          "& .MuiTabs-indicator": { bgcolor: "#F97316" },
        }}
      >
        <Tab value="methods" label="Phương pháp kiểm tra" />
        <Tab value="templates" label="Danh sách checklist" />
      </Tabs>

      {activeTab === "methods" && renderMethodTab()}
      {activeTab === "templates" && renderTemplateTab()}

      {/* Method dialog */}
      <Dialog
        open={methodDialogOpen}
        onClose={() => setMethodDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingMethodId ? "Cập nhật phương pháp" : "Thêm phương pháp"}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Mã phương pháp"
            fullWidth
            value={methodForm.code}
            onChange={(e) =>
              setMethodForm((prev) => ({ ...prev, code: e.target.value }))
            }
          />
          <TextField
            label="Tên phương pháp"
            fullWidth
            value={methodForm.name}
            onChange={(e) =>
              setMethodForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <TextField
            label="Thứ tự hiển thị"
            type="number"
            fullWidth
            value={methodForm.sortOrder}
            onChange={(e) =>
              setMethodForm((prev) => ({
                ...prev,
                sortOrder: Number(e.target.value),
              }))
            }
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Switch
              checked={methodForm.isActive}
              onChange={(e) =>
                setMethodForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
            />
            <Typography>Đang hoạt động</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setMethodDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitMethod}
            sx={{
              textTransform: "none",
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => {
          setTemplateDialogOpen(false);
          setItemErrors({}); // Clear errors khi đóng dialog
        }}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingTemplateId ? "Cập nhật checklist" : "Tạo checklist mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Tên checklist"
              fullWidth
              value={templateForm.name}
              onChange={(e) =>
                setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Loại thiết bị</InputLabel>
                <Select
                  label="Loại thiết bị"
                  value={templateForm.itemType}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      itemType: Number(e.target.value) as ItemType,
                    }))
                  }
                >
                  {ITEM_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Loại kiểm tra</InputLabel>
                <Select
                  label="Loại kiểm tra"
                  value={templateForm.inspectionType ?? ""}
                  onChange={(e) => {
                    const value = String(e.target.value);
                    setTemplateForm((prev) => ({
                      ...prev,
                      inspectionType:
                        value === "" ||
                        value === "null" ||
                        value === "undefined"
                          ? null
                          : (Number(value) as InspectionType),
                    }));
                  }}
                >
                  {INSPECTION_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={templateForm.isActive}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
              />
              <Typography>Kích hoạt sau khi lưu</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                Các phần trong checklist
              </Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={addSection}
                sx={{ textTransform: "none" }}
              >
                Thêm phần
              </Button>
            </Stack>

            {templateForm.sections.map((section, sectionIdx) => (
              <Accordion
                key={`section-${sectionIdx}`}
                defaultExpanded
                disableGutters
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ width: "100%", pr: 2 }}
                  >
                    <TextField
                      label="Tên phần"
                      fullWidth
                      value={section.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateSection(sectionIdx, "name", e.target.value)
                      }
                    />
                    <TextField
                      label="Thứ tự"
                      type="number"
                      sx={{ maxWidth: 120 }}
                      value={section.sortOrder}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateSection(
                          sectionIdx,
                          "sortOrder",
                          Number(e.target.value)
                        )
                      }
                    />
                    <Tooltip title="Xóa phần">
                      <span>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(sectionIdx);
                          }}
                          disabled={templateForm.sections.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {section.items.map((item, itemIdx) => (
                      <Paper
                        key={`item-${sectionIdx}-${itemIdx}`}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 1.5, borderColor: "#E5E7EB" }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                        >
                          <TextField
                            label="Tiêu đề hạng mục"
                            fullWidth
                            value={item.label}
                            onChange={(e) =>
                              updateItem(
                                sectionIdx,
                                itemIdx,
                                "label",
                                e.target.value
                              )
                            }
                            error={
                              !!itemErrors[
                                `section-${sectionIdx}-item-${itemIdx}-label`
                              ]
                            }
                            helperText={
                              itemErrors[
                                `section-${sectionIdx}-item-${itemIdx}-label`
                              ]
                            }
                          />
                          <TextField
                            label="Thứ tự"
                            type="number"
                            sx={{ maxWidth: 160 }}
                            value={item.sortOrder}
                            onChange={(e) =>
                              updateItem(
                                sectionIdx,
                                itemIdx,
                                "sortOrder",
                                Number(e.target.value)
                              )
                            }
                            error={
                              !!itemErrors[
                                `section-${sectionIdx}-item-${itemIdx}-sortOrder`
                              ]
                            }
                            helperText={
                              itemErrors[
                                `section-${sectionIdx}-item-${itemIdx}-sortOrder`
                              ]
                            }
                          />
                          <Tooltip title="Xóa hạng mục">
                            <IconButton
                              color="error"
                              onClick={() => removeItem(sectionIdx, itemIdx)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                          <InputLabel>Phương pháp được chọn</InputLabel>
                          <Select
                            label="Phương pháp được chọn"
                            multiple
                            value={item.allowedMethodIds ?? []}
                            onChange={(e) =>
                              updateItem(
                                sectionIdx,
                                itemIdx,
                                "allowedMethodIds",
                                e.target.value as string[]
                              )
                            }
                            renderValue={(selected) =>
                              methods
                                .filter((m) => selected.includes(m.id))
                                .map((m) => m.name)
                                .join(", ")
                            }
                          >
                            {methods.map((method) => (
                              <MenuItem key={method.id} value={method.id}>
                                {method.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Paper>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => addItem(sectionIdx)}
                      sx={{ textTransform: "none", alignSelf: "flex-start" }}
                    >
                      Thêm hạng mục
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setTemplateDialogOpen(false);
              setItemErrors({}); // Clear errors khi đóng dialog
            }}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitTemplate}
            sx={{
              textTransform: "none",
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
            }}
          >
            Lưu checklist
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InspectionManagement;
