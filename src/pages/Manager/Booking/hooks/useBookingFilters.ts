import { useState, useMemo } from "react";
import type { Booking } from "../../../../types/booking.types";

export type SortOrder = "newest" | "alphabetical";

export const useBookingFilters = (bookings: Booking[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filteredBookings = useMemo(() => {
    // Exclude Draft bookings from Manager view
    let filtered = bookings.filter((b) => b.status !== "Draft");

    // Filter by tab
    if (selectedTab === 1) {
      filtered = filtered.filter((b) => b.status === "PendingApproval");
    } else if (selectedTab === 2) {
      filtered = filtered.filter((b) => b.status === "Confirmed");
    } else if (selectedTab === 3) {
      filtered = filtered.filter((b) => b.status === "PickedUp");
    } else if (selectedTab === 4) {
      filtered = filtered.filter((b) => b.status === "Returned");
    } else if (selectedTab === 5) {
      filtered = filtered.filter((b) => b.status === "Completed");
    } else if (selectedTab === 6) {
      filtered = filtered.filter((b) => b.status === "Cancelled");
    } else if (selectedTab === 7) {
      filtered = filtered.filter((b) => b.status === "Overdue");
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