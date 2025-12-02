import { useState, useMemo } from "react";
import type { Booking } from "@/types/booking.types";
import { STATUS_MAP } from "../constants";

export const useBookingFilters = (bookings: Booking[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  const getStatusNumber = (statusText: string): number => {
    return STATUS_MAP[statusText] ?? -1;
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
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
  }, [bookings, searchQuery, selectedTab]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    filteredBookings,
  };
};