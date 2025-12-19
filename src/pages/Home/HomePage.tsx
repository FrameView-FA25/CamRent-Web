// filepath: d:\Capstone\CamRent-Web\src\pages\Home\HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Rating,
  Card,
  CircularProgress,
} from "@mui/material";
import CameraModel from "../../components/Modal/CameraModal";
import { FormatQuote } from "@mui/icons-material";
import ThreeDCarousel from "../../components/ui/3d-carousel";
import {
  getHomeBlocks,
  getFeedbacks,
  type HomeBlock,
  type Feedback,
} from "../../services/homepage.service";
import { toast } from "react-toastify";

const categories = [
  {
    title: "Máy bay camera",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800",
  },
  {
    title: "Ánh sáng",
    img: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800",
  },
  {
    title: "Máy ảnh",
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
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<HomeBlock[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus === "success") {
      toast.success("Thanh toán thành công!");
      // Xóa query parameter khỏi URL
      window.history.replaceState({}, "", window.location.pathname);
      // Redirect về trang đơn hàng sau 2 giây
      setTimeout(() => {
        navigate("/renter/my-orders");
      }, 2000);
    } else if (paymentStatus === "cancelled") {
      toast.error("Thanh toán đã bị hủy");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [navigate]);
  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [blocksData, feedbacksData] = await Promise.all([
        getHomeBlocks(),
        getFeedbacks(),
      ]);

      setBlocks(blocksData.filter((block) => block.isActive));
      setFeedbacks(feedbacksData.filter((feedback) => feedback.isActive));
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("Không thể tải dữ liệu trang chủ");
    } finally {
      setLoading(false);
    }
  };

  // Get blocks by key
  const getBlockByKey = (key: string): HomeBlock | undefined => {
    return blocks.find((block) => block.key === key);
  };

  const heroBlock = getBlockByKey("hero");
  const block1 = getBlockByKey("block1");
  const block2 = getBlockByKey("block2");

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <section className="page home-page">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {heroBlock?.title || "Chụp Ảnh Chuyên Nghiệp"}
          </h1>
          <p className="hero-subtitle">
            {heroBlock?.content ||
              "Vì sở hữu thiết bị đắt tiền đã là quá khứ. Thuê nó, chụp nó, tạo nên điều tuyệt vời."}
          </p>
          <div className="hero-buttons">
            <a
              href="/products"
              className="btn btn-primary"
              style={{ color: "white" }}
            >
              Khám Phá Thiết Bị
            </a>
            <a href="/products" className="btn btn-secondary">
              Thuê Ngay
            </a>
          </div>
        </div>
        <div className="hero-image">
          <CameraModel modelPath="/camera.glb" />
        </div>
      </div>

      {/* Categories Section with 3D Carousel */}
      <Box
        component="section"
        sx={{ pt: 0, pb: { xs: 8, md: "70px" }, backgroundColor: "#F9FAFB" }}
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
              KHÁM PHÁ BỘ SƯU TẬP
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#111827",
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "2.5rem" },
                mb: 2,
              }}
            >
              Danh Mục Sản Phẩm
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#6B7280",
                fontSize: { xs: "1rem", md: "1.125rem" },
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Khám phá dòng thiết bị máy ảnh chuyên nghiệp và phụ kiện đa dạng
              của chúng tôi
            </Typography>
          </Box>

          <ThreeDCarousel items={categories} />
        </Container>
      </Box>

      {/* Block 1 - Experience Matters Section */}
      {block1 && (
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: "70px" },
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
                paddingBottom: 4,
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
                  src={block1.imageUrl || "/sony.jpg"}
                  alt={block1.title}
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
                  TRẢI NGHIỆM LÀ QUAN TRỌNG
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
                  {block1.title}
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
                  {block1.content}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Block 2 - Trusted Brands Section */}
      {block2 && (
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: "70px" },
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
                  THIẾT BỊ CAO CẤP
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
                  {block2.title}
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
                  {block2.content}
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
                  src={block2.imageUrl || "/sony1.png"}
                  alt={block2.title}
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
      )}

      {/* Customer Testimonials Section */}
      {feedbacks.length > 0 && (
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: "70px" },
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
                KHÁCH HÀNG NÓI GÌ
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 2,
                }}
              >
                Đánh Giá Từ Khách Hàng
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#6B7280",
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                Hàng nghìn nhiếp ảnh gia và nhà sáng tạo nội dung đã tin tưởng
                CamRent
              </Typography>
            </Box>

            {/* Testimonial Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, 1fr)",
                },
                gap: 4,
              }}
            >
              {feedbacks.slice(0, 3).map((feedback) => (
                <Card
                  key={feedback.id}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* Quote Icon */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      color: "#F97316",
                      opacity: 0.2,
                    }}
                  >
                    <FormatQuote sx={{ fontSize: 48 }} />
                  </Box>

                  {/* Rating */}
                  <Box sx={{ mb: 2 }}>
                    <Rating value={feedback.rating} readOnly size="small" />
                  </Box>

                  {/* Comment */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#4B5563",
                      fontSize: "0.95rem",
                      lineHeight: 1.7,
                      mb: 3,
                      fontStyle: "italic",
                    }}
                  >
                    "{feedback.comment}"
                  </Typography>

                  {/* Customer Info */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={feedback.userAvatar || "https://i.pravatar.cc/150"}
                      alt={feedback.userName}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#111827",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {feedback.userName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#6B7280",
                          fontSize: "0.85rem",
                        }}
                      >
                        {new Date(feedback.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Our Partners Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: "70px" },
          backgroundColor: "#F9FAFB",
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
              ĐỐI TÁC CỦA CHÚNG TÔI
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
