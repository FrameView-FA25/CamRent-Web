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
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import type { Verification } from "../../types/verification.types";

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
                              item.itemType === "1" ||
                              item.itemType === "Camera"
                                ? "Camera"
                                : "Phụ kiện"
                            }
                            size="small"
                            sx={{
                              bgcolor:
                                item.itemType === "1" ||
                                item.itemType === "Camera"
                                  ? "#EFF6FF"
                                  : "#F0FDF4",
                              color:
                                item.itemType === "1" ||
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
                                {inspection.passed ? (
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
                                ) : (
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
    </Dialog>
  );
}
