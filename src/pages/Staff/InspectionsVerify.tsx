import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Tooltip,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Assignment,
  Search,
  Refresh,
  Visibility,
  PendingActions,
  CheckCircle,
  TaskAlt,
  FilterList,
  HourglassEmpty,
  CheckCircleOutline,
  PlaylistAddCheck,
  Clear,
  MoreVert,
} from "@mui/icons-material";
import {
  updateInspectionForm,
  getInspectionFormsByVerificationId,
  getInspectionFormById,
  type UpdateInspectionFormRequest,
  type InspectionFormResponse,
  type InspectionFormSummaryResponse,
} from "../../services/inspection.service";
import InspectionFormDialog from "../../components/Modal/Staff/InspectionFormDialog";
import { verificationService } from "../../services/verification.service";
import type { Verification } from "../../types/verification.types";
import { toast } from "react-toastify";
import type { InspectionListItem } from "../../components/Modal/Staff/InspectionListDialog";
import InspectionFormListDialog from "../../components/Modal/Staff/InspectionFormListDialog";
import EditInspectionDialog, {
  type EditInspectionFormState,
} from "../../components/Modal/Staff/EditInspectionDialog";

const statusPalette = {
  warning: { base: "#F59E0B", icon: HourglassEmpty },
  success: { base: "#10B981", icon: TaskAlt },
  info: { base: "#0284C7", icon: CheckCircleOutline },
  error: { base: "#F43F5E", icon: Clear },
  default: { base: "#6B7280", icon: Assignment },
} as const;

type StatusPaletteKey = keyof typeof statusPalette;

const verificationStatusMap: Record<
  string,
  { label: string; palette: StatusPaletteKey }
> = {
  pending: { label: "Chờ xử lý", palette: "warning" },
  // Đã duyệt: dùng màu xanh lá cho đồng bộ với card thống kê
  approved: { label: "Đã duyệt", palette: "success" },
  completed: { label: "Hoàn thành", palette: "success" },
  rejected: { label: "Từ chối", palette: "error" },
  cancelled: { label: "Đã hủy", palette: "error" },
};

const getVerificationStatusInfo = (status: string) => {
  const normalized = status?.toLowerCase?.() || "default";
  return (
    verificationStatusMap[normalized] || {
      label: status,
      palette: "default",
    }
  );
};

const Inspections: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getVerificationsByUserId();

      const sortedData = (res || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Mới nhất trước
      });
      setData(sortedData);
    } catch (err: unknown) {
      let message = "";
      if (typeof err === "object" && err !== null && "message" in err) {
        message = String((err as { message?: unknown }).message);
      } else {
        message = String(err);
      }
      setError(message || "Lỗi khi tải dữ liệu");
      toast.error(message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((d) => {
      return (
        d.id.toLowerCase().includes(q) ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.branchName || "").toLowerCase().includes(q) ||
        d.items?.some((it) => it.itemName.toLowerCase().includes(q))
      );
    });
  }, [data, query]);

  const paginatedData = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: data.length,
      pending: data.filter((d) => d.status.toLowerCase() === "pending").length,
      approved: data.filter((d) => d.status.toLowerCase() === "approved")
        .length,
      completed: data.filter((d) => d.status.toLowerCase() === "completed")
        .length,
      rejected: data.filter((d) => d.status.toLowerCase() === "rejected")
        .length,
    };
  }, [data]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // State cho dialog tạo inspection
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogRow, setDialogRow] = useState<Verification | null>(null);
  const [inspectionListOpen, setInspectionListOpen] = useState(false);
  const [inspectionListSubtitle, setInspectionListSubtitle] = useState("");
  const [inspectionListLoading, setInspectionListLoading] = useState(false);
  // State cho form-based display
  const [inspectionForms, setInspectionForms] = useState<
    InspectionFormSummaryResponse[]
  >([]);
  const [inspectionFormDetails, setInspectionFormDetails] = useState<
    Map<string, InspectionFormResponse>
  >(new Map());
  const [itemNameMap, setItemNameMap] = useState<Map<string, string>>(
    new Map()
  );
  const [editingInspection, setEditingInspection] =
    useState<InspectionListItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingInspection, setSavingInspection] = useState(false);
  const [activeVerificationId, setActiveVerificationId] = useState<
    string | null
  >(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [actionMenuVerificationId, setActionMenuVerificationId] = useState<
    string | null
  >(null);

  // Mở dialog với row tương ứng
  const openInspectionDialog = (row: Verification) => {
    setDialogRow(row);
    setOpenDialog(true);
  };

  const handleViewDetail = (row: Verification) => {
    navigate(`/staff/verification/${row.id}`);
  };

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    verificationId: string
  ) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuVerificationId(verificationId);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setActionMenuVerificationId(null);
  };

  // Xử lý submit tạo inspection
  // InspectionFormDialog đã xử lý việc tạo phiếu kiểm tra, chỉ cần refresh dữ liệu
  const handleSubmitInspection = async (form: Record<string, unknown>) => {
    try {
      if (form.success) {
        setOpenDialog(false);
        await load();
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: unknown }).message
          : err;
      toast.error("Lỗi refresh dữ liệu: " + (message || "Không xác định"));
    }
  };

  const shortId = (id: string) =>
    id.length > 8 ? `${id.substring(0, 8)}...` : id;

  const loadVerificationInspections = async (verificationId: string) => {
    setInspectionListLoading(true);
    try {
      // Sử dụng API mới: GET /api/inspection-forms/verification/{verificationId}
      const forms = await getInspectionFormsByVerificationId(verificationId);

      console.log("📋 Inspection forms from API:", forms);

      if (forms.length === 0) {
        setInspectionForms([]);
        setInspectionFormDetails(new Map());
        setItemNameMap(new Map());
        toast.info("Chưa có phiếu kiểm tra nào cho yêu cầu này.");
        return;
      }

      // Lấy chi tiết verification để có items
      const verificationDetail = await verificationService.getVerificationById(
        verificationId
      );

      // Tạo itemNameMap
      const nameMap = new Map<string, string>();
      verificationDetail.items?.forEach((item) => {
        if (item.itemId) {
          nameMap.set(item.itemId, item.itemName || "Không xác định");
        }
      });
      setItemNameMap(nameMap);

      // Lưu forms
      setInspectionForms(forms);

      // Load chi tiết từng form
      const formDetailsMap = new Map<string, InspectionFormResponse>();
      console.log(`📝 Processing ${forms.length} forms...`);

      for (const form of forms) {
        try {
          const formDetail = await getInspectionFormById(form.id);
          console.log(
            `  📋 Form ${form.id} has ${formDetail.rows.length} rows`
          );
          formDetailsMap.set(form.id, formDetail);
        } catch (err) {
          console.error(`Error loading form ${form.id}:`, err);
        }
      }

      setInspectionFormDetails(formDetailsMap);
      console.log(
        `✅ Loaded ${formDetailsMap.size} form details (from ${forms.length} forms)`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải phiếu kiểm tra";
      toast.error(message);
      setInspectionForms([]);
      setInspectionFormDetails(new Map());
      setItemNameMap(new Map());
    } finally {
      setInspectionListLoading(false);
    }
  };

  const handleManageVerificationInspections = async (
    verificationId: string
  ) => {
    setInspectionListOpen(true);
    setInspectionListSubtitle(`Yêu cầu ${shortId(verificationId)}`);
    setActiveVerificationId(verificationId);
    await loadVerificationInspections(verificationId);
  };

  const [editingFormId, setEditingFormId] = React.useState<string | null>(null);

  const handleCloseInspectionList = () => {
    setInspectionListOpen(false);
    setInspectionForms([]);
    setInspectionFormDetails(new Map());
    setItemNameMap(new Map());
    setInspectionListSubtitle("");
    setActiveVerificationId(null);
  };

  const handleEditInspection = (
    inspection: InspectionListItem,
    formId: string
  ) => {
    setEditingInspection(inspection);
    setEditingFormId(formId);
    setEditDialogOpen(true);
  };

  const handleCloseEditInspection = () => {
    setEditDialogOpen(false);
    setEditingInspection(null);
    setEditingFormId(null);
  };

  const handleSubmitEditInspection = async (
    formState: EditInspectionFormState
  ) => {
    if (!editingInspection || !editingFormId) return;
    setSavingInspection(true);
    try {
      const targetForm: InspectionFormResponse | undefined =
        inspectionFormDetails.get(editingFormId);

      if (!targetForm) {
        throw new Error("Không tìm thấy phiếu kiểm tra chứa mục này.");
      }

      const targetRow = targetForm.rows.find(
        (r) => r.inspectionId === editingInspection.id
      );
      if (!targetRow) {
        throw new Error("Không tìm thấy mục kiểm tra trong phiếu.");
      }

      // Sử dụng methodIds trực tiếp từ formState (theo API backend)
      // Nếu không có methodIds, fallback về parse từ value (tương thích ngược)
      const methodIds =
        formState.methodIds && formState.methodIds.length > 0
          ? formState.methodIds
          : (() => {
              // Fallback: parse từ value nếu methodIds không có
              const methodNames = formState.value
                .split(", ")
                .map((m) => m.trim())
                .filter((m) => m !== "");
              return targetRow.methods
                .filter((m) => methodNames.includes(m.name))
                .map((m) => m.id);
            })();

      const updateRequest: UpdateInspectionFormRequest = {
        passed: formState.passed ?? null,
        rows: targetForm.rows.map((row) => {
          if (row.inspectionId === editingInspection.id) {
            return {
              inspectionId: row.inspectionId,
              methodIds: methodIds,
              passed: formState.passed ?? null,
              notes: formState.notes || "",
            };
          }
          return {
            inspectionId: row.inspectionId,
            methodIds: row.methods.map((m) => m.id),
            passed: row.passed ?? null,
            notes: row.notes || "",
          };
        }),
      };

      await updateInspectionForm(editingFormId, updateRequest);

      if (activeVerificationId) {
        await loadVerificationInspections(activeVerificationId);
      }

      toast.success("Cập nhật phiếu kiểm tra thành công");
      handleCloseEditInspection();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Cập nhật phiếu kiểm tra thất bại";
      toast.error(message);
    } finally {
      setSavingInspection(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        minHeight: "100vh",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  bgcolor: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
                }}
              >
                <Assignment sx={{ color: "white", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 0.5,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                  }}
                >
                  Yêu cầu kiểm tra
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#6B7280", fontSize: "0.95rem" }}
                >
                  Danh sách yêu cầu kiểm tra được phân công cho bạn
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={load}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: "#F97316",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    bgcolor: "#FFF7ED",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#F97316" }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(4, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Tổng yêu cầu
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#111827", mt: 0.5 }}
                >
                  {stats.total}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#3B82F6", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Assignment sx={{ color: "#3B82F6", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Chờ xử lý
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#F59E0B", mt: 0.5 }}
                >
                  {stats.pending}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#F59E0B", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PendingActions sx={{ color: "#F59E0B", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Đã duyệt
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#10B981", mt: 0.5 }}
                >
                  {stats.approved}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#10B981", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle sx={{ color: "#10B981", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Hoàn thành
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#3B82F6", mt: 0.5 }}
                >
                  {stats.completed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#3B82F6", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TaskAlt sx={{ color: "#3B82F6", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Từ chối
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#EF4444", mt: 0.5 }}
                >
                  {stats.rejected}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#EF4444", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TaskAlt sx={{ color: "#EF4444", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid #E5E7EB",
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã, tên, thiết bị, chi nhánh..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F9FAFB",
                "& fieldset": {
                  borderColor: "#E5E7EB",
                },
                "&:hover fieldset": {
                  borderColor: "#F97316",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#F97316",
                  borderWidth: 2,
                },
              },
            }}
          />
          {query && (
            <IconButton
              onClick={() => setQuery("")}
              sx={{
                color: "#6B7280",
                "&:hover": { bgcolor: "#F3F4F6", color: "#F97316" },
              }}
            >
              <FilterList />
            </IconButton>
          )}
        </Paper>

        {/* Error */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FEF2F2",
              border: "1px solid #FEE2E2",
            }}
          >
            <Typography color="error" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Paper>
        )}

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Mã yêu cầu
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Tên khách hàng
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Thiết bị
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Chi nhánh
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Ngày kiểm tra
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 8 }}>
                      <CircularProgress sx={{ color: "#F97316", mb: 2 }} />
                      <Typography sx={{ color: "#6B7280", fontWeight: 500 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 10 }}>
                      <Assignment
                        sx={{
                          fontSize: 72,
                          color: "#E5E7EB",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#374151", mb: 1, fontWeight: 600 }}
                      >
                        Chưa có yêu cầu kiểm tra
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                        {query
                          ? "Không tìm thấy kết quả phù hợp"
                          : "Bạn chưa được phân công hoặc chưa có yêu cầu"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const statusDisplay = getVerificationStatusInfo(row.status);
                    const palette =
                      statusPalette[statusDisplay.palette] ||
                      statusPalette.default;
                    const StatusIcon = palette.icon;
                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:hover": { bgcolor: "#FFF7ED" },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            wordBreak: "break-word",
                            color: "#6B7280",
                            fontSize: "0.875rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {row.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#111827",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {row.items?.slice(0, 2).map((it) => (
                              <Chip
                                key={it.itemId}
                                label={it.itemName}
                                size="small"
                                sx={{
                                  bgcolor: "#F3F4F6",
                                  color: "#374151",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            ))}
                            {row.items && row.items.length > 2 && (
                              <Chip
                                label={`+${row.items.length - 2}`}
                                size="small"
                                sx={{
                                  bgcolor: "#FFF7ED",
                                  color: "#F97316",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#374151",
                            fontSize: "0.875rem",
                          }}
                        >
                          {row.branchName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#6B7280",
                            fontSize: "0.875rem",
                          }}
                        >
                          {new Date(row.inspectionDate).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<StatusIcon sx={{ fontSize: 16 }} />}
                            label={statusDisplay.label}
                            size="small"
                            sx={{
                              borderRadius: 999,
                              px: 1.25,
                              height: 26,
                              bgcolor: alpha(palette.base, 0.12),
                              color: palette.base,
                              border: `1px solid ${alpha(palette.base, 0.25)}`,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              "& .MuiChip-icon": {
                                color: palette.base,
                                ml: 0.25,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Hành động">
                            <IconButton
                              size="small"
                              onClick={(event) =>
                                handleOpenActionMenu(event, row.id)
                              }
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length > 0 && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng ${
                  count !== -1 ? count : `nhiều hơn ${to}`
                }`
              }
              sx={{
                borderTop: "1px solid #E5E7EB",
                "& .MuiTablePagination-toolbar": {
                  px: 2,
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  },
              }}
            />
          )}
        </Paper>
      </Container>

      {/* Dialogs */}
      <InspectionFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitInspection}
        inspectionType="Verification" // Thêm prop này
        defaultValues={
          dialogRow
            ? {
                verifyId: dialogRow.id,
                items: dialogRow.items || [],
              }
            : {}
        }
      />
      <InspectionFormListDialog
        open={inspectionListOpen}
        onClose={() => {
          handleCloseInspectionList();
          handleCloseEditInspection();
        }}
        title="Phiếu kiểm tra thiết bị"
        subtitle={inspectionListSubtitle}
        forms={inspectionForms}
        formDetails={inspectionFormDetails}
        loading={inspectionListLoading}
        onEditItem={handleEditInspection}
        itemNameMap={itemNameMap}
      />
      <EditInspectionDialog
        open={editDialogOpen}
        inspection={editingInspection}
        formId={editingFormId || undefined}
        saving={savingInspection}
        onClose={handleCloseEditInspection}
        onSubmit={handleSubmitEditInspection}
      />
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.1)",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            const row = data.find((d) => d.id === actionMenuVerificationId);
            // close menu first to avoid UI flicker before navigation
            handleCloseActionMenu();
            if (row) {
              handleViewDetail(row);
            }
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" sx={{ color: "#C8501D" }} />
          </ListItemIcon>
          <ListItemText primary="Xem chi tiết" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = actionMenuVerificationId;
            handleCloseActionMenu();
            if (id) {
              handleManageVerificationInspections(id);
            }
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" sx={{ color: "#1D4ED8" }} />
          </ListItemIcon>
          <ListItemText primary="Xem phiếu kiểm tra" />
        </MenuItem>
        {(() => {
          const target = data.find((d) => d.id === actionMenuVerificationId);
          if (!target) return false;
          const status = String(target.status || "").toLowerCase();
          // hide create action when verification is approved or completed
          return status !== "approved" && status !== "completed";
        })() && (
          <MenuItem
            onClick={() => {
              const row = data.find((d) => d.id === actionMenuVerificationId);
              handleCloseActionMenu();
              if (row) {
                openInspectionDialog(row);
              }
            }}
          >
            <ListItemIcon>
              <PlaylistAddCheck fontSize="small" sx={{ color: "#F97316" }} />
            </ListItemIcon>
            <ListItemText primary="Tạo phiếu kiểm tra" />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Inspections;
