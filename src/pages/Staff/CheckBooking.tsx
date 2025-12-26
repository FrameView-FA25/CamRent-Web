import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Tab,
  Tabs,
  Tooltip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  Search,
  Refresh,
  Assignment,
  LocalShipping,
  CheckCircleOutline,
  TaskAlt,
  Visibility,
  PlaylistAddCheck,
  Clear,
  MoreVert,
  Gavel,
  Update,
} from "@mui/icons-material";
import {
  fetchStaffBookings,
  fetchBookingById,
  updateBookingStatus,
} from "../../services/booking.service";
import type { Booking } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { useNavigate } from "react-router-dom";

import InspectionFormDialog from "../../components/Modal/Staff/InspectionFormDialog";

import {
  updateInspectionForm,
  deleteInspection,
  getInspectionFormsByBookingId,
  getInspectionFormById,
  type UpdateInspectionFormRequest,
  type InspectionFormResponse,
  type InspectionFormSummaryResponse,
} from "../../services/inspection.service";
import { toast } from "react-toastify";
import type {
  // VerificationItem,
  VerificationItemType,
} from "../../types/verification.types";

import type { InspectionListItem } from "../../components/Modal/Staff/InspectionListDialog";
import InspectionFormListDialog from "../../components/Modal/Staff/InspectionFormListDialog";
import EditInspectionDialog, {
  type EditInspectionFormState,
} from "../../components/Modal/Staff/EditInspectionDialog";
import BookingDisputeListDialog from "../../components/Modal/Staff/BookingDisputeListDialog";
import CreateDisputeDialog from "../../components/Modal/Staff/CreateDisputeDialog";
import { createDispute } from "../../services/dispute.service";
import type { CreateDisputeRequest } from "../../types/booking.types";

const CheckBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [inspectionListOpen, setInspectionListOpen] = useState(false);
  const [inspectionListLoading, setInspectionListLoading] = useState(false);
  const [inspectionListSubtitle, setInspectionListSubtitle] = useState("");
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
  const [deletingInspectionId, setDeletingInspectionId] = useState<
    string | null
  >(null);
  const [activeInspectionBookingId, setActiveInspectionBookingId] = useState<
    string | null
  >(null);
  // const [currentInspectionItems, setCurrentInspectionItems] = useState<
  //   VerificationItem[]
  // >([]);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [actionMenuBookingId, setActionMenuBookingId] = useState<string | null>(
    null
  );
  const [deviceMenuAnchorEl, setDeviceMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [deviceMenuBookingId, setDeviceMenuBookingId] = useState<string | null>(
    null
  );
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<string>("");
  const [createDisputeDialogOpen, setCreateDisputeDialogOpen] = useState(false);
  const [createDisputeBookingId, setCreateDisputeBookingId] =
    useState<string>("");
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [updateStatusBookingId, setUpdateStatusBookingId] =
    useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const navigate = useNavigate();
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    const { bookings: fetchedBookings, error: fetchError } =
      await fetchStaffBookings();

    if (fetchError) {
      setError(fetchError);
    } else {
      const sortedBookings = (fetchedBookings || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Mới nhất trước
      });
      setBookings(sortedBookings);
    }
    setLoading(false);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = (booking: Booking) => {
    navigate(`/staff/booking/${booking.id}`);
  };

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    bookingId: string
  ) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuBookingId(bookingId);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setActionMenuBookingId(null);
  };

  const handleOpenDeviceMenu = (
    event: React.MouseEvent<HTMLElement>,
    bookingId: string
  ) => {
    setDeviceMenuAnchorEl(event.currentTarget);
    setDeviceMenuBookingId(bookingId);
  };

  const handleCloseDeviceMenu = () => {
    setDeviceMenuAnchorEl(null);
    setDeviceMenuBookingId(null);
  };

  const handleOpenInspection = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setInspectionModalOpen(true);
  };

  const handleCloseInspection = () => {
    setInspectionModalOpen(false);
    setSelectedBookingId(null);
  };

  // const getItemTypeNumber = (value?: string | number): number | undefined => {
  //   if (value === undefined || value === null) return undefined;
  //   if (typeof value === "number" && !Number.isNaN(value)) return value;
  //   const normalized = value.toString().toLowerCase();
  //   if (normalized === "camera" || normalized === "1") return 1;
  //   if (normalized === "accessory" || normalized === "2") return 2;
  //   if (normalized === "combo" || normalized === "3") return 3;
  //   return undefined;
  // };

  // const convertBookingItemsToVerificationItems = (
  //   items: Booking["items"]
  // ): VerificationItem[] => {
  //   return items
  //     .filter(
  //       (item) => item.itemType === "Camera" || item.itemType === "Accessory"
  //     )
  //     .map((item) => ({
  //       itemId:
  //         item.itemId ||
  //         item.cameraId ||
  //         item.accessoryId ||
  //         item.productId ||
  //         item.comboId ||
  //         "",
  //       itemName: item.itemName || getItemName(item),
  //       itemType: item.itemType === "Camera" ? "1" : "2",
  //     }));
  // };

  const handleInspectionSuccess = async (
    data: Record<string, unknown>
  ): Promise<void> => {
    try {
      // InspectionFormDialog đã xử lý việc tạo phiếu kiểm tra
      // Chỉ cần refresh dữ liệu
      if (data.success) {
        await loadAssignments();
        setInspectionModalOpen(false);
      }
    } catch (err: unknown) {
      console.error("Lỗi refresh dữ liệu:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi refresh dữ liệu";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const shortId = (id: string) =>
    id.length > 8 ? `${id.substring(0, 8)}...` : id;

  const loadInspectionList = async (bookingId: string) => {
    setInspectionListLoading(true);
    try {
      // Sử dụng API mới: GET /api/inspection-forms/booking/{bookingId}
      const forms = await getInspectionFormsByBookingId(bookingId);

      console.log("📋 Inspection forms from API:", forms);

      if (forms.length === 0) {
        setInspectionForms([]);
        setInspectionFormDetails(new Map());
        setItemNameMap(new Map());
        // setCurrentInspectionItems([]);
        toast.info("Chưa có phiếu kiểm tra nào cho đơn hàng này.");
        return;
      }

      // Lấy items từ booking để có thông tin itemName
      const { booking, error } = await fetchBookingById(bookingId);
      if (error || !booking) {
        throw new Error(error || "Không tìm thấy thông tin đơn hàng");
      }

      // setCurrentInspectionItems(
      //   convertBookingItemsToVerificationItems(booking.items)
      // );

      // Tạo itemNameMap
      const nameMap = new Map<string, string>();
      booking.items.forEach((item) => {
        const itemId =
          item.itemId ||
          item.cameraId ||
          item.accessoryId ||
          item.comboId ||
          item.productId;
        if (itemId) {
          nameMap.set(
            itemId,
            item.itemName || getItemName(item) || "Không xác định"
          );
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
      // setCurrentInspectionItems([]);
    } finally {
      setInspectionListLoading(false);
    }
  };

  const handleManageInspections = async (bookingId: string) => {
    setInspectionListOpen(true);
    setInspectionListSubtitle(`Đơn hàng ${shortId(bookingId)}`);
    setActiveInspectionBookingId(bookingId);
    await loadInspectionList(bookingId);
  };

  const handleCloseInspectionList = () => {
    setInspectionListOpen(false);
    setInspectionForms([]);
    setInspectionFormDetails(new Map());
    setItemNameMap(new Map());
    setInspectionListSubtitle("");
    setDeletingInspectionId(null);
    // setCurrentInspectionItems([]);
    setActiveInspectionBookingId(null);
  };

  const [editingFormId, setEditingFormId] = React.useState<string | null>(null);

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
    if (!editingInspection) return;
    setSavingInspection(true);
    try {
      // Nếu không có editingFormId, thử load từ inspectionFormDetails hoặc tìm trong forms
      let formId = editingFormId;
      if (!formId) {
        // Tìm formId từ inspectionForms dựa trên inspection.id
        const foundForm = inspectionForms.find((form) => {
          const detail = inspectionFormDetails.get(form.id);
          return detail?.rows.some(
            (r) => r.inspectionId === editingInspection.id
          );
        });
        if (foundForm) {
          formId = foundForm.id;
          setEditingFormId(formId);
        }
      }

      if (!formId) {
        throw new Error("Không tìm thấy ID phiếu kiểm tra.");
      }

      // Load form detail nếu chưa có trong cache
      let targetForm = inspectionFormDetails.get(formId);
      if (!targetForm) {
        // Thử load lại form detail
        try {
          const formDetail = await getInspectionFormById(formId);
          inspectionFormDetails.set(formId, formDetail);
          targetForm = formDetail;
        } catch (loadErr) {
          console.error("Error loading form detail:", loadErr);
          throw new Error("Không thể tải thông tin phiếu kiểm tra.");
        }
      }

      if (!targetForm) {
        throw new Error("Không tìm thấy phiếu kiểm tra.");
      }

      // Tìm row cần update
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

      // Tạo request để update form
      const updateRequest: UpdateInspectionFormRequest = {
        passed: formState.passed ?? null,
        rows: targetForm.rows.map((row) => {
          if (row.inspectionId === editingInspection.id) {
            // Update row này
            return {
              inspectionId: row.inspectionId,
              methodIds: methodIds,
              passed: formState.passed ?? null,
              notes: formState.notes || "",
            };
          }
          // Giữ nguyên các row khác
          return {
            inspectionId: row.inspectionId,
            methodIds: row.methods.map((m) => m.id),
            passed: row.passed ?? null,
            notes: row.notes || "",
          };
        }),
      };

      await updateInspectionForm(formId, updateRequest);

      // Reload forms để cập nhật UI
      if (activeInspectionBookingId) {
        await loadInspectionList(activeInspectionBookingId);
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

  const handleDeleteInspection = async (inspection: InspectionListItem) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa mục kiểm tra "${
        inspection.label || inspection.section
      }"?`
    );
    if (!confirmDelete) return;
    setDeletingInspectionId(inspection.id);
    try {
      await deleteInspection(inspection.id);
      toast.success("Xóa mục kiểm tra thành công");
      // Reload forms để cập nhật UI
      if (activeInspectionBookingId) {
        await loadInspectionList(activeInspectionBookingId);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Xóa mục kiểm tra thất bại";
      toast.error(message);
    } finally {
      setDeletingInspectionId(null);
    }
  };

  const handleOpenUpdateStatusDialog = (bookingId: string) => {
    setUpdateStatusBookingId(bookingId);
    const booking = bookings.find((b) => b.id === bookingId);
    setSelectedStatus(booking?.status || "");
    setUpdateStatusDialogOpen(true);
  };

  const handleCloseUpdateStatusDialog = () => {
    setUpdateStatusDialogOpen(false);
    setUpdateStatusBookingId("");
    setSelectedStatus("");
  };

  const handleSubmitUpdateStatus = async () => {
    if (!updateStatusBookingId || !selectedStatus) return;

    try {
      await updateBookingStatus(
        updateStatusBookingId,
        selectedStatus as
          | "Confirmed"
          | "PickedUp"
          | "Returned"
          | "Completed"
          | "Cancelled"
      );
      toast.success("Cập nhật trạng thái thành công");
      await loadAssignments();
      handleCloseUpdateStatusDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Cập nhật trạng thái thất bại"
      );
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.renterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.items.some((item) =>
          (item.itemName || getItemName(item))
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      const matchesTab =
        selectedTab === 0 ||
        // Đã xác nhận
        (selectedTab === 1 && booking.status === "Confirmed") ||
        // Đã nhận máy (và đang thuê)
        (selectedTab === 2 && booking.status === "PickedUp") ||
        // Đã trả
        (selectedTab === 3 && booking.status === "Returned") ||
        // Hoàn tất
        (selectedTab === 4 && booking.status === "Completed") ||
        // Đã hủy
        (selectedTab === 5 && booking.status === "Cancelled");

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchQuery, selectedTab]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredBookings, page, rowsPerPage]);

  // Statistics theo các trạng thái mới
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "Confirmed").length,
      pickedUp: bookings.filter((b) => b.status === "PickedUp").length,
      returned: bookings.filter((b) => b.status === "Returned").length,
      completed: bookings.filter((b) => b.status === "Completed").length,
      cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    };
  }, [bookings]);

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
                  Kiểm tra đơn hàng
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#6B7280", fontSize: "0.95rem" }}
                >
                  Danh sách đơn thuê được phân công
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={loadAssignments}
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
              sm: "repeat(3, 1fr)",
              md: "repeat(6, 1fr)",
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
                  Tất cả
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
                  Đã xác nhận
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#10B981", mt: 0.5 }}
                >
                  {stats.confirmed}
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
                <CheckCircleOutline sx={{ color: "#10B981", fontSize: 24 }} />
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
                  Đã giao máy
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#4F46E5", mt: 0.5 }}
                >
                  {stats.pickedUp}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#4F46E5", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalShipping sx={{ color: "#4F46E5", fontSize: 24 }} />
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
                  Đã trả
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#0284C7", mt: 0.5 }}
                >
                  {stats.returned}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#0284C7", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleOutline sx={{ color: "#0284C7", fontSize: 24 }} />
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
                  sx={{ fontWeight: 700, color: "#F59E0B", mt: 0.5 }}
                >
                  {stats.completed}
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
                <TaskAlt sx={{ color: "#F59E0B", fontSize: 24 }} />
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
                  Đã hủy
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#EF4444", mt: 0.5 }}
                >
                  {stats.cancelled}
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
                <Clear sx={{ color: "#EF4444", fontSize: 24 }} />
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
            placeholder="Tìm kiếm theo mã đơn, ID khách hàng, thiết bị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          {searchQuery && (
            <IconButton
              onClick={() => setSearchQuery("")}
              sx={{
                color: "#6B7280",
                "&:hover": { bgcolor: "#F3F4F6", color: "#F97316" },
              }}
            >
              <Clear />
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

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}
        >
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "#E5E7EB",
              bgcolor: "#F9FAFB",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#6B7280",
                minHeight: 56,
                "&.Mui-selected": {
                  color: "#F97316",
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#F97316",
                height: 3,
              },
            }}
          >
            <Tab label={`Tất cả (${bookings.length})`} />
            <Tab
              label={`Đã xác nhận (${
                bookings.filter((b) => b.status === "Confirmed").length
              })`}
            />
            <Tab
              label={`Đã giao máy (${
                bookings.filter((b) => b.status === "PickedUp").length
              })`}
            />
            <Tab
              label={`Đã trả (${
                bookings.filter((b) => b.status === "Returned").length
              })`}
            />
            <Tab
              label={`Hoàn tất (${
                bookings.filter((b) => b.status === "Completed").length
              })`}
            />
            <Tab
              label={`Đã hủy (${
                bookings.filter((b) => b.status === "Cancelled").length
              })`}
            />
          </Tabs>
        </Paper>

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
                    Mã đơn
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      textAlign: "center",
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
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Ngày tạo
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Thời gian thuê
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Tổng tiền
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      textAlign: "center",
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
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                      <CircularProgress sx={{ color: "#F97316" }} />
                      <Typography
                        sx={{ mt: 2, color: "#6B7280", fontSize: "0.875rem" }}
                      >
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                      <Assignment
                        sx={{ fontSize: 64, color: "#E5E7EB", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#374151", mb: 1, fontWeight: 600 }}
                      >
                        Chưa có công việc nào
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                      >
                        Bạn chưa được phân công đơn thuê nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((booking) => {
                    const statusInfo = getStatusInfo(booking.status);
                    // Map status directly to ensure consistency with status cards
                    const getStatusIconAndColor = (status: string) => {
                      switch (status) {
                        case "Confirmed":
                          return { base: "#10B981", icon: CheckCircleOutline };
                        case "PickedUp":
                          return { base: "#4F46E5", icon: LocalShipping };
                        case "Returned":
                          return { base: "#0284C7", icon: CheckCircleOutline };
                        case "Completed":
                          return { base: "#F59E0B", icon: TaskAlt };
                        case "Cancelled":
                          return { base: "#EF4444", icon: Clear };
                        default:
                          return { base: "#6B7280", icon: Assignment };
                      }
                    };
                    const palette = getStatusIconAndColor(booking.status);
                    const StatusIcon = palette.icon;
                    return (
                      <TableRow
                        key={booking.id}
                        sx={{
                          "&:hover": {
                            bgcolor: "#F9FAFB",
                          },
                          transition: "background-color 0.2s ease",
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        <TableCell>
                          <Tooltip title={booking.id}>
                            <Typography
                              sx={{
                                maxWidth: 200,
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "#111827",
                                wordBreak: "break-word",
                                cursor: "pointer",
                              }}
                            >
                              {booking.id.length > 20
                                ? `${booking.id.substring(0, 10)}...`
                                : booking.id}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {booking.items.length > 0 && (
                              <>
                                <Chip
                                  label={
                                    booking.items[0].itemName ||
                                    getItemName(booking.items[0])
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: "#F3F4F6",
                                    color: "#374151",
                                    fontWeight: 500,
                                    fontSize: "0.75rem",
                                    height: 28,
                                    cursor:
                                      booking.items.length > 1
                                        ? "pointer"
                                        : "default",
                                    "&:hover":
                                      booking.items.length > 1
                                        ? {
                                            bgcolor: "#E5E7EB",
                                          }
                                        : {},
                                    "& .MuiChip-icon": {
                                      color: "#374151",
                                      ml: 0.5,
                                    },
                                  }}
                                />
                                {booking.items.length > 1 && (
                                  <Chip
                                    label={`+${booking.items.length - 1}`}
                                    size="small"
                                    onClick={(e) =>
                                      handleOpenDeviceMenu(e, booking.id)
                                    }
                                    sx={{
                                      bgcolor: "#DBEAFE",
                                      color: "#3B82F6",
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                      height: 28,
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: "#BFDBFE",
                                      },
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#6B7280",
                              fontSize: "0.8125rem",
                            }}
                          >
                            {formatDate(booking.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#6B7280",
                              fontSize: "0.8125rem",
                            }}
                          >
                            {formatDate(booking.pickupAt)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6B7280", fontSize: "0.8125rem" }}
                          >
                            - {formatDate(booking.returnAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#111827",
                              fontSize: "0.875rem",
                            }}
                          >
                            {formatCurrency(
                              booking.snapshotRentalTotal +
                                booking.snapshotDepositAmount
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<StatusIcon sx={{ fontSize: 16 }} />}
                            label={statusInfo.label}
                            size="small"
                            sx={{
                              borderRadius: 999,
                              px: 1.25,
                              height: 26,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              bgcolor: alpha(palette.base, 0.12),
                              color: palette.base,
                              border: `1px solid ${alpha(palette.base, 0.25)}`,
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
                                handleOpenActionMenu(event, booking.id)
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

          {/* Pagination */}
          {!loading && filteredBookings.length > 0 && (
            <TablePagination
              component="div"
              count={filteredBookings.length}
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
                bgcolor: "#F9FAFB",
                px: 2,
                "& .MuiTablePagination-select": {
                  borderRadius: 1,
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#F97316",
                },
                "& .MuiTablePagination-actions button": {
                  color: "#F97316",
                  "&:disabled": {
                    color: "#9CA3AF",
                  },
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

      {/* Inspection Modal */}
      {selectedBookingId && (
        <InspectionFormDialog
          open={inspectionModalOpen}
          onClose={handleCloseInspection}
          onSubmit={handleInspectionSuccess}
          inspectionType="Booking" // Thêm prop này
          defaultValues={{
            verifyId: selectedBookingId,
            items: (
              bookings.find((b) => b.id === selectedBookingId)?.items || []
            )
              .filter(
                (it) => it.itemType === "Camera" || it.itemType === "Accessory"
              )
              .map((it) => {
                let itemTypeStr: VerificationItemType = "1";
                if (it.itemType === "Camera") itemTypeStr = "1";
                else if (it.itemType === "Accessory") itemTypeStr = "2";

                return {
                  itemId: it.itemId || "",
                  itemName: it.itemName || "",
                  itemType: itemTypeStr,
                };
              }),
          }}
        />
      )}
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
            const booking = bookings.find((b) => b.id === actionMenuBookingId);
            if (booking) {
              handleViewDetail(booking);
            }
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" sx={{ color: "#C8501D" }} />
          </ListItemIcon>
          <ListItemText primary="Xem chi tiết" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuBookingId) {
              handleManageInspections(actionMenuBookingId);
            }
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" sx={{ color: "#1D4ED8" }} />
          </ListItemIcon>
          <ListItemText primary="Xem phiếu kiểm tra" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            const booking = bookings.find((b) => b.id === actionMenuBookingId);
            if (!booking) {
              handleCloseActionMenu();
              return;
            }

            handleOpenInspection(booking.id);
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <PlaylistAddCheck fontSize="small" sx={{ color: "#F97316" }} />
          </ListItemIcon>
          <ListItemText primary="Tạo phiếu kiểm tra" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenuBookingId) {
              setDisputeBookingId(actionMenuBookingId);
              setDisputeDialogOpen(true);
            }
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <Gavel fontSize="small" sx={{ color: "#9333EA" }} />
          </ListItemIcon>
          <ListItemText primary="Xem Bồi Thường" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuBookingId) {
              handleOpenUpdateStatusDialog(actionMenuBookingId);
            }
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <Update fontSize="small" sx={{ color: "#F97316" }} />
          </ListItemIcon>
          <ListItemText primary="Cập nhật trạng thái" />
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={deviceMenuAnchorEl}
        open={Boolean(deviceMenuAnchorEl)}
        onClose={handleCloseDeviceMenu}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.1)",
            mt: 1,
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {deviceMenuBookingId &&
          bookings
            .find((b) => b.id === deviceMenuBookingId)
            ?.items.map((item, idx) => {
              const itemName = item.itemName || getItemName(item);
              return (
                <MenuItem
                  key={idx}
                  onClick={handleCloseDeviceMenu}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: "#F9FAFB",
                    },
                  }}
                >
                  <ListItemText
                    primary={itemName}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#111827",
                    }}
                  />
                </MenuItem>
              );
            })}
      </Menu>
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
        onDeleteItem={handleDeleteInspection}
        deletingInspectionId={deletingInspectionId}
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
      <CreateDisputeDialog
        open={createDisputeDialogOpen}
        onClose={() => setCreateDisputeDialogOpen(false)}
        bookingId={createDisputeBookingId}
        onSubmit={async (data: CreateDisputeRequest) => {
          await createDispute(data);
          toast.success("Đã tạo dispute thành công");
          setCreateDisputeDialogOpen(false);
        }}
      />
      <BookingDisputeListDialog
        open={disputeDialogOpen}
        onClose={() => setDisputeDialogOpen(false)}
        bookingId={disputeBookingId}
        onCreateDispute={() => {
          setDisputeDialogOpen(false);
          setCreateDisputeBookingId(disputeBookingId);
          setCreateDisputeDialogOpen(true);
        }}
        allowCreateDispute={
          bookings.find((b) => b.id === disputeBookingId)?.status !==
          "Completed"
        }
      />

      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusDialogOpen}
        onClose={handleCloseUpdateStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          Cập nhật trạng thái đơn hàng
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              Chọn trạng thái mới
            </FormLabel>
            <RadioGroup
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <FormControlLabel
                value="Confirmed"
                control={<Radio sx={{ color: "#10B981" }} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleOutline
                      sx={{ color: "#10B981", fontSize: 20 }}
                    />
                    <Typography>Đã xác nhận</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="PickedUp"
                control={<Radio sx={{ color: "#3B82F6" }} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShipping sx={{ color: "#3B82F6", fontSize: 20 }} />
                    <Typography>Đã giao máy</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="Returned"
                control={<Radio sx={{ color: "#8B5CF6" }} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TaskAlt sx={{ color: "#8B5CF6", fontSize: 20 }} />
                    <Typography>Đã trả máy</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="Completed"
                control={<Radio sx={{ color: "#059669" }} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TaskAlt sx={{ color: "#059669", fontSize: 20 }} />
                    <Typography>Hoàn tất</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="Cancelled"
                control={<Radio sx={{ color: "#EF4444" }} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Clear sx={{ color: "#EF4444", fontSize: 20 }} />
                    <Typography>Hủy đơn</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseUpdateStatusDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitUpdateStatus}
            variant="contained"
            disabled={!selectedStatus}
            sx={{ bgcolor: "#F97316", fontWeight: 600 }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckBookings;
