import React from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Rating,
  Card,
} from "@mui/material";
import CameraModel from "../../components/Modal/CameraModal";
import { FormatQuote } from "@mui/icons-material";
import ThreeDCarousel from "../../components/ui/3d-carousel";

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

const testimonials = [
  {
    name: "Minh Tuấn",
    role: "Nhiếp ảnh gia",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    comment:
      "Dịch vụ cho thuê máy ảnh tuyệt vời! Thiết bị luôn trong tình trạng hoàn hảo và đội ngũ hỗ trợ rất chuyên nghiệp. Tôi đã thuê Canon R5 cho một dự án và kết quả vượt ngoài mong đợi.",
  },
  {
    name: "Hồng Nhung",
    role: "Nhà sáng tạo nội dung",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    comment:
      "Giá cả hợp lý, quy trình thuê đơn giản và nhanh chóng. Tôi đặc biệt thích việc có thể thuê ống kính kèm theo. Chắc chắn sẽ quay lại!",
  },
  {
    name: "Đức Anh",
    role: "Nhà làm phim",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 5,
    comment:
      "Từng thuê thiết bị ở nhiều nơi nhưng CamRent là tốt nhất. Máy móc mới, sạch sẽ và luôn có hướng dẫn chi tiết. Rất đáng để giới thiệu!",
  },
];

const HomePage: React.FC = () => {
  return (
    <section className="page home-page">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Chụp Ảnh Chuyên Nghiệp</h1>
          <p className="hero-subtitle">
            Vì sở hữu thiết bị đắt tiền đã là quá khứ.
            <br />
            Thuê nó, chụp nó, tạo nên điều tuyệt vời.
          </p>
          <div className="hero-buttons">
            <a
              href="/products"
              className="btn btn-primary"
              style={{ color: "white" }}
            >
              Khám Phá Thiết Bị
            </a>
            <a href="/rent" className="btn btn-secondary">
              Thuê Ngay
            </a>
          </div>
        </div>
        <div className="hero-image">
          <CameraModel modelPath="/camera.glb" />
        </div>
      </div>

      {/* ===== Categories Section with 3D Carousel ===== */}
      <Box
        component="section"
        sx={{ pt: 0, pb: { xs: 8, md: "70px" }, backgroundColor: "#F9FAFB" }}
      >
        <Container maxWidth="lg">
          {/* Category Header */}
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

      {/* ===== Experience Matters Section ===== */}
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
                src="/sony.jpg"
                alt="Máy ảnh chuyên nghiệp"
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
                Thiết Bị Nâng Tầm
                <br />
                <Box component="span" sx={{ fontStyle: "italic" }}>
                  Sáng Tạo
                </Box>{" "}
                Của Bạn
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
                Cho dù bạn là nhà làm phim, người sáng tạo nội dung hay nhiếp
                ảnh gia, chúng tôi đảm bảo bạn luôn có quyền truy cập vào máy
                ảnh và ống kính mới nhất mà không tốn kém. Thiết bị của chúng
                tôi được bảo trì chuyên nghiệp và được tuyển chọn cho những
                người sáng tạo quan tâm đến chất lượng.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===== Trusted Brands Section ===== */}
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
                Thương Hiệu Uy Tín.
                <br />
                Không Thỏa Hiệp.
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
                Chúng tôi hợp tác với những thương hiệu tốt nhất. Canon, Sony,
                RED, DJI để bạn có thể chụp với thiết bị tiêu chuẩn ngành, mà
                không phải trả chi phí ban đầu. Mọi thiết bị cho thuê đều trải
                qua quy trình kiểm tra chất lượng nghiêm ngặt trước khi đến tay
                bạn.
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
                src="/sony1.png"
                alt="Thiết bị máy ảnh chuyên nghiệp"
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

      {/* ===== Customer Testimonials Section ===== */}
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
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
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
                  <Rating value={testimonial.rating} readOnly size="small" />
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
                  "{testimonial.comment}"
                </Typography>

                {/* Customer Info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.name}
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
                      {testimonial.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6B7280",
                        fontSize: "0.85rem",
                      }}
                    >
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ===== Our Partners Section ===== */}
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
