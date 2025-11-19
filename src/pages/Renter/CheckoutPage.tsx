import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Camera,
  Package,
  CreditCard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { colors } from "../../theme/colors";
import { toast } from "react-toastify";

interface CartItemWithQuantity {
  itemId: string;
  itemName: string;
  itemType: string;
  unitPrice: number;
  quantity: number;
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

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = location.state || {};

  // Form state
  const [country] = useState("Vietnam");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [pickupAt, setPickupAt] = useState<Dayjs | null>(null);
  const [returnAt, setReturnAt] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if no items
  useEffect(() => {
    if (!items || items.length === 0) {
      toast.error("No items in cart");
      navigate("/");
    }
  }, [items, navigate]);

  const cartItems: CartItemWithQuantity[] = items || [];

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
    if (!pickupAt || !returnAt) return 0;
    const days = returnAt.diff(pickupAt, "day");
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    const days = calculateRentalDays();
    return calculateSubtotal() * (days || 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!province || !district) {
      toast.error("Please fill in pickup location");
      return;
    }

    if (!pickupAt || !returnAt) {
      toast.error("Please select pickup and return dates");
      return;
    }

    if (returnAt.isBefore(pickupAt)) {
      toast.error("Return date must be after pickup date");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const bookingData = {
        location: {
          country,
          province,
          district,
        },
        pickupAt: pickupAt.toISOString(),
        returnAt: returnAt.toISOString(),
      };

      console.log("Sending booking data:", bookingData);

      const response = await fetch(`${API_BASE_URL}/Bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // ✅ Check if response has content
      const contentType = response.headers.get("content-type");
      let result = null;

      if (contentType && contentType.includes("application/json")) {
        // Response is JSON
        const text = await response.text();
        console.log("Response text:", text);

        if (text) {
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            throw new Error("Invalid JSON response from server");
          }
        }
      } else {
        // Response is not JSON (might be empty or plain text)
        const text = await response.text();
        console.log("Non-JSON response:", text);
      }

      // ✅ Check response status after reading body
      if (!response.ok) {
        throw new Error(result?.message || `Server error: ${response.status}`);
      }

      console.log("Booking created successfully:", result);

      toast.success("Booking created successfully!");

      // Navigate to orders page
      setTimeout(() => {
        navigate("/renter/orders");
      }, 1500);
    } catch (error: unknown) {
      console.error("Error creating booking:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

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
              Back to Cart
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
              <CreditCard size={32} />
              Checkout
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary }}>
              Complete your rental booking
            </Typography>
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            {/* Left - Checkout Form */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={0}
                component="form"
                onSubmit={handleSubmit}
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
                      Pickup Location
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Country"
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
                      label="Province/City"
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
                      label="District/Ward"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Enter district or ward"
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
                      Rental Period
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <DateTimePicker
                      label="Pickup Date & Time"
                      value={pickupAt}
                      onChange={(newValue) => setPickupAt(newValue)}
                      minDateTime={dayjs()}
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

                    <DateTimePicker
                      label="Return Date & Time"
                      value={returnAt}
                      onChange={(newValue) => setReturnAt(newValue)}
                      minDateTime={pickupAt || dayjs()}
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

                    {pickupAt && returnAt && (
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: 2,
                          "& .MuiAlert-icon": {
                            color: colors.status.info,
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Rental Duration: {calculateRentalDays()} days
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
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
                  {loading ? "Processing..." : "Confirm Booking"}
                </Button>
              </Paper>
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
                  Order Summary
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
                        }}
                      >
                        {item.itemType === "Camera" ? (
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
                      Subtotal ({cartItems.length} items)
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
                        Rental Days
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {calculateRentalDays()} days
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
                      Total
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
                    💡 Please review your rental details carefully before
                    confirming
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default CheckoutPage;
