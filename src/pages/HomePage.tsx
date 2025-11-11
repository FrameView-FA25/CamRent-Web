import React from "react";
import { Box, Container, Typography, Card, CardMedia } from "@mui/material";
import CameraModel from "../components/Modal/CameraModal";

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

const partners = [
  {
    name: "Sony",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
  },
  {
    name: "DJI",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7HqMfOlgaKaXJgvnEkXArCT9H7qGFj0h7xw&s",
  },
  {
    name: "Canon",
    logo: "https://logolook.net/wp-content/uploads/2023/03/Canon-Font.png",
  },
  {
    name: "RED",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCb-Bn1ojk7WNxqkoD5AJiosZVvYuGXm-OqQ&s",
  },
];

const HomePage: React.FC = () => {
  return (
    <section className="page home-page">
      {/* ===== Hero Section ===== */}
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
          <CameraModel modelPath="/camera.glb" />
        </div>
      </div>

      {/* ===== Categories Section ===== */}
      <Box
        component="section"
        sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#F9FAFB" }}
      >
        <Container maxWidth="lg">
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
                  height="384"
                  image={cat.img}
                  alt={cat.title}
                  sx={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    "&:hover": { transform: "scale(1.08)" },
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                  }}
                />

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

      {/* ===== Experience Matters Section ===== */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: "#FFFFFF",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: { xs: 4, md: 8 },
            }}
          >
            {/* Left - Image */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="../../public/sony.jpg"
                alt="Professional Camera"
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Right - Content */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "#6B7280",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  mb: 2,
                  display: "block",
                }}
              >
                EXPERIENCE MATTERS
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Gear That Elevates
                <br />
                Your{" "}
                <Box component="span" sx={{ fontStyle: "italic" }}>
                  Creativity
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#4B5563",
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  lineHeight: 1.7,
                  maxWidth: 500,
                }}
              >
                Whether you're a filmmaker, content creator, or photographer we
                make sure you always have access to the latest cameras and
                lenses without breaking the bank. Our gear is professionally
                maintained and curated for creators who care about quality.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===== Trusted Brands Section ===== */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: "#F9FAFB",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: { xs: 4, md: 8 },
            }}
          >
            {/* Left - Content */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "#6B7280",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  mb: 2,
                  display: "block",
                }}
              >
                PREMIUM EQUIPMENT
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Trusted Brands.
                <br />
                Zero Compromises.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#4B5563",
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  lineHeight: 1.7,
                  maxWidth: 500,
                }}
              >
                We partner with the best. Canon, Sony, RED, DJI so you can shoot
                with industry-standard equipment, without the upfront cost.
                Every rental goes through a strict quality check before it
                reaches you.
              </Typography>
            </Box>

            {/* Right - Image */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="../../public/sony1.png"
                alt="Professional Camera Equipment"
                sx={{
                  width: "100%",
                  maxWidth: 500,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===== Our Partners Section ===== */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: "#FFFFFF",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#6B7280",
                fontWeight: 600,
                letterSpacing: 1.5,
                mb: 2,
                display: "block",
              }}
            >
              OUR PARTNER
            </Typography>
          </Box>

          {/* Partner Logos */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 4, md: 6 },
            }}
          >
            {partners.map((partner) => (
              <Box
                key={partner.name}
                sx={{
                  width: { xs: "120px", md: "150px" },
                  height: { xs: "60px", md: "80px" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  filter: "grayscale(100%)",
                  opacity: 0.7,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    filter: "grayscale(0%)",
                    opacity: 1,
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={partner.logo}
                  alt={partner.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </section>
  );
};

export default HomePage;
