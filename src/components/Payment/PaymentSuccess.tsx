import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Download,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Home,
  FileText,
  Clock,
  MapPin,
} from "lucide-react";
import { colors } from "../../theme/colors";
import confetti from "canvas-confetti";

interface PaymentDetails {
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  rentalPeriod: {
    startDate: string;
    endDate: string;
  };
  pickupLocation: string;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Fetch payment details from API
    const fetchPaymentDetails = async () => {
      try {
        // Get payment info from URL params
        const orderId = searchParams.get("orderId");
        const transactionId = searchParams.get("transactionId");

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/payments/${orderId}`);
        // const data = await response.json();

        // Mock data for demo
        const mockData: PaymentDetails = {
          orderId: orderId || "ORD-2024-001",
          amount: 5000000,
          paymentMethod: "VNPay",
          transactionId: transactionId || "VNP-" + Date.now(),
          paidAt: new Date().toISOString(),
          customerName: "Nguyễn Văn A",
          customerEmail: "nguyenvana@example.com",
          customerPhone: "0901234567",
          items: [
            {
              name: "Canon EOS R5",
              quantity: 1,
              price: 3000000,
            },
            {
              name: "Ống kính RF 24-70mm f/2.8",
              quantity: 1,
              price: 1500000,
            },
            {
              name: "Thẻ nhớ 128GB",
              quantity: 1,
              price: 500000,
            },
          ],
          rentalPeriod: {
            startDate: "2024-12-01",
            endDate: "2024-12-07",
          },
          pickupLocation: "Chi nhánh Quận 1, TP.HCM",
        };

        setPaymentDetails(mockData);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    return () => clearInterval(interval);
  }, [searchParams]);

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

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
    console.log("Download invoice");
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    console.log("Send email confirmation");
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: colors.background.default,
        }}
      >
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    );
  }

  if (!paymentDetails) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: colors.background.default,
        }}
      >
        <Typography variant="h6" sx={{ color: colors.text.secondary }}>
          Không tìm thấy thông tin thanh toán
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: colors.background.default,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        {/* Success Icon & Message */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: colors.status.success,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              mb: 3,
              boxShadow: `0 8px 24px ${colors.status.success}40`,
              animation: "scaleIn 0.5s ease-out",
              "@keyframes scaleIn": {
                "0%": {
                  transform: "scale(0)",
                  opacity: 0,
                },
                "50%": {
                  transform: "scale(1.1)",
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            <CheckCircle size={56} color="white" />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Thanh toán thành công!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: colors.text.secondary,
              mb: 1,
            }}
          >
            Đơn hàng của bạn đã được xác nhận
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
            }}
          >
            Chúng tôi đã gửi email xác nhận đến{" "}
            <strong>{paymentDetails.customerEmail}</strong>
          </Typography>
        </Box>

        {/* Order Summary Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            mb: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: colors.primary.lighter,
              p: 3,
              borderBottom: `1px solid ${colors.border.light}`,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary, mb: 0.5 }}
                >
                  Mã đơn hàng
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {paymentDetails.orderId}
                </Typography>
              </Box>
              <Chip
                label="Đã thanh toán"
                sx={{
                  bgcolor: colors.status.success,
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  height: 32,
                }}
              />
            </Stack>
          </Box>

          {/* Payment Details */}
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Thông tin thanh toán
            </Typography>

            <Stack spacing={2}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, display: "block" }}
                  >
                    Phương thức
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CreditCard size={18} color={colors.text.primary} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {paymentDetails.paymentMethod}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, display: "block" }}
                  >
                    Mã giao dịch
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {paymentDetails.transactionId}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, display: "block" }}
                  >
                    Thời gian thanh toán
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Clock size={18} color={colors.text.primary} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDateTime(paymentDetails.paidAt)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, display: "block" }}
                  >
                    Tổng tiền
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: colors.primary.main }}
                  >
                    {formatCurrency(paymentDetails.amount)}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Customer Info */}
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Thông tin khách hàng
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: colors.primary.lighter,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    {paymentDetails.customerName.charAt(0)}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {paymentDetails.customerName}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={18} color={colors.text.secondary} />
                <Typography variant="body2">
                  {paymentDetails.customerEmail}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone size={18} color={colors.text.secondary} />
                <Typography variant="body2">
                  {paymentDetails.customerPhone}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Rental Period */}
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Thời gian thuê
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Card
                elevation={0}
                sx={{
                  bgcolor: colors.background.default,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text.secondary,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Ngày bắt đầu
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Calendar size={18} color={colors.primary.main} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {formatDate(paymentDetails.rentalPeriod.startDate)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Typography sx={{ color: colors.text.secondary, fontSize: 24 }}>
                →
              </Typography>

              <Card
                elevation={0}
                sx={{
                  bgcolor: colors.background.default,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text.secondary,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Ngày kết thúc
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Calendar size={18} color={colors.primary.main} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {formatDate(paymentDetails.rentalPeriod.endDate)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: colors.primary.lighter,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <MapPin size={18} color={colors.primary.main} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: colors.text.secondary, display: "block" }}
                >
                  Địa điểm nhận hàng
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {paymentDetails.pickupLocation}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Items */}
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Sản phẩm đã thuê
            </Typography>

            <Stack spacing={1.5}>
              {paymentDetails.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: colors.background.default,
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Số lượng: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {formatCurrency(item.price)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tổng cộng
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: colors.primary.main }}
              >
                {formatCurrency(paymentDetails.amount)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download size={20} />}
              onClick={handleDownloadInvoice}
              sx={{
                bgcolor: colors.primary.main,
                color: "black",
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Tải hóa đơn
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Mail size={20} />}
              onClick={handleSendEmail}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 2,
                borderColor: colors.border.main,
                color: colors.text.primary,
                "&:hover": {
                  borderColor: colors.primary.main,
                  bgcolor: colors.primary.lighter,
                },
              }}
            >
              Gửi lại email
            </Button>
          </Stack>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<FileText size={20} />}
            onClick={() => navigate(`/orders/${paymentDetails.orderId}`)}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 2,
              borderColor: colors.border.main,
              color: colors.text.primary,
              "&:hover": {
                borderColor: colors.primary.main,
                bgcolor: colors.primary.lighter,
              },
            }}
          >
            Xem chi tiết đơn hàng
          </Button>

          <Button
            fullWidth
            variant="text"
            startIcon={<Home size={20} />}
            onClick={() => navigate("/")}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 2,
              color: colors.text.secondary,
              "&:hover": {
                bgcolor: colors.background.default,
              },
            }}
          >
            Về trang chủ
          </Button>
        </Stack>

        {/* Help Section */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            bgcolor: colors.status.infoLight,
            border: `1px solid ${colors.status.info}`,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: colors.status.info }}
          >
            Cần hỗ trợ?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.text.primary, mb: 2 }}
          >
            Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với
            chúng tôi:
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Phone size={18} color={colors.status.info} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                1900 1234
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Mail size={18} color={colors.status.info} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                support@camrent.vn
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;
