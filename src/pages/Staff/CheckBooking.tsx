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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Button,
  Tab,
  Tabs,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Search,
  Refresh,
  Assignment,
  HourglassEmpty,
  LocalShipping,
  CheckCircleOutline,
  TaskAlt,
  Visibility,
  PlaylistAddCheck,
  Clear,
  Edit,
} from "@mui/icons-material";
import {
  fetchStaffBookings,
  fetchBookingById,
} from "../../services/booking.service";
import type { Booking, BookingInspection } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
import { useNavigate } from "react-router-dom";
import CheckBookingDialog from "../../components/Modal/CheckBookingDialog";
import {
  createInspection,
  updateInspection,
  deleteInspection,
} from "../../services/inspection.service";
import { toast } from "react-toastify";
import type {
  VerificationItem,
  VerificationItemType,
} from "../../types/verification.types";
import InspectionListDialog, {
  type InspectionListItem,
} from "../../components/Modal/InspectionListDialog";
import EditInspectionDialog, {
  type EditInspectionFormState,
} from "../../components/Modal/EditInspectionDialog";

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
  const [inspectionList, setInspectionList] = useState<InspectionListItem[]>(
    []
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
  const [currentInspectionItems, setCurrentInspectionItems] = useState<
    VerificationItem[]
  >([]);
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
      setBookings(fetchedBookings);
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

  const handleOpenInspection = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setInspectionModalOpen(true);
  };

  const handleCloseInspection = () => {
    setInspectionModalOpen(false);
    setSelectedBookingId(null);
  };

  const getItemTypeNumber = (value?: string | number): number | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    const normalized = value.toString().toLowerCase();
    if (normalized === "camera" || normalized === "1") return 1;
    if (normalized === "accessory" || normalized === "2") return 2;
    if (normalized === "combo" || normalized === "3") return 3;
    return undefined;
  };

  const convertBookingItemsToVerificationItems = (
    items: Booking["items"]
  ): VerificationItem[] => {
    return items
      .filter(
        (item) => item.itemType === "Camera" || item.itemType === "Accessory"
      )
      .map((item) => ({
        itemId:
          item.itemId ||
          item.cameraId ||
          item.accessoryId ||
          item.productId ||
          item.comboId ||
          "",
        itemName: item.itemName || getItemName(item),
        itemType: item.itemType === "Camera" ? "1" : "2",
      }));
  };

  const resolveInspectionItemMetadata = (inspection: InspectionListItem) => {
    const normalizedName = inspection.itemName?.toLowerCase();
    const fallbackItem = currentInspectionItems.find((item) => {
      if (inspection.itemId && item.itemId === inspection.itemId) return true;
      const itemNameLower = item.itemName?.toLowerCase() || "";
      return itemNameLower === (normalizedName || "");
    });
    const itemId = inspection.itemId || fallbackItem?.itemId;
    const itemTypeValue =
      getItemTypeNumber(inspection.itemTypeValue ?? inspection.itemType) ??
      (fallbackItem ? getItemTypeNumber(fallbackItem.itemType) : undefined);

    return { itemId, itemTypeValue };
  };

  const handleInspectionSuccess = async (
    data: Record<string, unknown>
  ): Promise<void> => {
    try {
      // Tạo FormData từ dữ liệu form
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((file) => {
            if (file instanceof File) {
              formData.append("files", file);
            }
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      // Gọi API tạo inspection
      const res = await createInspection(formData);
      if (typeof res === "string")
        throw new Error(res || "Tạo kiểm tra thất bại");

      toast.success("Tạo kiểm tra thiết bị thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      await loadAssignments();
      setInspectionModalOpen(false);
    } catch (err: unknown) {
      console.error("Lỗi tạo kiểm tra:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo kiểm tra";
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

  const mapBookingInspectionToListItem = (
    inspection: BookingInspection,
    booking?: Booking
  ): InspectionListItem => {
    const normalizedName = inspection.itemName?.toLowerCase();
    const matchedItem = booking?.items.find((item) => {
      if (
        (inspection as BookingInspection & { itemId?: string }).itemId &&
        item.itemId ===
          (inspection as BookingInspection & { itemId?: string }).itemId
      ) {
        return true;
      }
      const itemNameLower = item.itemName?.toLowerCase() || "";
      return itemNameLower === (normalizedName || "");
    });

    const resolvedItemId =
      (inspection as BookingInspection & { itemId?: string }).itemId ||
      matchedItem?.itemId ||
      "";

    const resolvedItemType =
      getItemTypeNumber(
        (inspection as BookingInspection & { itemTypeValue?: number | string })
          .itemTypeValue ?? inspection.itemType
      ) ?? (matchedItem ? getItemTypeNumber(matchedItem.itemType) : undefined);

    return {
      id: inspection.id,
      itemName: inspection.itemName,
      itemType: inspection.itemType,
      section: inspection.section,
      label: inspection.label,
      value: inspection.value,
      notes: inspection.notes,
      passed: inspection.passed ?? null,
      itemId: resolvedItemId || undefined,
      itemTypeValue: resolvedItemType,
      inspectionTypeId:
        (inspection as BookingInspection & { inspectionTypeId?: string })
          .inspectionTypeId || booking?.id,
      type:
        (inspection as BookingInspection & { type?: string }).type || "Booking",
      media: inspection.media?.map((media) => ({
        id: media.id,
        url: media.url,
        label: media.label,
      })),
    };
  };

  const shortId = (id: string) =>
    id.length > 8 ? `${id.substring(0, 8)}...` : id;

  const loadInspectionList = async (bookingId: string) => {
    setInspectionListLoading(true);
    try {
      const { booking, error } = await fetchBookingById(bookingId);
      if (error || !booking) {
        throw new Error(error || "Không tìm thấy phiếu kiểm tra");
      }
      const mapped =
        booking.inspections?.map((inspection) =>
          mapBookingInspectionToListItem(inspection, booking)
        ) || [];
      setInspectionList(mapped);
      setCurrentInspectionItems(
        convertBookingItemsToVerificationItems(booking.items)
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải phiếu kiểm tra";
      toast.error(message);
      setInspectionList([]);
      setCurrentInspectionItems([]);
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
    setInspectionList([]);
    setInspectionListSubtitle("");
    setDeletingInspectionId(null);
    setCurrentInspectionItems([]);
    setActiveInspectionBookingId(null);
  };

  const handleEditInspection = (inspection: InspectionListItem) => {
    setEditingInspection(inspection);
    setEditDialogOpen(true);
  };

  const handleCloseEditInspection = () => {
    setEditDialogOpen(false);
    setEditingInspection(null);
  };

  const handleSubmitEditInspection = async (
    formState: EditInspectionFormState
  ) => {
    if (!editingInspection) return;
    setSavingInspection(true);
    try {
      const formData = new FormData();
      formData.append("Section", formState.section);
      formData.append("Label", formState.label);
      formData.append("Value", formState.value ?? "");
      formData.append("Notes", formState.notes ?? "");
      if (formState.passed !== null) {
        formData.append("Passed", formState.passed ? "true" : "false");
      }

      const { itemId, itemTypeValue } =
        resolveInspectionItemMetadata(editingInspection);

      if (!itemId || itemTypeValue === undefined) {
        throw new Error(
          "Không xác định được thông tin thiết bị cho phiếu kiểm tra."
        );
      }

      formData.append("ItemId", itemId);
      formData.append("ItemType", String(itemTypeValue));

      const inspectionTypeId =
        editingInspection.inspectionTypeId ||
        activeInspectionBookingId ||
        selectedBookingId;
      if (inspectionTypeId) {
        formData.append("InspectionTypeId", inspectionTypeId);
      }

      formData.append("Type", editingInspection.type || "Booking");

      formState.files.forEach((file) => formData.append("files", file));
      formState.removeMediaIds.forEach((mediaId) =>
        formData.append("RemoveMediaIds", mediaId)
      );

      await updateInspection(editingInspection.id, formData);

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
      `Bạn có chắc muốn xóa phiếu kiểm tra "${
        inspection.label || inspection.section
      }"?`
    );
    if (!confirmDelete) return;
    setDeletingInspectionId(inspection.id);
    try {
      await deleteInspection(inspection.id);
      setInspectionList((prev) =>
        prev.filter((item) => item.id !== inspection.id)
      );
      toast.success("Xóa phiếu kiểm tra thành công");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Xóa phiếu kiểm tra thất bại";
      toast.error(message);
    } finally {
      setDeletingInspectionId(null);
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
        (selectedTab === 1 && booking.status === "0") ||
        (selectedTab === 2 && booking.status === "1") ||
        (selectedTab === 3 && booking.status === "2") ||
        (selectedTab === 4 && booking.status === "3");

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchQuery, selectedTab]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredBookings, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "0").length,
      confirmed: bookings.filter((b) => b.status === "1").length,
      delivering: bookings.filter((b) => b.status === "2").length,
      completed: bookings.filter((b) => b.status === "3").length,
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
              sm: "repeat(5, 1fr)",
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
                  Chờ xác nhận
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
                <HourglassEmpty sx={{ color: "#F59E0B", fontSize: 24 }} />
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
                  Đang giao
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#4F46E5", mt: 0.5 }}
                >
                  {stats.delivering}
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
              label={`Chờ xác nhận (${
                bookings.filter((b) => b.status === "0").length
              })`}
            />
            <Tab
              label={`Đã xác nhận (${
                bookings.filter((b) => b.status === "1").length
              })`}
            />
            <Tab
              label={`Đang giao (${
                bookings.filter((b) => b.status === "2").length
              })`}
            />
            <Tab
              label={`Hoàn thành (${
                bookings.filter((b) => b.status === "3").length
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
                    const statusInfo = getStatusInfo(booking.statusText);
                    const statusPalette: Record<
                      string,
                      { base: string; icon: typeof HourglassEmpty }
                    > = {
                      warning: { base: "#F59E0B", icon: HourglassEmpty },
                      info: { base: "#0284C7", icon: CheckCircleOutline },
                      primary: { base: "#4F46E5", icon: LocalShipping },
                      success: { base: "#10B981", icon: TaskAlt },
                      error: { base: "#F43F5E", icon: Clear },
                      default: { base: "#6B7280", icon: Assignment },
                    };
                    const palette =
                      statusPalette[statusInfo.color] || statusPalette.default;
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
                          <Typography
                            sx={{
                              maxWidth: 200,
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "#111827",
                              wordBreak: "break-word",
                            }}
                          >
                            {booking.id.length > 20
                              ? `${booking.id.substring(0, 20)}...`
                              : booking.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {booking.items.slice(0, 2).map((item, idx) => (
                              <Chip
                                key={idx}
                                label={item.itemName || getItemName(item)}
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
                            {booking.items.length > 2 && (
                              <Chip
                                label={`+${booking.items.length - 2}`}
                                size="small"
                                sx={{
                                  bgcolor: "#DBEAFE",
                                  color: "#3B82F6",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#111827",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            }}
                          >
                            {formatDate(booking.pickupAt)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6B7280", fontSize: "0.8125rem" }}
                          >
                            đến {formatDate(booking.returnAt)}
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
                            {formatCurrency(booking.snapshotRentalTotal)}
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
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.25,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                onClick={() => handleViewDetail(booking)}
                                size="small"
                                sx={{
                                  borderRadius: 2,
                                  border: "1px solid #E5E7EB",
                                  bgcolor: "#F3F4F6",
                                  color: "#4B5563",
                                  "&:hover": {
                                    bgcolor: "#FFF7ED",
                                    color: "#F97316",
                                    borderColor: "#F97316",
                                  },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa phiếu kiểm tra">
                              <IconButton
                                onClick={() =>
                                  handleManageInspections(booking.id)
                                }
                                size="small"
                                sx={{
                                  borderRadius: 2,
                                  border: "1px solid #E5E7EB",
                                  bgcolor: "#F3F4F6",
                                  color: "#4B5563",
                                  "&:hover": {
                                    bgcolor: "#FFF7ED",
                                    color: "#F97316",
                                    borderColor: "#F97316",
                                  },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Tạo phiếu kiểm tra">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenInspection(booking.id)}
                                aria-label="Tạo phiếu kiểm tra"
                                sx={{
                                  borderRadius: 999,
                                  textTransform: "none",
                                  fontWeight: 600,
                                  px: 1.25,
                                  height: 34,
                                  minWidth: 0,
                                  background:
                                    "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                                  boxShadow:
                                    "0 6px 16px rgba(249, 115, 22, 0.25)",
                                  "&:hover": {
                                    background:
                                      "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
                                    boxShadow:
                                      "0 10px 20px rgba(234, 88, 12, 0.35)",
                                  },
                                }}
                              >
                                <PlaylistAddCheck fontSize="small" />
                              </Button>
                            </Tooltip>
                          </Box>
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
        <CheckBookingDialog
          open={inspectionModalOpen}
          onClose={handleCloseInspection}
          onSubmit={handleInspectionSuccess}
          defaultValues={{
            verifyId: selectedBookingId,
            items: (
              bookings.find((b) => b.id === selectedBookingId)?.items || []
            )
              .filter(
                (it) => it.itemType === "Camera" || it.itemType === "Accessory"
              )
              .map((it) => {
                // Chuyển itemType từ string sang format phù hợp
                let itemTypeStr: VerificationItemType = "1";
                if (it.itemType === "Camera") itemTypeStr = "1";
                else if (it.itemType === "Accessory") itemTypeStr = "2";

                return {
                  itemId: it.itemId || "",
                  itemName: it.itemName || "",
                  itemType: itemTypeStr,
                };
              }),
            ItemType: "",
            Type: "Booking",
          }}
        />
      )}
      <InspectionListDialog
        open={inspectionListOpen}
        onClose={() => {
          handleCloseInspectionList();
          handleCloseEditInspection();
        }}
        title="Phiếu kiểm tra thiết bị"
        subtitle={inspectionListSubtitle}
        inspections={inspectionList}
        loading={inspectionListLoading}
        onEdit={handleEditInspection}
        onDelete={handleDeleteInspection}
        deletingInspectionId={deletingInspectionId}
      />
      <EditInspectionDialog
        open={editDialogOpen}
        inspection={editingInspection}
        saving={savingInspection}
        onClose={handleCloseEditInspection}
        onSubmit={handleSubmitEditInspection}
      />
    </Box>
  );
};

export default CheckBookings;
