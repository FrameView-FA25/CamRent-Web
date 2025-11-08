import { useState, useEffect, useCallback } from "react";
import { fetchStaffBookings } from "../services/booking.service";
import type { Booking } from "../types/booking.types";

export const useStaffBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { bookings: staffBookings, error: fetchError } =
        await fetchStaffBookings();
      if (fetchError) {
        setError(fetchError);
      } else {
        setBookings(staffBookings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: loadBookings,
  };
};
