import React from "react";
import { Paper, Tabs, Tab, Box, Chip } from "@mui/material";
import { Warning } from "@mui/icons-material";
import type { Booking } from "../../../../types/booking.types";

interface BookingTabsProps {
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
  bookings: Booking[];
}

export const BookingTabs: React.FC<BookingTabsProps> = ({
  selectedTab,
  setSelectedTab,
  bookings,
}) => {
  const getCount = (status: string) =>
    bookings.filter((b) => b.status.toLowerCase() === status.toLowerCase())
      .length;

  return (
    <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            minHeight: 48,
            "&.Mui-selected": {
              color: "#F97316",
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#F97316",
            height: 3,
          },
        }}
      >
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Tất cả
              <Chip
                label={bookings.length}
                size="small"
                sx={{
                  bgcolor: "#F3F4F6",
                  color: "#1F2937",
                  fontWeight: 700,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          }
        />

        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Đã xác nhận
              <Chip
                label={getCount("Confirmed")}
                size="small"
                sx={{
                  bgcolor: "#D1FAE5",
                  color: "#059669",
                  fontWeight: 700,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Đang thuê
              <Chip
                label={getCount("PickedUp")}
                size="small"
                sx={{
                  bgcolor: "#DBEAFE",
                  color: "#2563EB",
                  fontWeight: 700,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Đã trả
              <Chip
                label={getCount("Returned")}
                size="small"
                sx={{
                  bgcolor: "#E0E7FF",
                  color: "#4F46E5",
                  fontWeight: 700,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Hoàn thành
              <Chip
                label={getCount("Completed")}
                size="small"
                sx={{
                  bgcolor: "#D1FAE5",
                  color: "#059669",
                  fontWeight: 700,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Đã hủy
              <Chip
                label={getCount("Cancelled")}
                size="small"
                sx={{
                  bgcolor: "#FEE2E2",
                  color: "#DC2626",
                  fontWeight: 700,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Warning sx={{ fontSize: 18, color: "#DC2626" }} />
              Có vấn đề
            </Box>
          }
          sx={{
            color: "#DC2626",
            "&.Mui-selected": {
              color: "#DC2626",
            },
          }}
        />
      </Tabs>
    </Paper>
  );
};
