import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Phone,
  LocationOn,
  CalendarToday,
  Business,
  Note,
  Camera,
  Inventory,
  CheckCircle,
  Cancel,
  ZoomIn,
  Close,
  PhotoCamera,
  TaskAlt,
} from "@mui/icons-material";
import { verificationService } from "../../services/verification.service";
import type { Verification } from "../../types/verification.types";

const VerificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadVerificationDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedVerification = await verificationService.getVerificationById(
        id
      );
      setVerification(fetchedVerification);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải thông tin";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadVerificationDetail();
    }
  }, [id, loadVerificationDetail]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getItemTypeLabel = (itemType: string) => {
    return itemType === "1" || itemType === "Camera" ? "Camera" : "Phụ kiện";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      Pending: "Chờ xử lý",
      Assigned: "Đã phân công",
      Approved: "Đã duyệt",
      Rejected: "Từ chối",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, { bg: string; color: string }> = {
      Pending: { bg: "#FEF3C7", color: "#F59E0B" },
      Assigned: { bg: "#DBEAFE", color: "#3B82F6" },
      Approved: { bg: "#D1FAE5", color: "#10B981" },
      Rejected: { bg: "#FEE2E2", color: "#EF4444" },
      Completed: { bg: "#DBEAFE", color: "#3B82F6" },
      Cancelled: { bg: "#F3F4F6", color: "#6B7280" },
    };
    return colorMap[status] || { bg: "#F3F4F6", color: "#6B7280" };
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F5F5F5",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#F97316", mb: 2 }} size={60} />
          <Typography sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
            Đang tải thông tin kiểm tra xác minh...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !verification) {
    return (
      <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/staff/verifications")}
              >
                Quay lại
              </Button>
            }
          >
            {error || "Không tìm thấy yêu cầu kiểm tra xác minh"}
          </Alert>
        </Container>
      </Box>
    );
  }

  const statusInfo = getStatusColor(verification.status);

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => navigate("/staff/verifications")}
              sx={{
                bgcolor: "white",
                border: "1px solid #E5E7EB",
                "&:hover": {
                  bgcolor: "#FFF7ED",
                  borderColor: "#F97316",
                },
              }}
            >
              <ArrowBack sx={{ color: "#F97316" }} />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Chi tiết kiểm tra xác minh
                <Chip
                  label={getStatusLabel(verification.status)}
                  sx={{
                    bgcolor: statusInfo.bg,
                    color: statusInfo.color,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                Mã yêu cầu: {verification.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Left Column */}
          <Box sx={{ flex: 1 }}>
            {/* Customer Information */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: "#FFF7ED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Person sx={{ color: "#F97316", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    Thông tin khách hàng
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Chi tiết người yêu cầu
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      Họ và tên
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {verification.name}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                    <Phone />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      Số điện thoại
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {verification.phoneNumber}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                    <LocationOn />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      Địa chỉ
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {verification.address}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Branch & Date Info */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Business sx={{ color: "#4F46E5", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    Thông tin chi nhánh
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Chi tiết địa điểm và thời gian
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      Chi nhánh
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {verification.branchName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                    <CalendarToday />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      Ngày kiểm tra
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatDateTime(verification.inspectionDate)}
                    </Typography>
                  </Box>
                </Box>

                {verification.staffName && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "#6B7280", display: "block" }}
                      >
                        Nhân viên phụ trách
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#1F2937" }}
                      >
                        {verification.staffName}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Notes */}
            {verification.notes && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      bgcolor: "#F0FDF4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Note sx={{ color: "#10B981", fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#1F2937" }}
                    >
                      Ghi chú
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ color: "#374151" }}>
                  {verification.notes}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1 }}>
            {/* Items List */}
            {verification.items && verification.items.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      bgcolor: "#D1FAE5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PhotoCamera sx={{ color: "#059669", fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#1F2937" }}
                    >
                      Danh sách thiết bị
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      {verification.items.length} thiết bị
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2}>
                  {verification.items.map((item) => (
                    <Paper
                      key={item.itemId}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: "#F9FAFB",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {item.itemType === "Camera" || item.itemType === "1" ? (
                          <Camera sx={{ color: "#3B82F6", fontSize: 28 }} />
                        ) : (
                          <Inventory sx={{ color: "#10B981", fontSize: 28 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: "#1F2937" }}
                          >
                            {item.itemName}
                          </Typography>
                          <Chip
                            label={getItemTypeLabel(item.itemType)}
                            size="small"
                            sx={{
                              bgcolor:
                                item.itemType === "Camera" ||
                                item.itemType === "1"
                                  ? "#EFF6FF"
                                  : "#F0FDF4",
                              color:
                                item.itemType === "Camera" ||
                                item.itemType === "1"
                                  ? "#3B82F6"
                                  : "#10B981",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              mt: 0.5,
                            }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Inspections Section */}
        {verification.inspections && verification.inspections.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TaskAlt sx={{ color: "#F59E0B", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Kết quả kiểm tra
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {verification.inspections.length} mục kiểm tra
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Group inspections by itemName */}
            {(() => {
              const groupedInspections = verification.inspections.reduce(
                (acc, inspection) => {
                  const key = `${inspection.itemName}-${inspection.itemType}`;
                  if (!acc[key]) {
                    acc[key] = {
                      itemName: inspection.itemName,
                      itemType: inspection.itemType,
                      inspections: [],
                    };
                  }
                  acc[key].inspections.push(inspection);
                  return acc;
                },
                {} as Record<
                  string,
                  {
                    itemName: string;
                    itemType: string;
                    inspections: typeof verification.inspections;
                  }
                >
              );

              return (
                <Stack spacing={3}>
                  {Object.entries(groupedInspections).map(([key, group]) => (
                    <Box key={key}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                          p: 2,
                          bgcolor: "#F9FAFB",
                          borderRadius: 2,
                        }}
                      >
                        <PhotoCamera
                          sx={{
                            color:
                              group.itemType === "Camera"
                                ? "#059669"
                                : "#4F46E5",
                            fontSize: 24,
                          }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: "#1F2937" }}
                          >
                            {group.itemName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            {group.itemType} • {group.inspections.length} mục
                            kiểm tra
                          </Typography>
                        </Box>
                      </Box>

                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          border: "1px solid #E5E7EB",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Phần
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Nhãn
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Giá trị
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Trạng thái
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Ghi chú
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Ảnh
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.inspections.map((inspection, idx) => (
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
                                      color: "#1F2937",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {inspection.section}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      color: "#1F2937",
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
                                      icon={<CheckCircle />}
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
                                      icon={<Cancel />}
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
                                              border: "1px solid #E5E7EB",
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
                                            <ZoomIn
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
                  ))}
                </Stack>
              );
            })()}
          </Paper>
        )}

        {/* No Inspections Message */}
        {(!verification.inspections ||
          verification.inspections.length === 0) && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              border: "1px solid #E5E7EB",
              borderRadius: 3,
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
      </Container>

      {/* Image Viewer Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.9)",
            borderRadius: 2,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
          }}
        >
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
              zIndex: 1,
            }}
          >
            <Close />
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
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VerificationDetailPage;
