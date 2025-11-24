import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
  Paper,
} from "@mui/material";
import { Package, Eye, Download, MessageSquare, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import { ShoppingCart } from "@mui/icons-material";
import type { Booking } from "../../types/booking.types";
import { toast } from "react-toastify";
import OrderStats from "../../components/Order/OrderStats";
import OrderFilters from "../../components/Order/OrderFilters";
import OrderCard from "../../components/Order/OrderCard";
import { ORDER_TABS } from "../../utils/order.utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.warning("Please login to view your orders");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Bookings/renterbookings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.items.some(
        (item) =>
          item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.itemId.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab =
      activeTab === 0 || booking.status === ORDER_TABS[activeTab].value;

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PendingApproval").length,
    active: bookings.filter((b) =>
      ["Confirmed", "InProgress"].includes(b.status)
    ).length,
    completed: bookings.filter((b) => b.status === "Completed").length,
  };

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCart sx={{ color: "white", fontSize: 30 }} />
            </Box>
            Đơn Hàng Của Tôi
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Quản lý và theo dõi đơn hàng thuê thiết bị
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchBookings}
                sx={{ fontWeight: 600 }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Stats Overview */}
        <OrderStats stats={stats} />

        {/* Search & Filter */}
        <OrderFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Orders List */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={250}
                sx={{ borderRadius: 3 }}
              />
            ))}
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              textAlign: "center",
            }}
          >
            <Package size={64} color={colors.neutral[300]} />
            <Typography
              variant="h6"
              sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
            >
              Không tìm thấy đơn hàng
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mb: 3 }}
            >
              {searchQuery
                ? "Thử điều chỉnh từ khóa tìm kiếm"
                : "Bắt đầu thuê thiết bị ngay hôm nay!"}
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
              onClick={() => navigate("/products")}
            >
              Xem sản phẩm
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredBookings.map((booking) => (
              <OrderCard
                key={booking.id}
                booking={booking}
                onMenuOpen={(e) => handleMenuOpen(e, booking)}
              />
            ))}
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              navigate(`/renter/my-orders/${selectedBooking?.id}`);
              handleMenuClose();
            }}
          >
            <Eye size={16} style={{ marginRight: 8 }} />
            Xem chi tiết
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Download size={16} style={{ marginRight: 8 }} />
            Tải hóa đơn
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <MessageSquare size={16} style={{ marginRight: 8 }} />
            Liên hệ hỗ trợ
          </MenuItem>
          {selectedBooking?.status === "PendingApproval" && (
            <MenuItem
              onClick={handleMenuClose}
              sx={{ color: colors.status.error }}
            >
              <XCircle size={16} style={{ marginRight: 8 }} />
              Hủy đơn hàng
            </MenuItem>
          )}
        </Menu>
      </Container>
    </Box>
  );
};

export default OrderPage;
