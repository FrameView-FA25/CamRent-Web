import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { colors } from "../../theme/colors";

interface PaymentLoadingOverlayProps {
  show: boolean;
}

const PaymentLoadingOverlay: React.FC<PaymentLoadingOverlayProps> = ({
  show,
}) => {
  if (!show) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(0, 0, 0, 0.7)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: colors.primary.main,
        }}
      />
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 700,
            mb: 1,
          }}
        >
          Đang khởi tạo thanh toán...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          Vui lòng đợi trong giây lát
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentLoadingOverlay;
