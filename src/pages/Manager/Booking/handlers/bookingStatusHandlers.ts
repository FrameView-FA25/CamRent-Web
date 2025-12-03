import { toast } from "react-toastify";
import type { Booking } from "@/types/booking.types";

export const handleConfirmBooking = async (
  booking: Booking | null,
  onSuccess?: () => void
): Promise<boolean> => {
  if (!booking) {
    toast.error("Không tìm thấy thông tin booking");
    return false;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    toast.error("Vui lòng đăng nhập lại");
    return false;
  }

  try {
    const response = await fetch(
      `https://camrent-backend.up.railway.app/api/Bookings/${booking.id}/update-status?status=Confirmed`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.title || "Xác nhận đơn thất bại");
    }

    toast.success("Xác nhận đơn hàng thành công!");
    onSuccess?.();
    return true;
  } catch (error) {
    console.error("Confirm booking error:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi khi xác nhận đơn hàng");
    return false;
  }
};

export const handleCancelBooking = async (
  booking: Booking | null,
  onSuccess?: () => void
): Promise<boolean> => {
  if (!booking) {
    toast.error("Không tìm thấy thông tin booking");
    return false;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    toast.error("Vui lòng đăng nhập lại");
    return false;
  }

  try {
    const response = await fetch(
      `https://camrent-backend.up.railway.app/api/Bookings/${booking.id}/update-status?status=Cancelled`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.title || "Hủy đơn thất bại");
    }

    toast.success("Hủy đơn hàng thành công!");
    onSuccess?.();
    return true;
  } catch (error) {
    console.error("Cancel booking error:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi khi hủy đơn hàng");
    return false;
  }
};

export const handleUpdateBookingStatus = async (
  bookingId: string,
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "Rejected",
  onSuccess?: () => void
): Promise<boolean> => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    toast.error("Vui lòng đăng nhập lại");
    return false;
  }

  try {
    const response = await fetch(
      `https://camrent-backend.up.railway.app/api/Bookings/${bookingId}/update-status?status=${status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.title || "Cập nhật trạng thái thất bại");
    }

    toast.success(`Cập nhật trạng thái thành ${status} thành công!`);
    onSuccess?.();
    return true;
  } catch (error) {
    console.error("Update status error:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái");
    return false;
  }
};