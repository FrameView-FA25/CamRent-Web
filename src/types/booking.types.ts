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
  id?: string;
  bookingId?: string;
  cameraId?: string;
  accessoryId?: string;
  comboId?: string; // ID của combo
  productId?: string; // Thêm productId
  quantity: number;
  unitPrice: number;
  depositAmount: number;
  camera?: Camera;
  accessory?: Accessory;
  combo?: Combo; // Thông tin combo
  product?: Product; // Thêm product
}

export interface Renter {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: number; // 0: Female, 1: Male, 2: Other
  avatar: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  renterId: string;
  type: number;
  pickupAt: string;
  returnAt: string;
  deliveryAddress: string;
  status: number;
  statusText: string;
  snapshotRentalTotal: number;
  snapshotDepositAmount: number;
  snapshotTransportFee: number;
  snapshotPlatformFeePercent?: number; // Phần trăm phí nền tảng
  snapshotDepositPercent?: number; // Phần trăm tiền cọc
  createdAt: string;
  updatedAt: string;
  renter?: Renter; // Optional renter details
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
export interface CreateDeliveryRequest {
  bookingId: string;
  assigneeUserId: string;
  trackingCode: string;
  notes: string;
  deliveryFee: number;
}
export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  depositAmount: number;
  rating: number;
  reviewCount: number;
  categoryId: string;
  description: string;
  specifications: string;
  status: number; // 0: Inactive, 1: Active, 2: Maintenance
  createdAt: string;
  updatedAt: string;
  images?: string[]; // Optional: array of image URLs
  thumbnail?: string; // Optional: main product image
}

export interface BookingItemWithProduct {
  id: string;
  bookingId?: string;
  productId: string;
  cameraId?: string;
  accessoryId?: string;
  quantity: number;
  unitPrice: number;
  depositAmount: number;
  product?: Product; // Product details
  camera?: Camera; // Camera details (if applicable)
  accessory?: Accessory; // Accessory details (if applicable)
}

export interface InspectionItem {
  section: string;
  label: string;
  value: string;
  passed: boolean;
  notes: string;
  images?: string[]; // URLs của hình ảnh
}

export interface Inspection {
  bookingId: string;
  type: number; // 1: Check-in, 2: Check-out
  performedByUserId: string;
  branchId: string;
  notes: string;
  items: InspectionItem[];
}

export interface CreateInspectionRequest {
  bookingId: string;
  type: number;
  performedByUserId: string;
  branchId: string;
  notes: string;
  items: InspectionItem[];
}
