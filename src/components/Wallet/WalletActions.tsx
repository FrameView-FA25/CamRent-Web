/**
 * WalletActions Component
 * Action buttons for wallet operations
 */

import React from "react";
import { Box, Button, Stack, Paper, Typography } from "@mui/material";
import {
  AddCircleOutline,
  RemoveCircleOutline,
  History,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";

interface WalletActionsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onViewHistory: () => void;
  disabled?: boolean;
}

const WalletActions: React.FC<WalletActionsProps> = ({
  onDeposit,
  onWithdraw,
  onViewHistory,
  disabled = false,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: colors.background.paper,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        color={colors.text.primary}
        mb={2}
      >
        Thao tác nhanh
      </Typography>

      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<AddCircleOutline />}
          onClick={onDeposit}
          disabled={disabled}
          sx={{
            bgcolor: colors.primary.main,
            color: "white",
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
            "&:hover": {
              bgcolor: colors.primary.dark,
              boxShadow: "0 6px 16px rgba(249, 115, 22, 0.35)",
            },
            "&:disabled": {
              bgcolor: colors.neutral[300],
              color: colors.neutral[500],
            },
          }}
        >
          Nạp tiền vào ví
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<RemoveCircleOutline />}
          onClick={onWithdraw}
          disabled={disabled}
          sx={{
            borderColor: colors.primary.main,
            color: colors.primary.main,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            borderWidth: 2,
            "&:hover": {
              borderColor: colors.primary.dark,
              bgcolor: colors.primary.lighter,
              borderWidth: 2,
            },
            "&:disabled": {
              borderColor: colors.neutral[300],
              color: colors.neutral[500],
            },
          }}
        >
          Rút tiền về tài khoản
        </Button>

        <Button
          variant="text"
          size="large"
          fullWidth
          startIcon={<History />}
          onClick={onViewHistory}
          disabled={disabled}
          sx={{
            color: colors.text.secondary,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": {
              bgcolor: colors.neutral[100],
              color: colors.primary.main,
            },
            "&:disabled": {
              color: colors.neutral[400],
            },
          }}
        >
          Xem lịch sử giao dịch
        </Button>
      </Stack>

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: colors.status.infoLight,
          border: `1px solid ${colors.status.info}20`,
        }}
      >
        <Typography
          variant="caption"
          color={colors.status.info}
          fontWeight={600}
          display="block"
          mb={0.5}
        >
          💡 Lưu ý
        </Typography>
        <Typography variant="caption" color={colors.text.secondary}>
          • Nạp tiền tối thiểu: 10,000 ₫
          <br />
          • Rút tiền tối thiểu: 50,000 ₫
          <br />• Thời gian xử lý: 1-3 ngày làm việc
        </Typography>
      </Box>
    </Paper>
  );
};

export default WalletActions;
