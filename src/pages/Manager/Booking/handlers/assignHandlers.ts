import { toast } from "react-toastify";
import { createDelivery } from "@/services/booking.service"
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
  const { success, error: deliveryError } = await createDelivery(
    selectedBooking.id,
    selectedStaff
  );

  if (deliveryError) {
    toast.error(`Lỗi phân công nhân viên: ${deliveryError}`, {
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