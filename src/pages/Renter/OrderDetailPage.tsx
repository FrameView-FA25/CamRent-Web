import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  Collapse,
  Stack,
} from "@mui/material";
import {
  ArrowLeft,
  Package,
  Camera,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  XCircle,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "../../theme/colors";
import type { BookingDetail } from "../../types/booking.types";
import { toast } from "react-toastify";
import { getOrderStatusInfo } from "../../utils/order.utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedInspectionImage, setSelectedInspectionImage] = useState<
    string | null
  >(null);
  const [paidDetailExpanded, setPaidDetailExpanded] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [, setCurrentContractId] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>("");
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.warning("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Bookings/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order details: ${response.status}`);
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load order details"
      );
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (location: BookingDetail["location"]) => {
    return `${location.district}, ${location.province}, ${location.country}`;
  };

  const calculateRentalDays = (pickupAt: string, returnAt: string) => {
    const pickup = new Date(pickupAt);
    const returnDate = new Date(returnAt);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.warning("Vui lòng đăng nhập");
        return;
      }

      // TODO: Implement cancel order API call
      toast.success("Đã hủy đơn hàng thành công");
      setOpenCancelDialog(false);
      fetchOrderDetail();
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Không thể hủy đơn hàng");
    }
  };

  const handleViewContract = async () => {
    if (!order || !order.contracts || order.contracts.length === 0) {
      toast.error("Không tìm thấy hợp đồng");
      return;
    }

    const contractId = order.contracts[0].id;
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

  const handleClosePdfDialog = () => {
    setPdfDialogOpen(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleDownloadContract = () => {
    if (!pdfUrl || !currentFilename) {
      toast.error("Không thể tải hợp đồng");
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = currentFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đang tải hợp đồng...");
  };

  // Get image URL from media array
  const getImageUrl = (media: any[]): string | null => {
    if (!media || media.length === 0) return null;
    return media[0]?.url || null;
  };

  if (loading) {
    return (
      <Box
        sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}
      >
        <Container maxWidth="xl">
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: 3, mb: 3 }}
          />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Skeleton
              variant="rectangular"
              height={600}
              sx={{ flex: 1, borderRadius: 3 }}
            />
            <Skeleton
              variant="rectangular"
              height={600}
              sx={{ width: 400, borderRadius: 3 }}
            />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box
        sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}
      >
        <Container maxWidth="xl">
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              textAlign: "center",
            }}
          >
            <Package size={64} color={colors.neutral[300]} />
            <Typography
              variant="h6"
              sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
            >
              {error || "Không tìm thấy đơn hàng"}
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary.main,
                color: "black",
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                mt: 2,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
              onClick={() => navigate("/renter/my-orders")}
            >
              Quay lại đơn hàng
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status, order.statusText);
  const rentalDays = calculateRentalDays(order.pickupAt, order.returnAt);

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Back Button */}
        <Button
          startIcon={<ArrowLeft size={20} />}
          sx={{
            color: colors.text.secondary,
            textTransform: "none",
            fontWeight: 600,
            mb: 3,
            "&:hover": {
              bgcolor: colors.neutral[100],
            },
          }}
          onClick={() => navigate("/renter/my-orders")}
        >
          Quay lại đơn hàng
        </Button>

        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: colors.text.primary }}
                >
                  {order.id.slice(0, 13)}...
                </Typography>
                <Chip
                  icon={statusInfo.icon}
                  label={statusInfo.label}
                  sx={{
                    bgcolor: statusInfo.bgColor,
                    color: statusInfo.color,
                    fontWeight: 600,
                    "& .MuiChip-icon": {
                      color: "inherit",
                    },
                  }}
                />
                <Chip
                  label={order.type}
                  variant="outlined"
                  sx={{
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {rentalDays} ngày thuê • {formatDate(order.pickupAt)} -{" "}
                {formatDate(order.returnAt)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {order.contracts && order.contracts.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<FileText size={18} />}
                  disabled={contractLoading}
                  sx={{
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: colors.primary.dark,
                      bgcolor: colors.primary.lighter,
                    },
                  }}
                  onClick={handleViewContract}
                >
                  {contractLoading ? "Đang tải..." : "Xem hợp đồng"}
                </Button>
              )}

              {order.status === "PendingApproval" && (
                <Button
                  variant="outlined"
                  startIcon={<XCircle size={18} />}
                  sx={{
                    borderColor: colors.status.error,
                    color: colors.status.error,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: colors.status.error,
                      bgcolor: colors.status.errorLight,
                    },
                  }}
                  onClick={() => setOpenCancelDialog(true)}
                >
                  Hủy đơn
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Left Column */}
          <Box sx={{ flex: 1 }}>
            {/* Order Items */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Sản phẩm ({order.items.length})
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {order.items.map((item, index) => {
                  const imageUrl = getImageUrl(item.media);

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        gap: 2,
                        p: 2,
                        bgcolor: colors.neutral[50],
                        borderRadius: 2,
                        border: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          bgcolor: colors.neutral[100],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.itemName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const icon = document.createElement("div");
                                icon.innerHTML =
                                  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
                                icon.style.color = colors.neutral[400];
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <Camera size={32} color={colors.neutral[400]} />
                        )}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                color: colors.text.primary,
                                mb: 0.5,
                              }}
                            >
                              {item.itemName || "Camera"}
                            </Typography>
                            <Chip
                              label={item.itemType}
                              size="small"
                              sx={{
                                bgcolor: colors.primary.lighter,
                                color: colors.primary.main,
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: colors.primary.main }}
                          >
                            {formatCurrency(item.unitPrice)}/ngày
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.secondary,
                            display: "block",
                            fontFamily: "monospace",
                            mt: 1,
                          }}
                        >
                          ID: {item.itemId.slice(0, 13)}...
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            mt: 1,
                            p: 1.5,
                            bgcolor: colors.background.paper,
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: colors.text.secondary }}
                            >
                              Tiền cọc
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: colors.text.primary,
                              }}
                            >
                              {formatCurrency(item.depositAmount)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Rental Information */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Thông tin thuê
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Calendar
                    size={24}
                    color={colors.primary.main}
                    style={{ flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Ngày nhận
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatDateTime(order.pickupAt)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Calendar
                    size={24}
                    color={colors.status.error}
                    style={{ flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Ngày trả
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatDateTime(order.returnAt)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <MapPin
                    size={24}
                    color={colors.accent.blue}
                    style={{ flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Địa điểm
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatLocation(order.location)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Payment Information */}
            {order.payments && order.payments.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
                >
                  Tổng quát thanh toán
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary, mb: 3 }}
                >
                  Chi tiết chi phí
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2}>
                  {/* Dropdown cho Đã thanh toán */}
                  <Box>
                    <Box
                      onClick={() => setPaidDetailExpanded(!paidDetailExpanded)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: paidDetailExpanded
                          ? colors.primary.lighter
                          : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: colors.primary.lighter,
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: colors.text.secondary }}
                        >
                          Đã thanh toán
                        </Typography>
                        {paidDetailExpanded ? (
                          <ChevronUp size={20} color={colors.primary.main} />
                        ) : (
                          <ChevronDown size={20} color={colors.primary.main} />
                        )}
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: colors.text.primary }}
                      >
                        {formatCurrency(
                          order.payments
                            .filter(
                              (p) =>
                                p.status === "Captured" ||
                                p.status === "Authorized"
                            )
                            .reduce(
                              (sum, p) =>
                                sum +
                                (p.capturedAmount || p.authorizedAmount || 0),
                              0
                            )
                        )}
                      </Typography>
                    </Box>

                    <Collapse in={paidDetailExpanded}>
                      <Box
                        sx={{
                          mt: 1,
                          ml: 2,
                          pl: 2,
                          borderLeft: `2px solid ${colors.primary.main}`,
                        }}
                      >
                        <Stack spacing={2}>
                          {order.payments
                            .filter(
                              (p) =>
                                p.status === "Captured" ||
                                p.status === "Authorized"
                            )
                            .map((payment, index) => {
                              const paymentAmount =
                                payment.status === "Captured"
                                  ? payment.capturedAmount
                                  : payment.authorizedAmount;

                              const getPaymentMethodLabel = (
                                provider: string
                              ) => {
                                switch (provider?.toLowerCase()) {
                                  case "payos":
                                    return "Chuyển khoản ngân hàng (PayOS)";
                                  case "cash":
                                    return "Tiền mặt";
                                  case "wallet":
                                    return "Ví điện tử";
                                  default:
                                    return provider || "Không xác định";
                                }
                              };

                              const getStatusLabel = (status: string) => {
                                switch (status) {
                                  case "Captured":
                                    return "Đã thanh toán";
                                  case "Authorized":
                                    return "Đã ủy quyền";
                                  default:
                                    return status;
                                }
                              };

                              const getStatusColor = (status: string) => {
                                switch (status) {
                                  case "Captured":
                                    return colors.status.success;
                                  case "Authorized":
                                    return colors.accent.blue;
                                  default:
                                    return colors.text.secondary;
                                }
                              };

                              return (
                                <Box
                                  key={payment.id}
                                  sx={{
                                    p: 2,
                                    bgcolor: colors.background.default,
                                    borderRadius: 2,
                                    border: `1px solid ${colors.border.light}`,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "start",
                                      mb: 1.5,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 600,
                                          color: colors.text.primary,
                                        }}
                                      >
                                        Thanh toán #{index + 1}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: colors.text.secondary }}
                                      >
                                        {getPaymentMethodLabel(
                                          payment.provider
                                        )}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontWeight: 700,
                                          color: colors.status.success,
                                        }}
                                      >
                                        {formatCurrency(paymentAmount)}
                                      </Typography>
                                      <Chip
                                        label={getStatusLabel(payment.status)}
                                        size="small"
                                        sx={{
                                          mt: 0.5,
                                          bgcolor: getStatusColor(
                                            payment.status
                                          ),
                                          color: "white",
                                          fontSize: "0.7rem",
                                          height: 20,
                                        }}
                                      />
                                    </Box>
                                  </Box>

                                  {/* Chi tiết các payment lines */}
                                  {payment.lines &&
                                    payment.lines.length > 0 && (
                                      <Box
                                        sx={{
                                          mt: 1.5,
                                          pt: 1.5,
                                          borderTop: `1px solid ${colors.border.light}`,
                                        }}
                                      >
                                        <Stack spacing={1}>
                                          {payment.lines.map(
                                            (line, lineIndex) => {
                                              const getLineTypeLabel = (
                                                type: string
                                              ) => {
                                                switch (type) {
                                                  case "rental":
                                                    return "Tiền thuê thiết bị";
                                                  case "rental_advance":
                                                    return "Tiền giữ chỗ (10%)";
                                                  case "device_deposit":
                                                    return "Tiền cọc thiết bị";
                                                  case "delivery_fee":
                                                    return "Phí giao hàng";
                                                  case "refund":
                                                    return "Hoàn tiền";
                                                  default:
                                                    return type;
                                                }
                                              };

                                              const lineAmount =
                                                payment.status === "Captured"
                                                  ? line.capturedAmount ||
                                                    line.amount
                                                  : line.amount;

                                              return (
                                                <Box
                                                  key={lineIndex}
                                                  sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                      "space-between",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    sx={{
                                                      color:
                                                        colors.text.secondary,
                                                    }}
                                                  >
                                                    {getLineTypeLabel(
                                                      line.type
                                                    )}
                                                  </Typography>
                                                  <Typography
                                                    variant="caption"
                                                    sx={{
                                                      fontWeight: 600,
                                                      color:
                                                        colors.text.primary,
                                                    }}
                                                  >
                                                    {formatCurrency(lineAmount)}
                                                  </Typography>
                                                </Box>
                                              );
                                            }
                                          )}
                                        </Stack>
                                      </Box>
                                    )}
                                </Box>
                              );
                            })}

                          {order.payments.filter(
                            (p) =>
                              p.status === "Captured" ||
                              p.status === "Authorized"
                          ).length === 0 && (
                            <Typography
                              variant="caption"
                              sx={{ color: colors.text.secondary }}
                            >
                              Chưa có khoản thanh toán nào
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Collapse>
                  </Box>

                  {/* Đã hoàn tiền (nếu có) */}
                  {order.payments.some(
                    (p) => p.status === "Refunded" && p.refundedAmount > 0
                  ) && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: colors.accent.blue + "20",
                        borderRadius: 2,
                        border: `1px solid ${colors.accent.blue}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckCircle size={20} color={colors.accent.blue} />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.accent.blue }}
                          >
                            Đã hoàn tiền
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: colors.accent.blue }}
                        >
                          {formatCurrency(
                            order.payments
                              .filter((p) => p.status === "Refunded")
                              .reduce(
                                (sum, p) => sum + (p.refundedAmount || 0),
                                0
                              )
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Inspections */}
            {order.inspections && order.inspections.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
                >
                  Kiểm tra thiết bị ({order.inspections.length})
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {order.inspections.map((inspection) => (
                    <Card
                      key={inspection.id}
                      elevation={0}
                      sx={{
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                color: colors.text.primary,
                                mb: 0.5,
                              }}
                            >
                              {inspection.itemName}
                            </Typography>
                            <Chip
                              label={inspection.itemType}
                              size="small"
                              sx={{
                                bgcolor: colors.primary.lighter,
                                color: colors.primary.main,
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          {inspection.passed !== null && (
                            <Chip
                              icon={
                                inspection.passed ? (
                                  <CheckCircle size={16} />
                                ) : (
                                  <XCircle size={16} />
                                )
                              }
                              label={
                                inspection.passed ? "Đạt yêu cầu" : "Không đạt"
                              }
                              size="small"
                              sx={{
                                bgcolor: inspection.passed
                                  ? colors.status.successLight
                                  : colors.status.errorLight,
                                color: inspection.passed
                                  ? colors.status.success
                                  : colors.status.error,
                                fontWeight: 600,
                                "& .MuiChip-icon": {
                                  color: "inherit",
                                },
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Phần: {inspection.section} • Nhãn:{" "}
                            {inspection.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.text.primary, mt: 0.5 }}
                          >
                            Giá trị: {inspection.value}
                          </Typography>
                          {inspection.notes && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.text.secondary,
                                mt: 0.5,
                                fontStyle: "italic",
                              }}
                            >
                              Ghi chú: {inspection.notes}
                            </Typography>
                          )}
                        </Box>

                        {inspection.media && inspection.media.length > 0 && (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.secondary,
                                display: "block",
                                mb: 1,
                              }}
                            >
                              Hình ảnh ({inspection.media.length})
                            </Typography>
                            <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                              {inspection.media.map((media) => (
                                <ImageListItem
                                  key={media.id}
                                  sx={{
                                    cursor: "pointer",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    "&:hover": {
                                      opacity: 0.8,
                                    },
                                  }}
                                  onClick={() =>
                                    setSelectedInspectionImage(media.url)
                                  }
                                >
                                  <img
                                    src={media.url}
                                    alt={media.label}
                                    loading="lazy"
                                    style={{
                                      width: "100%",
                                      height: "100px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </ImageListItem>
                              ))}
                            </ImageList>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>

          {/* Right Column */}
          <Box sx={{ width: { xs: "100%", lg: "400px" }, flexShrink: 0 }}>
            {/* Customer Information */}
            {order.renter && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
                >
                  Thông tin khách hàng
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Avatar
                    src={
                      typeof order.renter.avatar === "string"
                        ? order.renter.avatar
                        : Array.isArray(order.renter.avatar) &&
                          order.renter.avatar.length > 0
                        ? order.renter.avatar[0]
                        : undefined
                    }
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: colors.primary.main,
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {order.renter.fullName?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: colors.text.primary }}
                    >
                      {order.renter.fullName || "Unknown"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      ID: {order.renterId.slice(0, 13)}...
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {order.renter.email && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Mail
                        size={20}
                        color={colors.text.secondary}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.secondary,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Email
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.text.primary }}
                        >
                          {order.renter.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {order.renter.phone && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Phone
                        size={20}
                        color={colors.text.secondary}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.secondary,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Số điện thoại
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.text.primary }}
                        >
                          {order.renter.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}

            {/* Important Note */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.status.warningLight}`,
                bgcolor: colors.status.warningLight,
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <AlertCircle
                  size={24}
                  color={colors.status.warning}
                  style={{ flexShrink: 0 }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
                  >
                    Lưu ý quan trọng
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Vui lòng kiểm tra kỹ thiết bị khi nhận hàng. Báo cáo hư hỏng
                    trong vòng 24 giờ. Tiền cọc sẽ được hoàn lại sau khi trả
                    thiết bị và kiểm tra.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Inspection Image Dialog */}
        <Dialog
          open={Boolean(selectedInspectionImage)}
          onClose={() => setSelectedInspectionImage(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 0, position: "relative" }}>
            <IconButton
              onClick={() => setSelectedInspectionImage(null)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
                zIndex: 1,
              }}
            >
              <XCircle size={20} />
            </IconButton>
            {selectedInspectionImage && (
              <img
                src={selectedInspectionImage}
                alt="Inspection"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* PDF Contract Dialog */}
        <Dialog
          open={pdfDialogOpen}
          onClose={handleClosePdfDialog}
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
              bgcolor: colors.background.default,
              borderBottom: `2px solid ${colors.border.light}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2.5,
              px: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: colors.text.primary }}
              >
                Hợp đồng thuê thiết bị
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                {currentFilename}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClosePdfDialog}
              sx={{
                color: colors.text.secondary,
                "&:hover": {
                  bgcolor: colors.neutral[100],
                  color: colors.text.primary,
                },
              }}
            >
              <XCircle size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, bgcolor: colors.background.default }}>
            {pdfUrl && (
              <Box
                sx={{
                  width: "100%",
                  height: "70vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <iframe
                  src={pdfUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title="Contract Preview"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: colors.background.default,
              borderTop: `2px solid ${colors.border.light}`,
              px: 3,
              py: 2,
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              sx={{
                borderColor: colors.border.light,
                color: colors.text.primary,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: colors.primary.main,
                  bgcolor: colors.primary.lighter,
                },
              }}
              onClick={handleDownloadContract}
            >
              Tải PDF
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary.main,
                color: "black",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
              onClick={handleClosePdfDialog}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Hủy đơn hàng
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: colors.status.errorLight,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <AlertCircle size={24} color={colors.status.error} />
                <Typography variant="body2" sx={{ color: colors.text.primary }}>
                  Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể
                  hoàn tác.
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Mã đơn hàng: <strong>{order.id.slice(0, 13)}...</strong>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: colors.border.light,
                color: colors.text.primary,
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={() => setOpenCancelDialog(false)}
            >
              Giữ đơn hàng
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.status.error,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: colors.status.error,
                  opacity: 0.9,
                },
              }}
              onClick={handleCancelOrder}
            >
              Xác nhận hủy
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrderDetailPage;
