import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  MenuItem,
  Stack,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Camera,
  Package,
  FileText,
  CheckCircle,
  X as XIcon,
  CreditCard,
  Wallet,
  Clock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { colors } from "../../theme/colors";
import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CartItemWithQuantity {
  itemId: string;
  itemName: string;
  itemType: string;
  unitPrice: number;
  quantity: number;
  media?: string[];
}

interface WorkSlot {
  id: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface UnavailableRange {
  bookingId: string;
  startUtc: string;
  endUtc: string;
  status: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Vietnam provinces
const PROVINCES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const steps = ["Thông tin đặt thuê", "Xem và ký hợp đồng", "Thanh toán"];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = location.state || {};
  const signatureRef = useRef<SignatureCanvas | null>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [country] = useState("Vietnam");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
  const [returnDate, setReturnDate] = useState<Dayjs | null>(null);
  const [pickupSlotId, setPickupSlotId] = useState<string>("");
  const [returnSlotId, setReturnSlotId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Work slots and unavailable ranges
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>([]);
  const [unavailableRanges, setUnavailableRanges] = useState<
    UnavailableRange[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingRanges, setLoadingRanges] = useState(false);

  // Contract state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"PayOs" | "Wallet">(
    "PayOs"
  );
  const [processingPayment, setProcessingPayment] = useState(false);

  // Redirect if no items
  useEffect(() => {
    if (!items || items.length === 0) {
      toast.error("Không có sản phẩm trong giỏ hàng");
      navigate("/");
    }
  }, [items, navigate]);

  // Fetch work slots on mount
  useEffect(() => {
    fetchWorkSlots();
  }, []);

  // Fetch unavailable ranges when items change
  useEffect(() => {
    if (items && items.length > 0) {
      fetchUnavailableRanges(items[0].itemId, items[0].itemType);
    }
  }, [items]);

  // Auto-set return slot when pickup slot changes
  useEffect(() => {
    if (pickupSlotId && !returnSlotId) {
      setReturnSlotId(pickupSlotId);
    }
  }, [pickupSlotId]);

  const cartItems: CartItemWithQuantity[] = items || [];

  // Fetch work slots
  const fetchWorkSlots = async () => {
    try {
      setLoadingSlots(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/WorkSlots`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải khung giờ làm việc");
      }

      const data: WorkSlot[] = await response.json();
      const activeSlots = data.filter((slot) => slot.isActive);
      setWorkSlots(activeSlots);

      // Auto-select first slot
      if (activeSlots.length > 0 && !pickupSlotId) {
        const firstSlot = activeSlots[0];
        setPickupSlotId(firstSlot.id);
        setReturnSlotId(firstSlot.id);
      }
    } catch (error) {
      console.error("Error fetching work slots:", error);
      toast.error("Không thể tải khung giờ làm việc");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch unavailable ranges for item
  const fetchUnavailableRanges = async (itemId: string, itemType: string) => {
    try {
      setLoadingRanges(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/Bookings/items/${itemId}/unavailable-ranges?type=${itemType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin lịch đặt");
      }

      const data: UnavailableRange[] = await response.json();
      setUnavailableRanges(data);
    } catch (error) {
      console.error("Error fetching unavailable ranges:", error);
      toast.warning("Không thể tải thông tin lịch đặt thiết bị");
    } finally {
      setLoadingRanges(false);
    }
  };

  // Get working hours range
  const getWorkingHours = () => {
    if (workSlots.length === 0) return null;

    const sortedSlots = [...workSlots].sort(
      (a, b) => a.slotIndex - b.slotIndex
    );
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];

    return {
      start: firstSlot.startTime,
      end: lastSlot.endTime,
    };
  };

  // Get slot by ID
  const getSlotById = (slotId: string): WorkSlot | undefined => {
    return workSlots.find((slot) => slot.id === slotId);
  };

  // Check if date+slot combination is available
  const isDateSlotAvailable = (date: Dayjs | null, slotId: string): boolean => {
    if (!date || !slotId) return true;

    const slot = getSlotById(slotId);
    if (!slot) return false;

    // Create datetime from date + slot start time
    const [hours, minutes] = slot.startTime.split(":").map(Number);
    const dateTime = date.hour(hours).minute(minutes).second(0).millisecond(0);

    // Check against unavailable ranges
    for (const range of unavailableRanges) {
      const rangeStart = dayjs(range.startUtc).tz("Asia/Ho_Chi_Minh");
      const rangeEnd = dayjs(range.endUtc).tz("Asia/Ho_Chi_Minh");

      // Check if datetime falls within unavailable range
      if (
        dateTime.valueOf() >= rangeStart.valueOf() &&
        dateTime.valueOf() < rangeEnd.valueOf()
      ) {
        return false;
      }
    }

    return true;
  };

  // Disable dates that are fully booked for selected slot
  const shouldDisableDate = (date: Dayjs | Date): boolean => {
    if (!pickupSlotId) return false;

    // Convert Date to Dayjs if needed
    const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
    
    return !isDateSlotAvailable(dayjsDate, pickupSlotId);
  };

  // Get available slots for a date
  const getAvailableSlotsForDate = (date: Dayjs | null): WorkSlot[] => {
    if (!date) return workSlots;

    return workSlots.filter((slot) => isDateSlotAvailable(date, slot.id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);
  };

  const calculateRentalDays = () => {
    if (!pickupDate || !returnDate) return 0;
    const days = returnDate.diff(pickupDate, "day");
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    const days = calculateRentalDays();
    return calculateSubtotal() * (days || 1);
  };

  // Handle pickup date change
  const handlePickupDateChange = (value: Dayjs | null | Date) => {
    // Convert Date to Dayjs if needed
    const dayjsValue = value && dayjs.isDayjs(value) ? value : value ? dayjs(value) : null;
    setPickupDate(dayjsValue);

    // Check availability
    if (dayjsValue && pickupSlotId) {
      if (!isDateSlotAvailable(dayjsValue, pickupSlotId)) {
        toast.warning(
          "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác"
        );
      }
    }
  };

  // Handle return date change
  const handleReturnDateChange = (value: Dayjs | null | Date) => {
    // Convert Date to Dayjs if needed
    const dayjsValue = value && dayjs.isDayjs(value) ? value : value ? dayjs(value) : null;
    setReturnDate(dayjsValue);

    if (pickupDate && dayjsValue && dayjsValue.isBefore(pickupDate)) {
      toast.error("Ngày trả phải sau ngày nhận");
      setReturnDate(pickupDate);
    }

    // Check availability
    if (dayjsValue && returnSlotId) {
      if (!isDateSlotAvailable(dayjsValue, returnSlotId)) {
        toast.warning(
          "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác"
        );
      }
    }
  };

  // Handle pickup slot change
  const handlePickupSlotChange = (slotId: string) => {
    setPickupSlotId(slotId);
    setReturnSlotId(slotId); // Auto-set return slot to same as pickup

    // Check availability
    if (pickupDate && !isDateSlotAvailable(pickupDate, slotId)) {
      toast.warning("Khung giờ này đã được đặt cho ngày đã chọn");
    }
  };

  // Step 1: Create booking
  const handleCreateBooking = async () => {
    // Validation
    if (!province || !district) {
      toast.error("Vui lòng điền địa điểm nhận hàng");
      return;
    }

    if (!pickupDate || !returnDate) {
      toast.error("Vui lòng chọn ngày nhận và ngày trả");
      return;
    }

    if (!pickupSlotId || !returnSlotId) {
      toast.error("Vui lòng chọn khung giờ nhận và trả");
      return;
    }

    // Get slots
    const pickupSlot = getSlotById(pickupSlotId);
    const returnSlot = getSlotById(returnSlotId);

    if (!pickupSlot || !returnSlot) {
      toast.error("Khung giờ không hợp lệ");
      return;
    }

    // Check availability
    if (!isDateSlotAvailable(pickupDate, pickupSlotId)) {
      toast.error("Ngày và giờ nhận đã được đặt. Vui lòng chọn thời gian khác");
      return;
    }

    if (!isDateSlotAvailable(returnDate, returnSlotId)) {
      toast.error("Ngày và giờ trả đã được đặt. Vui lòng chọn thời gian khác");
      return;
    }

    if (returnDate.isBefore(pickupDate)) {
      toast.error("Ngày trả phải sau ngày nhận");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      // Create pickup datetime
      const [pickupHours, pickupMinutes] = pickupSlot.startTime
        .split(":")
        .map(Number);
      const pickupDateTime = pickupDate
        .hour(pickupHours)
        .minute(pickupMinutes)
        .second(0)
        .millisecond(0);

      // Create return datetime
      const [returnHours, returnMinutes] = returnSlot.startTime
        .split(":")
        .map(Number);
      const returnDateTime = returnDate
        .hour(returnHours)
        .minute(returnMinutes)
        .second(0)
        .millisecond(0);

      const bookingData = {
        location: {
          country,
          province,
          district,
        },
        pickupAt: pickupDateTime.toISOString(),
        returnAt: returnDateTime.toISOString(),
      };

      console.log("Booking data:", bookingData);

      const response = await fetch(`${API_BASE_URL}/Bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const contentType = response.headers.get("content-type");
      let result = null;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text) {
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            throw new Error("Invalid JSON response from server");
          }
        }
      }

      if (!response.ok) {
        throw new Error(result?.message || `Máy ảnh đã có người đặt thuê.`);
      }

      // Get bookingId and contractId from response
      const responseBookingId = result?.id || result?.bookingId;
      const responseContractId =
        result?.contracts?.[0]?.id || result?.contractId;

      if (!responseBookingId || !responseContractId) {
        throw new Error("Không tìm thấy thông tin đơn hàng hoặc hợp đồng");
      }

      setBookingId(responseBookingId);
      setContractId(responseContractId);

      // Fetch contract preview
      await fetchContractPreview(responseContractId, token);

      toast.success("Đặt thuê thành công!");
      setActiveStep(1); // Move to step 2
    } catch (error: unknown) {
      console.error("Error creating booking:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể tạo đơn thuê. Vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch contract preview PDF
  const fetchContractPreview = async (
    contractId: string,
    token: string | null
  ) => {
    try {
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
        throw new Error("Không thể lấy hợp đồng");
      }

      const blob = await previewResponse.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching contract:", error);
      toast.error("Không thể tải hợp đồng");
    }
  };

  // Open signature dialog
  const handleOpenSignature = () => {
    setSignatureDialogOpen(true);
  };

  // Clear signature
  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // Sign contract
  const handleSignContract = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Vui lòng ký vào khung trước khi xác nhận");
      return;
    }

    if (!contractId) {
      toast.error("Không tìm thấy hợp đồng");
      return;
    }

    try {
      setSigning(true);
      const token = localStorage.getItem("accessToken");

      // Get signature as base64
      const signatureDataUrl = signatureRef.current.toDataURL("image/png");
      const base64Data = signatureDataUrl.split(",")[1] || "";

      if (!base64Data) {
        throw new Error("Dữ liệu chữ ký không hợp lệ");
      }

      // POST signature
      const response = await fetch(
        `${API_BASE_URL}/Contracts/${contractId}/sign`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signatureBase64: base64Data,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể ký hợp đồng");
      }

      toast.success("Ký hợp đồng thành công!");
      setSignatureDialogOpen(false);

      // Move to payment step
      setActiveStep(2);
    } catch (error) {
      console.error("Error signing contract:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể ký hợp đồng"
      );
    } finally {
      setSigning(false);
    }
  };

  // Process payment
  const handlePayment = async () => {
    if (!bookingId) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      setProcessingPayment(true);
      const token = localStorage.getItem("accessToken");

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
            bookingId: bookingId,
            mode: "Deposit",
            method: paymentMethod,
          }),
        }
      );

      if (!authorizeResponse.ok) {
        const errorText = await authorizeResponse.text();
        throw new Error(errorText || "Không thể khởi tạo thanh toán");
      }

      // Response is payment ID (string with quotes)
      let paymentId = await authorizeResponse.text();

      // Remove leading and trailing quotes if present
      paymentId = paymentId.replace(/^"|"$/g, "");

      if (paymentMethod === "Wallet") {
        // Wallet payment success
        toast.success("Thanh toán bằng ví thành công!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        // PayOs payment - create checkout URL
        const returnUrl = `${window.location.origin}`;
        const cancelUrl = `${window.location.origin}`;

        const payosResponse = await fetch(
          `${API_BASE_URL}/Payments/${paymentId}/payos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              returnUrl: returnUrl,
              cancelUrl: cancelUrl,
            }),
          }
        );

        if (!payosResponse.ok) {
          const errorText = await payosResponse.text();
          throw new Error(errorText || "Không thể tạo link thanh toán");
        }

        const payosData = await payosResponse.json();

        // Get redirectUrl from response
        const redirectUrl =
          payosData.redirectUrl || payosData.checkoutUrl || payosData.url;

        if (!redirectUrl) {
          throw new Error("Không nhận được link thanh toán");
        }

        // Redirect to PayOs checkout page
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể xử lý thanh toán"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const workingHours = getWorkingHours();
  const availablePickupSlots = getAvailableSlotsForDate(pickupDate);
  const availableReturnSlots = getAvailableSlotsForDate(returnDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: colors.background.default,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={() => navigate(-1)}
              sx={{
                color: colors.text.secondary,
                textTransform: "none",
                fontWeight: 600,
                mb: 2,
                "&:hover": {
                  bgcolor: colors.neutral[100],
                },
              }}
            >
              Quay lại
            </Button>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <FileText size={32} />
              Thanh Toán
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary }}>
              Hoàn tất đặt thuê thiết bị của bạn
            </Typography>
          </Box>

          {/* Stepper */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Working Hours Info */}
          {workingHours && activeStep === 0 && (
            <Alert
              severity="info"
              icon={<Clock size={20} />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Giờ làm việc: {workingHours.start} - {workingHours.end}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                Vui lòng chọn khung giờ trong giờ làm việc
              </Typography>
            </Alert>
          )}

          {/* Main Content */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            {/* Left - Form/Contract/Payment */}
            <Box sx={{ flex: 1 }}>
              {activeStep === 0 ? (
                // Step 1: Booking Information
                <Paper
                  elevation={0}
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateBooking();
                  }}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  {/* Pickup Location */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 3,
                      }}
                    >
                      <MapPin size={24} color={colors.primary.main} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Chọn Nơi Nhận Thiết Bị
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Quốc gia"
                        value={country}
                        disabled
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: colors.neutral[50],
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        select
                        required
                        label="Tỉnh/Thành phố"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: colors.primary.main,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: colors.primary.main,
                            },
                          },
                        }}
                      >
                        {PROVINCES.map((prov) => (
                          <MenuItem key={prov} value={prov}>
                            {prov}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth
                        required
                        label="Quận/Huyện"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Nhập quận hoặc huyện"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: colors.primary.main,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: colors.primary.main,
                            },
                          },
                        }}
                      />
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Rental Period */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 3,
                      }}
                    >
                      <Calendar size={24} color={colors.primary.main} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Thời gian thuê
                      </Typography>
                    </Box>

                    {loadingSlots || loadingRanges ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <CircularProgress size={32} />
                      </Box>
                    ) : (
                      <Stack spacing={3}>
                        {/* Pickup Date & Slot */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            Ngày & Giờ Nhận
                          </Typography>
                          <Stack spacing={2}>
                            <DatePicker
                              label="Chọn Ngày Nhận"
                              value={pickupDate}
                              onChange={handlePickupDateChange}
                              minDate={dayjs()}
                              shouldDisableDate={shouldDisableDate}
                              slotProps={{
                                textField: {
                                  required: true,
                                  fullWidth: true,
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      "&:hover fieldset": {
                                        borderColor: colors.primary.main,
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: colors.primary.main,
                                      },
                                    },
                                  },
                                },
                              }}
                            />

                            <TextField
                              fullWidth
                              select
                              required
                              label="Chọn Khung Giờ Nhận"
                              value={pickupSlotId}
                              onChange={(e) =>
                                handlePickupSlotChange(e.target.value)
                              }
                              disabled={!pickupDate}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "&:hover fieldset": {
                                    borderColor: colors.primary.main,
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: colors.primary.main,
                                  },
                                },
                              }}
                            >
                              {availablePickupSlots.map((slot) => (
                                <MenuItem key={slot.id} value={slot.id}>
                                  {slot.startTime} - {slot.endTime}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        </Box>

                        {/* Return Date & Slot */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            Ngày & Giờ Trả
                          </Typography>
                          <Stack spacing={2}>
                            <DatePicker
                              label="Chọn Ngày Trả"
                              value={returnDate}
                              onChange={handleReturnDateChange}
                              minDate={pickupDate || dayjs()}
                              shouldDisableDate={shouldDisableDate}
                              slotProps={{
                                textField: {
                                  required: true,
                                  fullWidth: true,
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      "&:hover fieldset": {
                                        borderColor: colors.primary.main,
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: colors.primary.main,
                                      },
                                    },
                                  },
                                },
                              }}
                            />

                            <TextField
                              fullWidth
                              select
                              required
                              label="Chọn Khung Giờ Trả"
                              value={returnSlotId}
                              onChange={(e) => setReturnSlotId(e.target.value)}
                              disabled={!returnDate}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "&:hover fieldset": {
                                    borderColor: colors.primary.main,
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: colors.primary.main,
                                  },
                                },
                              }}
                            >
                              {availableReturnSlots.map((slot) => (
                                <MenuItem key={slot.id} value={slot.id}>
                                  {slot.startTime} - {slot.endTime}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        </Box>

                        {pickupDate && returnDate && (
                          <Alert
                            severity="info"
                            sx={{
                              borderRadius: 2,
                              "& .MuiAlert-icon": {
                                color: colors.status.info,
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Thời gian thuê: {calculateRentalDays()} ngày
                            </Typography>
                          </Alert>
                        )}

                        {unavailableRanges.length > 0 && (
                          <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, display: "block", mb: 1 }}
                            >
                              Lịch đã đặt:
                            </Typography>
                            {unavailableRanges.map((range, idx) => (
                              <Typography
                                key={idx}
                                variant="caption"
                                sx={{ display: "block" }}
                              >
                                •{" "}
                                {dayjs(range.startUtc)
                                  .tz("Asia/Ho_Chi_Minh")
                                  .format("DD/MM/YYYY HH:mm")}{" "}
                                -{" "}
                                {dayjs(range.endUtc)
                                  .tz("Asia/Ho_Chi_Minh")
                                  .format("DD/MM/YYYY HH:mm")}
                              </Typography>
                            ))}
                          </Alert>
                        )}
                      </Stack>
                    )}
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || loadingSlots || loadingRanges}
                    sx={{
                      mt: 4,
                      py: 1.5,
                      bgcolor: colors.primary.main,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                      "&:disabled": {
                        bgcolor: colors.neutral[300],
                      },
                    }}
                  >
                    {loading ? "Đang xử lý..." : "Chuyển qua bước tiếp theo"}
                  </Button>
                </Paper>
              ) : activeStep === 1 ? (
                // Step 2: Contract Preview
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Xem trước hợp đồng
                    </Typography>
                    <Chip
                      icon={<FileText size={16} />}
                      label="Hợp đồng thuê"
                      color="primary"
                    />
                  </Box>

                  {/* PDF Preview */}
                  {pdfUrl ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: "600px",
                        border: `2px solid ${colors.border.light}`,
                        borderRadius: 2,
                        overflow: "hidden",
                        mb: 3,
                      }}
                    >
                      <iframe
                        src={pdfUrl}
                        width="100%"
                        height="100%"
                        title="Contract Preview"
                        style={{ border: "none" }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 400,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  )}

                  {/* Sign Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle size={20} />}
                    onClick={handleOpenSignature}
                    disabled={!pdfUrl}
                    sx={{
                      py: 1.5,
                      bgcolor: colors.primary.main,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                      "&:disabled": {
                        bgcolor: colors.neutral[300],
                      },
                    }}
                  >
                    Ký hợp đồng
                  </Button>
                </Paper>
              ) : (
                // Step 3: Payment
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    <CreditCard size={24} color={colors.primary.main} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Chọn phương thức thanh toán
                    </Typography>
                  </Box>

                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Hợp đồng đã được ký thành công!
                    </Typography>
                  </Alert>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "PayOs" | "Wallet")
                      }
                    >
                      {/* PayOs Payment */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 2,
                          border: `2px solid ${
                            paymentMethod === "PayOs"
                              ? colors.primary.main
                              : colors.border.light
                          }`,
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: colors.primary.main,
                            bgcolor: colors.primary.lighter,
                          },
                        }}
                        onClick={() => setPaymentMethod("PayOs")}
                      >
                        <FormControlLabel
                          value="PayOs"
                          control={<Radio />}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <CreditCard
                                size={24}
                                color={colors.primary.main}
                              />
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Chuyển khoản ngân hàng
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: colors.text.secondary }}
                                >
                                  Thanh toán qua cổng PayOS
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ m: 0, width: "100%" }}
                        />
                      </Paper>

                      {/* Wallet Payment */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: `2px solid ${
                            paymentMethod === "Wallet"
                              ? colors.primary.main
                              : colors.border.light
                          }`,
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: colors.primary.main,
                            bgcolor: colors.primary.lighter,
                          },
                        }}
                        onClick={() => setPaymentMethod("Wallet")}
                      >
                        <FormControlLabel
                          value="Wallet"
                          control={<Radio />}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Wallet size={24} color={colors.primary.main} />
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Ví điện tử
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: colors.text.secondary }}
                                >
                                  Thanh toán bằng số dư ví
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ m: 0, width: "100%" }}
                        />
                      </Paper>
                    </RadioGroup>
                  </FormControl>

                  {/* Payment Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePayment}
                    disabled={processingPayment}
                    sx={{
                      mt: 4,
                      py: 1.5,
                      bgcolor: colors.primary.main,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                      "&:disabled": {
                        bgcolor: colors.neutral[300],
                      },
                    }}
                  >
                    {processingPayment ? (
                      <>
                        <CircularProgress
                          size={20}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      "Tiến hành thanh toán"
                    )}
                  </Button>
                </Paper>
              )}
            </Box>

            {/* Right - Order Summary */}
            <Box sx={{ width: { xs: "100%", lg: "400px" }, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  position: "sticky",
                  top: 20,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Tóm tắt đơn hàng
                </Typography>

                {/* Items List */}
                <Box sx={{ mb: 3, maxHeight: "300px", overflowY: "auto" }}>
                  {cartItems.map((item) => (
                    <Box
                      key={item.itemId}
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: 2,
                        p: 2,
                        bgcolor: colors.neutral[50],
                        borderRadius: 2,
                      }}
                    >
                      {/* Item Icon */}
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1.5,
                          bgcolor: colors.neutral[100],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {item.media && item.media.length > 0 ? (
                          <img
                            src={item.media[0]}
                            alt={item.itemName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  item.itemType === "Camera"
                                    ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>'
                                    : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
                              }
                            }}
                          />
                        ) : item.itemType === "Camera" ? (
                          <Camera size={28} color={colors.neutral[400]} />
                        ) : (
                          <Package size={28} color={colors.neutral[400]} />
                        )}
                      </Box>

                      {/* Item Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: colors.text.primary,
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.itemName}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Chip
                            label={item.itemType}
                            size="small"
                            sx={{
                              bgcolor: colors.primary.lighter,
                              color: colors.primary.main,
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              height: 20,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: colors.text.secondary }}
                          >
                            × {item.quantity}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: colors.primary.main,
                          }}
                        >
                          {formatCurrency(item.unitPrice * item.quantity)} / day
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Price Breakdown */}
                <Stack spacing={2}>
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
                      Tổng phụ ({cartItems.length} sản phẩm)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Box>

                  {calculateRentalDays() > 0 && (
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
                        Ngày thuê
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {calculateRentalDays()} ngày
                      </Typography>
                    </Box>
                  )}

                  <Divider />

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
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Tổng
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: colors.primary.main }}
                    >
                      {formatCurrency(calculateTotal())}
                    </Typography>
                  </Box>
                </Stack>

                {/* Info Box */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: colors.status.warningLight,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary, display: "block" }}
                  >
                    💡 Vui lòng xem xét kỹ thông tin thuê thiết bị của bạn trước
                    khi xác nhận
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Signature Dialog */}
          <Dialog
            open={signatureDialogOpen}
            onClose={() => !signing && setSignatureDialogOpen(false)}
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
                  Ký hợp đồng
                </Typography>
                <IconButton
                  onClick={() => !signing && setSignatureDialogOpen(false)}
                  disabled={signing}
                >
                  <XIcon size={20} />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Vui lòng ký tên của bạn vào khung bên dưới để xác nhận hợp
                  đồng
                </Alert>
              </Box>

              <Box
                sx={{
                  border: `2px dashed ${colors.border.light}`,
                  borderRadius: 2,
                  bgcolor: colors.neutral[50],
                  p: 2,
                }}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    style: {
                      width: "100%",
                      height: "200px",
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: "8px",
                      backgroundColor: "white",
                    },
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleClearSignature}
                disabled={signing}
                sx={{
                  borderColor: colors.border.light,
                  color: colors.text.primary,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Xóa
              </Button>
              <Button
                variant="contained"
                onClick={handleSignContract}
                disabled={signing}
                sx={{
                  bgcolor: colors.primary.main,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: colors.primary.dark,
                  },
                }}
              >
                {signing ? (
                  <>
                    <CircularProgress
                      size={16}
                      sx={{ mr: 1 }}
                      color="inherit"
                    />
                    Đang ký...
                  </>
                ) : (
                  "Xác nhận ký"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default CheckoutPage;
