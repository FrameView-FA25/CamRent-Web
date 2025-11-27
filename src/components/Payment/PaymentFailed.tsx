import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  XCircle,
  RefreshCw,
  Home,
  Phone,
  Mail,
  HelpCircle,
  AlertTriangle,
  CreditCard,
  Clock,
} from "lucide-react";
import { colors } from "../../theme/colors";

interface FailedPaymentInfo {
  orderId: string;
  amount: number;
  failedAt: string;
  errorCode: string;
  errorMessage: string;
  paymentMethod: string;
}

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<FailedPaymentInfo | null>(
    null
  );

  useEffect(() => {
    const fetchFailedPaymentInfo = async () => {
      try {
        const orderId = searchParams.get("orderId");
        const errorCode = searchParams.get("errorCode");
        const errorMessage = searchParams.get("errorMessage");

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/payments/failed/${orderId}`);
        // const data = await response.json();

        // Mock data
        const mockData: FailedPaymentInfo = {
          orderId: orderId || "ORD-2024-001",
          amount: 5000000,
          failedAt: new Date().toISOString(),
          errorCode: errorCode || "PAYMENT_DECLINED",
          errorMessage:
            errorMessage || "Giao dịch bị từ chối bởi ngân hàng phát hành",
          paymentMethod: "VNPay",
        };

        setPaymentInfo(mockData);
      } catch (error) {
        console.error("Error fetching failed payment info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFailedPaymentInfo();
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  const getErrorSuggestions = (errorCode: string): string[] => {
    const suggestions: Record<string, string[]> = {
      PAYMENT_DECLINED: [
        "Kiểm tra số dư tài khoản của bạn",
        "Xác nhận thẻ/tài khoản chưa bị khóa",
        "Liên hệ ngân hàng để biết chi tiết",
        "Thử sử dụng phương thức thanh toán khác",
      ],
      INSUFFICIENT_FUNDS: [
        "Nạp thêm tiền vào tài khoản",
        "Sử dụng thẻ/tài khoản khác",
        "Giảm số lượng sản phẩm trong đơn hàng",
      ],
      CARD_EXPIRED: [
        "Kiểm tra ngày hết hạn của thẻ",
        "Cập nhật thông tin thẻ mới",
        "Sử dụng phương thức thanh toán khác",
      ],
      INVALID_CARD: [
        "Kiểm tra lại thông tin thẻ",
        "Đảm bảo nhập đúng số thẻ, CVV, ngày hết hạn",
        "Thử lại với thẻ khác",
      ],
      TIMEOUT: [
        "Kiểm tra kết nối internet",
        "Thử thanh toán lại",
        "Đảm bảo không đóng trang trong quá trình thanh toán",
      ],
      LIMIT_EXCEEDED: [
        "Kiểm tra giới hạn giao dịch của thẻ/tài khoản",
        "Liên hệ ngân hàng để tăng hạn mức",
        "Chia nhỏ đơn hàng hoặc thanh toán nhiều lần",
      ],
    };

    return (
      suggestions[errorCode] || [
        "Vui lòng thử lại sau",
        "Kiểm tra thông tin thanh toán",
        "Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn",
      ]
    );
  };

  const handleRetry = () => {
    if (paymentInfo) {
      navigate(`/checkout?orderId=${paymentInfo.orderId}`);
    }
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

  if (!paymentInfo) {
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
        {/* Error Icon & Message */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: colors.status.error,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              mb: 3,
              boxShadow: `0 8px 24px ${colors.status.error}40`,
              animation: "shake 0.5s ease-in-out",
              "@keyframes shake": {
                "0%, 100%": { transform: "translateX(0)" },
                "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-10px)" },
                "20%, 40%, 60%, 80%": { transform: "translateX(10px)" },
              },
            }}
          >
            <XCircle size={56} color="white" />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Thanh toán thất bại!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: colors.text.secondary,
              mb: 1,
            }}
          >
            Không thể hoàn tất giao dịch của bạn
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
            }}
          >
            Đừng lo lắng, không có khoản phí nào được tính
          </Typography>
        </Box>

        {/* Error Details Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `2px solid ${colors.status.error}`,
            mb: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: colors.status.errorLight,
              p: 3,
              borderBottom: `1px solid ${colors.status.error}`,
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
                  {paymentInfo.orderId}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary, mb: 0.5 }}
                >
                  Số tiền
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: colors.status.error }}
                >
                  {formatCurrency(paymentInfo.amount)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Error Info */}
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                Lỗi: {paymentInfo.errorCode}
              </AlertTitle>
              {paymentInfo.errorMessage}
            </Alert>

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
                    Phương thức thanh toán
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CreditCard size={18} color={colors.text.primary} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {paymentInfo.paymentMethod}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, display: "block" }}
                  >
                    Thời gian thất bại
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Clock size={18} color={colors.text.primary} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDateTime(paymentInfo.failedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Suggestions */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <HelpCircle size={20} color={colors.status.warning} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Gợi ý khắc phục
              </Typography>
            </Box>

            <List>
              {getErrorSuggestions(paymentInfo.errorCode).map(
                (suggestion, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AlertTriangle size={18} color={colors.status.warning} />
                    </ListItemIcon>
                    <ListItemText
                      primary={suggestion}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: colors.text.primary,
                      }}
                    />
                  </ListItem>
                )
              )}
            </List>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<RefreshCw size={20} />}
            onClick={handleRetry}
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
            Thử thanh toán lại
          </Button>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/checkout")}
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
              Chọn phương thức khác
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Home size={20} />}
              onClick={() => navigate("/")}
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
              Về trang chủ
            </Button>
          </Stack>
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
            Cần trợ giúp?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.text.primary, mb: 2 }}
          >
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn:
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Phone size={18} color={colors.status.info} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: colors.text.secondary, display: "block" }}
                >
                  Hotline
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  1900 1234
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Mail size={18} color={colors.status.info} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: colors.text.secondary, display: "block" }}
                >
                  Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  support@camrent.vn
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" sx={{ color: colors.text.secondary }}>
            Thời gian hỗ trợ: 24/7 - Phản hồi trong vòng 15 phút
          </Typography>
        </Paper>

        {/* FAQ Section */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            bgcolor: "white",
            border: `1px solid ${colors.border.light}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Câu hỏi thường gặp
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, color: colors.text.primary }}
              >
                Tại sao thanh toán của tôi bị từ chối?
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Có nhiều lý do như số dư không đủ, thẻ hết hạn, vượt quá giới
                hạn giao dịch, hoặc thẻ bị khóa. Vui lòng kiểm tra với ngân
                hàng.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, color: colors.text.primary }}
              >
                Tôi có bị tính phí không?
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Không, giao dịch thất bại sẽ không tính bất kỳ khoản phí nào.
                Bạn có thể yên tâm thử lại.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, color: colors.text.primary }}
              >
                Đơn hàng của tôi có bị hủy không?
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Đơn hàng sẽ được giữ trong 30 phút. Vui lòng hoàn tất thanh toán
                trong thời gian này.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailed;
