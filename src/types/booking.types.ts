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
  itemId: string;
  itemName: string;
  itemType: "Camera" | "Accessory" | "Combo" | "Product";
  unitPrice: number;
  quantity: number;
  depositAmount: number;

  // ID mapping
  cameraId?: string;
  accessoryId?: string;
  comboId?: string;
  productId?: string;

  // Data mapping
  camera?: Camera;
  accessory?: Accessory;
  combo?: Combo;
  product?: Product;
}

export interface Renter {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null; // 0: Female, 1: Male, 2: Other
  avatar?: string | string[] | null;
  emailConfirmed?: boolean | null;
  phoneNumberConfirmed?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  type: string;
  renterId: string;
  renter: Renter | null;
  staffId?: string;
  staffName?: string | null;
  pickupAt: string;
  returnAt: string;
  location: Location;
  branchId?: string;
  branch?: Branch | null;
  status: string; // "PendingApproval" | "Confirmed" | "InProgress" | "Completed" | "Cancelled"
  statusText: string;
  snapshotBaseDailyRate: number;
  snapshotDepositPercent: number;
  snapshotPlatformFeePercent: number;
  snapshotRentalTotal: number;
  snapshotDepositAmount: number;
  items: BookingItem[];
  inspections?: BookingInspection[];
  createdAt: string;
  updatedAt: string;
  contracts: Contracts[];
}
export interface Contracts {
  id: string;
  status: string;
  branchAddress: string;
  branchName: string;
  createdAt: string;
  signatures: string[];
  signedAt: string;
}
export interface Branch {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
}
export interface BookingStatusInfo {
  label: string;
  color: "warning" | "info" | "success" | "default" | "error";
}
export interface Staff {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  role: string;
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

// Booking Inspection Media (for inspections in booking details)
export interface BookingInspectionMedia {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  label: string;
}

// Booking Inspection (matches API response structure)
export interface BookingInspection {
  id: string;
  itemName: string;
  itemType: string; // "Camera" | "Accessory"
  section: string;
  label: string;
  value: string;
  passed: boolean | null;
  notes: string;
  media: BookingInspectionMedia[];
}

export interface CreateInspectionRequest {
  bookingId: string;
  type: number;
  performedByUserId: string;
  branchId: string;
  notes: string;
  items: InspectionItem[];
  inspectorId: string;
}
export interface Location {
  country: string;
  province: string;
  district: string;
}
export interface BookingDetail extends Booking {
  staffId?: string;
  staff?: Staff | null;
  branchId?: string;
  branch?: Branch | null;
  createdAt: string;
  updatedAt: string;
}
