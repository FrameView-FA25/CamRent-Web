import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Divider,
  Checkbox,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Camera,
  Package,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import { toast } from "react-toastify";

interface CartItem {
  itemId: string;
  itemName: string;
  itemType: string; // "Camera" or "Accessory"
  quantity: number;
  unitPrice: number;
}

interface CartResponse {
  id: string;
  items: CartItem[];
  totalPrice: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch cart items
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/Bookings/GetCard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      console.log("Cart data:", data);

      setCartData(data);
      // Auto select all items
      if (data.items) {
        setSelectedItems(data.items.map((item: CartItem) => item.itemId));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");
      const item = cartData?.items.find((i) => i.itemId === itemId);

      if (!item) return;

      const response = await fetch(`${API_BASE_URL}/Bookings/AddToCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: itemId,
          type: item.itemType === "Camera" ? 1 : 2,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Refresh cart
      await fetchCart();
      toast.success("Cart updated successfully");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/Bookings/RemoveFromCart/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      // Refresh cart
      await fetchCart();
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (!cartData?.items) return;

    if (selectedItems.length === cartData.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartData.items.map((item) => item.itemId));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateSubtotal = () => {
    if (!cartData?.items) return 0;
    return cartData.items
      .filter((item) => selectedItems.includes(item.itemId))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("Please select items to checkout");
      return;
    }

    // Navigate to checkout with selected items
    navigate("/renter/checkout", {
      state: {
        items: cartData?.items.filter((item) =>
          selectedItems.includes(item.itemId)
        ),
        cartId: cartData?.id,
      },
    });
  };

  if (loading) {
    return (
      <Box
        sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}
      >
        <Container maxWidth="xl">
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ mb: 3, borderRadius: 2 }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ flex: 1, borderRadius: 3 }}
            />
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ width: 400, borderRadius: 3 }}
            />
          </Box>
        </Container>
      </Box>
    );
  }

  const cartItems = cartData?.items || [];

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <ShoppingCart size={32} />
            Shopping Cart
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            {cartItems.length} items in your cart
          </Typography>
        </Box>

        {cartItems.length === 0 ? (
          // Empty Cart
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              textAlign: "center",
            }}
          >
            <ShoppingCart size={64} color={colors.neutral[300]} />
            <Typography
              variant="h6"
              sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
            >
              Your cart is empty
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mb: 3 }}
            >
              Start adding items to your cart
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
              Browse Products
            </Button>
          </Paper>
        ) : (
          // Cart Items
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            {/* Left - Items List */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  overflow: "hidden",
                }}
              >
                {/* Select All Header */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: colors.neutral[50],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Checkbox
                    checked={
                      selectedItems.length === cartItems.length &&
                      cartItems.length > 0
                    }
                    onChange={handleSelectAll}
                    sx={{
                      color: colors.primary.main,
                      "&.Mui-checked": {
                        color: colors.primary.main,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    Select All ({cartItems.length} items)
                  </Typography>
                </Box>

                {/* Items */}
                <Box sx={{ p: 2 }}>
                  {cartItems.map((item) => (
                    <Box
                      key={item.itemId}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: colors.background.paper,
                        borderRadius: 2,
                        border: `1px solid ${
                          selectedItems.includes(item.itemId)
                            ? colors.primary.main
                            : colors.border.light
                        }`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "start",
                        }}
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedItems.includes(item.itemId)}
                          onChange={() => handleSelectItem(item.itemId)}
                          sx={{
                            color: colors.primary.main,
                            "&.Mui-checked": {
                              color: colors.primary.main,
                            },
                          }}
                        />

                        {/* Product Image */}
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            bgcolor: colors.neutral[100],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.itemType === "Camera" ? (
                            <Camera size={40} color={colors.neutral[400]} />
                          ) : (
                            <Package size={40} color={colors.neutral[400]} />
                          )}
                        </Box>

                        {/* Product Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                              mb: 1,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 700,
                                  color: colors.text.primary,
                                  mb: 0.5,
                                }}
                              >
                                {item.itemName}
                              </Typography>
                              <Chip
                                label={item.itemType}
                                size="small"
                                sx={{
                                  bgcolor: colors.primary.lighter,
                                  color: colors.primary.main,
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              />
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(item.itemId)}
                              disabled={updating}
                              sx={{
                                color: colors.status.error,
                                "&:hover": {
                                  bgcolor: colors.status.errorLight,
                                },
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 2,
                              mt: 2,
                            }}
                          >
                            {/* Quantity */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.itemId,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1 || updating}
                                sx={{
                                  border: `1px solid ${colors.border.light}`,
                                  borderRadius: 1,
                                }}
                              >
                                <Minus size={16} />
                              </IconButton>

                              <Typography
                                sx={{
                                  px: 2,
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                  minWidth: 40,
                                  textAlign: "center",
                                }}
                              >
                                {item.quantity}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.itemId,
                                    item.quantity + 1
                                  )
                                }
                                disabled={updating}
                                sx={{
                                  border: `1px solid ${colors.border.light}`,
                                  borderRadius: 1,
                                }}
                              >
                                <Plus size={16} />
                              </IconButton>
                            </Box>

                            {/* Price */}
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: colors.primary.main,
                                }}
                              >
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: colors.text.secondary }}
                              >
                                {formatCurrency(item.unitPrice)} / day
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Right - Order Summary */}
            <Box sx={{ width: { xs: "100%", lg: "400px" }, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  position: "sticky",
                  top: 20,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
                >
                  Order Summary
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      Subtotal ({selectedItems.length} items)
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      bgcolor: colors.primary.lighter,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: colors.text.primary }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: colors.primary.main }}
                    >
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowRight size={20} />}
                  disabled={selectedItems.length === 0}
                  sx={{
                    bgcolor: colors.primary.main,
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    mb: 2,
                    "&:hover": {
                      bgcolor: colors.primary.dark,
                    },
                    "&:disabled": {
                      bgcolor: colors.neutral[300],
                    },
                  }}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderColor: colors.border.light,
                    color: colors.text.primary,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      borderColor: colors.primary.main,
                      bgcolor: colors.primary.lighter,
                    },
                  }}
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </Button>

                {/* Info */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: colors.status.infoLight,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                    <Calendar size={20} color={colors.status.info} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      Rental Period
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    You can select rental dates during checkout
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CartPage;
