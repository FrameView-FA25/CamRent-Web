import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  X,
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
import { useCartContext } from "../../context/CartContext/useCartContext";
interface CartItem {
  itemId: string;
  itemName: string;
  itemType: string;
  unitPrice: number;
}

interface CartResponse {
  id: string;
  items: CartItem[];
  totalPrice: number;
}

interface CartItemWithQuantity extends CartItem {
  quantity: number;
}

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CartModal: React.FC<CartModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { refreshCart: refreshCartCount } = useCartContext();

  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

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
      setCartData(data);

      if (data.items) {
        const quantities: Record<string, number> = {};
        data.items.forEach((item: CartItem) => {
          quantities[item.itemId] = 1;
        });
        setItemQuantities(quantities);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  };

  const handleRemoveItem = async (itemId: string, itemType: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/Bookings/RemoveFromCart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: itemId,
          type: itemType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Remove item error:", errorText);
        throw new Error("Failed to remove item");
      }

      // ✅ Remove item from local state
      setCartData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((item) => item.itemId !== itemId),
        };
      });

      // ✅ Remove quantity tracking
      setItemQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[itemId];
        return newQuantities;
      });

      toast.success("Đã xoá sản phẩm khỏi giỏ hàng");

      // ✅ Refresh cart to get updated data
      await fetchCart();
      await refreshCartCount();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // ✅ Calculate total for ALL items (no selection needed)
  const calculateTotal = () => {
    if (!cartData?.items) return 0;
    return cartData.items.reduce((sum, item) => {
      const quantity = itemQuantities[item.itemId] || 1;
      return sum + item.unitPrice * quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (!cartData?.items || cartData.items.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    // ✅ All items go to checkout
    const itemsWithQuantities: CartItemWithQuantity[] = cartData.items.map(
      (item) => ({
        ...item,
        quantity: itemQuantities[item.itemId] || 1,
      })
    );

    onClose();
    navigate("/checkout", {
      state: {
        items: itemsWithQuantities,
        cartId: cartData?.id,
      },
    });
  };

  const cartItems = cartData?.items || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border.light}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShoppingCart size={24} color={colors.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Shopping Cart
          </Typography>
          <Chip
            label={`${cartItems.length} items`}
            size="small"
            sx={{
              bgcolor: colors.primary.lighter,
              color: colors.primary.main,
              fontWeight: 600,
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
          </Box>
        ) : cartItems.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
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
              onClick={() => {
                onClose();
                navigate("/products");
              }}
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 3 }}>
            {/* Left - Items List */}
            <Box sx={{ flex: 1 }}>
              {/* Items List */}
              <Box
                sx={{
                  maxHeight: "550px",
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    bgcolor: colors.neutral[100],
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: colors.neutral[300],
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: colors.neutral[400],
                    },
                  },
                }}
              >
                {cartItems.map((item) => {
                  const quantity = itemQuantities[item.itemId] || 1;

                  return (
                    <Box
                      key={item.itemId}
                      sx={{
                        p: 2.5,
                        mb: 2,
                        bgcolor: colors.background.paper,
                        borderRadius: 2,
                        border: `1px solid ${colors.border.light}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          borderColor: colors.primary.main,
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 2.5, alignItems: "start" }}
                      >
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
                                  height: 24,
                                }}
                              />
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRemoveItem(item.itemId, item.itemType)
                              }
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
                              mt: 2,
                            }}
                          >
                            {/* Quantity Controls */}
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
                                    quantity - 1
                                  )
                                }
                                disabled={quantity <= 1}
                                sx={{
                                  border: `1px solid ${colors.border.light}`,
                                  borderRadius: 1,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                <Minus size={16} />
                              </IconButton>

                              <Typography
                                sx={{
                                  px: 2,
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  minWidth: 40,
                                  textAlign: "center",
                                }}
                              >
                                {quantity}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.itemId,
                                    quantity + 1
                                  )
                                }
                                sx={{
                                  border: `1px solid ${colors.border.light}`,
                                  borderRadius: 1,
                                  width: 32,
                                  height: 32,
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
                                {formatCurrency(item.unitPrice * quantity)}
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
                  );
                })}
              </Box>
            </Box>

            {/* Right - Checkout Summary */}
            <Box sx={{ width: 360, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${colors.border.light}`,
                  position: "sticky",
                  top: 0,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
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
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      Subtotal ({cartItems.length} items)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(calculateTotal())}
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
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: colors.primary.main }}
                    >
                      {formatCurrency(calculateTotal())}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowRight size={20} />}
                  disabled={cartItems.length === 0}
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
                  onClick={() => {
                    onClose();
                    navigate("/products");
                  }}
                >
                  Continue Shopping
                </Button>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: colors.status.infoLight,
                    borderRadius: 2,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "start",
                  }}
                >
                  <Calendar
                    size={20}
                    color={colors.status.info}
                    style={{ flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                        mb: 0.5,
                      }}
                    >
                      Rental Period
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      You can select rental dates during checkout
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
