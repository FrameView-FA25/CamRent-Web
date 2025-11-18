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
  isAvailable: boolean;
  ownerUserId: string;
  ownerName: string | null;
}

export interface MediaItem {
  url: string;
  type?: string;
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
