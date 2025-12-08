import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    captcha: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <Box sx={{ bgcolor: "#fff", color: "#000", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 300 }}>
            Liên lạc
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#666", maxWidth: 600, mx: "auto" }}
          >
            Văn phòng đặt tại Glendale, CA. Chúng tôi phục vụ khu vực miền Nam
            California với dịch vụ cho thuê thiết bị vượt trội. Đội ngũ giàu kinh
            nghiệm sẵn sàng giải đáp mọi thắc mắc về sản phẩm, vệ sinh, kỹ thuật
            và các nhu cầu liên quan đến sản xuất phim/ảnh.
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Left Side - Contact Form */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#d4af37", mb: 3 }}>
              Vui lòng liên hệ với chúng tôi
              <br />
              qua biểu mẫu dưới đây:
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="name"
                placeholder="Họ tên*"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#000",
                    "& fieldset": { borderColor: "#ddd" },
                    "&:hover fieldset": { borderColor: "#999" },
                  },
                  "& input::placeholder": { color: "#999" },
                }}
              />

              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#000",
                    "& fieldset": { borderColor: "#ddd" },
                    "&:hover fieldset": { borderColor: "#999" },
                  },
                  "& input::placeholder": { color: "#999" },
                }}
              />

              <TextField
                fullWidth
                name="subject"
                placeholder="Tiêu đề"
                value={formData.subject}
                onChange={handleChange}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#000",
                    "& fieldset": { borderColor: "#ddd" },
                    "&:hover fieldset": { borderColor: "#999" },
                  },
                  "& input::placeholder": { color: "#999" },
                }}
              />

              <TextField
                fullWidth
                name="message"
                placeholder="Nội dung"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    color: "#000",
                    "& fieldset": { borderColor: "#ddd" },
                    "&:hover fieldset": { borderColor: "#999" },
                  },
                  "& textarea::placeholder": { color: "#999" },
                }}
              />

              {/* CAPTCHA */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Paper
                  sx={{
                    bgcolor: "#f5f5f5",
                    p: 1,
                    px: 2,
                    border: "1px solid #ddd",
                  }}
                >
                  <Typography
                    sx={{ color: "#000", fontWeight: "bold", letterSpacing: 2 }}
                  >
                    GQBZ
                  </Typography>
                </Paper>
                <TextField
                  name="captcha"
                  placeholder="Mã xác thực (nhập lại chuỗi trên)"
                  value={formData.captcha}
                  onChange={handleChange}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      color: "#000",
                      "& fieldset": { borderColor: "#ddd" },
                      "&:hover fieldset": { borderColor: "#999" },
                    },
                    "& input::placeholder": {
                      color: "#999",
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="outlined"
                sx={{
                  color: "#000",
                  borderColor: "#000",
                  px: 4,
                  "&:hover": {
                    borderColor: "#d4af37",
                    bgcolor: "rgba(212, 175, 55, 0.1)",
                  },
                }}
              >
                GỬI
              </Button>
            </Box>
          </Box>

          {/* Right Side - Contact Info & Map */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ mb: 1 }}>
                Điện thoại:{" "}
                <Box component="span" sx={{ color: "#d4af37" }}>
                  818-500-7559
                </Box>
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Fax:{" "}
                <Box component="span" sx={{ color: "#d4af37" }}>
                  8818-500-1227
                </Box>
              </Typography>

              <Typography sx={{ mb: 1 }}>
                Jeff Shapiro:{" "}
                <Box component="span" sx={{ color: "#d4af37" }}>
                  jeff@worldwidela.com
                </Box>
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Alan Heght:{" "}
                <Box component="span" sx={{ color: "#d4af37" }}>
                  alan@worldwidela.com
                </Box>
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Brian:{" "}
                <Box component="span" sx={{ color: "#d4af37" }}>
                  brian@worldwidela.com
                </Box>
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Gene Duggan:{" "}
                <Box component="span" sx={{ color: "#d4af37" }}>
                  gene@worldwidela.com
                </Box>
              </Typography>
            </Box>

            {/* Map */}
            <Box
              sx={{
                width: "100%",
                height: 300,
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid #ddd",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303.8971928937634!2d-118.25570492346576!3d34.14250331523893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c06d38a35f73%3A0x8c82f8e6b7a6b6fc!2sGlendale%2C%20CA!5e0!3m2!1sen!2sus!4v1698000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactPage;
