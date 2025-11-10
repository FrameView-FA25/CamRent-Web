import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material";

const DashboardManager: React.FC = () => {
  const statsCards = [
    {
      title: "Total Bookings",
      value: "$8,903",
      icon: <ShowChartIcon sx={{ fontSize: 24 }} />,
      chart: [20, 35, 25, 40, 30, 45, 35],
    },
    {
      title: "Total Status",
      value: "$8,903",
      icon: <ShowChartIcon sx={{ fontSize: 24 }} />,
      chart: [30, 20, 40, 25, 45, 30, 40],
    },
    {
      title: "Total User",
      value: "$8,903",
      icon: <ShowChartIcon sx={{ fontSize: 24 }} />,
      chart: [25, 40, 20, 45, 30, 35, 40],
    },
    {
      title: "Total Orders",
      value: "$8,903",
      icon: <ShowChartIcon sx={{ fontSize: 24 }} />,
      chart: [35, 25, 40, 30, 45, 25, 35],
    },
  ];

  const monthlyRevenue = [
    { week: "Week 01", progress: 85, color: "#EF4444" },
    { week: "Week 01", progress: 92, color: "#F97316" },
    { week: "Week 01", progress: 78, color: "#EF4444" },
    { week: "Week 01", progress: 45, color: "#F59E0B" },
  ];

  const trafficSeller = [
    { price: "$7.31", amount: "0.31", total: "$124.00" },
    { price: "$7.31", amount: "0.31", total: "$25.00" },
    { price: "$7.31", amount: "0.12", total: "$61.00" },
    { price: "$5.72", amount: "0.48", total: "$315.00" },
  ];

  const trendingOrders = [
    {
      name: "Canon R50",
      image:
        "https://cdn.vjshop.vn/may-anh/mirrorless/canon/canon-eos-r50/black-18-45/canon-eos-r50-lens-18-45mm-500x500.jpg",
      orders: "All Orders",
    },
    {
      name: "Sony A7C",
      image:
        "https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-alpha-a7c/sony-a7c-black-1-1000x1000.jpg",
      orders: "All Orders",
    },
    {
      name: "Fujifilm XT30",
      image:
        "https://binhminhdigital.com/storedata/images/product/may-anh-fujifilm-xt5-silver-body-only-chinh-hang-1.jpg",
      orders: "Best Seller",
      isBest: true,
    },
    {
      name: "Canon M50",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Canon_EOS_60D_01.jpg/1200px-Canon_EOS_60D_01.jpg",
      orders: "All Orders",
    },
  ];

  const renderMiniChart = (data: number[], color: string) => {
    const max = Math.max(...data);
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (value / max) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        width="80"
        height="40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#1F2937", mb: 0.5 }}
          >
            Welcome, Jhonny
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Dashboard & Analytics
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Search..."
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            width: 250,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "white",
                border: "1px solid #E5E7EB",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: "#6B7280", mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    {card.value}
                  </Typography>
                </Box>
                {renderMiniChart(card.chart, "#F97316")}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Monthly Revenue & Traffic Seller */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
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
                sx={{ fontWeight: 600, color: "#1F2937" }}
              >
                Monthly Revenue
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                January
              </Typography>
            </Box>
            <Box>
              {monthlyRevenue.map((item, index) => (
                <Box key={index} sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      {item.week}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      height: 12,
                      borderRadius: 2,
                      bgcolor: "#F3F4F6",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: item.color,
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
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
                sx={{ fontWeight: 600, color: "#1F2937" }}
              >
                Traffic Seller
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                January
              </Typography>
            </Box>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  px: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#9CA3AF", fontWeight: 600 }}
                >
                  Price
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#9CA3AF", fontWeight: 600 }}
                >
                  Amount
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#9CA3AF", fontWeight: 600 }}
                >
                  Total
                </Typography>
              </Box>
              {trafficSeller.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1.5,
                    px: 1,
                    borderBottom:
                      index < trafficSeller.length - 1
                        ? "1px solid #F3F4F6"
                        : "none",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#1F2937" }}>
                    {item.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1F2937" }}>
                    {item.amount}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#1F2937", fontWeight: 600 }}
                  >
                    {item.total}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Trending Order & Order Timing Chart */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
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
                sx={{ fontWeight: 600, color: "#1F2937" }}
              >
                Trending Order For Month
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                January
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {trendingOrders.map((order, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid #E5E7EB",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        height: 300,
                        backgroundImage: `url(${order.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1F2937", mb: 0.5 }}
                      >
                        {order.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: order.isBest ? "#F97316" : "#E5E7EB",
                          color: order.isBest ? "white" : "#6B7280",
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {order.orders}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              height: 400,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1F2937", mb: 3 }}
            >
              Order Timing Chart
            </Typography>
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                Chart visualization will be here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              height: 400,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1F2937", mb: 3 }}
            >
              Total Earnings
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "#FFF7ED",
                    borderRadius: 2,
                  }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: 40, color: "#F97316", mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    $6,242
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Today
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "#FFF7ED",
                    borderRadius: 2,
                  }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: 40, color: "#F97316", mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    $54,758
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Month
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardManager;
