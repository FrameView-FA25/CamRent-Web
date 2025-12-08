export interface Accessory {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchName: string;
  branchAddress: string | null;
  itemType: number;
  bookingItemType: number;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number;
  depositCapMaxVnd: number;
  media: MediaItem[];
  specsJson: string | null;
  categories: string[];
  isConfirmed: boolean;
  ownerUserId: string;
  ownerName: string | null;
}

export interface MediaItem {
  id: string;
  url?: string;
  contentType?: string;
  sizeBytes?: number;
  label?: string | null;
}

export interface AccessoryResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Accessory[];
}

export interface AccessoryFilters {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  brand?: string;
  model?: string;
  branchName?: string;
}

export interface AccessoryQrHistoryResponse {
  accessory: Accessory;
  bookings: Array<AccessoryBooking>;
  inspections: Array<AccessoryInspection>;
}

export interface AccessoryBooking {
  bookingId: string;
  renterName: string;
  pickupAt: string;
  returnAt: string;
  status: string;
}

export interface AccessoryInspection {
  id: string;
  label?: string;
  itemName?: string;
  section?: string;
  itemType?: string;
  notes?: string;
  passed: boolean;
}
