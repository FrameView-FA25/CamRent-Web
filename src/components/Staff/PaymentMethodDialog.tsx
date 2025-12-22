import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import { CreditCard, Money } from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";
import { formatCurrency } from "../../utils/booking.utils";

type Props = {
  open: boolean;
  onClose: () => void;
  paymentMethod: "PayOs" | "Cash";
  setPaymentMethod: (m: "PayOs" | "Cash") => void;
  onConfirmPayment: () => void;
  paymentLoading: boolean;
  booking?: Booking | null;
  paymentDetails: { unpaidAmount: number };
};

const PaymentMethodDialog: React.FC<Props> = ({
  open,
  onClose,
  paymentMethod,
  setPaymentMethod,
  onConfirmPayment,
  paymentLoading,
  booking,
  paymentDetails,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
          Chọn phương thức thanh toán
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "PayOs" | "Cash")
            }
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 2,
                border: `2px solid ${
                  paymentMethod === "PayOs" ? "#F97316" : "#E5E7EB"
                }`,
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#F97316",
                  bgcolor: "#FFF7ED",
                },
              }}
              onClick={() => setPaymentMethod("PayOs")}
            >
              <FormControlLabel
                value="PayOs"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CreditCard sx={{ color: "#F97316", fontSize: 28 }} />
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: "#1F2937" }}
                      >
                        Chuyển khoản ngân hàng
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        Thanh toán qua cổng PayOS
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: "100%" }}
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px solid ${
                  paymentMethod === "Cash" ? "#F97316" : "#E5E7EB"
                }`,
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#F97316",
                  bgcolor: "#FFF7ED",
                },
              }}
              onClick={() => setPaymentMethod("Cash")}
            >
              <FormControlLabel
                value="Cash"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Money sx={{ color: "#059669", fontSize: 28 }} />
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: "#1F2937" }}
                      >
                        Tiền mặt
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        Thanh toán trực tiếp bằng tiền mặt
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: "100%" }}
              />
            </Paper>
          </RadioGroup>
        </FormControl>

        {booking && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Số tiền cần thanh toán:
            </Typography>
            <Typography variant="h6" sx={{ color: "#F97316", fontWeight: 700 }}>
              {formatCurrency(paymentDetails.unpaidAmount)}
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#E5E7EB",
            color: "#6B7280",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#9CA3AF",
              bgcolor: "#F9FAFB",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirmPayment}
          variant="contained"
          disabled={paymentLoading}
          sx={{
            bgcolor: "#F97316",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#EA580C",
            },
          }}
        >
          {paymentLoading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Xác nhận thanh toán"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentMethodDialog;
