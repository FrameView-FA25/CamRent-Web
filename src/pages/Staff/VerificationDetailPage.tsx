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

  const summaryCards = [
    {
      icon: TaskAlt,
      bg: "#FEF3C7",
      color: "#F59E0B",
      label: "Trạng thái",
      value: getStatusLabel(verification.status),
    },
    {
      icon: CalendarToday,
      bg: "#DBEAFE",
      color: "#2563EB",
      label: "Ngày kiểm tra",
      value: formatDateTime(verification.inspectionDate),
    },
    {
      icon: Camera,
      bg: "#D1FAE5",
      color: "#059669",
      label: "Thiết bị",
      value: `${verification.items?.length || 0} mục`,
    },
    {
      icon: Person,
      bg: "#FFE4E6",
      color: "#DB2777",
      label: "Nhân viên phụ trách",
      value: verification.staffName || "Chưa phân công",
    },
  ];

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

        {/* Summary */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 4,
          }}
        >
          {summaryCards.map((card) => (
            <Paper
              key={card.label}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: 110,
              }}
            >
              <Avatar sx={{ bgcolor: card.bg, color: card.color }}>
                <card.icon />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  {card.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#111827", mt: 0.5 }}
                >
                  {card.value}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Detail sections */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: 3,
            mb: 4,
            "& > *": { height: "100%" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
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

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                    {verification.staffName || "Chưa cập nhật"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                  {verification.items?.length || 0} thiết bị
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            {verification.items && verification.items.length > 0 ? (
              <Stack spacing={2}>
                {verification.items.map((item) => (
                  <Paper
                    key={item.itemId}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#F9FAFB",
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor:
                            item.itemType === "Camera" || item.itemType === "1"
                              ? "#EFF6FF"
                              : "#ECFDF5",
                          color:
                            item.itemType === "Camera" || item.itemType === "1"
                              ? "#2563EB"
                              : "#059669",
                        }}
                      >
                        {item.itemType === "Camera" || item.itemType === "1" ? (
                          <Camera />
                        ) : (
                          <Inventory />
                        )}
                      </Avatar>
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
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#94A3B8", textAlign: "center", mt: 6 }}
              >
                Chưa có thiết bị nào được gán
              </Typography>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Thông tin bổ sung từ nhân viên
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ color: "#374151" }}>
              {verification.notes ||
                "Chưa có ghi chú nào được thêm vào yêu cầu này."}
            </Typography>
          </Paper>
        </Box>

      </Container>
    </Box>
  );
};

export default VerificationDetailPage;
