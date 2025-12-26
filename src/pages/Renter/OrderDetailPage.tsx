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
  MessageSquare,
  XCircle,
  AlertCircle,
  Shield,
  CheckCircle,
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
  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedInspectionImage, setSelectedInspectionImage] = useState<
    string | null
  >(null);

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

  const handleViewContract = () => {
    setOpenContractDialog(true);
  };

  const handleDownloadContract = () => {
    toast.info("Tính năng tải hợp đồng sẽ sớm có");
  };

  // Get image URL from media array
  const getImageUrl = (media: any[]): string | null => {
    if (!media || media.length === 0) return null;
    return media[0]?.url || null;
  };

  // Calculate payment details from payment lines
  const calculatePaymentDetails = () => {
    if (!order || !order.payments || order.payments.length === 0) {
      return {
        rentalAmount: order?.snapshotRentalTotal || 0,
        depositAmount: order?.snapshotDepositAmount || 0,
        platformFee:
          (order?.snapshotRentalTotal || 0) *
          (order?.snapshotPlatformFeePercent || 0),
        totalAmount: 0,
        paidAmount: 0,
        paymentStatus: "Chưa thanh toán",
      };
    }

    let totalRental = 0;
    let totalDeposit = 0;
    let totalPaid = 0;

    // Sum up all payment lines
    order.payments.forEach((payment) => {
      if (payment && payment.lines && Array.isArray(payment.lines)) {
        payment.lines.forEach((line) => {
          if (line.type === "rental" || line.type === "rental_advance") {
            totalRental += line.amount;
            if (
              payment.status === "Captured" ||
              payment.status === "Authorized"
            ) {
              totalPaid += line.capturedAmount || line.amount;
            }
          } else if (line.type === "device_deposit") {
            totalDeposit += line.amount;
          }
        });
      }
    });

    // Use snapshot values if no payment lines
    const rentalAmount = totalRental || order.snapshotRentalTotal;
    const depositAmount = totalDeposit || order.snapshotDepositAmount;
    const platformFee = rentalAmount * order.snapshotPlatformFeePercent;
    const totalAmount = rentalAmount + depositAmount + platformFee;

    // Determine payment status
    let paymentStatus = "Chưa thanh toán";
    const hasAuthorized = order.payments.some(
      (p) => p && p.status === "Authorized"
    );
    const hasCaptured = order.payments.some(
      (p) => p && p.status === "Captured"
    );

    if (hasCaptured) {
      paymentStatus = "Đã thanh toán";
    } else if (hasAuthorized) {
      paymentStatus = "Đã ủy quyền";
    }

    return {
      rentalAmount,
      depositAmount,
      platformFee,
      totalAmount,
      paidAmount: totalPaid,
      paymentStatus,
    };
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
  const paymentDetails = calculatePaymentDetails();

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
                  Xem hợp đồng
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<MessageSquare size={18} />}
                sx={{
                  borderColor: colors.border.light,
                  color: colors.text.primary,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: colors.accent.blue,
                    bgcolor: colors.accent.blueLight,
                  },
                }}
              >
                Liên hệ hỗ trợ
              </Button>

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
            {order.payments &&
              order.payments.length > 0 &&
              (() => {
                // Tổng hợp thông tin thanh toán
                const paymentSummary: { [key: string]: number } = {};
                let totalPaid = 0;
                let totalRefunded = 0;

                order.payments.forEach((payment) => {
                  if (payment.lines && Array.isArray(payment.lines)) {
                    payment.lines.forEach((line) => {
                      const lineType =
                        line.type === "rental"
                          ? "Tiền thuê (Đã trừ tiền cọc dư)"
                          : line.type === "rental_advance"
                          ? "Tiền cọc dữ chỗ"
                          : line.type === "device_deposit"
                          ? "Tiền cọc thiết bị"
                          : line.type === "refund"
                          ? "Hoàn tiền"
                          : line.type;

                      if (!paymentSummary[lineType]) {
                        paymentSummary[lineType] = 0;
                      }
                      paymentSummary[lineType] += line.amount;
                    });
                  }

                  if (payment.status === "Captured") {
                    totalPaid += payment.capturedAmount || 0;
                  }
                  totalRefunded += payment.refundedAmount || 0;
                });

                return (
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
                      sx={{
                        fontWeight: 700,
                        color: colors.text.primary,
                        mb: 3,
                      }}
                    >
                      Thông tin thanh toán
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {/* Các khoản thanh toán */}
                      {Object.entries(paymentSummary).map(([type, amount]) => (
                        <Box
                          key={type}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            bgcolor: colors.background.default,
                            p: 2,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              color: colors.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {type}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {formatCurrency(amount)}
                          </Typography>
                        </Box>
                      ))}

                      <Divider sx={{ my: 1 }} />

                      {/* Tổng đã thanh toán */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          bgcolor: colors.status.successLight,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: colors.status.success, fontWeight: 600 }}
                        >
                          Tổng đã thanh toán
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: colors.status.success }}
                        >
                          {formatCurrency(totalPaid)}
                        </Typography>
                      </Box>

                      {/* Tổng đã hoàn tiền */}
                      {totalRefunded > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            p: 2,
                            bgcolor: colors.accent.blue + "20",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ color: colors.accent.blue, fontWeight: 600 }}
                          >
                            Tổng đã hoàn tiền
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: colors.accent.blue }}
                          >
                            {formatCurrency(totalRefunded)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })()}

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

            {/* Payment Summary */}
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
                Chi tiết thanh toán
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Phí thuê ({rentalDays} ngày)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(paymentDetails.rentalAmount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Tiền cọc
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(paymentDetails.depositAmount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Phí nền tảng (
                    {(order.snapshotPlatformFeePercent * 100).toFixed(0)}%)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(paymentDetails.platformFee)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: colors.primary.lighter,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: colors.text.primary }}
                  >
                    Tổng cộng
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: colors.primary.main }}
                  >
                    {formatCurrency(paymentDetails.totalAmount)}
                  </Typography>
                </Box>

                {paymentDetails.paidAmount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      Đã thanh toán
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.status.success }}
                    >
                      {formatCurrency(paymentDetails.paidAmount)}
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    textAlign: "center",
                    mt: 1,
                  }}
                >
                  Giá thuê cơ bản: {formatCurrency(order.snapshotBaseDailyRate)}
                  /ngày
                </Typography>

                {/* Payment Status */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    bgcolor:
                      paymentDetails.paymentStatus === "Đã thanh toán"
                        ? colors.status.successLight
                        : colors.status.warningLight,
                    borderRadius: 2,
                    mt: 1,
                  }}
                >
                  <Shield
                    size={20}
                    color={
                      paymentDetails.paymentStatus === "Đã thanh toán"
                        ? colors.status.success
                        : colors.status.warning
                    }
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          paymentDetails.paymentStatus === "Đã thanh toán"
                            ? colors.status.success
                            : colors.status.warning,
                        fontWeight: 700,
                      }}
                    >
                      {paymentDetails.paymentStatus}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      {paymentDetails.paymentStatus === "Đã thanh toán"
                        ? "Đơn hàng đã được xử lý"
                        : "Đang chờ thanh toán"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

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

        {/* Contract Dialog */}
        <Dialog
          open={openContractDialog}
          onClose={() => setOpenContractDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Hợp đồng thuê
              </Typography>
              <IconButton onClick={() => setOpenContractDialog(false)}>
                <XCircle size={20} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                p: 3,
                bgcolor: colors.neutral[50],
                borderRadius: 2,
                minHeight: 400,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Hợp đồng thuê thiết bị Camera
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Mã hợp đồng: {order.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Hợp đồng này được ký kết giữa CamRent và{" "}
                {order.renter?.fullName || "Khách hàng"}.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Điều khoản và điều kiện:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <ol>
                  <li>
                    Thời gian thuê: {formatDate(order.pickupAt)} đến{" "}
                    {formatDate(order.returnAt)} ({rentalDays} ngày)
                  </li>
                  <li>
                    Tổng phí thuê: {formatCurrency(paymentDetails.rentalAmount)}
                  </li>
                  <li>
                    Tiền cọc: {formatCurrency(paymentDetails.depositAmount)}
                  </li>
                  <li>
                    Phí nền tảng: {formatCurrency(paymentDetails.platformFee)}
                  </li>
                  <li>Thiết bị phải được trả lại trong tình trạng ban đầu</li>
                  <li>Bất kỳ hư hỏng nào sẽ được trừ vào tiền cọc</li>
                  <li>Trả muộn sẽ phát sinh phí bổ sung</li>
                </ol>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", color: colors.text.secondary }}
              >
                Vui lòng đọc kỹ trước khi ký. Đây là tài liệu có tính pháp lý
                ràng buộc.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              sx={{
                borderColor: colors.border.light,
                color: colors.text.primary,
                textTransform: "none",
                fontWeight: 600,
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
              onClick={() => setOpenContractDialog(false)}
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
