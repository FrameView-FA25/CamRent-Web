import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  HourglassEmptyRounded,
  CheckCircleRounded,
  CancelRounded,
  TaskAltRounded,
  DoNotDisturbOnRounded,
} from "@mui/icons-material";
import { branchService } from "../../../services/branch.service";
import { verificationService } from "../../../services/verification.service";
import type { CreateVerificationRequest } from "../../../services/verification.service";
import type { Branch } from "../../../types/branch.types";
import ModalVerification from "../../../components/Modal/Owner/ModalVerification";
import VerificationDetailModal from "../../../components/Modal/VerificationDetailModal";
import { useVerificationContext } from "../../../context/VerifiContext/useVerificationContext";
import type { Verification } from "../../../types/verification.types";

export default function VerificationManagement() {
  // Sử dụng context thay vì state local
  const {
    verifications,
    loading,
    error,
    fetchVerifications,
    refreshVerifications,
  } = useVerificationContext();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingVerification, setEditingVerification] =
    useState<Verification | null>(null);
  const [editFormData, setEditFormData] =
    useState<CreateVerificationRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng verification hiển thị mỗi trang
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /**
   * useEffect: Gọi API lấy danh sách verification khi component được mount
   * Với context, hàm fetchVerifications sẽ kiểm tra cache trước khi gọi API
   */
  useEffect(() => {
    fetchVerifications();
    fetchBranches();
  }, [fetchVerifications]);

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chi nhánh:", error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setMessage(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setMessage(null);
  };

  const handleOpenDetailModal = (verification: Verification) => {
    setSelectedVerification(verification);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedVerification(null);
  };

  const handleCreateVerification = async (data: CreateVerificationRequest) => {
    await verificationService.createVerification(data);
    refreshVerifications(); // Refresh danh sách
    setCurrentPage(1); // Reset về trang 1
    setMessage({
      type: "success",
      text: "Tạo yêu cầu xác minh thành công!",
    });
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const normalizeItemType = (itemType?: string) =>
    itemType === "2" || itemType === "Accessory" ? "Accessory" : "Camera";

  const mapVerificationToFormData = (
    verification: Verification
  ): CreateVerificationRequest => ({
    name: verification.name || "",
    phoneNumber: verification.phoneNumber || "",
    inspectionDate: formatDateForInput(verification.inspectionDate),
    notes: verification.notes || "",
    branchId: verification.branchId,
    items:
      verification.items && verification.items.length > 0
        ? verification.items.map((item) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            itemType: normalizeItemType(item.itemType),
          }))
        : [
            {
              itemId: "",
              itemName: "",
              itemType: "Camera",
            },
          ],
  });

  const handleOpenEditModal = (verification: Verification) => {
    setEditingVerification(verification);
    setEditFormData(mapVerificationToFormData(verification));
    setOpenEditModal(true);
    setMessage(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingVerification(null);
    setEditFormData(null);
  };

  const handleUpdateVerification = async (data: CreateVerificationRequest) => {
    if (!editingVerification) return;
    await verificationService.updateVerification(editingVerification.id, data);
    await refreshVerifications();
    setCurrentPage(1);
    setMessage({
      type: "success",
      text: "Cập nhật yêu cầu xác minh thành công!",
    });
  };

  const handleDeleteVerification = async (verificationId: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá yêu cầu này?")) return;
    await verificationService.deleteVerification(verificationId);
    await refreshVerifications();
    setMessage({
      type: "success",
      text: "Xoá yêu cầu xác minh thành công!",
    });
  };
  /**
   * Tính toán phân trang
   */
  const totalPages = Math.ceil((verifications?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVerifications = verifications?.slice(startIndex, endIndex) || [];

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const statusStyles = {
    pending: {
      label: "Chờ xử lý",
      bg: "#FFF4ED",
      color: "#C8501D",
      border: "1px solid rgba(255, 107, 53, 0.35)",
      icon: (
        <HourglassEmptyRounded
          fontSize="small"
          sx={{ color: "#FF6B35", mr: 0.5 }}
        />
      ),
    },
    approved: {
      label: "Đã duyệt",
      bg: "#EEF4FF",
      color: "#1D4ED8",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      icon: (
        <CheckCircleRounded
          fontSize="small"
          sx={{ color: "#2563EB", mr: 0.5 }}
        />
      ),
    },
    rejected: {
      label: "Từ chối",
      bg: "#FEF2F2",
      color: "#B91C1C",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      icon: (
        <CancelRounded fontSize="small" sx={{ color: "#EF4444", mr: 0.5 }} />
      ),
    },
    completed: {
      label: "Hoàn thành",
      bg: "#F0FDF4",
      color: "#047857",
      border: "1px solid rgba(16, 185, 129, 0.35)",
      icon: (
        <TaskAltRounded fontSize="small" sx={{ color: "#059669", mr: 0.5 }} />
      ),
    },
    cancelled: {
      label: "Đã hủy",
      bg: "#F4F4F5",
      color: "#52525B",
      border: "1px solid rgba(148, 163, 184, 0.35)",
      icon: (
        <DoNotDisturbOnRounded
          fontSize="small"
          sx={{ color: "#64748B", mr: 0.5 }}
        />
      ),
    },
  } as const;

  const renderStatusChip = (status: string) => {
    const key = status?.toLowerCase() as keyof typeof statusStyles;
    const config = statusStyles[key] || {
      label: getStatusText(status),
      bg: "#F1F5F9",
      color: "#0F172A",
      border: "1px solid #CBD5F5",
      icon: (
        <DoNotDisturbOnRounded
          fontSize="small"
          sx={{ color: "#0F172A", mr: 0.5 }}
        />
      ),
    };

    return (
      <Chip
        label={config.label}
        size="small"
        icon={config.icon}
        sx={{
          bgcolor: config.bg,
          color: config.color,
          border: config.border,
          borderRadius: 999,
          fontWeight: 600,
          fontSize: "0.75rem",
          px: 0.5,
          "& .MuiChip-icon": {
            marginLeft: 0,
          },
        }}
        variant="outlined"
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Hiển thị error từ context */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Hiển thị message từ form */}
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 3,
          borderBottom: "3px solid #E2E8F0",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{
              color: "#1E293B",
              letterSpacing: "-0.5px",
              mb: 0.5,
            }}
          >
            Quản Lý Yêu Cầu Xác Minh
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            Theo dõi và quản lý các yêu cầu xác minh thiết bị
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="large"
            onClick={refreshVerifications}
            disabled={loading}
            sx={{
              borderColor: "#CBD5E1",
              color: "#64748B",
              fontWeight: 600,
              fontSize: "0.95rem",
              px: 3,
              py: 1.25,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                borderColor: "#94A3B8",
                bgcolor: "#F8FAFC",
              },
            }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleOpenModal}
            sx={{
              bgcolor: "#FF6B35",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.95rem",
              px: 3,
              py: 1.25,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#E85D2A",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Tạo yêu cầu xác minh
          </Button>
        </Stack>
      </Box>

      {message && (
        <Alert
          severity={message.type}
          sx={{
            mb: 3,
            borderRadius: 2,
            border:
              message.type === "error"
                ? "1px solid #FEE2E2"
                : "1px solid #D1FAE5",
            "& .MuiAlert-icon": {
              color: message.type === "error" ? "#EF4444" : "#10B981",
            },
          }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Stats - Thống kê tổng quan */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#FF6B35",
              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Tổng Số Yêu Cầu
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#1E293B" }}
                >
                  {verifications.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#FFF5F0",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>📦</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#3B82F6",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Chờ Xử Lý
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#3B82F6" }}
                >
                  {
                    verifications.filter(
                      (v) =>
                        v.status === "Pending" ||
                        v.status.toLowerCase() === "pending"
                    ).length
                  }
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#EFF6FF",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>⏳</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#10B981",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Đã Hoàn Thành
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#10B981" }}
                >
                  {verifications.filter((v) => v.status === "completed").length}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#F0FDF4",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>✅</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#EF4444",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Đã Hủy/Từ Chối
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#EF4444" }}
                >
                  {
                    verifications.filter(
                      (v) => v.status === "cancelled" || v.status === "rejected"
                    ).length
                  }
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#FEF2F2",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>❌</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {loading && !openModal ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: "#FF6B35" }} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}
        >
          {verifications.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                bgcolor: "#FFFFFF",
              }}
            >
              <Box sx={{ mb: 2, opacity: 0.5 }}>
                <Typography sx={{ fontSize: "4rem" }}>✅</Typography>
              </Box>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  color: "#475569",
                  mb: 1,
                }}
              >
                Chưa có yêu cầu xác minh nào
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#94A3B8",
                  fontWeight: 500,
                }}
              >
                Nhấn nút "Tạo yêu cầu xác minh" để bắt đầu
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Tên
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Số Điện Thoại
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Ngày Kiểm Tra
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Chi Nhánh
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Nhân Viên
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Trạng Thái
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Ghi Chú
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    Thao Tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentVerifications.map((verification, index) => (
                  <TableRow
                    key={verification.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "#F8FAFC",
                      },
                      bgcolor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                    }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#1E293B",
                          fontSize: "0.875rem",
                        }}
                      >
                        {verification.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.875rem",
                        }}
                      >
                        {verification.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatDate(verification.inspectionDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={verification.branchName}
                        size="small"
                        sx={{
                          bgcolor: "#FFF5F0",
                          color: "#FF6B35",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          border: "1px solid #FECACA",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: verification.staffName ? "#1E293B" : "#94A3B8",
                          fontSize: "0.875rem",
                          fontStyle: verification.staffName
                            ? "normal"
                            : "italic",
                        }}
                      >
                        {verification.staffName || "Chưa phân công"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {renderStatusChip(verification.status)}
                    </TableCell>
                    <TableCell>
                      {verification.notes ? (
                        <Tooltip
                          title={verification.notes}
                          arrow
                          placement="top"
                        >
                          <Typography
                            sx={{
                              color: "#64748B",
                              fontSize: "0.875rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {verification.notes}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography
                          sx={{
                            color: "#CBD5E1",
                            fontSize: "0.875rem",
                          }}
                        >
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        sx={{ minWidth: 160 }}
                      >
                        <Tooltip title="Xoá" arrow>
                          <IconButton
                            size="medium"
                            onClick={() =>
                              handleDeleteVerification(verification.id)
                            }
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              color: "#B91C1C",
                              bgcolor: "rgba(254, 226, 226, 0.6)",
                              boxShadow: "0 4px 10px rgba(239, 68, 68, 0.15)",
                              "&:hover": {
                                bgcolor: "#FEE2E2",
                                borderColor: "rgba(239, 68, 68, 0.4)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa" arrow>
                          <IconButton
                            size="medium"
                            onClick={() => handleOpenEditModal(verification)}
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              border: "1px solid rgba(37, 99, 235, 0.25)",
                              color: "#1D4ED8",
                              bgcolor: "rgba(219, 234, 254, 0.6)",
                              boxShadow: "0 4px 10px rgba(59, 130, 246, 0.15)",
                              "&:hover": {
                                bgcolor: "#DBEAFE",
                                borderColor: "rgba(37, 99, 235, 0.4)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xem chi tiết" arrow>
                          <IconButton
                            size="medium"
                            onClick={() => handleOpenDetailModal(verification)}
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              border: "1px solid rgba(255, 107, 53, 0.3)",
                              color: "#C8501D",
                              bgcolor: "rgba(255, 245, 240, 0.9)",
                              boxShadow: "0 4px 10px rgba(255, 107, 53, 0.15)",
                              "&:hover": {
                                bgcolor: "#FFE7DD",
                                borderColor: "rgba(255, 107, 53, 0.45)",
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* Pagination */}
      {!loading && verifications.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
            mb: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                fontSize: "0.9rem",
                "&.Mui-selected": {
                  bgcolor: "#FF6B35",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#E85D2A",
                  },
                },
                "&:hover": {
                  bgcolor: "#FFF5F0",
                },
              },
            }}
          />
        </Box>
      )}

      {/* Modal tạo yêu cầu xác minh */}
      <ModalVerification
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateVerification}
        branches={branches}
        isLoadingBranches={isLoadingBranches}
      />

      <ModalVerification
        open={openEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateVerification}
        branches={branches}
        isLoadingBranches={isLoadingBranches}
        mode="edit"
        initialData={editFormData}
      />

      {/* Modal chi tiết yêu cầu xác minh */}
      <VerificationDetailModal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        verification={selectedVerification}
      />
    </Box>
  );
}
