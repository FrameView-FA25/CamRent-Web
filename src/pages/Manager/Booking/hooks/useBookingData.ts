import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Booking, Staff } from "@/types/booking.types";
import { fetchBranchBookings, fetchStaffList } from "@/services/booking.service";

export const useBookingData = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    const { bookings: fetchedBookings, error: fetchError } = await fetchBranchBookings();

    if (fetchError) {
      setError(fetchError);
      if (fetchError.includes("Unauthorized")) {
        navigate("/login");
      }
    } else {
      const validBookings = fetchedBookings.filter(
        (booking) => booking.statusText !== "Giỏ hàng"
      );
      setBookings(validBookings);
    }
    setLoading(false);
  };

  const loadStaff = async () => {
    const { staff, error: fetchError } = await fetchStaffList();

    if (fetchError) {
      console.error("Error loading staff:", fetchError);
    } else {
      setStaffList(staff);
    }
  };

  useEffect(() => {
    loadBookings();
    loadStaff();
  }, []);

  return {
    bookings,
    staffList,
    loading,
    error,
    setError,
    loadBookings,
  };
};