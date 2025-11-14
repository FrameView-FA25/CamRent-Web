import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
} from "@mui/material";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  MoreVertical,
  Download,
  MessageSquare,
  Camera,
  Calendar,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import { ShoppingCart } from "@mui/icons-material";
interface Order {
  id: string;
  orderNumber: string;
  items: {
    productName: string;
    quantity: number;
    image: string;
  }[];
  status:
    | "pending"
    | "confirmed"
    | "delivering"
    | "delivered"
    | "completed"
    | "cancelled";
  pickupDate: string;
  returnDate: string;
  deliveryAddress: string;
  totalAmount: number;
  depositAmount: number;
  transportFee: number;
  createdAt: string;
}

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ORD-2024-001",
        items: [
          { productName: "Canon EOS R5", quantity: 1, image: "" },
          { productName: "Lens RF 24-70mm", quantity: 1, image: "" },
        ],
        status: "delivering",
        pickupDate: "2024-11-15",
        returnDate: "2024-11-22",
        deliveryAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
        totalAmount: 4500000,
        depositAmount: 2000000,
        transportFee: 100000,
        createdAt: "2024-11-10",
      },
      {
        id: "2",
        orderNumber: "ORD-2024-002",
        items: [{ productName: "Sony A7 IV", quantity: 1, image: "" }],
        status: "completed",
        pickupDate: "2024-11-01",
        returnDate: "2024-11-08",
        deliveryAddress: "456 Lê Lợi, Q.1, TP.HCM",
        totalAmount: 2500000,
        depositAmount: 1000000,
        transportFee: 50000,
        createdAt: "2024-10-28",
      },
      {
        id: "3",
        orderNumber: "ORD-2024-003",
        items: [{ productName: "Nikon Z9", quantity: 1, image: "" }],
        status: "pending",
        pickupDate: "2024-11-20",
        returnDate: "2024-11-27",
        deliveryAddress: "789 Trần Hưng Đạo, Q.5, TP.HCM",
        totalAmount: 4000000,
        depositAmount: 1500000,
        transportFee: 80000,
        createdAt: "2024-11-12",
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    order: Order
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const getStatusInfo = (status: Order["status"]) => {
    const statusMap = {
      pending: {
        label: "Chờ xác nhận",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: <Clock size={16} />,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: colors.status.info,
        bgColor: colors.status.infoLight,
        icon: <CheckCircle size={16} />,
      },
      delivering: {
        label: "Đang giao hàng",
        color: colors.accent.blue,
        bgColor: colors.accent.blueLight,
        icon: <Truck size={16} />,
      },
      delivered: {
        label: "Đã giao hàng",
        color: colors.accent.purple,
        bgColor: colors.accent.purpleLight,
        icon: <Package size={16} />,
      },
      completed: {
        label: "Hoàn thành",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <CheckCircle size={16} />,
      },
      cancelled: {
        label: "Đã hủy",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <XCircle size={16} />,
      },
    };
    return statusMap[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xác nhận", value: "pending" },
    { label: "Đang thuê", value: "active" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab =
      activeTab === 0 ||
      (tabs[activeTab].value === "pending" && order.status === "pending") ||
      (tabs[activeTab].value === "active" &&
        ["confirmed", "delivering", "delivered"].includes(order.status)) ||
      (tabs[activeTab].value === "completed" && order.status === "completed") ||
      (tabs[activeTab].value === "cancelled" && order.status === "cancelled");

    return matchesSearch && matchesTab;
  });

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
            Đơn Hàng
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: <Package size={32} />,
              color: colors.primary.main,
              bgColor: "#E3F2FD",
            },
            {
              label: "Active Rentals",
              value: orders.filter((o) =>
                ["confirmed", "delivering", "delivered"].includes(o.status)
              ).length,
              icon: <Truck size={32} />,
              color: "#FF9800",
              bgColor: "#FFF3E0",
            },
            {
              label: "Completed",
              value: orders.filter((o) => o.status === "completed").length,
              icon: <CheckCircle size={32} />,
              color: "#4CAF50",
              bgColor: "#E8F5E9",
            },
            {
              label: "Pending",
              value: orders.filter((o) => o.status === "pending").length,
              icon: <Clock size={32} />,
              color: "#FFC107",
              bgColor: "#FFFDE7",
            },
          ].map((stat, index) => (
            <Box
              key={index}
              sx={{
                flex: {
                  xs: "1 1 calc(50% - 12px)",
                  sm: "1 1 calc(25% - 18px)",
                },
                minWidth: 0,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  bgcolor: colors.background.paper,
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: colors.text.primary,
                      mb: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Search & Filter */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by order number or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: colors.primary.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </Paper>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTabs-indicator": {
                bgcolor: colors.primary.main,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: colors.text.secondary,
                "&.Mui-selected": {
                  color: colors.primary.main,
                },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Orders List */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 3 }}
              />
            ))}
          </Box>
        ) : filteredOrders.length === 0 ? (
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
              No orders found
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mb: 3 }}
            >
              {searchQuery
                ? "Try adjusting your search"
                : "Start renting camera gear today!"}
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
              onClick={() => navigate("/renter/products")}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <Paper
                  key={order.id}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${colors.border.light}`,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: colors.neutral[50],
                      borderBottom: `1px solid ${colors.border.light}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: colors.text.primary }}
                      >
                        {order.orderNumber}
                      </Typography>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          bgcolor: statusInfo.bgColor,
                          color: statusInfo.color,
                          fontWeight: 600,
                          "& .MuiChip-icon": {
                            color: "inherit",
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        Created: {formatDate(order.createdAt)}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order)}
                      >
                        <MoreVertical size={18} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 3,
                        flexDirection: { xs: "column", md: "row" },
                      }}
                    >
                      {/* Left - Products */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: colors.text.secondary,
                            mb: 2,
                          }}
                        >
                          Products ({order.items.length})
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          {order.items.map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1.5,
                                bgcolor: colors.neutral[50],
                                borderRadius: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 2,
                                  bgcolor: colors.neutral[100],
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Camera size={24} color={colors.neutral[400]} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                  }}
                                >
                                  {item.productName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: colors.text.secondary }}
                                >
                                  Qty: {item.quantity}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      {/* Middle - Rental Info */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: colors.text.secondary,
                            mb: 2,
                          }}
                        >
                          Rental Period
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            <Calendar
                              size={20}
                              color={colors.primary.main}
                              style={{ flexShrink: 0 }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.secondary,
                                  display: "block",
                                }}
                              >
                                Pickup Date
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                }}
                              >
                                {formatDate(order.pickupDate)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            <Calendar
                              size={20}
                              color={colors.status.error}
                              style={{ flexShrink: 0 }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.secondary,
                                  display: "block",
                                }}
                              >
                                Return Date
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                }}
                              >
                                {formatDate(order.returnDate)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            <MapPin
                              size={20}
                              color={colors.accent.blue}
                              style={{ flexShrink: 0 }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.secondary,
                                  display: "block",
                                }}
                              >
                                Delivery Address
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                }}
                              >
                                {order.deliveryAddress}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Right - Payment Info */}
                      <Box
                        sx={{
                          width: { xs: "100%", md: "280px" },
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: colors.text.secondary,
                            mb: 2,
                          }}
                        >
                          Payment Details
                        </Typography>

                        <Box
                          sx={{
                            p: 2,
                            bgcolor: colors.neutral[50],
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.secondary }}
                            >
                              Rental Fee
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: colors.text.primary,
                              }}
                            >
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.secondary }}
                            >
                              Deposit
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: colors.text.primary,
                              }}
                            >
                              {formatCurrency(order.depositAmount)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                              pb: 2,
                              borderBottom: `1px solid ${colors.border.light}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.secondary }}
                            >
                              Transport Fee
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: colors.text.primary,
                              }}
                            >
                              {formatCurrency(order.transportFee)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                color: colors.text.primary,
                              }}
                            >
                              Total
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: colors.primary.main,
                              }}
                            >
                              {formatCurrency(
                                order.totalAmount +
                                  order.depositAmount +
                                  order.transportFee
                              )}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Eye size={18} />}
                          sx={{
                            mt: 2,
                            borderColor: colors.border.light,
                            color: colors.text.primary,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: colors.primary.main,
                              bgcolor: colors.primary.lighter,
                            },
                          }}
                          onClick={() =>
                            navigate(`/renter/my-orders/${order.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
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
              navigate(`/renter/orders/${selectedOrder?.id}`);
              handleMenuClose();
            }}
          >
            <Eye size={16} style={{ marginRight: 8 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Download size={16} style={{ marginRight: 8 }} />
            Download Invoice
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <MessageSquare size={16} style={{ marginRight: 8 }} />
            Contact Support
          </MenuItem>
          {selectedOrder?.status === "pending" && (
            <MenuItem
              onClick={handleMenuClose}
              sx={{ color: colors.status.error }}
            >
              <XCircle size={16} style={{ marginRight: 8 }} />
              Cancel Order
            </MenuItem>
          )}
        </Menu>
      </Container>
    </Box>
  );
};

export default OrderPage;
