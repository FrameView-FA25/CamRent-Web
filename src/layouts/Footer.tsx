import React from "react";
import { Box, Container, Typography, Link, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1F2937",
        color: "white",
        py: 6,
        mt: "auto",
        borderTop: "1px solid #374151",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 4,
          }}
        >
          {/* Brand Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "white" }}
                >
                  CR
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#F97316" }}
              >
                CamRent
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#9CA3AF", mb: 2, lineHeight: 1.6 }}
            >
              Nền tảng cho thuê máy ảnh hàng đầu Việt Nam. Chúng tôi cam kết
              mang đến trải nghiệm tốt nhất cho khách hàng.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                component="a"
                href="#"
                sx={{
                  color: "#9CA3AF",
                  "&:hover": {
                    color: "#F97316",
                    bgcolor: "rgba(249, 115, 22, 0.1)",
                  },
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                component="a"
                href="#"
                sx={{
                  color: "#9CA3AF",
                  "&:hover": {
                    color: "#F97316",
                    bgcolor: "rgba(249, 115, 22, 0.1)",
                  },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                component="a"
                href="#"
                sx={{
                  color: "#9CA3AF",
                  "&:hover": {
                    color: "#F97316",
                    bgcolor: "rgba(249, 115, 22, 0.1)",
                  },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "white" }}
            >
              Liên kết nhanh
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="/"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Sản phẩm
              </Link>
              <Link
                href="/about"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Về chúng tôi
              </Link>
              <Link
                href="/contact"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Liên hệ
              </Link>
            </Box>
          </Box>

          {/* Resources */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "white" }}
            >
              Hỗ trợ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="/support"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Trung tâm hỗ trợ
              </Link>
              <Link
                href="/faq"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Câu hỏi thường gặp
              </Link>
              <Link
                href="/privacy"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="/terms"
                sx={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#F97316" },
                }}
              >
                Điều khoản dịch vụ
              </Link>
            </Box>
          </Box>

          {/* Contact */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "white" }}
            >
              Liên hệ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                Thống Nhất, Đồng Nai
              </Typography>
              <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                Email: support@camrent.vn
              </Typography>
              <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                Hotline: 1900 xxxx
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: "1px solid #374151",
            mt: 4,
            pt: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            © {new Date().getFullYear()} CamRent. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: "#6B7280", mt: 0.5 }}>
            Made with ❤️ by CamRent Team
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
