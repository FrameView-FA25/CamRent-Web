import React from "react";
import { Paper, Tabs, Tab } from "@mui/material";
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
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: "#E5E7EB",
          bgcolor: "#F9FAFB",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            color: "#6B7280",
            minHeight: 56,
            "&.Mui-selected": {
              color: "#F97316",
            },
          },
          "& .MuiTabs-indicator": {
            bgcolor: "#F97316",
            height: 3,
          },
        }}
      >
        <Tab label={`Tất cả (${bookings.length})`} />
        <Tab
          label={`Chờ xác nhận (${
            bookings.filter((b) => b.statusText === "Chờ xác nhận").length
          })`}
        />
        <Tab
          label={`Đã xác nhận (${
            bookings.filter((b) => b.statusText === "Đã xác nhận").length
          })`}
        />
        <Tab
          label={`Đang thuê (${
            bookings.filter((b) => b.statusText === "Đang thuê").length
          })`}
        />
        <Tab
          label={`Hoàn thành (${
            bookings.filter((b) => b.statusText === "Hoàn thành").length
          })`}
        />
        <Tab
          label={`Đã hủy (${
            bookings.filter((b) => b.statusText === "Đã hủy").length
          })`}
        />
      </Tabs>
    </Paper>
  );
};
