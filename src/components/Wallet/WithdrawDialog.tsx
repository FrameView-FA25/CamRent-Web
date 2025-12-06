/**
 * WithdrawDialog Component
 * Dialog for withdrawing money from wallet
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
import { Close as CloseIcon, AccountBalance, Info } from "@mui/icons-material";
import { colors } from "../../theme/colors";
import { withdrawFromWallet } from "../../services/wallet.service";

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

const QUICK_AMOUNTS = [100000, 500000, 1000000, 2000000, 5000000];

const WithdrawDialog: React.FC<WithdrawDialogProps> = ({
  open,
  onClose,
  onSuccess,
  currentBalance,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleQuickAmount = (value: number) => {
    if (value <= currentBalance) {
      setAmount(value.toString());
      setError("");
    } else {
      setError("Số dư không đủ");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
    setError("");
  };

  const handleWithdraw = async () => {
    const amountNumber = parseInt(amount);

    // Validation
    if (!amount || isNaN(amountNumber)) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amountNumber < 50000) {
      setError("Số tiền rút tối thiểu là 50,000 ₫");
      return;
    }

    if (amountNumber > currentBalance) {
      setError("Số dư không đủ");
      return;
    }

    if (!bankAccountNumber.trim()) {
      setError("Vui lòng nhập số tài khoản ngân hàng");
      return;
    }

    if (!bankName.trim()) {
      setError("Vui lòng nhập tên ngân hàng");
      return;
    }

    if (!accountHolderName.trim()) {
      setError("Vui lòng nhập tên chủ tài khoản");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await withdrawFromWallet({
        amount: amountNumber,
        bankAccountNumber: bankAccountNumber.trim(),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
      });

      setSuccess(
        response.message ||
          "Yêu cầu rút tiền đã được gửi. Vui lòng đợi xử lý trong 1-3 ngày làm việc."
      );

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể rút tiền. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount("");
      setBankAccountNumber("");
      setBankName("");
      setAccountHolderName("");
      setError("");
      setSuccess("");
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
                bgcolor: colors.status.warningLight,
                color: colors.status.warning,
              }}
            >
              <AccountBalance />
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color={colors.text.primary}
            >
              Rút tiền về tài khoản
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

          {success && (
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: colors.neutral[50],
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color={colors.text.secondary}>
                Số dư khả dụng:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color={colors.primary.main}
              >
                {formatCurrency(currentBalance)}
              </Typography>
            </Stack>
          </Box>

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
              {QUICK_AMOUNTS.filter((qa) => qa <= currentBalance).map(
                (quickAmount) => (
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
                )
              )}
            </Stack>
          </Box>

          <TextField
            label="Số tiền rút"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            placeholder="Nhập số tiền"
            InputProps={{
              endAdornment: <InputAdornment position="end">₫</InputAdornment>,
            }}
            helperText={`Số tiền rút tối thiểu: 50,000 ₫ - Tối đa: ${formatCurrency(
              currentBalance
            )}`}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: colors.status.infoLight,
              border: `1px solid ${colors.status.info}20`,
            }}
          >
            <Stack direction="row" spacing={1} mb={1}>
              <Info sx={{ fontSize: 20, color: colors.status.info }} />
              <Typography
                variant="body2"
                fontWeight={600}
                color={colors.status.info}
              >
                Thông tin tài khoản nhận
              </Typography>
            </Stack>

            <Stack spacing={2} mt={2}>
              <TextField
                label="Số tài khoản"
                fullWidth
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng"
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                }}
              />

              <TextField
                label="Tên ngân hàng"
                fullWidth
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="VD: Vietcombank, Techcombank, BIDV..."
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                }}
              />

              <TextField
                label="Tên chủ tài khoản"
                fullWidth
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Nhập tên chủ tài khoản"
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                }}
              />
            </Stack>
          </Box>

          {amount && !isNaN(parseInt(amount)) && parseInt(amount) >= 50000 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: colors.status.warningLight,
                border: `1px solid ${colors.status.warning}20`,
              }}
            >
              <Typography
                variant="body2"
                color={colors.text.secondary}
                fontWeight={600}
                mb={1}
              >
                Thông tin rút tiền
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={colors.text.secondary}>
                    Số tiền:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={colors.status.warning}
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
                    Số tiền nhận:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={colors.status.warning}
                  >
                    {formatCurrency(parseInt(amount))}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          <Alert severity="warning">
            <Typography variant="caption">
              Yêu cầu rút tiền sẽ được xử lý trong vòng 1-3 ngày làm việc. Vui
              lòng kiểm tra kỹ thông tin tài khoản trước khi xác nhận.
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
          onClick={handleWithdraw}
          variant="contained"
          disabled={!amount || loading}
          startIcon={
            loading ? <CircularProgress size={20} /> : <AccountBalance />
          }
          sx={{
            bgcolor: colors.status.warning,
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              bgcolor: colors.status.warning,
              filter: "brightness(0.9)",
            },
            "&:disabled": {
              bgcolor: colors.neutral[300],
              color: colors.neutral[500],
            },
          }}
        >
          {loading ? "Đang xử lý..." : "Rút tiền"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawDialog;
