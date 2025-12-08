export interface Camera {
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
  platformFeePercent: number;
  location: string | null;
}
export interface Media {
  url: string;
  contentType: string;
  sizeBytes: number;
  label: string | null;
}
export interface CameraResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Camera[];
}
export interface CameraFilters {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  brand?: string;
  model?: string;
  branchName?: string;
}
export interface MediaItem {
  url: string;
  type?: string;
}

export interface AccessoryMedia {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  label: string;
}

export interface Accessory {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string;
  specsJson: string;
  branchName: string | null;
  branchAddress: string | null;
  itemType: "Accessory";
  baseDailyRate: number;
  platformFeePercent: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number | null;
  depositCapMaxVnd: number | null;
  isConfirmed: boolean;
  location: string;
  ownerUserId: string;
  ownerName: string | null;
  media: AccessoryMedia[];
}
