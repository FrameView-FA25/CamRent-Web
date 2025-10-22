import React from "react";
import { Box, Container, Typography, Card, CardMedia } from "@mui/material";

const categories = [
  {
    title: "Drones",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800",
  },
  {
    title: "Lighting",
    img: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800",
  },
  {
    title: "Cameras",
    img: "https://thuvienmuasam.com/uploads/default/original/2X/8/82b7fef36a4202ca4dc7d22ead2892e5a924038c.jpeg",
  },
];

const HomePage: React.FC = () => {
  return (
    <section className="page home-page">
      {/* ===== Hero giữ nguyên thiết kế của bạn ===== */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Capture Without
            <br />
            Owning
          </h1>
          <p className="hero-subtitle">
            Because owning expensive gear is sooo last season.
            <br />
            Rent it, shoot it, slay it.
          </p>
          <div className="hero-buttons">
            <a href="/products" className="btn btn-primary">
              Explore Gears
            </a>
            <a href="/rent" className="btn btn-secondary">
              Rent Now
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://product.hstatic.net/200000354621/product/may-anh-fujifilm-x-t4-kit-18-55-mau-bac-1_4d8855bb7c5a423d821ee2de196d4b18_grande.jpg"
            alt="Fujifilm X-T4 Camera"
          />
        </div>
      </div>

      {/* ===== Categories Section (MUI, không dùng Grid) ===== */}
      <Box
        component="section"
        sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#F9FAFB" }}
      >
        <Container maxWidth="lg">
          {/* Flex layout 3 cột khi rộng, tự xuống hàng khi hẹp */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {categories.map((cat) => (
              <Card
                key={cat.title}
                sx={{
                  position: "relative",
                  width: { xs: "100%", sm: "45%", md: "30%" },
                  overflow: "hidden",
                  borderRadius: 6,
                  boxShadow: 4,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 8,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="384" // ~ h-96
                  image={cat.img}
                  alt={cat.title}
                  sx={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    "&:hover": { transform: "scale(1.08)" },
                  }}
                />

                {/* Overlay gradient */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                  }}
                />

                {/* Title badge giữa đáy */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      backgroundColor: "white",
                      color: "#111827",
                      fontWeight: 600,
                      px: 4,
                      py: 1,
                      borderRadius: 999,
                      boxShadow: 3,
                      fontSize: "1rem",
                    }}
                  >
                    {cat.title}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </section>
  );
};

export default HomePage;
