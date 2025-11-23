import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import {
  Search,
  ShoppingCart,
  LocalShipping,
  Assignment,
} from "@mui/icons-material";

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: <Search sx={{ fontSize: 60 }} />,
      title: "1. Browse Equipment",
      description:
        "Explore our extensive catalog of professional camera equipment. Use filters to find exactly what you need for your project.",
    },
    {
      icon: <ShoppingCart sx={{ fontSize: 60 }} />,
      title: "2. Select & Reserve",
      description:
        "Choose your rental dates, add items to cart, and complete the reservation. We'll confirm availability immediately.",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 60 }} />,
      title: "3. Pick Up or Delivery",
      description:
        "Pick up equipment at our location or opt for delivery service. All gear is tested and ready to use.",
    },
    {
      icon: <Assignment sx={{ fontSize: 60 }} />,
      title: "4. Create & Return",
      description:
        "Use the equipment for your shoot. Return it on the agreed date in the same condition. Simple and hassle-free.",
    },
  ];

  const policies = [
    {
      title: "Reservation Policy",
      items: [
        "Reserve equipment up to 6 months in advance",
        "24-hour cancellation policy for full refund",
        "Valid ID and credit card required",
        "Security deposit may be required for certain items",
      ],
    },
    {
      title: "Rental Periods",
      items: [
        "Daily rentals (24 hours)",
        "Weekly rentals (7 days)",
        "Monthly rentals available",
        "Flexible pickup and return times",
      ],
    },
    {
      title: "Equipment Care",
      items: [
        "All equipment is tested before rental",
        "Insurance options available",
        "Renters responsible for equipment damage",
        "Professional cleaning after each rental",
      ],
    },
  ];

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ mb: 3, fontWeight: 300, color: "#000" }}
          >
            How It Works
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              maxWidth: 800,
              mx: "auto",
              fontSize: "1.1rem",
            }}
          >
            Renting professional camera equipment has never been easier. Follow
            these simple steps to get started with your next project.
          </Typography>
        </Box>

        {/* Steps Section */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 300,
              color: "#000",
            }}
          >
            Simple 4-Step Process
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {steps.map((step, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                  maxWidth: { md: "calc(50% - 12px)" },
                  p: 4,
                  textAlign: "center",
                  border: "1px solid #e0e0e0",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#d4af37",
                    transform: "translateY(-5px)",
                    boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                  },
                }}
              >
                <Box sx={{ color: "#d4af37", mb: 2 }}>{step.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 500, color: "#000" }}
                >
                  {step.title}
                </Typography>
                <Typography sx={{ color: "#666", lineHeight: 1.7 }}>
                  {step.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: "#e0e0e0",
            mb: 10,
          }}
        />

        {/* Policies Section */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 300,
              color: "#000",
            }}
          >
            Rental Policies & Guidelines
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {policies.map((policy, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 4,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fafafa",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 500,
                    color: "#d4af37",
                    borderBottom: "2px solid #d4af37",
                    pb: 1,
                  }}
                >
                  {policy.title}
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {policy.items.map((item, idx) => (
                    <Typography
                      key={idx}
                      component="li"
                      sx={{
                        color: "#666",
                        mb: 1.5,
                        lineHeight: 1.7,
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            mt: 10,
            textAlign: "center",
            p: 6,
            bgcolor: "#f5f5f5",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 400, color: "#000" }}
          >
            Ready to Get Started?
          </Typography>
          <Typography sx={{ mb: 4, color: "#666", fontSize: "1.1rem" }}>
            Browse our equipment catalog and reserve your gear today.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Box
              component="a"
              href="/equipment"
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: "#d4af37",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 1,
                fontWeight: 500,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#c49d2f",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                },
              }}
            >
              Browse Equipment
            </Box>
            <Box
              component="a"
              href="/contact"
              sx={{
                px: 4,
                py: 1.5,
                border: "2px solid #d4af37",
                color: "#d4af37",
                textDecoration: "none",
                borderRadius: 1,
                fontWeight: 500,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(212, 175, 55, 0.1)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Contact Us
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksPage;
