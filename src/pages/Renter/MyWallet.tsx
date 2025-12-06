/**
 * MyWallet Page
 * Main page for wallet management
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { NavigateNext, Home } from "@mui/icons-material";
import { Link, useSearchParams } from "react-router-dom";
import { colors } from "../../theme/colors";
import WalletBalance from "../../components/Wallet/WalletBalance";
import WalletActions from "../../components/Wallet/WalletActions";
import TransactionList from "../../components/Wallet/TransactionList";
import DepositDialog from "../../components/Wallet/DepositDialog";
import WithdrawDialog from "../../components/Wallet/WithdrawDialog";
import {
  getWallet,
  getWalletStats,
  getTransactions,
} from "../../services/wallet.service";
import type {
  Wallet,
  WalletStats,
  Transaction,
  TransactionListResponse,
} from "../../types/wallet.types";

const MyWallet: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for wallet data
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // State for loading
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // State for dialogs
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  // State for pagination and filters
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<
    Transaction["type"] | undefined
  >();
  const [statusFilter, setStatusFilter] = useState<
    Transaction["status"] | undefined
  >();

  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Check for deposit/withdraw success/cancel from URL params
  useEffect(() => {
    const depositStatus = searchParams.get("deposit");
    const withdrawStatus = searchParams.get("withdraw");

    if (depositStatus === "success") {
      showNotification("Nạp tiền thành công!", "success");
      searchParams.delete("deposit");
      setSearchParams(searchParams);
      loadWalletData();
    } else if (depositStatus === "cancel") {
      showNotification("Đã hủy nạp tiền", "info");
      searchParams.delete("deposit");
      setSearchParams(searchParams);
    }

    if (withdrawStatus === "success") {
      showNotification("Yêu cầu rút tiền đã được gửi!", "success");
      searchParams.delete("withdraw");
      setSearchParams(searchParams);
      loadWalletData();
    }
  }, [searchParams]);

  // Load wallet and stats data
  const loadWalletData = async () => {
    setLoadingWallet(true);
    try {
      const [walletData, statsData] = await Promise.all([
        getWallet(),
        getWalletStats(),
      ]);
      setWallet(walletData);
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading wallet data:", error);
      showNotification(error.message || "Không thể tải thông tin ví", "error");
    } finally {
      setLoadingWallet(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response: TransactionListResponse = await getTransactions({
        type: typeFilter,
        status: statusFilter,
        page: page + 1, // API uses 1-based pagination
        pageSize,
      });
      setTransactions(response.items);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      console.error("Error loading transactions:", error);
      showNotification(
        error.message || "Không thể tải lịch sử giao dịch",
        "error"
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWalletData();
  }, []);

  // Load transactions when filters change
  useEffect(() => {
    loadTransactions();
  }, [page, pageSize, typeFilter, statusFilter]);

  const showNotification = (
    message: string,
    severity: "success" | "error" | "info"
  ) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleDepositSuccess = () => {
    loadWalletData();
    loadTransactions();
    showNotification("Đang xử lý yêu cầu nạp tiền...", "info");
  };

  const handleWithdrawSuccess = () => {
    loadWalletData();
    loadTransactions();
    showNotification("Yêu cầu rút tiền đã được gửi!", "success");
  };

  const handleFilterChange = (
    type?: Transaction["type"],
    status?: Transaction["status"]
  ) => {
    setTypeFilter(type);
    setStatusFilter(status);
    setPage(0); // Reset to first page when filtering
  };

  const handleViewHistory = () => {
    // Scroll to transaction list
    const element = document.getElementById("transaction-list");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: colors.background.default,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/renter/dashboard"
            sx={{
              display: "flex",
              alignItems: "center",
              color: colors.text.secondary,
              textDecoration: "none",
              "&:hover": {
                color: colors.primary.main,
              },
            }}
          >
            <Home sx={{ mr: 0.5, fontSize: 20 }} />
            Trang chủ
          </MuiLink>
          <Typography color={colors.text.primary} fontWeight={600}>
            Ví của tôi
          </Typography>
        </Breadcrumbs>

        {/* Page Title */}
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight={700}
            color={colors.text.primary}
            mb={1}
          >
            Ví của tôi
          </Typography>
          <Typography variant="body1" color={colors.text.secondary}>
            Quản lý tài chính và giao dịch của bạn
          </Typography>
        </Box>

        {/* Wallet Balance Card */}
        <Box mb={4}>
          <WalletBalance
            wallet={wallet}
            stats={stats}
            loading={loadingWallet}
          />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Actions */}
          <Grid item xs={12} md={4} lg={3}>
            <WalletActions
              onDeposit={() => setDepositDialogOpen(true)}
              onWithdraw={() => setWithdrawDialogOpen(true)}
              onViewHistory={handleViewHistory}
              disabled={loadingWallet || !wallet}
            />
          </Grid>

          {/* Right Column - Transaction List */}
          <Grid item xs={12} md={8} lg={9}>
            <Box id="transaction-list">
              <TransactionList
                transactions={transactions}
                loading={loadingTransactions}
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(0);
                }}
                onFilterChange={handleFilterChange}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Deposit Dialog */}
      <DepositDialog
        open={depositDialogOpen}
        onClose={() => setDepositDialogOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      {/* Withdraw Dialog */}
      <WithdrawDialog
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        onSuccess={handleWithdrawSuccess}
        currentBalance={wallet?.balance || 0}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{
            width: "100%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: 2,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyWallet;
