export interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
}

export interface Accessory {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
}

export interface Combo {
  id: string;
  name: string;
}

export interface BookingItem {
  cameraId: string | null;
  camera: Camera | null;
  accessoryId: string | null;
  accessory: Accessory | null;
  comboId: string | null;
  combo: Combo | null;
  quantity: number;
  unitPrice: number;
  depositAmount: number;
}

export interface Renter {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface Booking {
  id: string;
  type: number;
  renterId: string;
  renter: Renter | null;
  pickupAt: string;
  returnAt: string;
  status: number;
  statusText: string;
  snapshotBaseDailyRate: number;
  snapshotDepositPercent: number;
  snapshotPlatformFeePercent: number;
  snapshotRentalTotal: number;
  snapshotDepositAmount: number;
  items: BookingItem[];
}

export interface BookingStatusInfo {
  label: string;
  color: "warning" | "info" | "success" | "default" | "error";
}

export const BookingStatus = {
  DRAFT: 0,
  PROCESSING: 1,
  CONFIRMED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  CANCELLED: 5,
} as const;

export const getBookingStatusInfo = (status: number): BookingStatusInfo => {
  switch (status) {
    case BookingStatus.DRAFT:
      return { label: "Bản nháp", color: "default" };
    case BookingStatus.PROCESSING:
      return { label: "Đang xử lý", color: "warning" };
    case BookingStatus.CONFIRMED:
      return { label: "Đã xác nhận", color: "info" };
    case BookingStatus.IN_PROGRESS:
      return { label: "Đang thực hiện", color: "warning" };
    case BookingStatus.COMPLETED:
      return { label: "Hoàn thành", color: "success" };
    case BookingStatus.CANCELLED:
      return { label: "Đã hủy", color: "error" };
    default:
      return { label: "Không xác định", color: "default" };
  }
};
