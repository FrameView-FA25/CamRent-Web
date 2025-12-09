import { toast } from "react-toastify";
import { assignStaffToBooking } from "@/services/booking.service"
import type { Booking } from "@/types/booking.types";

export const handleAssignConfirm = async (
  selectedBooking: Booking | null,
  selectedStaff: string,
  setAssignLoading: (loading: boolean) => void,
  setAssignDialogOpen: (open: boolean) => void,
  setSelectedStaff: (staff: string) => void
) => {
  if (!selectedBooking || !selectedStaff) return;

  setAssignLoading(true);
  const { success, error: assignError } = await assignStaffToBooking(
    selectedBooking.id,
    selectedStaff
  );

  if (assignError) {
    toast.error(`Lỗi phân công nhân viên: ${assignError}`, {
      position: "top-right",
      autoClose: 3000,
    });
    setAssignLoading(false);
    return;
  }

  if (success) {
    setAssignDialogOpen(false);
    setSelectedStaff("");
    setAssignLoading(false);

    toast.success("Gán nhân viên thành công!", {
      position: "top-right",
      autoClose: 2000,
    });
  }
};