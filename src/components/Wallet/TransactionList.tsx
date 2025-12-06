/**
 * TransactionList Component
 * Displays transaction history with filtering and pagination
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  MenuItem,
  Skeleton,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  Payment,
  Refresh,
  KeyboardReturn,
  ShoppingCart,
  FilterList,
} from "@mui/icons-material";
import { colors } from "../../theme/colors";
import type { Transaction } from "../../types/wallet.types";

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onFilterChange?: (
    type?: Transaction["type"],
    status?: Transaction["status"]
  ) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading = false,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
}) => {
  const [typeFilter, setTypeFilter] = useState<Transaction["type"] | "All">(
    "All"
  );
  const [statusFilter, setStatusFilter] = useState<
    Transaction["status"] | "All"
  >("All");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "Deposit":
        return <ArrowDownward sx={{ fontSize: 20 }} />;
      case "Withdraw":
        return <ArrowUpward sx={{ fontSize: 20 }} />;
      case "Payment":
      case "Rental":
        return <Payment sx={{ fontSize: 20 }} />;
      case "Refund":
        return <Refresh sx={{ fontSize: 20 }} />;
      case "Return":
        return <KeyboardReturn sx={{ fontSize: 20 }} />;
      default:
        return <ShoppingCart sx={{ fontSize: 20 }} />;
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "Deposit":
      case "Refund":
      case "Return":
        return colors.status.success;
      case "Withdraw":
      case "Payment":
      case "Rental":
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "Completed":
        return colors.status.success;
      case "Pending":
        return colors.status.warning;
      case "Failed":
      case "Cancelled":
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    const labels = {
      Deposit: "Nạp tiền",
      Withdraw: "Rút tiền",
      Payment: "Thanh toán",
      Refund: "Hoàn tiền",
      Rental: "Thuê thiết bị",
      Return: "Trả thiết bị",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: Transaction["status"]) => {
    const labels = {
      Completed: "Hoàn thành",
      Pending: "Chờ xử lý",
      Failed: "Thất bại",
      Cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  const handleTypeFilterChange = (newType: Transaction["type"] | "All") => {
    setTypeFilter(newType);
    if (onFilterChange) {
      onFilterChange(
        newType === "All" ? undefined : newType,
        statusFilter === "All" ? undefined : statusFilter
      );
    }
  };

  const handleStatusFilterChange = (
    newStatus: Transaction["status"] | "All"
  ) => {
    setStatusFilter(newStatus);
    if (onFilterChange) {
      onFilterChange(
        typeFilter === "All" ? undefined : typeFilter,
        newStatus === "All" ? undefined : newStatus
      );
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ mt: 2, borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight={700} color={colors.text.primary}>
            Lịch sử giao dịch
          </Typography>
          <Chip
            icon={<FilterList />}
            label={`${totalCount} giao dịch`}
            size="small"
            sx={{
              bgcolor: colors.primary.lighter,
              color: colors.primary.main,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <TextField
            select
            size="small"
            label="Loại giao dịch"
            value={typeFilter}
            onChange={(e) =>
              handleTypeFilterChange(
                e.target.value as Transaction["type"] | "All"
              )
            }
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="All">Tất cả</MenuItem>
            <MenuItem value="Deposit">Nạp tiền</MenuItem>
            <MenuItem value="Withdraw">Rút tiền</MenuItem>
            <MenuItem value="Payment">Thanh toán</MenuItem>
            <MenuItem value="Refund">Hoàn tiền</MenuItem>
            <MenuItem value="Rental">Thuê thiết bị</MenuItem>
            <MenuItem value="Return">Trả thiết bị</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Trạng thái"
            value={statusFilter}
            onChange={(e) =>
              handleStatusFilterChange(
                e.target.value as Transaction["status"] | "All"
              )
            }
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="All">Tất cả</MenuItem>
            <MenuItem value="Completed">Hoàn thành</MenuItem>
            <MenuItem value="Pending">Chờ xử lý</MenuItem>
            <MenuItem value="Failed">Thất bại</MenuItem>
            <MenuItem value="Cancelled">Đã hủy</MenuItem>
          </TextField>
        </Stack>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            border: `1px solid ${colors.border.light}`,
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Loại
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Mô tả
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: colors.text.primary }}
                >
                  Số tiền
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.text.primary }}>
                  Thời gian
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color={colors.text.secondary}>
                      Chưa có giao dịch nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow
                    key={transaction.transactionId}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: colors.neutral[50],
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: `${getTransactionColor(
                              transaction.type
                            )}20`,
                            color: getTransactionColor(transaction.type),
                          }}
                        >
                          {getTransactionIcon(transaction.type)}
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={colors.text.primary}
                        >
                          {getTypeLabel(transaction.type)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={colors.text.secondary}>
                        {transaction.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={getTransactionColor(transaction.type)}
                      >
                        {transaction.type === "Deposit" ||
                        transaction.type === "Refund" ||
                        transaction.type === "Return"
                          ? "+"
                          : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(transaction.status)}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(transaction.status)}20`,
                          color: getStatusColor(transaction.status),
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={colors.text.secondary}>
                        {formatDate(transaction.createdDate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) =>
            onPageSizeChange(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default TransactionList;
