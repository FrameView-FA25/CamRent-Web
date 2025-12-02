import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";
import type { Booking } from "@/types/booking.types";

export const handleSaveSignature = async (
  signatureRef: React.RefObject<SignatureCanvas | null>,
  selectedBooking: Booking | null,
  currentContractId: string | null,
  handleCloseSignature: () => void,
  handleClosePdfDialog: () => void,
  loadBookings: () => Promise<void>
) => {
  if (!signatureRef.current) return;

  const isEmpty = signatureRef.current.isEmpty();

  if (isEmpty) {
    toast.error("Vui lòng ký vào khung trước khi xác nhận!", {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }

  const signatureData = signatureRef.current.toDataURL();
  const base64Signature = signatureData.split(",")[1];

  if (!selectedBooking) {
    toast.error("Không tìm thấy thông tin đơn thuê!", {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }

  try {
    const token = localStorage.getItem("accessToken");

    const signResponse = await fetch(
      `https://camrent-backend.up.railway.app/api/Contracts/${currentContractId}/sign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          signatureBase64: base64Signature,
        }),
      }
    );

    if (!signResponse.ok) {
      throw new Error("Ký hợp đồng thất bại");
    }

    toast.success("Chữ ký đã được lưu thành công!", {
      position: "top-right",
      autoClose: 2000,
    });

    handleCloseSignature();
    handleClosePdfDialog();
    await loadBookings();
  } catch (error) {
    console.error("Signature error:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi khi ký hợp đồng", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};