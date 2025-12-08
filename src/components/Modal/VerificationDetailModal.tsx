import { useState } from "react";
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
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
  ZoomIn as ZoomInIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import type { Verification, Contract } from "../../types/verification.types";
import { contractService } from "../../services/contract.service";

interface VerificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  verification: Verification | null;
}

export default function VerificationDetailModal({
  open,
  onClose,
  verification,
}: VerificationDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  if (!verification) return null;

  const handlePreviewContract = async (contractId: string) => {
    setPreviewLoading(contractId);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Vui lòng đăng nhập để xem hợp đồng.");
        return;
      }

      const blob = await contractService.getPreview(contractId, token);
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      // Mở PDF trong tab mới
      window.open(url, "_blank");

      // Cleanup sau 1 phút
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Error previewing contract:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi khi xem trước hợp đồng."
      );
    } finally {
      setPreviewLoading(null);
    }
  };

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

  /**
   * Tính toán trạng thái hợp đồng dựa trên status từ API và chữ ký thực tế
   * - status: "Signed" → "Đã ký"
   * - status: "PendingSignatures" + có ít nhất 1 bên đã ký → "Đang ký"
   * - status: "PendingSignatures" + chưa ai ký → "Chờ ký"
   */
  const getContractStatus = (contract: Contract) => {
    if (contract.status === "Signed") {
      return { label: "Đã ký", color: "#10B981", bg: "#F0FDF4" };
    } else if (contract.status === "PendingSignatures") {
      // Kiểm tra có bất kỳ ai đã ký chưa
      const anySigned =
        contract.signatures?.some(
          (s: { isSigned: boolean }) => s.isSigned === true
        ) || false;

      if (anySigned) {
        // Có ít nhất 1 bên đã ký → "Đang ký"
        return { label: "Đang ký", color: "#F59E0B", bg: "#FEF3C7" };
      } else {
        // Chưa ai ký → "Chờ ký"
        return { label: "Chờ ký", color: "#C8501D", bg: "#FFF4ED" };
      }
    } else {
      // Trạng thái khác hoặc không xác định
      return {
        label: contract.status || "Chờ ký",
        color: "#64748B",
        bg: "#F1F5F9",
      };
    }
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

  return (
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
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: "#1E293B", mb: 2 }}
            >
              Thông Tin Yêu Cầu
            </Typography>
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
                              item.itemType === "Camera" ? "Camera" : "Phụ kiện"
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
          {verification.inspections && verification.inspections.length > 0 && (
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
                                bgcolor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
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

          {/* Danh sách hợp đồng */}
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
              Danh Sách Hợp Đồng ({verification.contracts?.length || 0})
            </Typography>
            {verification.contracts && verification.contracts.length > 0 ? (
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
                        Mã hợp đồng
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Trạng thái
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Ngày tạo
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Chữ ký
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {verification.contracts.map((contract, index) => {
                      const contractStatus = getContractStatus(contract);
                      return (
                        <TableRow
                          key={contract.id}
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
                              {contract.id.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={contractStatus.label}
                              size="small"
                              sx={{
                                bgcolor: contractStatus.bg,
                                color: contractStatus.color,
                                fontWeight: 600,
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
                              {formatDate(contract.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              {contract.signatures &&
                              contract.signatures.length > 0 ? (
                                contract.signatures.map((signature, sigIdx) => (
                                  <Tooltip
                                    key={sigIdx}
                                    title={
                                      signature.isSigned && signature.signedAt
                                        ? `Đã ký lúc: ${formatDate(
                                            signature.signedAt
                                          )}`
                                        : signature.isSigned
                                        ? "Đã ký"
                                        : "Chưa ký"
                                    }
                                    arrow
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Chip
                                        label={
                                          signature.role === "Owner"
                                            ? "Chủ sở hữu"
                                            : signature.role === "Platform"
                                            ? "Nền tảng"
                                            : signature.role === "Renter"
                                            ? "Người thuê"
                                            : signature.role
                                        }
                                        size="small"
                                        sx={{
                                          bgcolor: signature.isSigned
                                            ? "#F0FDF4"
                                            : "#FEF2F2",
                                          color: signature.isSigned
                                            ? "#10B981"
                                            : "#EF4444",
                                          fontWeight: 600,
                                          fontSize: "0.7rem",
                                          height: 20,
                                        }}
                                      />
                                      {signature.isSigned ? (
                                        <CheckCircleIcon
                                          sx={{
                                            color: "#10B981",
                                            fontSize: 16,
                                          }}
                                        />
                                      ) : (
                                        <CancelIcon
                                          sx={{
                                            color: "#EF4444",
                                            fontSize: 16,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Tooltip>
                                ))
                              ) : (
                                <Typography
                                  sx={{
                                    color: "#94A3B8",
                                    fontSize: "0.75rem",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Chưa có chữ ký
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handlePreviewContract(contract.id)}
                              disabled={previewLoading === contract.id}
                              sx={{
                                borderColor: "#FF6B35",
                                color: "#FF6B35",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                textTransform: "none",
                                "&:hover": {
                                  borderColor: "#E85D2A",
                                  bgcolor: "#FFF5F0",
                                },
                                "&:disabled": {
                                  borderColor: "#FCDAD0",
                                  color: "#FCDAD0",
                                },
                              }}
                            >
                              {previewLoading === contract.id
                                ? "Đang tải..."
                                : "Xem trước"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#94A3B8", fontStyle: "italic" }}
              >
                Chưa có hợp đồng nào
              </Typography>
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
  );
}
