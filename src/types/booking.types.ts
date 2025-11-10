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
export interface Staff {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
}