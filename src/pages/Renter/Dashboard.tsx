import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  TrendingUp,
  ShoppingCart,
  Star,
  ArrowRight,
  Clock,
  Shield,
  Award,
  Heart,
  Package,
  CheckCircle,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import { useAuth } from "../../hooks/useAuth";

interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  popular: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface RecentOrder {
  id: string;
  productName: string;
  status: string;
  date: string;
  total: number;
}

const RenterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - Recent Orders
  const recentOrders: RecentOrder[] = [
    {
      id: "ORD-001",
      productName: "Canon EOS R5",
      status: "Đang giao",
      date: "2024-11-10",
      total: 3000000,
    },
    {
      id: "ORD-002",
      productName: "Sony A7 IV",
      status: "Hoàn thành",
      date: "2024-11-05",
      total: 2500000,
    },
  ];

  // Featured Products
  const featuredProducts: FeaturedProduct[] = [
    {
      id: "1",
      name: "Canon EOS R5",
      category: "Camera",
      price: 3000000,
      rating: 4.8,
      reviews: 156,
      image: "/products/canon-r5.jpg",
      popular: true,
    },
    {
      id: "2",
      name: "Sony A7 IV",
      category: "Camera",
      price: 2500000,
      rating: 4.9,
      reviews: 203,
      image: "/products/sony-a7iv.jpg",
      popular: true,
    },
    {
      id: "3",
      name: "Nikon Z9",
      category: "Camera",
      price: 4000000,
      rating: 4.7,
      reviews: 89,
      image: "/products/nikon-z9.jpg",
      popular: false,
    },
    {
      id: "4",
      name: "Lens RF 24-70mm",
      category: "Lens",
      price: 1500000,
      rating: 4.6,
      reviews: 124,
      image: "/products/lens-rf.jpg",
      popular: false,
    },
  ];

  // Categories
  const categories: Category[] = [
    {
      id: "1",
      name: "Cameras",
      icon: <Camera size={28} />,
      count: 45,
      color: colors.primary.main,
    },
    {
      id: "2",
      name: "Lenses",
      icon: <TrendingUp size={28} />,
      count: 78,
      color: colors.accent.blue,
    },
    {
      id: "3",
      name: "Lighting",
      icon: <ShoppingCart size={28} />,
      count: 32,
      color: colors.status.warning,
    },
    {
      id: "4",
      name: "Accessories",
      icon: <Package size={28} />,
      count: 156,
      color: colors.accent.purple,
    },
  ];

  // Stats
  const stats = [
    {
      label: "Active Rentals",
      value: "2",
      icon: <ShoppingCart size={24} />,
      color: colors.primary.main,
      bgColor: colors.primary.lighter,
      trend: "+1 this week",
    },
    {
      label: "Completed Orders",
      value: "12",
      icon: <CheckCircle size={24} />,
      color: colors.status.success,
      bgColor: colors.status.successLight,
      trend: "All time",
    },
    {
      label: "Saved Items",
      value: "8",
      icon: <Heart size={24} />,
      color: colors.status.error,
      bgColor: colors.status.errorLight,
      trend: "In wishlist",
    },
    {
      label: "Loyalty Points",
      value: "1,250",
      icon: <Award size={24} />,
      color: colors.secondary.main,
      bgColor: colors.secondary.light,
      trend: "Can redeem",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang giao":
        return colors.status.info;
      case "Hoàn thành":
        return colors.status.success;
      case "Đã hủy":
        return colors.status.error;
      default:
        return colors.neutral[500];
    }
  };

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
            }}
          >
            Welcome back, {user?.fullName || "Renter"}! 👋
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Explore premium camera gear and manage your rentals
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 5,
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                flex: {
                  xs: "1 1 100%",
                  sm: "1 1 calc(50% - 12px)",
                  lg: "1 1 calc(25% - 18px)",
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
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "start", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
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
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary, mb: 0.5 }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: colors.text.primary }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary, mt: 0.5 }}
                    >
                      {stat.trend}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 5,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search for cameras, lenses, accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: colors.primary.main }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: colors.primary.main,
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                    }}
                    onClick={() => navigate("/renter/products")}
                  >
                    Search
                  </Button>
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

        {/* Main Content - 2 Columns */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Left Column */}
          <Box sx={{ flex: 1 }}>
            {/* Categories */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: colors.text.primary }}
                >
                  Browse by Category
                </Typography>
                <Button
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    color: colors.primary.main,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => navigate("/renter/products")}
                >
                  View All
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {categories.map((category) => (
                  <Box
                    key={category.id}
                    sx={{
                      flex: {
                        xs: "1 1 calc(50% - 8px)",
                        sm: "1 1 calc(25% - 12px)",
                      },
                      minWidth: 0,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: `1px solid ${colors.border.light}`,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          borderColor: category.color,
                          boxShadow: `0 8px 16px ${category.color}20`,
                        },
                      }}
                      onClick={() => navigate("/renter/products")}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          bgcolor: `${category.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: category.color,
                          mb: 1.5,
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: colors.text.primary,
                          mb: 0.5,
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.text.secondary }}
                      >
                        {category.count} items
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Featured Products */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: colors.text.primary }}
                >
                  Featured Products
                </Typography>
                <Button
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    color: colors.primary.main,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => navigate("/renter/products")}
                >
                  View All
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexWrap: "wrap",
                }}
              >
                {featuredProducts.map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      flex: {
                        xs: "1 1 100%",
                        sm: "1 1 calc(50% - 12px)",
                      },
                      minWidth: 0,
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: `1px solid ${colors.border.light}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 180,
                            bgcolor: colors.neutral[100],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Camera size={60} color={colors.neutral[300]} />
                        </CardMedia>

                        {product.popular && (
                          <Chip
                            label="Popular"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              bgcolor: colors.primary.main,
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        )}

                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "white",
                            boxShadow: 1,
                            "&:hover": {
                              bgcolor: colors.status.errorLight,
                              color: colors.status.error,
                            },
                          }}
                        >
                          <Heart size={18} />
                        </IconButton>
                      </Box>

                      <CardContent sx={{ p: 2.5 }}>
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{
                            bgcolor: colors.primary.lighter,
                            color: colors.primary.main,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            mb: 1,
                          }}
                        />

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: colors.text.primary,
                            mb: 1,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Star
                              size={16}
                              fill={colors.secondary.main}
                              color={colors.secondary.main}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: colors.text.primary,
                              }}
                            >
                              {product.rating}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.text.secondary }}
                          >
                            ({product.reviews} reviews)
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: colors.primary.main,
                              }}
                            >
                              {formatCurrency(product.price)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: colors.text.secondary }}
                            >
                              /day
                            </Typography>
                          </Box>

                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              bgcolor: colors.primary.main,
                              color: "white",
                              textTransform: "none",
                              fontWeight: 600,
                              px: 2,
                              "&:hover": {
                                bgcolor: colors.primary.dark,
                              },
                            }}
                            onClick={() =>
                              navigate(`/renter/products/${product.id}`)
                            }
                          >
                            Rent Now
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right Column - Recent Orders & Quick Actions */}
          <Box sx={{ width: { xs: "100%", lg: "400px" }, flexShrink: 0 }}>
            {/* Recent Orders */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.text.primary }}
                >
                  Recent Orders
                </Typography>
                <Button
                  size="small"
                  sx={{
                    color: colors.primary.main,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => navigate("/renter/orders")}
                >
                  View All
                </Button>
              </Box>

              {recentOrders.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Package size={48} color={colors.neutral[300]} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary, mt: 2 }}
                  >
                    No recent orders
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {recentOrders.map((order) => (
                    <Paper
                      key={order.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: colors.neutral[50],
                        borderRadius: 2,
                        border: `1px solid ${colors.border.light}`,
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: colors.primary.main,
                        },
                      }}
                      onClick={() => navigate(`/renter/orders/${order.id}`)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.text.primary }}
                        >
                          {order.productName}
                        </Typography>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(order.status)}15`,
                            color: getStatusColor(order.status),
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.secondary,
                          display: "block",
                          mb: 1,
                        }}
                      >
                        {order.id} • {order.date}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: colors.primary.main }}
                      >
                        {formatCurrency(order.total)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Quick Actions */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Quick Actions
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Camera size={20} />}
                  sx={{
                    borderColor: colors.border.light,
                    color: colors.text.primary,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: colors.primary.main,
                      bgcolor: colors.primary.lighter,
                    },
                  }}
                  onClick={() => navigate("/renter/products")}
                >
                  Browse All Products
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Heart size={20} />}
                  sx={{
                    borderColor: colors.border.light,
                    color: colors.text.primary,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: colors.status.error,
                      bgcolor: colors.status.errorLight,
                    },
                  }}
                  onClick={() => navigate("/renter/favorites")}
                >
                  View Saved Items
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ShoppingCart size={20} />}
                  sx={{
                    borderColor: colors.border.light,
                    color: colors.text.primary,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: colors.accent.blue,
                      bgcolor: colors.accent.blueLight,
                    },
                  }}
                  onClick={() => navigate("/renter/cart")}
                >
                  Go to Cart
                </Button>
              </Box>
            </Paper>

            {/* Membership Progress */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                background: `linear-gradient(135deg, ${colors.primary.lighter} 0%, ${colors.background.paper} 100%)`,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: colors.secondary.main,
                  }}
                >
                  <Award size={28} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: colors.text.primary }}
                  >
                    Silver Member
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    1,250 / 2,000 points
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={62.5}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: colors.neutral[200],
                  "& .MuiLinearProgress-bar": {
                    bgcolor: colors.secondary.main,
                    borderRadius: 4,
                  },
                }}
              />

              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary, display: "block", mt: 1 }}
              >
                750 points to Gold Member
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Why Choose Us */}
        <Paper
          elevation={0}
          sx={{
            mt: 5,
            p: 5,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            background: `linear-gradient(135deg, ${colors.primary.lighter} 0%, ${colors.background.paper} 100%)`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 4,
              textAlign: "center",
            }}
          >
            Why Choose CamRent?
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 21.333px)" },
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: colors.status.successLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <Shield size={40} color={colors.status.success} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
              >
                Trusted Equipment
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                All equipment is professionally maintained and insured
              </Typography>
            </Box>

            <Box
              sx={{
                flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 21.333px)" },
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: colors.status.infoLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <Clock size={40} color={colors.status.info} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
              >
                Flexible Rental
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Rent by day, week, or month with easy booking
              </Typography>
            </Box>

            <Box
              sx={{
                flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 21.333px)" },
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: colors.secondary.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                <Award size={40} color={colors.secondary.main} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
              >
                24/7 Support
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Our team is always ready to help you anytime
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RenterDashboard;
