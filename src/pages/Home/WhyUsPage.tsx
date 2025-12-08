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
      title: "Thiết bị cao cấp",
      description:
        "Tất cả thiết bị được bảo dưỡng, kiểm tra định kỳ để đảm bảo hiệu suất tối ưu. Chúng tôi chỉ cung cấp gear chuyên nghiệp từ các hãng uy tín.",
    },
    {
      icon: <Support sx={{ fontSize: 60 }} />,
      title: "Đội ngũ hỗ trợ chuyên môn",
      description:
        "Nhân sự am hiểu giúp bạn chọn đúng thiết bị và hỗ trợ kỹ thuật xuyên suốt thời gian thuê.",
    },
    {
      icon: <Inventory sx={{ fontSize: 60 }} />,
      title: "Kho thiết bị phong phú",
      description:
        "Từ body, ống kính đến ánh sáng và âm thanh — đầy đủ cho mọi nhu cầu sản xuất tại một nơi.",
    },
    {
      icon: <LocalOffer sx={{ fontSize: 60 }} />,
      title: "Giá linh hoạt, cạnh tranh",
      description:
        "Gói thuê theo ngày, tuần, tháng với mức giá hợp lý, phù hợp ngân sách và tiến độ của bạn.",
    },
    {
      icon: <Engineering sx={{ fontSize: 60 }} />,
      title: "Dịch vụ chuyên nghiệp",
      description:
        "Hiểu nhu cầu sản xuất chuyên nghiệp, quy trình tinh gọn đảm bảo bạn nhận thiết bị đúng lúc.",
    },
    {
      icon: <Speed sx={{ fontSize: 60 }} />,
      title: "Nhanh & đơn giản",
      description:
        "Đặt online, nhận tại quầy hoặc giao tận nơi, trả khi xong. Không giấy tờ rườm rà, không phí ẩn.",
    },
  ];

  const testimonials = [
    {
      name: "John Smith",
      role: "Đạo diễn phim",
      text: "Dịch vụ xuất sắc, thiết bị chất lượng cao. Đội ngũ rất am hiểu và luôn hỗ trợ vượt mong đợi để chúng tôi có đủ mọi thứ cho buổi quay.",
    },
    {
      name: "Sarah Johnson",
      role: "Chủ studio nhiếp ảnh",
      text: "Tôi thuê ở đây nhiều năm. Kho thiết bị rất lớn, giá hợp lý, thiết bị luôn trong tình trạng hoàn hảo. Rất đáng tin cậy!",
    },
    {
      name: "Mike Chen",
      role: "Nhà làm phim độc lập",
      text: "Tiện lợi và ổn định hiếm có. Từ đặt đến trả đều trơn tru, chuyên nghiệp. Đây là nơi thuê thiết bị quen thuộc của tôi.",
    },
  ];

  const stats = [
    { number: "10+", label: "Năm kinh nghiệm" },
    { number: "5000+", label: "Khách hàng hài lòng" },
    { number: "500+", label: "Hạng mục thiết bị" },
    { number: "24/7", label: "Hỗ trợ liên tục" },
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
            Vì sao chọn chúng tôi
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
            Chúng tôi cam kết mang lại trải nghiệm thuê thiết bị tốt nhất. Đây là những điểm khác biệt của chúng tôi.
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
            Điểm khác biệt của chúng tôi
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
            Khách hàng nói gì
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
            Sẵn sàng trải nghiệm sự khác biệt?
          </Typography>
          <Typography sx={{ mb: 4, color: "#666", fontSize: "1.1rem" }}>
            Hãy gia nhập hàng nghìn nhà làm phim và nhiếp ảnh tin dùng dịch vụ của chúng tôi.
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
              Xem thiết bị
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
              Liên hệ
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default WhyUsPage;
