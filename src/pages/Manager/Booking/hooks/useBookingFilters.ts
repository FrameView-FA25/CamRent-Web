import { useState, useMemo } from "react";
import type { Booking } from "../../../../types/booking.types";

export type SortOrder = "newest" | "alphabetical";

export const useBookingFilters = (bookings: Booking[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

   const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Filter by tab
    if (selectedTab === 1) {
      // Tab 1: Đã xác nhận
      filtered = filtered.filter(
        (b) => b.status.toLowerCase() === "confirmed"
      );
    } else if (selectedTab === 2) {
      // Tab 2: Đang thuê (PickedUp)
      filtered = filtered.filter(
        (b) => b.status.toLowerCase() === "pickedup"
      );
    } else if (selectedTab === 3) {
      // Tab 3: Đã trả
      filtered = filtered.filter(
        (b) => b.status.toLowerCase() === "returned"
      );
    } else if (selectedTab === 4) {
      // Tab 4: Hoàn thành
      filtered = filtered.filter(
        (b) => b.status.toLowerCase() === "completed"
      );
    } else if (selectedTab === 5) {
      // Tab 5: Đã hủy
      filtered = filtered.filter(
        (b) => b.status.toLowerCase() === "cancelled"
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.id.toLowerCase().includes(query) ||
          b.renterId.toLowerCase().includes(query) ||
          b.renter?.fullName?.toLowerCase().includes(query) ||
          b.renter?.phone?.toLowerCase().includes(query) ||
          b.items.some(
            (item) =>
              item.itemName?.toLowerCase().includes(query) ||
              item.itemId.toLowerCase().includes(query)
          )
      );
    }

    // Sort
    if (sortOrder === "newest") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOrder === "alphabetical") {
      filtered = [...filtered].sort((a, b) =>
        (a.renter?.fullName || "").localeCompare(b.renter?.fullName || "")
      );
    }

    return filtered;
  }, [bookings, selectedTab, searchQuery, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    filteredBookings,
    sortOrder,
    setSortOrder,
  };
};