import { useState, useMemo } from "react";
import type { Booking } from "@/types/booking.types";
import { STATUS_MAP } from "../constants";

export type SortOrder = "newest" | "alphabetical";

export const useBookingFilters = (bookings: Booking[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const getStatusNumber = (statusText: string): number => {
    return STATUS_MAP[statusText] ?? -1;
  };

  const filteredBookings = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      if (booking.statusText === "Giỏ hàng") {
        return false;
      }

      const matchesSearch =
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.renterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.items.some((item) =>
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        booking.location.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.location.district.toLowerCase().includes(searchQuery.toLowerCase());

      const bookingStatusNumber = getStatusNumber(booking.statusText);
      const matchesTab =
        selectedTab === 0 ||
        (selectedTab === 1 && bookingStatusNumber === 0) ||
        (selectedTab === 2 && bookingStatusNumber === 1) ||
        (selectedTab === 3 && bookingStatusNumber === 2) ||
        (selectedTab === 4 && bookingStatusNumber === 3) ||
        (selectedTab === 5 && bookingStatusNumber === 4);

      return matchesSearch && matchesTab;
    });

    // ✅ Apply sorting
    return filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      } else {
        // Alphabetical by booking ID
        return a.id.localeCompare(b.id, 'vi');
      }
    });
  }, [bookings, searchQuery, selectedTab, sortOrder]);

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