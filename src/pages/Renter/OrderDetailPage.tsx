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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Skeleton,
} from "@mui/material";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Camera,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  MessageSquare,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "../../theme/colors";

interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  depositAmount: number;
  image: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "delivering"
    | "delivered"
    | "completed"
    | "cancelled";
  items: OrderItem[];
  pickupDate: string;
  returnDate: string;
  deliveryAddress: string;
  totalAmount: number;
  depositAmount: number;
  transportFee: number;
  createdAt: string;
  renter: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatar: string;
  };
  delivery?: {
    assigneeName: string;
    assigneePhone: string;
    estimatedTime: string;
    trackingNumber: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    description: string;
  }[];
  contractUrl?: string;
}

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    // Mock data
    const mockOrder: OrderDetail = {
      id: orderId || "1",
      orderNumber: "ORD-2024-001",
      status: "delivering",
      items: [
        {
          productId: "1",
          productName: "Canon EOS R5",
          category: "Camera",
          quantity: 1,
          unitPrice: 3000000,
          depositAmount: 1500000,
          image: "",
        },
        {
          productId: "2",
          productName: "Lens RF 24-70mm f/2.8",
          category: "Lens",
          quantity: 1,
          unitPrice: 1500000,
          depositAmount: 500000,
          image: "",
        },
      ],
      pickupDate: "2024-11-15",
      returnDate: "2024-11-22",
      deliveryAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      totalAmount: 4500000,
      depositAmount: 2000000,
      transportFee: 100000,
      createdAt: "2024-11-10T10:30:00",
      renter: {
        id: "1",
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phoneNumber: "0901234567",
        avatar: "",
      },
      delivery: {
        assigneeName: "Trần Văn B",
        assigneePhone: "0912345678",
        estimatedTime: "2024-11-15T14:00:00",
        trackingNumber: "TRK-001-2024",
      },
      timeline: [
        {
          status: "Order Created",
          timestamp: "2024-11-10T10:30:00",
          description: "Your order has been created successfully",
        },
        {
          status: "Payment Confirmed",
          timestamp: "2024-11-10T11:00:00",
          description: "Payment has been confirmed",
        },
        {
          status: "Order Confirmed",
          timestamp: "2024-11-10T12:00:00",
          description: "Your order has been confirmed by the shop",
        },
        {
          status: "Out for Delivery",
          timestamp: "2024-11-14T08:00:00",
          description: "Your order is on the way",
        },
      ],
      contractUrl: "/contracts/contract-001.pdf",
    };

    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  }, [orderId]);

  const getStatusInfo = (status: OrderDetail["status"]) => {
    const statusMap = {
      pending: {
        label: "Chờ xác nhận",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: <Clock size={20} />,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: colors.status.info,
        bgColor: colors.status.infoLight,
        icon: <CheckCircle size={20} />,
      },
      delivering: {
        label: "Đang giao hàng",
        color: colors.accent.blue,
        bgColor: colors.accent.blueLight,
        icon: <Truck size={20} />,
      },
      delivered: {
        label: "Đã giao hàng",
        color: colors.accent.purple,
        bgColor: colors.accent.purpleLight,
        icon: <Package size={20} />,
      },
      completed: {
        label: "Hoàn thành",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <CheckCircle size={20} />,
      },
      cancelled: {
        label: "Đã hủy",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <XCircle size={20} />,
      },
    };
    return statusMap[status];
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

  const handleCancelOrder = () => {
    // Handle cancel order logic
    console.log("Cancel order:", orderId);
    setOpenCancelDialog(false);
  };

  const handleViewContract = () => {
    setOpenContractDialog(true);
  };

  const handleDownloadContract = () => {
    // Handle download contract
    console.log("Download contract");
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

  if (!order) {
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
              Order not found
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

  const statusInfo = getStatusInfo(order.status);

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
                  {order.orderNumber}
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
              </Box>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Created on {formatDateTime(order.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {order.contractUrl && (
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
                Contact Support
              </Button>

              {order.status === "pending" && (
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
                Order Items ({order.items.length})
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
                            {item.productName}
                          </Typography>
                          <Chip
                            label={item.category}
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
                          {formatCurrency(item.unitPrice)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Quantity
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {item.quantity}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Deposit
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {formatCurrency(item.depositAmount)}
                          </Typography>
                        </Box>
                      </Box>
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
                Rental Information
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
                      Pickup Date
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatDate(order.pickupDate)}
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
                      Return Date
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatDate(order.returnDate)}
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
                      Delivery Address
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {order.deliveryAddress}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Delivery Information */}
            {order.delivery && (
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
                  Delivery Information
                </Typography>

                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: colors.accent.blueLight,
                    borderRadius: 2,
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1,
                    }}
                  >
                    <Truck size={20} color={colors.accent.blue} />
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: colors.accent.blue }}
                    >
                      Tracking Number: {order.delivery.trackingNumber}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Estimated delivery:{" "}
                    {formatDateTime(order.delivery.estimatedTime)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <User
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
                        Delivery Staff
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: colors.text.primary }}
                      >
                        {order.delivery.assigneeName}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Phone
                      size={24}
                      color={colors.status.success}
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
                        Phone Number
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: colors.text.primary }}
                      >
                        {order.delivery.assigneePhone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Order Timeline */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Order Timeline
              </Typography>

              <Stepper orientation="vertical">
                {order.timeline.map((item, index) => (
                  <Step key={index} active completed>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: colors.primary.main,
                          "&.Mui-completed": {
                            color: colors.status.success,
                          },
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: colors.text.primary }}
                      >
                        {item.status}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        {formatDateTime(item.timestamp)}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary }}
                      >
                        {item.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Box>

          {/* Right Column */}
          <Box sx={{ width: { xs: "100%", lg: "400px" }, flexShrink: 0 }}>
            {/* Customer Information */}
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
                Customer Information
              </Typography>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: colors.primary.main,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  {order.renter.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: colors.text.primary }}
                  >
                    {order.renter.fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Customer ID: {order.renter.id}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                      Phone Number
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {order.renter.phoneNumber}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

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
                Payment Summary
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
                    Rental Fee
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(order.totalAmount)}
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
                    Deposit Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(order.depositAmount)}
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
                    Transport Fee
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatCurrency(order.transportFee)}
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
                    Total Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: colors.primary.main }}
                  >
                    {formatCurrency(
                      order.totalAmount +
                        order.depositAmount +
                        order.transportFee
                    )}
                  </Typography>
                </Box>

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
                    Important Note
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Please inspect all equipment upon delivery. Report any
                    damages within 24 hours. Deposit will be refunded after
                    equipment return and inspection.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

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
                Contract Number: {order.orderNumber}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This agreement is made between CamRent and{" "}
                {order.renter.fullName}.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Terms and Conditions:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <ol>
                  <li>
                    The rental period is from {formatDate(order.pickupDate)} to{" "}
                    {formatDate(order.returnDate)}
                  </li>
                  <li>Total rental fee: {formatCurrency(order.totalAmount)}</li>
                  <li>Deposit amount: {formatCurrency(order.depositAmount)}</li>
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
                Order Number: <strong>{order.orderNumber}</strong>
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
