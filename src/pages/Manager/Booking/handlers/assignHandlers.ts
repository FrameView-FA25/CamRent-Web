import { toast } from "react-toastify";
import { assignStaffToBooking } from "@/services/booking.service";

export const handleAssignConfirm = async (
  selectedBooking: any,
  selectedStaff: string,
  setAssignLoading: (loading: boolean) => void,
  setAssignDialogOpen: (open: boolean) => void,
) => {
  if (!selectedBooking || !selectedStaff) {
    toast.error("Vui lòng chọn nhân viên");
    return;
  }

  try {
    setAssignLoading(true);
    
    const result = await assignStaffToBooking(selectedBooking.id, selectedStaff);

    if (!result.success) {
      throw new Error(result.error || "Phân công nhân viên thất bại");
    }

    toast.success("Phân công nhân viên thành công!");
    setAssignDialogOpen(false);
    

  } catch (error) {
    console.error("Assign staff error:", error);
    toast.error(
      error instanceof Error ? error.message : "Không thể phân công nhân viên"
    );
  } finally {
    setAssignLoading(false);
  }
};