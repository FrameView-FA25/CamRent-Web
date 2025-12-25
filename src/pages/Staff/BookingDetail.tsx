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
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  Stack,
  Collapse,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  LocalShipping,
  PhotoCamera,
  AccessTime,
  Payment,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import {
  fetchBookingById,
  fetchStaffBookings,
} from "../../services/booking.service";
import {
  getDisputesByBookingId,
  resolveDispute,
} from "../../services/dispute.service";
import ConfirmDialog from "../../components/Staff/ConfirmDialog";
import PaymentMethodDialog from "../../components/Staff/PaymentMethodDialog";
import type { Booking, Dispute } from "../../types/booking.types";
import {
  formatCurrency,
  formatDate,
  getBookingType,
} from "../../utils/booking.utils";
import { getItemName } from "../../helpers/booking.helper";
// import { initiatePayment } from "../../services/payment.service";

const steps = [
  "Đơn hàng mới",
  "Đã xác nhận",
  "Đã giao hàng",
  "Đã trả hàng",
  "Hoàn thành",
];

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputeDetailExpanded, setDisputeDetailExpanded] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [deliveryPhotos, setDeliveryPhotos] = useState<File[]>([]);
  const [rentalDetailExpanded, setRentalDetailExpanded] = useState(false);
  const [paidDetailExpanded, setPaidDetailExpanded] = useState(false);
  const [unpaidDetailExpanded, setUnpaidDetailExpanded] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PayOs" | "Cash">("PayOs");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [refundProcessing, setRefundProcessing] = useState(false);

  const loadBookingDetail = useCallback(async () => {
    if (!id) return;
    console.log("Loading booking detail for ID:", id);

    setLoading(true);
    setError(null);

    const { booking: fetchedBooking, error: fetchError } =
      await fetchBookingById(id);

    if (fetchError) {
      setError(fetchError);
    } else if (fetchedBooking) {
      let renter = fetchedBooking.renter;

      if (!renter && fetchedBooking.renterId) {
        const { bookings: staffBookings } = await fetchStaffBookings();
        renter =
          staffBookings.find((staffBooking) => staffBooking.id === id)
            ?.renter || null;
      }

      setBooking({ ...fetchedBooking, renter });
    }
    setLoading(false);

    // Always load disputes for the booking so they are visible in the booking detail
    // even if they haven't been resolved yet.
    setDisputesLoading(true);
    try {
      const disputesData = await getDisputesByBookingId(id);
      setDisputes(disputesData);
    } catch (err) {
      console.error("Error loading disputes:", err);
      setDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBookingDetail();
  }, [loadBookingDetail]);

  // Reload booking when returning from PayOS payment
  useEffect(() => {
    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get("payment");
      const bookingIdFromUrl = urlParams.get("bookingId");

      // If returning from payment success and on booking detail page
      if (
        (paymentStatus === "success" || paymentStatus === "paid") &&
        bookingIdFromUrl === id
      ) {
        // Reload booking to get updated payment status
        loadBookingDetail();
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    if (id) {
      checkPaymentReturn();
    }
  }, [id, loadBookingDetail]);

  const handleConfirmUpdate = () => {
    console.log("Update booking status:", {
      bookingId: id,
      notes,
      photos: deliveryPhotos,
    });
    alert("Cập nhật trạng thái thành công!");
    setConfirmDialogOpen(false);
    setNotes("");
    setDeliveryPhotos([]);
  };

  const handlePayment = () => {
    if (!booking?.id) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
        severity: "error",
      });
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!booking?.id) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
        severity: "error",
      });
      return;
    }

    setPaymentDialogOpen(false);
    setPaymentLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (paymentMethod === "Cash") {
        // Gọi API authorize với phương thức Cash
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/Payments/authorize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            mode: "Rental", // Thanh toán phần còn lại
            method: "Cash",
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Không thể xác nhận thanh toán");
        }

        // Reload booking data để cập nhật trạng thái thanh toán trước
        await loadBookingDetail();

        setSnackbar({
          open: true,
          message: "Xác nhận thanh toán tiền mặt thành công!",
          severity: "success",
        });
      } else {
        // For PayOS payment, we need to customize return URL to include bookingId
        // So we'll handle the payment flow manually
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        // Step 1: Authorize payment
        const authorizeResponse = await fetch(
          `${API_BASE_URL}/Payments/authorize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookingId: booking.id,
              mode: "Rental",
              method: "PayOs",
            }),
          }
        );

        if (!authorizeResponse.ok) {
          const errorText = await authorizeResponse.text();
          throw new Error(errorText || "Không thể khởi tạo thanh toán");
        }

        const paymentIdRaw = await authorizeResponse.text();
        const paymentId = paymentIdRaw.trim().replace(/^["']|["']$/g, "");

        // Step 2: Create PayOS payment link with custom return URL
        const returnUrl = `${window.location.origin}/staff/booking/${booking.id}?payment=success&bookingId=${booking.id}`;
        const cancelUrl = `${window.location.origin}/staff/booking/${booking.id}?payment=cancelled`;

        const payosResponse = await fetch(
          `${API_BASE_URL}/Payments/${paymentId}/payos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              returnUrl,
              cancelUrl,
            }),
          }
        );

        if (!payosResponse.ok) {
          const errorText = await payosResponse.text();
          throw new Error(errorText || "Không thể tạo link thanh toán");
        }

        const payosData = await payosResponse.json();
        const checkoutUrl =
          payosData.redirectUrl || payosData.checkoutUrl || payosData.url;

        if (!checkoutUrl) {
          throw new Error("Không nhận được URL thanh toán từ hệ thống");
        }

        setSnackbar({
          open: true,
          message: "Đang chuyển hướng đến trang thanh toán...",
          severity: "success",
        });

        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setSnackbar({
        open: true,
        message:
          (error as Error).message ||
          "Không thể xử lý thanh toán. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Process refund or create compensatory payment via backend
  const handleProcessRefund = async () => {
    if (!booking?.id) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
        severity: "error",
      });
      return;
    }

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xử lý hoàn trả/tiền bù cho đơn này không?"
      )
    ) {
      return;
    }

    setRefundProcessing(true);

    try {
      // Compute local diff to decide preferred backend method (used only to tell backend whether we prefer Cash or PayOs)
      const depositAmount = booking.snapshotDepositAmount || 0;
      const disputesTotalAll = disputes.reduce(
        (sum, d) => sum + (d.totalAmount || 0),
        0
      );
      const diff = depositAmount - disputesTotalAll;
      const methodForBackend = diff > 0 ? "Cash" : "PayOs";

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      // Backend will compute net and perform either refund (net > 0) or create offset payment (net < 0).
      const response = await fetch(`${API_BASE_URL}/Payments/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          BookingId: booking.id,
          Method: methodForBackend,
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Không thể xử lý hoàn trả");
      }

      // Parse JSON response (backend returns { type: "refund" | "offset" | "none", amount, paymentId })
      let result: { type?: string; amount?: number; paymentId?: string } = {};
      try {
        result = JSON.parse(text) as {
          type?: string;
          amount?: number;
          paymentId?: string;
        };
      } catch (parseErr) {
        console.warn("Failed to parse refund response:", parseErr);
        // If backend returned plain string, attempt to auto-resolve disputes (best-effort),
        // then show success and reload.
        try {
          const unresolvedDisputes = disputes.filter((d) => {
            const st = (d.status || "").toString().toLowerCase();
            return st !== "resolved" && (d.totalAmount || 0) > 0;
          });
          await Promise.all(
            unresolvedDisputes.map(async (d) => {
              try {
                await resolveDispute(d.id);
              } catch (err) {
                console.warn("Failed to resolve dispute", d.id, err);
              }
            })
          );
        } catch (err) {
          console.warn("Error resolving disputes after refund:", err);
        }

        setSnackbar({
          open: true,
          message: "Xử lý hoàn trả/tiền bù thành công.",
          severity: "success",
        });
        await loadBookingDetail();
        setRefundProcessing(false);
        return;
      }

      if (result.type === "refund") {
        setSnackbar({
          open: true,
          message: `Hoàn cọc thành công: ${formatCurrency(
            result.amount || diff
          )}`,
          severity: "success",
        });

        // Mark disputes resolved on backend for items > 0 (best-effort)
        try {
          const unresolvedDisputes = disputes.filter((d) => {
            const st = (d.status || "").toString().toLowerCase();
            return st !== "resolved" && (d.totalAmount || 0) > 0;
          });
          await Promise.all(
            unresolvedDisputes.map(async (d) => {
              try {
                await resolveDispute(d.id);
              } catch (err) {
                console.warn("Failed to resolve dispute", d.id, err);
              }
            })
          );
        } catch (err) {
          console.warn("Error resolving disputes after refund:", err);
        }

        await loadBookingDetail();
      } else if (result.type === "offset") {
        const extra = result.amount || Math.abs(diff);
        // If backend created an authorization payment for PayOs, open PayOS checkout
        if (methodForBackend === "PayOs" && result.paymentId) {
          setSnackbar({
            open: true,
            message: "Chuyển hướng sang trang thanh toán bù tranh chấp...",
            severity: "info",
          });

          // Initialize PayOS link
          const payosResp = await fetch(
            `${API_BASE_URL}/Payments/${result.paymentId}/payos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                returnUrl: `${window.location.origin}/staff/booking/${booking.id}?payment=success&bookingId=${booking.id}`,
                cancelUrl: `${window.location.origin}/staff/booking/${booking.id}?payment=cancelled`,
              }),
            }
          );

          if (!payosResp.ok) {
            const errText = await payosResp.text();
            throw new Error(
              errText || "Không thể tạo link PayOS cho payment bù"
            );
          }

          const payosData = await payosResp.json();
          const checkoutUrl =
            payosData.redirectUrl || payosData.checkoutUrl || payosData.url;
          if (!checkoutUrl)
            throw new Error("Không nhận được URL thanh toán từ hệ thống");

          // Redirect to PayOS checkout
          setTimeout(() => {
            window.location.href = checkoutUrl;
          }, 800);
        } else {
          // Cash offset created & captured by backend
          setSnackbar({
            open: true,
            message: `Tạo payment bù tranh chấp thành công: ${formatCurrency(
              extra
            )}`,
            severity: "success",
          });
          await loadBookingDetail();
        }
      } else {
        setSnackbar({
          open: true,
          message: "Không có hành động nào cần thực hiện.",
          severity: "info",
        });
      }
    } catch (err) {
      console.error("Refund processing error:", err);
      setSnackbar({
        open: true,
        message:
          (err as Error).message || "Lỗi khi xử lý hoàn trả. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setRefundProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate payment details from actual payments
  const calculatePaymentDetails = () => {
    if (!booking) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        rentalAmount: 0,
        depositAmount: 0,
        platformFee: 0,
        refundAmount: 0,
        refundPaidAmount: 0,
        refundUnpaidAmount: 0,
      };
    }

    const totalAmount =
      booking.snapshotRentalTotal + booking.snapshotDepositAmount;
    const platformFee =
      booking.snapshotRentalTotal * booking.snapshotPlatformFeePercent;

    // Calculate paid amount from actual payments
    let paidAmount = 0;
    if (booking.payments && booking.payments.length > 0) {
      booking.payments.forEach((payment) => {
        // Only count Captured payments as paid
        if (payment.status === "Captured") {
          // Sum up captured amounts from payment lines
          if (payment.lines && payment.lines.length > 0) {
            payment.lines.forEach((line) => {
              if (
                line.type === "rental" ||
                line.type === "rental_advance" ||
                line.type === "device_deposit"
              ) {
                // Use capturedAmount if available, otherwise use amount
                paidAmount += line.capturedAmount || line.amount || 0;
              }
            });
          } else {
            // Fallback to payment capturedAmount if no lines
            paidAmount += payment.capturedAmount || 0;
          }
        }
        // Also count Authorized payments (for PayOS pending capture)
        else if (payment.status === "Authorized") {
          if (payment.lines && payment.lines.length > 0) {
            payment.lines.forEach((line) => {
              if (
                line.type === "rental" ||
                line.type === "rental_advance" ||
                line.type === "device_deposit"
              ) {
                // For authorized payments, use amount (not capturedAmount)
                paidAmount += line.amount || 0;
              }
            });
          } else {
            paidAmount += payment.authorizedAmount || 0;
          }
        }
      });
    }
    // If no payments at all, paidAmount remains 0 (chưa thanh toán)

    const unpaidAmount = totalAmount - paidAmount;

    // Calculate refund amounts (tiền hoàn trả)
    // Tiền hoàn trả = tổng dispute items + tiền cọc thiết bị (nếu có dispute resolved)
    let refundAmount = 0; // Tổng tiền cần hoàn trả
    let refundPaidAmount = 0; // Tiền đã hoàn trả

    // Sum of all dispute amounts (resolved or not) for preview/display purposes
    const disputesTotalAll = disputes.reduce(
      (sum, d) => sum + (d.totalAmount || 0),
      0
    );

    const depositAmount = booking.snapshotDepositAmount || 0;

    // Business rules:
    // - For display, show refundPreview = max(0, deposit - sum(all disputes))
    // - For actual refund processing we will use disputesTotalAll so staff can process even if disputes aren't yet marked resolved.
    // - If there are no disputes, refund = deposit.
    if (disputesTotalAll > 0) {
      refundAmount = Math.max(0, depositAmount - disputesTotalAll);
    } else if (disputes.length === 0) {
      refundAmount = depositAmount;
    } else {
      refundAmount = 0;
    }

    // Calculate paid refund amount from payments
    // Tìm các payment có type "dispute" hoặc "refund" hoặc "device_deposit_refund"
    if (booking.payments && booking.payments.length > 0) {
      booking.payments.forEach((payment) => {
        // Include Refunded payments as already-paid refunds, treat Refunded similar to Captured
        if (
          payment.status === "Captured" ||
          payment.status === "Authorized" ||
          payment.status === "Refunded"
        ) {
          if (payment.lines && payment.lines.length > 0) {
            payment.lines.forEach((line) => {
              if (
                line.type === "dispute" ||
                line.type === "refund" ||
                line.type === "device_deposit_refund"
              ) {
                // For Captured/Refunded use capturedAmount if available, otherwise amount.
                // For Authorized use amount.
                if (
                  payment.status === "Captured" ||
                  payment.status === "Refunded"
                ) {
                  refundPaidAmount += line.capturedAmount || line.amount || 0;
                } else {
                  refundPaidAmount += line.amount || 0;
                }
              }
            });
          }
        }
      });
    }

    const refundUnpaidAmount = Math.max(0, refundAmount - refundPaidAmount);

    return {
      totalAmount,
      paidAmount,
      unpaidAmount: Math.max(0, unpaidAmount), // Ensure non-negative
      rentalAmount: booking.snapshotRentalTotal,
      depositAmount: booking.snapshotDepositAmount,
      platformFee,
      refundAmount, // Tổng tiền hoàn trả (dispute items + tiền cọc)
      refundPaidAmount, // Tiền đã hoàn trả
      refundUnpaidAmount, // Tiền chưa hoàn trả
    };
  };

  const getStatusNumber = (statusText: string): number => {
    // Normalize incoming statusText (may be English code or localized string)
    const key = (statusText || "").toString().trim();
    const normalized = key.toLowerCase();

    const statusMap: Record<string, number> = {
      // Pending variants
      pending: 0,
      pendingapproval: 0,
      "chờ duyệt": 0,
      // Confirmed variants
      confirmed: 1,
      "đã xác nhận": 1,
      // Delivering / PickedUp / InProgress variants
      delivering: 2,
      pickedup: 2,
      inprogress: 2,
      "đang thuê": 2,
      "đang giao hàng": 2,
      // Delivered / Returned variants (returned often means renter returned items -> step 3)
      delivered: 3,
      returned: 3,
      "đã trả": 3,
      // Completed
      completed: 4,
      "hoàn thành": 4,
      // Cancelled / Rejected
      cancelled: -1,
      rejected: -1,
      "đã hủy": -1,
    };

    return statusMap[normalized] ?? 0;
  };

  const getActiveStep = (statusNumber: number) => {
    if (statusNumber === -1) return -1;
    return statusNumber;
  };

  // Helper to present human friendly dispute status labels
  const getDisputeStatusLabel = (status?: string) => {
    const s = (status || "").toString().toLowerCase();
    switch (s) {
      case "resolved":
      case "đã giải quyết":
        return "Đã giải quyết";
      case "under_review":
      case "processing":
      case "đang xử lý":
        return "Đang xử lý";
      case "pending":
      case "chờ xử lý":
        return "Chờ xử lý";
      default:
        return status || "Không rõ";
    }
  };

  const getDisputeStatusColor = (status?: string) => {
    const s = (status || "").toString().toLowerCase();
    switch (s) {
      case "resolved":
      case "đã giải quyết":
        return "#059669";
      case "under_review":
      case "processing":
      case "đang xử lý":
        return "#0284C7";
      case "pending":
      case "chờ xử lý":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
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
            Đang tải thông tin đơn hàng...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !booking) {
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
                onClick={() => navigate("/staff/my-assignments")}
              >
                Quay lại
              </Button>
            }
          >
            {error || "Không tìm thấy đơn hàng"}
          </Alert>
        </Container>
      </Box>
    );
  }

  const statusNumber = getStatusNumber(booking.statusText);
  const paymentDetails = calculatePaymentDetails();

  // Tổng tất cả các khoản bồi thường (theo backend)
  const disputesTotalAll = disputes.reduce(
    (sum, d) => sum + (d.totalAmount || 0),
    0
  );

  // Ensure refund amounts are always defined
  const refundAmount = paymentDetails.refundAmount || 0;
  const refundPaidAmount = paymentDetails.refundPaidAmount || 0;
  const refundUnpaidAmount = paymentDetails.refundUnpaidAmount || 0;

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => navigate("/staff/check-booking")}
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
                Chi tiết đơn hàng
                <Chip
                  label={booking.statusText}
                  size="small"
                  sx={{
                    bgcolor: statusNumber === -1 ? "#FEE2E2" : "#FFF7ED",
                    color: statusNumber === -1 ? "#DC2626" : "#F97316",
                    fontWeight: 600,
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                Mã đơn: {booking.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stepper */}
        {statusNumber !== -1 && (
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Stepper activeStep={getActiveStep(statusNumber)} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index <= statusNumber}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        "&.Mui-active": {
                          color: "#F97316",
                        },
                        "&.Mui-completed": {
                          color: "#059669",
                        },
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: index <= statusNumber ? 600 : 400,
                        fontSize: "0.875rem",
                        color: index <= statusNumber ? "#1F2937" : "#9CA3AF",
                      }}
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: 3,
            mb: 4,
            "& > *": { height: "100%" },
          }}
        >
          {/* Customer Info */}
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
                  Chi tiết người thuê
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
                    {booking.renter?.fullName || "N/A"}
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
                    {booking.renter?.phone ||
                      booking.renter?.phoneNumber ||
                      "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <Email />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.renter?.email || "N/A"}
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
                    Địa chỉ giao hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {booking.location
                      ? `${booking.location.district}, ${booking.location.province}`
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Delivery Info */}
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
                <LocalShipping sx={{ color: "#4F46E5", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Thông tin giao hàng
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Chi tiết thời gian và địa điểm
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Ngày nhận hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatDate(booking.pickupAt)}
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
                    Ngày trả hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatDate(booking.returnAt)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block" }}
                  >
                    Loại thuê
                  </Typography>
                  <Chip
                    label={getBookingType(booking.type)}
                    size="small"
                    sx={{
                      bgcolor: "#FFF7ED",
                      color: "#F97316",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Payment Status Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              border: "2px solid",
              borderColor:
                paymentDetails.paidAmount > 0 ? "#10B981" : "#FEE2E2",
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
                  bgcolor:
                    booking.snapshotPlatformFeePercent *
                      booking.snapshotRentalTotal >
                    0
                      ? "#D1FAE5"
                      : "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Payment
                  sx={{
                    color:
                      paymentDetails.paidAmount > 0 ? "#059669" : "#DC2626",
                    fontSize: 28,
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Trạng thái thanh toán
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Xác minh trước khi giao hàng
                </Typography>
              </Box>
              <Chip
                icon={
                  paymentDetails.paidAmount > 0 ? <CheckCircle /> : <Cancel />
                }
                label={
                  paymentDetails.paidAmount > 0
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"
                }
                sx={{
                  bgcolor:
                    paymentDetails.paidAmount > 0 ? "#D1FAE5" : "#FEE2E2",
                  color: paymentDetails.paidAmount > 0 ? "#059669" : "#DC2626",
                  fontWeight: 600,
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {paymentDetails.paidAmount > 0 ? (
              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", display: "block" }}
                    >
                      Số tiền đã thanh toán
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatCurrency(paymentDetails.paidAmount)}
                    </Typography>
                  </Box>
                </Box>

                {paymentDetails.unpaidAmount > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#F9FAFB", color: "#6B7280" }}>
                      <Payment />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "#6B7280", display: "block" }}
                      >
                        Số tiền còn lại
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#DC2626" }}
                      >
                        {formatCurrency(paymentDetails.unpaidAmount)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  {paymentDetails.unpaidAmount > 0
                    ? `Đã thanh toán ${formatCurrency(
                        paymentDetails.paidAmount
                      )}. Còn lại ${formatCurrency(
                        paymentDetails.unpaidAmount
                      )} cần thanh toán.`
                    : "Đã thanh toán đầy đủ. Có thể giao hàng."}
                </Alert>
              </Stack>
            ) : (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                Khách hàng chưa thực hiện thanh toán. Vui lòng nhắc khách hàng
                thanh toán trước khi giao hàng.
              </Alert>
            )}
          </Paper>

          {/* Equipment List */}
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
                  {booking.items.length} thiết bị
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {booking.items.map((item, index) => (
                <Paper
                  key={index}
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
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#1F2937", flex: 1 }}
                    >
                      {getItemName(item)}
                    </Typography>
                    <Chip
                      label={`x${item.quantity}`}
                      size="small"
                      sx={{
                        bgcolor: "#FFF7ED",
                        color: "#F97316",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Đơn giá / Ngày
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatCurrency(item.unitPrice)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Tiền cọc thiết bị
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatCurrency(item.depositAmount)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>

          {/* Payment Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              gridColumn: { xs: "1 / -1", lg: "1 / -1" },
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
                  bgcolor: "#DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Payment sx={{ color: "#0284C7", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  Tổng quát thanh toán
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Chi tiết chi phí
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {/* Dropdown cho Tổng tiền thuê */}
              <Box>
                <Box
                  onClick={() => setRentalDetailExpanded(!rentalDetailExpanded)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: rentalDetailExpanded ? "#FFF7ED" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#FFF7ED",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Tổng thanh toán
                    </Typography>
                    {rentalDetailExpanded ? (
                      <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                    ) : (
                      <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(
                      booking.snapshotRentalTotal +
                        booking.snapshotDepositAmount
                    )}
                  </Typography>
                </Box>

                <Collapse in={rentalDetailExpanded}>
                  <Box
                    sx={{
                      mt: 1,
                      ml: 2,
                      pl: 2,
                      borderLeft: "2px solid #F97316",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Tiền thuê thiết bị
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#374151" }}
                        >
                          {formatCurrency(booking.snapshotRentalTotal)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Tiền cọc thiết bị
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#374151" }}
                        >
                          {formatCurrency(booking.snapshotDepositAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

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
                    bgcolor: paidDetailExpanded ? "#FFF7ED" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#FFF7ED",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Đã thanh toán
                    </Typography>
                    {paidDetailExpanded ? (
                      <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                    ) : (
                      <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                    )}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1F2937" }}
                  >
                    {formatCurrency(paymentDetails.paidAmount)}
                  </Typography>
                </Box>

                <Collapse in={paidDetailExpanded}>
                  <Box
                    sx={{
                      mt: 1,
                      ml: 2,
                      pl: 2,
                      borderLeft: "2px solid #F97316",
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Hiển thị các khoản thanh toán */}
                      {booking.payments && booking.payments.length > 0 ? (
                        booking.payments
                          .filter(
                            (payment) =>
                              payment.status === "Captured" ||
                              payment.status === "Authorized"
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
                                case "Refunded":
                                  return "Đã hoàn tiền";
                                case "Pending":
                                  return "Đang chờ";
                                case "Failed":
                                  return "Thất bại";
                                default:
                                  return status;
                              }
                            };

                            const getStatusColor = (status: string) => {
                              switch (status) {
                                case "Captured":
                                  return "#059669";
                                case "Authorized":
                                  return "#0284C7";
                                case "Refunded":
                                  return "#DC2626";
                                case "Pending":
                                  return "#F59E0B";
                                case "Failed":
                                  return "#DC2626";
                                default:
                                  return "#6B7280";
                              }
                            };

                            return (
                              <Box
                                key={payment.id}
                                sx={{
                                  p: 2,
                                  bgcolor: "#F9FAFB",
                                  borderRadius: 2,
                                  border: "1px solid #E5E7EB",
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
                                      sx={{ fontWeight: 600, color: "#1F2937" }}
                                    >
                                      Thanh toán #{index + 1}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#6B7280" }}
                                    >
                                      {getPaymentMethodLabel(payment.provider)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 700, color: "#059669" }}
                                    >
                                      {formatCurrency(paymentAmount)}
                                    </Typography>
                                    <Chip
                                      label={getStatusLabel(payment.status)}
                                      size="small"
                                      sx={{
                                        mt: 0.5,
                                        bgcolor: getStatusColor(payment.status),
                                        color: "white",
                                        fontSize: "0.7rem",
                                        height: 20,
                                      }}
                                    />
                                  </Box>
                                </Box>

                                {/* Chi tiết các payment lines */}
                                {payment.lines && payment.lines.length > 0 && (
                                  <Box
                                    sx={{
                                      mt: 1.5,
                                      pt: 1.5,
                                      borderTop: "1px solid #E5E7EB",
                                    }}
                                  >
                                    <Stack spacing={1}>
                                      {payment.lines.map((line, lineIndex) => {
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
                                            case "adjustment":
                                              return "Điều chỉnh";
                                            default:
                                              return type;
                                          }
                                        };

                                        const lineAmount =
                                          payment.status === "Captured"
                                            ? line.capturedAmount || line.amount
                                            : line.amount;

                                        return (
                                          <Box
                                            key={lineIndex}
                                            sx={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{ color: "#6B7280" }}
                                            >
                                              {getLineTypeLabel(line.type)}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                fontWeight: 600,
                                                color: "#374151",
                                              }}
                                            >
                                              {formatCurrency(lineAmount)}
                                            </Typography>
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                )}
                              </Box>
                            );
                          })
                      ) : (
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          Chưa có khoản thanh toán nào
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              {/* Dropdown cho Chưa thanh toán */}
              {paymentDetails.unpaidAmount > 0 ? (
                <Box>
                  <Box
                    onClick={() =>
                      setUnpaidDetailExpanded(!unpaidDetailExpanded)
                    }
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: unpaidDetailExpanded ? "#FFF7ED" : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#FFF7ED",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#6B7280" }}>
                        Chưa thanh toán
                      </Typography>
                      {unpaidDetailExpanded ? (
                        <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                      ) : (
                        <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#DC2626" }}
                    >
                      {formatCurrency(paymentDetails.unpaidAmount)}
                    </Typography>
                  </Box>

                  <Collapse in={unpaidDetailExpanded}>
                    <Box
                      sx={{
                        mt: 1,
                        ml: 2,
                        pl: 2,
                        borderLeft: "2px solid #F97316",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            Tổng thanh toán - Đã thanh toán
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#374151" }}
                          >
                            {formatCurrency(paymentDetails.unpaidAmount)}
                          </Typography>
                        </Box>

                        {/* Nút Thanh Toán */}
                        <Button
                          variant="contained"
                          startIcon={
                            paymentLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <Payment />
                            )
                          }
                          fullWidth
                          disabled={paymentLoading}
                          sx={{
                            mt: 2,
                            bgcolor: "#F97316",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 600,
                            py: 1.2,
                            borderRadius: 2,
                            "&:hover": {
                              bgcolor: "#EA580C",
                            },
                            "&:disabled": {
                              bgcolor: "#FED7AA",
                              color: "white",
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayment();
                          }}
                        >
                          {paymentLoading ? "Đang xử lý..." : "Thanh toán ngay"}
                        </Button>
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#D1FAE5",
                    border: "1px solid #10B981",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircle sx={{ color: "#059669", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#059669" }}
                    >
                      Đã thanh toán đủ
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Dropdown cho Tiền hoàn trả (chỉ khi đã trả máy / statusNumber >= 3) */}
              {statusNumber >= 3 && refundAmount > 0 && (
                <Box>
                  <Box
                    onClick={() =>
                      setDisputeDetailExpanded(!disputeDetailExpanded)
                    }
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: disputeDetailExpanded
                        ? "#FFF7ED"
                        : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#FFF7ED",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#6B7280" }}>
                        Tiền hoàn trả
                      </Typography>
                      {disputeDetailExpanded ? (
                        <ExpandLess sx={{ color: "#F97316", fontSize: 20 }} />
                      ) : (
                        <ExpandMore sx={{ color: "#F97316", fontSize: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#059669" }}
                      >
                        {formatCurrency(refundAmount)}
                      </Typography>
                      {refundUnpaidAmount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#DC2626", display: "block" }}
                        >
                          Chưa hoàn trả: {formatCurrency(refundUnpaidAmount)}
                        </Typography>
                      )}
                      {refundPaidAmount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#059669", display: "block" }}
                        >
                          Đã hoàn trả: {formatCurrency(refundPaidAmount)}
                        </Typography>
                      )}

                      {/* Button to trigger backend refund/payment handling (only when booking returned) */}
                      {statusNumber >= 3 && refundUnpaidAmount > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={handleProcessRefund}
                            disabled={refundProcessing}
                            startIcon={
                              refundProcessing ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : undefined
                            }
                            sx={{
                              bgcolor: "#F97316",
                              color: "white",
                              textTransform: "none",
                              fontWeight: 600,
                              "&:hover": { bgcolor: "#EA580C" },
                            }}
                          >
                            {refundProcessing
                              ? "Đang xử lý..."
                              : "Xử lý hoàn trả"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Collapse in={disputeDetailExpanded}>
                    <Box
                      sx={{
                        mt: 1,
                        ml: 2,
                        pl: 2,
                        borderLeft: "2px solid #F97316",
                      }}
                    >
                      <Stack spacing={2}>
                        {disputesLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              py: 2,
                            }}
                          >
                            <CircularProgress size={24} />
                          </Box>
                        ) : disputes.length > 0 ? (
                          disputes
                            .filter((dispute) => (dispute.totalAmount || 0) > 0)
                            .map((dispute, disputeIndex) => {
                              // Check if dispute has been refunded
                              // Only treat as refunded if there is a payment line of type 'refund'/'dispute'
                              // that is actually refunded (payment.status === 'Refunded') or a captured refund line.
                              const disputeRefunded =
                                booking.payments?.some((payment) =>
                                  payment.lines?.some((line) => {
                                    const lineType = (line.type || "")
                                      .toString()
                                      .toLowerCase();
                                    const isDisputeLine =
                                      lineType === "dispute" ||
                                      lineType === "refund";
                                    if (!isDisputeLine) return false;
                                    // If payment was explicitly refunded on backend
                                    if (payment.status === "Refunded")
                                      return true;
                                    // If payment is captured/authorized but the line itself represents a refund with amount > 0
                                    const lineAmount =
                                      line.capturedAmount || line.amount || 0;
                                    if (
                                      (payment.status === "Captured" ||
                                        payment.status === "Authorized") &&
                                      lineType === "refund" &&
                                      lineAmount > 0
                                    )
                                      return true;
                                    return false;
                                  })
                                ) || false;

                              // Check if this is the last dispute (to show deposit refund)
                              const isLastDispute =
                                disputeIndex ===
                                disputes.filter(
                                  (d) =>
                                    d.status === "resolved" && d.totalAmount > 0
                                ).length -
                                  1;

                              return (
                                <Box
                                  key={dispute.id}
                                  sx={{
                                    p: 2,
                                    bgcolor: "#F9FAFB",
                                    borderRadius: 2,
                                    border: "1px solid #E5E7EB",
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
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            color: "#1F2937",
                                          }}
                                        >
                                          {dispute.title}
                                        </Typography>
                                        <Chip
                                          label={getDisputeStatusLabel(
                                            dispute.status
                                          )}
                                          size="small"
                                          sx={{
                                            bgcolor: getDisputeStatusColor(
                                              dispute.status
                                            ),
                                            color: "white",
                                            fontSize: "0.7rem",
                                            height: 20,
                                          }}
                                        />
                                      </Box>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#6B7280" }}
                                      >
                                        {dispute.description}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontWeight: 700,
                                          color: disputeRefunded
                                            ? "#059669"
                                            : "#DC2626",
                                        }}
                                      >
                                        {formatCurrency(dispute.totalAmount)}
                                      </Typography>
                                      <Chip
                                        label={
                                          disputeRefunded
                                            ? "Đã hoàn trả"
                                            : "Chưa hoàn trả"
                                        }
                                        size="small"
                                        sx={{
                                          mt: 0.5,
                                          bgcolor: disputeRefunded
                                            ? "#059669"
                                            : "#DC2626",
                                          color: "white",
                                          fontSize: "0.7rem",
                                          height: 20,
                                        }}
                                      />
                                    </Box>
                                  </Box>

                                  {/* Chi tiết các khoản bồi thường */}
                                  {dispute.items &&
                                    dispute.items.length > 0 && (
                                      <Box
                                        sx={{
                                          mt: 1.5,
                                          pt: 1.5,
                                          borderTop: "1px solid #E5E7EB",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#6B7280",
                                            fontWeight: 600,
                                            display: "block",
                                            mb: 1,
                                          }}
                                        >
                                          Chi tiết bồi thường:
                                        </Typography>
                                        <Stack spacing={1}>
                                          {dispute.items.map(
                                            (item, itemIndex) => {
                                              const getItemTypeLabel = (
                                                type: string
                                              ) => {
                                                switch (type.toLowerCase()) {
                                                  case "damage":
                                                    return "Thiệt hại";
                                                  case "missing":
                                                    return "Mất thiết bị";
                                                  case "late":
                                                    return "Trễ hẹn";
                                                  case "money":
                                                    return "Tiền";
                                                  default:
                                                    return type;
                                                }
                                              };

                                              return (
                                                <Box
                                                  key={itemIndex}
                                                  sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                      "space-between",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    sx={{ color: "#6B7280" }}
                                                  >
                                                    {getItemTypeLabel(
                                                      item.type
                                                    )}
                                                    {item.notes && (
                                                      <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                          color: "#9CA3AF",
                                                          ml: 0.5,
                                                        }}
                                                      >
                                                        ({item.notes})
                                                      </Typography>
                                                    )}
                                                  </Typography>
                                                  <Typography
                                                    variant="caption"
                                                    sx={{
                                                      fontWeight: 600,
                                                      color: "#374151",
                                                    }}
                                                  >
                                                    {formatCurrency(
                                                      item.amount
                                                    )}
                                                  </Typography>
                                                </Box>
                                              );
                                            }
                                          )}
                                        </Stack>
                                      </Box>
                                    )}

                                  {/* Hiển thị tiền cọc thiết bị cần hoàn trả (chỉ ở dispute cuối cùng) */}
                                  {isLastDispute &&
                                    booking.snapshotDepositAmount > 0 && (
                                      <Box
                                        sx={{
                                          mt: 1.5,
                                          pt: 1.5,
                                          borderTop: "1px solid #E5E7EB",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "#6B7280",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Tiền cọc thiết bị cần hoàn trả:
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: 700,
                                              color: "#059669",
                                            }}
                                          >
                                            {formatCurrency(
                                              booking.snapshotDepositAmount
                                            )}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#9CA3AF",
                                            fontStyle: "italic",
                                          }}
                                        >
                                          Tiền cọc sẽ được hoàn trả khi giải
                                          quyết bồi thường
                                        </Typography>
                                      </Box>
                                    )}
                                </Box>
                              );
                            })
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            Không có bồi thường đã giải quyết nào
                          </Typography>
                        )}

                        {/* Hiển thị tổng tiền hoàn trả nếu có */}
                        {refundAmount > 0 && (
                          <Box
                            sx={{
                              mt: 2,
                              pt: 2,
                              borderTop: "2px solid #059669",
                              bgcolor: "#F0FDF4",
                              p: 2,
                              borderRadius: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: "#1F2937" }}
                              >
                                Tổng tiền hoàn trả:
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: "#059669" }}
                              >
                                {formatCurrency(refundAmount)}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "0.75rem",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                • Tiền bồi thường:{" "}
                                {formatCurrency(disputesTotalAll)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                • Tiền cọc thiết bị:{" "}
                                {formatCurrency(booking.snapshotDepositAmount)}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Stack>
          </Paper>
        </Box>

        {/* Confirm Dialog (extracted) */}
        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleConfirmUpdate}
        />

        {/* Payment Method Dialog (extracted) */}
        <PaymentMethodDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onConfirmPayment={handleConfirmPayment}
          paymentLoading={paymentLoading}
          booking={booking}
          paymentDetails={paymentDetails}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default BookingDetail;
