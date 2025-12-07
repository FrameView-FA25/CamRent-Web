import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { getWallet } from "../../../services/wallet.service";
import type { Wallet as WalletType } from "../../../types/wallet.types";
import { toast } from "react-toastify";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const walletData = await getWallet();
      setWallet(walletData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải thông tin ví";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const getTransactionIcon = (isCredit: boolean) => {
    return isCredit ? (
      <TrendingUpIcon sx={{ color: "#10B981", fontSize: 20 }} />
    ) : (
      <TrendingDownIcon sx={{ color: "#EF4444", fontSize: 20 }} />
    );
  };

  const getTransactionColor = (isCredit: boolean) => {
    return isCredit ? "#10B981" : "#EF4444";
  };

  const getTransactionSign = (isCredit: boolean) => {
    return isCredit ? "+" : "-";
  };

  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        minHeight: "100vh",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  bgcolor: "#0D9488",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                }}
              >
                <WalletIcon sx={{ color: "white", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 0.5,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                  }}
                >
                  Ví của tôi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#6B7280", fontSize: "0.95rem" }}
                >
                  Quản lý số dư và lịch sử giao dịch
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={loadWallet}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: "#0D9488",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    bgcolor: "#F0FDFA",
                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.15)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#0D9488" }} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FEF2F2",
              border: "1px solid #FEE2E2",
            }}
          >
            <Typography color="error" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Paper>
        )}

        {/* Balance Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Available Balance Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                bgcolor: alpha("#0D9488", 0.1),
                p: 3,
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <WalletIcon sx={{ color: "#0D9488", fontSize: 24 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Số dư khả dụng
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#0D9488",
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#0D9488" }} />
                ) : (
                  formatCurrency(wallet?.balance ?? 0)
                )}
              </Typography>
            </Box>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "#6B7280", fontSize: "0.875rem" }}
              >
                Số tiền bạn có thể sử dụng ngay
              </Typography>
            </CardContent>
          </Paper>

          {/* Frozen Balance Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                bgcolor: alpha("#F59E0B", 0.1),
                p: 3,
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <LockIcon sx={{ color: "#F59E0B", fontSize: 24 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Số dư đóng băng
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#F59E0B",
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#F59E0B" }} />
                ) : (
                  formatCurrency(wallet?.frozenBalance ?? 0)
                )}
              </Typography>
            </Box>
            <CardContent>
              <Typography
                variant="body2"
                sx={{ color: "#6B7280", fontSize: "0.875rem" }}
              >
                Số tiền đang bị giữ lại
              </Typography>
            </CardContent>
          </Paper>
        </Box>

        {/* Transactions Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid #E5E7EB",
              bgcolor: "#F9FAFB",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#111827",
                fontSize: "1.125rem",
              }}
            >
              Lịch sử giao dịch
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#6B7280", mt: 0.5, fontSize: "0.875rem" }}
            >
              Danh sách các giao dịch gần đây
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Loại
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Mô tả
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Thời gian
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Số tiền
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 8 }}>
                      <CircularProgress sx={{ color: "#0D9488" }} />
                      <Typography
                        sx={{ mt: 2, color: "#6B7280", fontSize: "0.875rem" }}
                      >
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !wallet?.recentTransactions ||
                  wallet.recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 8 }}>
                      <WalletIcon
                        sx={{ fontSize: 64, color: "#E5E7EB", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#374151", mb: 1, fontWeight: 600 }}
                      >
                        Chưa có giao dịch
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}
                      >
                        Lịch sử giao dịch sẽ hiển thị tại đây
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  wallet.recentTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      sx={{
                        "&:hover": {
                          bgcolor: "#F9FAFB",
                        },
                        transition: "background-color 0.2s ease",
                        borderBottom: "1px solid #F3F4F6",
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getTransactionIcon(transaction.isCredit)}
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {transaction.type || "Giao dịch"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "#374151",
                            maxWidth: 300,
                          }}
                        >
                          {transaction.description || "Không có mô tả"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "#6B7280",
                          }}
                        >
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: getTransactionColor(transaction.isCredit),
                          }}
                        >
                          {getTransactionSign(transaction.isCredit)}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default Wallet;
