/**
 * DepositDialog Component
 * Dialog for depositing money to wallet
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Alert,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccountBalanceWallet,
  QrCode2,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";
import { depositToWallet } from "../../services/wallet.service";

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const DepositDialog: React.FC<DepositDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
    setError("");
  };

  const handleDeposit = async () => {
    const amountNumber = parseInt(amount);

    // Validation
    if (!amount || isNaN(amountNumber)) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amountNumber < 10000) {
      setError("Số tiền nạp tối thiểu là 10,000 ₫");
      return;
    }

    if (amountNumber > 50000000) {
      setError("Số tiền nạp tối đa là 50,000,000 ₫");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await depositToWallet({
        amount: amountNumber,
        returnUrl: `${window.location.origin}/renter/wallet?deposit=success`,
        cancelUrl: `${window.location.origin}/renter/wallet?deposit=cancel`,
      });

      // Redirect to payment gateway
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        onSuccess();
        handleClose();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể nạp tiền. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: colors.primary.lighter,
                color: colors.primary.main,
              }}
            >
              <AccountBalanceWallet />
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color={colors.text.primary}
            >
              Nạp tiền vào ví
            </Typography>
          </Stack>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              minWidth: "auto",
              p: 1,
              color: colors.text.secondary,
            }}
          >
            <CloseIcon />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography
              variant="body2"
              color={colors.text.secondary}
              fontWeight={600}
              mb={1}
            >
              Chọn nhanh
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Chip
                  key={quickAmount}
                  label={formatCurrency(quickAmount)}
                  onClick={() => handleQuickAmount(quickAmount)}
                  sx={{
                    bgcolor:
                      amount === quickAmount.toString()
                        ? colors.primary.main
                        : colors.neutral[100],
                    color:
                      amount === quickAmount.toString()
                        ? "white"
                        : colors.text.primary,
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor:
                        amount === quickAmount.toString()
                          ? colors.primary.dark
                          : colors.neutral[200],
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <TextField
            label="Số tiền nạp"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            placeholder="Nhập số tiền"
            InputProps={{
              endAdornment: <InputAdornment position="end">₫</InputAdornment>,
            }}
            helperText="Số tiền nạp tối thiểu: 10,000 ₫ - Tối đa: 50,000,000 ₫"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {amount && !isNaN(parseInt(amount)) && parseInt(amount) >= 10000 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: colors.primary.lighter,
                border: `1px solid ${colors.primary.main}20`,
              }}
            >
              <Typography
                variant="body2"
                color={colors.text.secondary}
                fontWeight={600}
                mb={1}
              >
                Thông tin nạp tiền
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={colors.text.secondary}>
                    Số tiền:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={colors.primary.main}
                  >
                    {formatCurrency(parseInt(amount))}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={colors.text.secondary}>
                    Phí giao dịch:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={colors.text.secondary}
                  >
                    Miễn phí
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{
                    pt: 1,
                    borderTop: `1px solid ${colors.border.light}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={colors.text.primary}
                  >
                    Tổng cộng:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={colors.primary.main}
                  >
                    {formatCurrency(parseInt(amount))}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          <Alert severity="info" icon={<QrCode2 />}>
            <Typography variant="caption">
              Sau khi nhấn "Nạp tiền", bạn sẽ được chuyển đến trang thanh toán
              để quét mã QR hoặc chuyển khoản ngân hàng.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          borderTop: `1px solid ${colors.border.light}`,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: colors.text.secondary,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleDeposit}
          variant="contained"
          disabled={!amount || loading}
          startIcon={
            loading ? <CircularProgress size={20} /> : <AccountBalanceWallet />
          }
          sx={{
            bgcolor: colors.primary.main,
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              bgcolor: colors.primary.dark,
            },
            "&:disabled": {
              bgcolor: colors.neutral[300],
              color: colors.neutral[500],
            },
          }}
        >
          {loading ? "Đang xử lý..." : "Nạp tiền"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepositDialog;
