import React from "react";
import { Container, Typography, Box } from "@mui/material";

const PrivacyPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Chính sách bảo mật
      </Typography>
      <Box sx={{ bgcolor: "background.paper", p: 4, borderRadius: 2 }}>
        <Typography variant="body1">Demo only – No real payment</Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPage;


