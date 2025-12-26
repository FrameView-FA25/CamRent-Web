import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import SignatureCanvas from "react-signature-canvas";
import type { Verification } from "../../types/verification.types";
import type { Staff } from "../../types/booking.types";
import {
  handleContractConfirm,
  handleDownloadPdf,
} from "@/pages/Manager/Verification/handlers/handleContractConfirm";
import { handleSaveSignature } from "@/pages/Manager/Verification/handlers/handleSaveSignature";
import { CreateContractDialog } from "@/pages/Manager/Verification/components/dialogs/CreateContractDialog";
import { PdfPreviewDialog } from "@/pages/Manager/Verification/components/dialogs/PdfPreviewDialog";
import { SignatureDialog } from "@/pages/Manager/Verification/components/dialogs/SignatureDialog";
import AssignStaffDialog from "./AssignStaffDialog";
import { verificationService } from "../../services/verification.service";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface InspectionForm {
  id: string;
  templateId: string;
  templateName: string;
  staffId: string;
  staffName: string;
  itemType: string;
  itemId: string;
  type: string;
  handoverType: string | null;
  inspectionTypeId: string;
  branchId: string | null;
  overallPassed: boolean;
  createdAt: string;
}

interface VerificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  verification: Verification | null;
  onRefresh?: () => void;
  staffList?: Staff[];
  onAssignStaff?: (verificationId: string, staffId: string) => Promise<boolean>;
}

export default function VerificationDetailModal({
  open,
  onClose,
  verification,
  onRefresh,
  staffList = [],
  onAssignStaff,
}: VerificationDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentContractId, setCurrentContractId] = useState<string | null>(
    null
  );
  const [currentFilename, setCurrentFilename] = useState<string>("");
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [assignStaffDialogOpen, setAssignStaffDialogOpen] = useState(false);

  const [statusNote, setStatusNote] = useState<string>("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    status: string;
    note: string;
  } | null>(null);

  // States for inspection forms
  const [inspectionForms, setInspectionForms] = useState<InspectionForm[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  // State to track current verification data
  const [currentVerification, setCurrentVerification] =
    useState<Verification | null>(verification);

  const signatureRef = useRef<SignatureCanvas | null>(null);

  // Sync verification data when prop changes
  useEffect(() => {
    if (verification) {
      setCurrentVerification(verification);
    }
  }, [verification]);

  // Fetch inspection forms when dialog opens
  useEffect(() => {
    if (open && currentVerification?.id) {
      fetchInspectionForms();
    }
  }, [open, currentVerification?.id]);

  const fetchInspectionForms = async () => {
    if (!currentVerification?.id) return;

    try {
      setLoadingInspections(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/inspection-forms/verification/${currentVerification.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu kiểm tra");
      }

      const data: InspectionForm[] = await response.json();
      setInspectionForms(data);
    } catch (error) {
      console.error("Error fetching inspection forms:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu kiểm tra"
      );
      setInspectionForms([]);
    } finally {
      setLoadingInspections(false);
    }
  };

  // Fetch updated verification data
  const fetchUpdatedVerification = async () => {
    if (!verification?.id) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/Verifications/${verification.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin yêu cầu");
      }

      const data: Verification = await response.json();
      setCurrentVerification(data);
    } catch (error) {
      console.error("Error fetching verification:", error);
      // Don't show toast error to avoid disturbing user
    }
  };

  if (!currentVerification) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "completed":
        return "info";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
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

  const canCreateContract = ["approved", "completed"].includes(
    currentVerification.status.toLowerCase()
  );
  const isApproved = currentVerification.status.toLowerCase() === "approved";
  const hasStaff = !!currentVerification.staffName;
  const hasContract =
    currentVerification.contracts && currentVerification.contracts.length > 0;

  const handleCreateContract = async () => {
    if (hasContract) {
      await handleViewContract();
    } else {
      setContractDialogOpen(true);
    }
  };

  const handleViewContract = async () => {
    if (
      !currentVerification.contracts ||
      currentVerification.contracts.length === 0
    ) {
      toast.error("Không tìm thấy hợp đồng");
      return;
    }

    const contractId = currentVerification.contracts[0].id;
    const token = localStorage.getItem("accessToken");

    try {
      setContractLoading(true);

      const previewResponse = await fetch(
        `${API_BASE_URL}/Contracts/${contractId}/preview`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!previewResponse.ok) {
        throw new Error("Không thể lấy preview hợp đồng");
      }

      const contentDisposition = previewResponse.headers.get(
        "content-disposition"
      );
      let filename = `contract_${contractId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=(?:(["'])([^"'\n]*)\1|([^;\n]*));?/
        );
        if (filenameMatch && filenameMatch[2]) {
          filename = filenameMatch[2];
        }
      }

      const blob = await previewResponse.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      setPdfUrl(url);
      setCurrentContractId(contractId);
      setCurrentFilename(filename);
      setPdfDialogOpen(true);
    } catch (error) {
      console.error("Contract error:", error);
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi xem hợp đồng"
      );
    } finally {
      setContractLoading(false);
    }
  };

  const handleCloseContractDialog = () => {
    setContractDialogOpen(false);
  };

  const handleConfirmContract = async () => {
    await handleContractConfirm(
      currentVerification,
      setContractLoading,
      setPdfUrl,
      setCurrentContractId,
      setCurrentFilename,
      setPdfDialogOpen,
      setContractDialogOpen
    );
  };

  const handleClosePdfDialog = () => {
    setPdfDialogOpen(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleOpenSignature = () => {
    setSignatureDialogOpen(true);
  };

  const handleCloseSignature = () => {
    setSignatureDialogOpen(false);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleConfirmSignature = async () => {
    await handleSaveSignature(
      signatureRef,
      currentVerification,
      currentContractId,
      handleCloseSignature,
      handleClosePdfDialog,
      onRefresh
    );
  };

  const handleDownload = () => {
    handleDownloadPdf(pdfUrl, currentFilename, setPdfDialogOpen, setPdfUrl);
  };

  const handleOpenAssignStaff = () => {
    setAssignStaffDialogOpen(true);
  };

  const handleCloseAssignStaff = () => {
    setAssignStaffDialogOpen(false);
  };

  const handleAssignStaff = async (staffId: string) => {
    if (!onAssignStaff || !verification) return false;

    const success = await onAssignStaff(verification.id, staffId);
    if (success) {
      // Refresh verification data immediately after successful assignment
      await fetchUpdatedVerification();

      // Also refresh parent component data
      if (onRefresh) {
        onRefresh();
      }
    }
    return success;
  };

  const handleSelectStatus = (status: string) => {
    setSelectedStatus(status);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedStatus("");
    setStatusNote("");
  };

  const handleConfirmStatusUpdate = () => {
    setPendingStatusUpdate({
      status: selectedStatus,
      note: statusNote,
    });
    setStatusDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setPendingStatusUpdate(null);
  };

  const handleFinalConfirm = async () => {
    if (!pendingStatusUpdate || !currentVerification) return;

    try {
      await verificationService.updateVerificationStatus(
        currentVerification.id,
        pendingStatusUpdate.status,
        pendingStatusUpdate.note || undefined
      );
      toast.success("Cập nhật trạng thái thành công");
      handleCloseConfirmDialog();
      onClose();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      // Check if trying to approve without manager signature
      const isApproveStatus =
        pendingStatusUpdate.status?.toLowerCase() === "approved";
      const is500Error = error?.response?.status === 500;
      const hasSignatureError = error?.response?.data?.detail
        ?.toLowerCase()
        .includes("chữ ký");

      console.log("isApproveStatus:", isApproveStatus);
      console.log("is500Error:", is500Error);
      console.log("hasSignatureError:", hasSignatureError);

      if (isApproveStatus && is500Error && hasSignatureError) {
        toast.error(
          "Bạn cần thêm chữ ký trước khi duyệt. Chuyển đến trang hồ sơ."
        );
        setTimeout(() => {
          window.location.href = "/manager/profile";
        }, 1500);
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : error?.response?.data?.detail || "Không thể cập nhật trạng thái";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#F8FAFC",
            borderBottom: "2px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2.5,
            px: 3,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: "#1E293B", mb: 0.5 }}
            >
              Chi Tiết Yêu Cầu Xác Minh
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Mã yêu cầu: {currentVerification.id}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#64748B",
              "&:hover": {
                bgcolor: "#F1F5F9",
                color: "#1E293B",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "#FFFFFF" }}>
          <Box sx={{ mb: 4 }}>
            {/* Thông tin cơ bản */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: "1px solid #E2E8F0",
                borderRadius: 2,
                bgcolor: "#F8FAFC",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#1E293B" }}
                >
                  Thông Tin Yêu Cầu
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  {!isApproved && (
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleSelectStatus("Approved")}
                      sx={{
                        borderColor: "#10B981",
                        color: "#10B981",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 3,
                        "&:hover": {
                          borderColor: "#059669",
                          bgcolor: "#F0FDF4",
                        },
                      }}
                    >
                      Đã duyệt
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => handleSelectStatus("Rejected")}
                    sx={{
                      borderColor: "#EF4444",
                      color: "#EF4444",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 3,
                      "&:hover": {
                        borderColor: "#DC2626",
                        bgcolor: "#FEF2F2",
                      },
                    }}
                  >
                    Hủy
                  </Button>

                  {onAssignStaff && (
                    <Button
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      onClick={handleOpenAssignStaff}
                      sx={{
                        borderColor: "#3B82F6",
                        color: "#3B82F6",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 3,
                        "&:hover": {
                          borderColor: "#2563EB",
                          bgcolor: "#EFF6FF",
                        },
                      }}
                    >
                      {hasStaff ? "Thay Đổi Nhân Viên" : "Gán Nhân Viên"}
                    </Button>
                  )}

                  {canCreateContract && (
                    <Button
                      variant="contained"
                      startIcon={<DescriptionIcon />}
                      onClick={handleCreateContract}
                      disabled={contractLoading}
                      sx={{
                        bgcolor: "#10B981",
                        color: "white",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 3,
                        "&:hover": {
                          bgcolor: "#059669",
                        },
                      }}
                    >
                      {contractLoading
                        ? "Đang tải..."
                        : hasContract
                        ? "Xem Hợp Đồng"
                        : "Tạo Hợp Đồng"}
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                  >
                    Tên khách hàng
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1E293B" }}>
                    {currentVerification.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                  >
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1E293B" }}>
                    {currentVerification.phoneNumber}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                  >
                    Ngày kiểm tra
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1E293B" }}>
                    {formatDate(currentVerification.inspectionDate)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                  >
                    Trạng thái
                  </Typography>
                  <Chip
                    label={getStatusText(currentVerification.status)}
                    color={getStatusColor(currentVerification.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                  >
                    Chi nhánh
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1E293B" }}>
                    {currentVerification.branchName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                  >
                    Nhân viên phụ trách
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1E293B" }}>
                    {currentVerification.staffName || "Chưa phân công"}
                  </Typography>
                </Grid>
                {currentVerification.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                    >
                      Ghi chú
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1E293B" }}>
                      {currentVerification.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Danh sách thiết bị */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: "1px solid #E2E8F0",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "#1E293B", mb: 2 }}
              >
                Danh Sách Thiết Bị ({currentVerification.items?.length || 0})
              </Typography>
              {currentVerification.items &&
              currentVerification.items.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Tên thiết bị
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Loại
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentVerification.items.map((item, index) => (
                        <TableRow
                          key={item.itemId}
                          sx={{
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
                              {item.itemName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                item.itemType === "Camera"
                                  ? "Camera"
                                  : "Phụ kiện"
                              }
                              size="small"
                              sx={{
                                bgcolor:
                                  item.itemType === "Camera"
                                    ? "#EFF6FF"
                                    : "#F0FDF4",
                                color:
                                  item.itemType === "Camera"
                                    ? "#3B82F6"
                                    : "#10B981",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "#94A3B8", fontStyle: "italic" }}
                >
                  Chưa có thiết bị nào
                </Typography>
              )}
            </Paper>

            {/* Chi tiết kiểm tra */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid #E2E8F0",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "#1E293B", mb: 2 }}
              >
                Chi Tiết Kiểm Tra ({inspectionForms.length})
              </Typography>

              {loadingInspections ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={40} sx={{ color: "#FF6B35" }} />
                </Box>
              ) : inspectionForms.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Template
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Nhân viên
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Loại thiết bị
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Kết quả
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          Ngày kiểm tra
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inspectionForms.map((form, index) => (
                        <TableRow
                          key={form.id}
                          sx={{
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
                              {form.templateName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color: "#64748B",
                                fontSize: "0.875rem",
                              }}
                            >
                              {form.staffName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={form.itemType}
                              size="small"
                              sx={{
                                bgcolor:
                                  form.itemType === "Camera"
                                    ? "#EFF6FF"
                                    : "#F0FDF4",
                                color:
                                  form.itemType === "Camera"
                                    ? "#3B82F6"
                                    : "#10B981",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={
                                form.overallPassed ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <CancelIcon />
                                )
                              }
                              label={form.overallPassed ? "Đạt" : "Không đạt"}
                              size="small"
                              sx={{
                                bgcolor: form.overallPassed
                                  ? "#D1FAE5"
                                  : "#FEE2E2",
                                color: form.overallPassed
                                  ? "#059669"
                                  : "#DC2626",
                                fontWeight: 600,
                                "& .MuiChip-icon": {
                                  color: "inherit",
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color: "#64748B",
                                fontSize: "0.875rem",
                              }}
                            >
                              {formatDate(form.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#94A3B8", fontStyle: "italic" }}
                  >
                    Chưa có dữ liệu kiểm tra nào
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: "#F8FAFC",
            borderTop: "2px solid #E2E8F0",
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              bgcolor: "#FF6B35",
              color: "#FFFFFF",
              fontWeight: 600,
              px: 3,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#E85D2A",
              },
            }}
          >
            Đóng
          </Button>
        </DialogActions>

        {/* Modal xem ảnh lớn */}
        <Modal
          open={selectedImage !== null}
          onClose={() => setSelectedImage(null)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 2,
              outline: "none",
            }}
          >
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                zIndex: 1,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedImage && (
              <Box
                component="img"
                src={selectedImage}
                alt="Inspection image"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            )}
          </Box>
        </Modal>
      </Dialog>

      {/* Contract Dialog */}
      <CreateContractDialog
        open={contractDialogOpen}
        onClose={handleCloseContractDialog}
        selectedVerification={currentVerification}
        loading={contractLoading}
        onConfirm={handleConfirmContract}
      />

      {/* PDF Preview Dialog */}
      <PdfPreviewDialog
        open={pdfDialogOpen}
        onClose={handleClosePdfDialog}
        pdfUrl={pdfUrl}
        onSign={handleOpenSignature}
        onDownload={handleDownload}
      />

      {/* Signature Dialog */}
      <SignatureDialog
        open={signatureDialogOpen}
        onClose={handleCloseSignature}
        signatureRef={signatureRef}
        onClear={handleClearSignature}
        onSave={handleConfirmSignature}
      />

      {/* Assign Staff Dialog */}
      <AssignStaffDialog
        open={assignStaffDialogOpen}
        onClose={handleCloseAssignStaff}
        staffList={staffList}
        onAssign={handleAssignStaff}
        verificationDate={currentVerification.inspectionDate}
      />

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Cập nhật trạng thái
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748B" }}>
              Bạn đang cập nhật trạng thái thành:{" "}
              <strong>{selectedStatus}</strong>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ghi chú (tùy chọn)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCloseStatusDialog}
            sx={{
              borderColor: "#E2E8F0",
              color: "#1E293B",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmStatusUpdate}
            sx={{
              bgcolor: "#FF6B35",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#E85D2A",
              },
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#FFF7ED",
            borderBottom: "2px solid #FFEDD5",
            py: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ color: "#F97316", fontSize: 28 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B" }}>
              Xác nhận tạo hợp đồng và ký
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Bạn đang thực hiện cập nhật trạng thái:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Trạng thái mới: <strong>{pendingStatusUpdate?.status}</strong>
              </Typography>
              {pendingStatusUpdate?.note && (
                <Typography variant="body2">
                  • Ghi chú: <em>{pendingStatusUpdate.note}</em>
                </Typography>
              )}
            </Box>
          </Alert>

          <Typography
            variant="body1"
            sx={{ color: "#64748B", lineHeight: 1.7 }}
          >
            Vui lòng xác nhận rằng bạn đã kiểm tra kỹ thông tin và đồng ý với
            việc thay đổi trạng thái này. Hành động này sẽ được ghi lại trong hệ
            thống.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: "#F8FAFC",
            borderTop: "2px solid #E2E8F0",
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseConfirmDialog}
            sx={{
              borderColor: "#E2E8F0",
              color: "#64748B",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                borderColor: "#CBD5E1",
                bgcolor: "#F8FAFC",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleFinalConfirm}
            sx={{
              bgcolor: "#10B981",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              "&:hover": {
                bgcolor: "#059669",
              },
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
