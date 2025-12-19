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
  const getStatusCount = (status: string) => {
    return bookings.filter((b) => b.status === status).length;
  };

  // Exclude Draft from total count
  const visibleBookings = bookings.filter((b) => b.status !== "Draft");

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
        <Tab label={`Tất cả (${visibleBookings.length})`} />
        <Tab label={`Chờ xác nhận (${getStatusCount("PendingApproval")})`} />
        <Tab label={`Đã xác nhận (${getStatusCount("Confirmed")})`} />
        <Tab label={`Đã nhận máy (${getStatusCount("PickedUp")})`} />
        <Tab label={`Đã trả máy (${getStatusCount("Returned")})`} />
        <Tab label={`Hoàn thành (${getStatusCount("Completed")})`} />
        <Tab label={`Đã hủy (${getStatusCount("Cancelled")})`} />
        <Tab label={`Quá hạn (${getStatusCount("Overdue")})`} />
      </Tabs>
    </Paper>
  );
};
