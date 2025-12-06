/**
 * WalletBalance Component
 * Displays wallet balance and statistics
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Pending,
  AccountBalance,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";
import type { Wallet, WalletStats } from "../../types/wallet.types";

interface WalletBalanceProps {
  wallet: Wallet | null;
  stats: WalletStats | null;
  loading?: boolean;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({
  wallet,
  stats,
  loading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          color: "white",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(249, 115, 22, 0.25)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Skeleton
            variant="text"
            width={150}
            height={30}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
          />
          <Skeleton
            variant="text"
            width={250}
            height={60}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mt: 2,
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                height={80}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 2,
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
        color: "white",
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(249, 115, 22, 0.25)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
        },
      }}
    >
      <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          mb={3}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AccountBalanceWallet sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600}>
                Số dư ví
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight={700} letterSpacing={-1}>
              {wallet ? formatCurrency(wallet.balance) : "0 ₫"}
            </Typography>
          </Box>
          <Chip
            label={wallet?.status || "Active"}
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.25)",
              color: "white",
              fontWeight: 600,
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <TrendingUp sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Tổng nạp
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {stats ? formatCurrency(stats.totalDeposit) : "0 ₫"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <TrendingDown sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Tổng rút
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {stats ? formatCurrency(stats.totalWithdraw) : "0 ₫"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AccountBalance sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Tổng chi
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {stats ? formatCurrency(stats.totalSpent) : "0 ₫"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Pending sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Chờ xử lý
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {stats ? formatCurrency(stats.pendingAmount) : "0 ₫"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
