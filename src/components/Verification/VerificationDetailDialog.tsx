import { useState, useRef } from "react";
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
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
  ZoomIn as ZoomInIcon,
  Description as DescriptionIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
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
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [statusNote, setStatusNote] = useState<string>("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const signatureRef = useRef<SignatureCanvas | null>(null);

  if (!verification) return null;

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

  // Nhóm inspections theo itemName
  const groupedInspections =
    verification.inspections?.reduce((acc, inspection) => {
      if (!acc[inspection.itemName]) {
        acc[inspection.itemName] = [];
      }
      acc[inspection.itemName].push(inspection);
      return acc;
    }, {} as Record<string, typeof verification.inspections>) || {};

  const canCreateContract = ["approved", "completed"].includes(
    verification.status.toLowerCase()
  );

  // const canAssignStaff = verification.status.toLowerCase() === "pending";

  const handleCreateContract = () => {
    setContractDialogOpen(true);
  };

  const handleCloseContractDialog = () => {
    setContractDialogOpen(false);
  };

  const handleConfirmContract = async () => {
    await handleContractConfirm(
      verification,
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
      verification,
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
    if (success && onRefresh) {
      onRefresh();
    }
    return success;
  };

  const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchor(null);
  };

  const handleSelectStatus = (status: string) => {
    setSelectedStatus(status);
    setStatusMenuAnchor(null);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedStatus("");
    setStatusNote("");
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedStatus || !verification) return;

    try {
      await verificationService.updateVerificationStatus(
        verification.id,
        selectedStatus,
        statusNote || undefined
      );
      toast.success("Cập nhật trạng thái thành công");
      handleCloseStatusDialog();
      onClose(); // Đóng modal chính
      if (onRefresh) {
        onRefresh(); // Refresh danh sách verification
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái";
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
              Mã yêu cầu: {verification.id}
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
                  {/* Update Status Button */}
                  <IconButton
                    onClick={handleOpenStatusMenu}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "#F8FAFC",
                      },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={statusMenuAnchor}
                    open={Boolean(statusMenuAnchor)}
                    onClose={handleCloseStatusMenu}
                  >
                    <MenuItem onClick={() => handleSelectStatus("Pending")}>
                      Chờ xử lý
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectStatus("Verified")}>
                      Đã xác minh
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectStatus("Approved")}>
                      Đã duyệt
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectStatus("Rejected")}>
                      Từ chối
                    </MenuItem>
                  </Menu>

                  {/* {canAssignStaff && onAssignStaff && ( */}
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
                    Gán Nhân Viên
                  </Button>
                  {/* )} */}

                  {canCreateContract && (
                    <Button
                      variant="contained"
                      startIcon={<DescriptionIcon />}
                      onClick={handleCreateContract}
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
                      Tạo Hợp Đồng
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
                    {verification.name}
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
                    {verification.phoneNumber}
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
                    {formatDate(verification.inspectionDate)}
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
                    label={getStatusText(verification.status)}
                    color={getStatusColor(verification.status)}
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
                    {verification.branchName}
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
                    {verification.staffName || "Chưa phân công"}
                  </Typography>
                </Grid>
                {verification.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", mb: 0.5, fontWeight: 600 }}
                    >
                      Ghi chú
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1E293B" }}>
                      {verification.notes}
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
                Danh Sách Thiết Bị ({verification.items?.length || 0})
              </Typography>
              {verification.items && verification.items.length > 0 ? (
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
                      {verification.items.map((item, index) => (
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
            {verification.inspections &&
              verification.inspections.length > 0 && (
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
                    Chi Tiết Kiểm Tra ({verification.inspections.length})
                  </Typography>

                  {Object.entries(groupedInspections).map(
                    ([itemName, inspections]) => (
                      <Box key={itemName} sx={{ mb: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <CameraIcon sx={{ color: "#FF6B35", fontSize: 20 }} />
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ color: "#1E293B" }}
                          >
                            {itemName}
                          </Typography>
                          <Chip
                            label={
                              inspections[0]?.itemType === "Camera"
                                ? "Camera"
                                : "Phụ kiện"
                            }
                            size="small"
                            sx={{
                              bgcolor:
                                inspections[0]?.itemType === "Camera"
                                  ? "#EFF6FF"
                                  : "#F0FDF4",
                              color:
                                inspections[0]?.itemType === "Camera"
                                  ? "#3B82F6"
                                  : "#10B981",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>

                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{
                            border: "1px solid #E2E8F0",
                            borderRadius: 2,
                            mb: 2,
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Phần
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Nhãn
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Giá trị
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Kết quả
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Ghi chú
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Ảnh
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {inspections.map((inspection, idx) => (
                                <TableRow
                                  key={inspection.id}
                                  sx={{
                                    bgcolor:
                                      idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                                  }}
                                >
                                  <TableCell>
                                    <Typography
                                      sx={{
                                        color: "#1E293B",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {inspection.section}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      sx={{
                                        color: "#1E293B",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {inspection.label}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      sx={{
                                        color: "#64748B",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {inspection.value}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    {inspection.passed === true ? (
                                      <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Đạt"
                                        size="small"
                                        sx={{
                                          bgcolor: "#F0FDF4",
                                          color: "#10B981",
                                          fontWeight: 600,
                                          "& .MuiChip-icon": {
                                            color: "#10B981",
                                          },
                                        }}
                                      />
                                    ) : inspection.passed === false ? (
                                      <Chip
                                        icon={<CancelIcon />}
                                        label="Không đạt"
                                        size="small"
                                        sx={{
                                          bgcolor: "#FEF2F2",
                                          color: "#EF4444",
                                          fontWeight: 600,
                                          "& .MuiChip-icon": {
                                            color: "#EF4444",
                                          },
                                        }}
                                      />
                                    ) : (
                                      <Chip
                                        label="Chưa đánh giá"
                                        size="small"
                                        sx={{
                                          bgcolor: "#F1F5F9",
                                          color: "#64748B",
                                          fontWeight: 600,
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      sx={{
                                        color: "#64748B",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {inspection.notes || "-"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {inspection.media &&
                                    inspection.media.length > 0 ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        {inspection.media.map((mediaItem) => (
                                          <Box
                                            key={mediaItem.id}
                                            sx={{
                                              position: "relative",
                                              cursor: "pointer",
                                              "&:hover": {
                                                opacity: 0.8,
                                              },
                                            }}
                                            onClick={() =>
                                              setSelectedImage(mediaItem.url)
                                            }
                                          >
                                            <Box
                                              component="img"
                                              src={mediaItem.url}
                                              alt={
                                                mediaItem.label ||
                                                "Inspection image"
                                              }
                                              sx={{
                                                width: 60,
                                                height: 60,
                                                objectFit: "cover",
                                                borderRadius: 1,
                                                border: "1px solid #E2E8F0",
                                              }}
                                            />
                                            <Box
                                              sx={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                                bgcolor: "rgba(0,0,0,0.5)",
                                                borderRadius: "50%",
                                                p: 0.5,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                              }}
                                            >
                                              <ZoomInIcon
                                                sx={{
                                                  color: "white",
                                                  fontSize: 16,
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                        ))}
                                      </Box>
                                    ) : (
                                      <Typography
                                        sx={{
                                          color: "#94A3B8",
                                          fontSize: "0.875rem",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        Không có ảnh
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )
                  )}
                </Paper>
              )}

            {(!verification.inspections ||
              verification.inspections.length === 0) && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#94A3B8", fontStyle: "italic" }}
                >
                  Chưa có dữ liệu kiểm tra nào
                </Typography>
              </Paper>
            )}
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
        selectedVerification={verification}
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
    </>
  );
}
