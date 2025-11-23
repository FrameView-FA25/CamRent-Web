import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import {
  Verified,
  Support,
  Inventory,
  LocalOffer,
  Engineering,
  Speed,
} from "@mui/icons-material";

const WhyUsPage: React.FC = () => {
  const features = [
    {
      icon: <Verified sx={{ fontSize: 60 }} />,
      title: "Premium Quality Equipment",
      description:
        "All our camera equipment is regularly maintained and tested to ensure optimal performance. We only stock professional-grade gear from top manufacturers.",
    },
    {
      icon: <Support sx={{ fontSize: 60 }} />,
      title: "Expert Support Team",
      description:
        "Our knowledgeable staff is available to help you choose the right equipment and provide technical support throughout your rental period.",
    },
    {
      icon: <Inventory sx={{ fontSize: 60 }} />,
      title: "Extensive Inventory",
      description:
        "From cameras and lenses to lighting and audio equipment, we have everything you need for any production, all in one place.",
    },
    {
      icon: <LocalOffer sx={{ fontSize: 60 }} />,
      title: "Competitive Pricing",
      description:
        "We offer flexible rental packages with competitive rates. Daily, weekly, and monthly options available to fit your budget and timeline.",
    },
    {
      icon: <Engineering sx={{ fontSize: 60 }} />,
      title: "Professional Service",
      description:
        "We understand the demands of professional production. Our streamlined process ensures you get your equipment when you need it.",
    },
    {
      icon: <Speed sx={{ fontSize: 60 }} />,
      title: "Quick & Easy Process",
      description:
        "Reserve online, pick up or get delivery, and return when done. No complicated paperwork or hidden fees. Simple and transparent.",
    },
  ];

  const testimonials = [
    {
      name: "John Smith",
      role: "Film Director",
      text: "Outstanding service and top-quality equipment. The team is incredibly knowledgeable and always goes above and beyond to ensure we have everything we need for our shoots.",
    },
    {
      name: "Sarah Johnson",
      role: "Photography Studio Owner",
      text: "I've been renting from them for years. Their inventory is extensive, prices are fair, and the equipment is always in perfect condition. Highly recommended!",
    },
    {
      name: "Mike Chen",
      role: "Independent Filmmaker",
      text: "The convenience and reliability are unmatched. From reservation to return, everything is smooth and professional. They've become my go-to rental house.",
    },
  ];

  const stats = [
    { number: "10+", label: "Years Experience" },
    { number: "5000+", label: "Happy Clients" },
    { number: "500+", label: "Equipment Items" },
    { number: "24/7", label: "Support Available" },
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
            Why Choose Us
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
            We're committed to providing the best camera rental experience in
            Southern California. Here's what sets us apart from the competition.
          </Typography>
        </Box>

        {/* Stats Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            mb: 10,
            justifyContent: "center",
          }}
        >
          {stats.map((stat, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                flex: 1,
                p: 4,
                textAlign: "center",
                bgcolor: "#f5f5f5",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h3"
                sx={{ color: "#d4af37", fontWeight: 700, mb: 1 }}
              >
                {stat.number}
              </Typography>
              <Typography sx={{ color: "#666", fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Features Section */}
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
            What Makes Us Different
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
            {features.map((feature, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 16px)" },
                  maxWidth: { md: "calc(33.333% - 16px)" },
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
                <Box sx={{ color: "#d4af37", mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 500, color: "#000" }}
                >
                  {feature.title}
                </Typography>
                <Typography sx={{ color: "#666", lineHeight: 1.7 }}>
                  {feature.description}
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

        {/* Testimonials Section */}
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
            What Our Clients Say
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 4,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fafafa",
                  position: "relative",
                }}
              >
                <Typography
                  sx={{
                    color: "#d4af37",
                    fontSize: "3rem",
                    lineHeight: 0.5,
                    mb: 2,
                  }}
                >
                  "
                </Typography>
                <Typography
                  sx={{
                    color: "#666",
                    lineHeight: 1.7,
                    mb: 3,
                    fontStyle: "italic",
                  }}
                >
                  {testimonial.text}
                </Typography>
                <Box sx={{ borderTop: "2px solid #d4af37", pt: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "#000", mb: 0.5 }}>
                    {testimonial.name}
                  </Typography>
                  <Typography sx={{ color: "#999", fontSize: "0.9rem" }}>
                    {testimonial.role}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
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
            Ready to Experience the Difference?
          </Typography>
          <Typography sx={{ mb: 4, color: "#666", fontSize: "1.1rem" }}>
            Join thousands of satisfied filmmakers and photographers who trust
            us with their equipment needs.
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

export default WhyUsPage;
