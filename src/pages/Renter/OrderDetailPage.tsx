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
        toast.warning("Please login to view order details");
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
      toast.error("Failed to load order details");
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
        toast.warning("Please login");
        return;
      }

      // TODO: Implement cancel order API call
      toast.success("Order cancelled successfully");
      setOpenCancelDialog(false);
      fetchOrderDetail(); // Refresh order data
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel order");
    }
  };

  const handleViewContract = () => {
    setOpenContractDialog(true);
  };

  const handleDownloadContract = () => {
    toast.info("Contract download feature coming soon");
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
              {error || "Order not found"}
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
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
              Back to Orders
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status, order.statusText);
  const rentalDays = calculateRentalDays(order.pickupAt, order.returnAt);
  const platformFee =
    order.snapshotRentalTotal * order.snapshotPlatformFeePercent;
  const totalAmount =
    order.snapshotRentalTotal + order.snapshotDepositAmount + platformFee;

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
          Back to Orders
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
                View Contract
              </Button>

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
                Contact Support
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
                  Cancel Order
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
                {order.items.map((item, index) => (
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
                      }}
                    >
                      <Camera size={32} color={colors.neutral[400]} />
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
                    </Box>
                  </Box>
                ))}
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
                              label={inspection.passed ? "Passed" : "Failed"}
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
                            Section: {inspection.section} • Label:{" "}
                            {inspection.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.text.primary, mt: 0.5 }}
                          >
                            Value: {inspection.value}
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
                              Notes: {inspection.notes}
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
                      Array.isArray(order.renter.avatar)
                        ? order.renter.avatar[0]
                        : typeof order.renter.avatar === "string"
                        ? order.renter.avatar
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

                  {order.renter.phoneNumber && (
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
                          {order.renter.phoneNumber}
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
                    {formatCurrency(order.snapshotRentalTotal)}
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
                    Tiền cọc ({(order.snapshotDepositPercent * 100).toFixed(0)}
                    %)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(order.snapshotDepositAmount)}
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
                    {formatCurrency(platformFee)}
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
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>

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

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    bgcolor: colors.status.successLight,
                    borderRadius: 2,
                    mt: 1,
                  }}
                >
                  <Shield size={20} color={colors.status.success} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.status.success, fontWeight: 600 }}
                  >
                    Payment Confirmed
                  </Typography>
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
                Rental Contract
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
                Camera Rental Agreement
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Contract ID: {order.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This agreement is made between CamRent and{" "}
                {order.renter?.fullName || "Customer"}.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Terms and Conditions:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <ol>
                  <li>
                    Rental period: {formatDate(order.pickupAt)} to{" "}
                    {formatDate(order.returnAt)} ({rentalDays} days)
                  </li>
                  <li>
                    Total rental fee:{" "}
                    {formatCurrency(order.snapshotRentalTotal)}
                  </li>
                  <li>
                    Deposit amount:{" "}
                    {formatCurrency(order.snapshotDepositAmount)}
                  </li>
                  <li>Platform fee: {formatCurrency(platformFee)}</li>
                  <li>Equipment must be returned in original condition</li>
                  <li>Any damages will be deducted from the deposit</li>
                  <li>Late returns will incur additional charges</li>
                </ol>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", color: colors.text.secondary }}
              >
                Please read carefully before signing. This is a legally binding
                document.
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
              Download PDF
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
              onClick={() => setOpenContractDialog(false)}
            >
              Close
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
              Cancel Order
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
                  Are you sure you want to cancel this order? This action cannot
                  be undone.
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Order ID: <strong>{order.id.slice(0, 13)}...</strong>
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
              Keep Order
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
              Yes, Cancel Order
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrderDetailPage;
