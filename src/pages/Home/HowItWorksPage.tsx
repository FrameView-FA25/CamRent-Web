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
      title: "1. Tìm thiết bị",
      description:
        "Duyệt danh mục thiết bị quay chụp chuyên nghiệp. Dùng bộ lọc để nhanh chóng chọn đúng nhu cầu cho dự án của bạn.",
    },
    {
      icon: <ShoppingCart sx={{ fontSize: 60 }} />,
      title: "2. Chọn & đặt trước",
      description:
        "Chọn ngày thuê, thêm thiết bị vào giỏ và hoàn tất đặt chỗ. Hệ thống xác nhận khả dụng ngay lập tức.",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 60 }} />,
      title: "3. Nhận tại quầy hoặc giao tận nơi",
      description:
        "Nhận thiết bị tại chi nhánh hoặc chọn giao hàng. Tất cả thiết bị đều được kiểm tra và sẵn sàng sử dụng.",
    },
    {
      icon: <Assignment sx={{ fontSize: 60 }} />,
      title: "4. Sáng tạo & hoàn trả",
      description:
        "Dùng thiết bị cho buổi quay chụp, sau đó hoàn trả đúng hẹn và cùng tình trạng. Quy trình đơn giản, nhanh gọn.",
    },
  ];

  const policies = [
    {
      title: "Chính sách đặt trước",
      items: [
        "Đặt trước tối đa 6 tháng",
        "Hủy trong 24 giờ được hoàn tiền đầy đủ",
        "Cần CMND/CCCD/Hộ chiếu và thẻ thanh toán hợp lệ",
        "Một số thiết bị cần đặt cọc an toàn",
      ],
    },
    {
      title: "Thời hạn thuê",
      items: [
        "Thuê theo ngày (24 giờ)",
        "Thuê theo tuần (7 ngày)",
        "Có gói thuê theo tháng",
        "Linh hoạt giờ nhận và trả thiết bị",
      ],
    },
    {
      title: "Bảo quản thiết bị",
      items: [
        "Mọi thiết bị được kiểm tra trước khi giao",
        "Có tùy chọn mua bảo hiểm",
        "Người thuê chịu trách nhiệm nếu thiết bị hư hỏng",
        "Vệ sinh chuyên nghiệp sau mỗi lượt thuê",
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
            Hướng dẫn quy trình
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
            Thuê thiết bị quay chụp chuyên nghiệp chưa bao giờ dễ hơn. Làm theo
            các bước đơn giản dưới đây để bắt đầu dự án tiếp theo của bạn.
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
            4 bước đơn giản
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
            Chính sách & hướng dẫn thuê
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
            Sẵn sàng bắt đầu?
          </Typography>
          <Typography sx={{ mb: 4, color: "#666", fontSize: "1.1rem" }}>
            Duyệt danh mục và đặt thiết bị ngay hôm nay.
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

export default HowItWorksPage;
