export interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchName: string;
  bookingItemType: number;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number;
  depositCapMaxVnd: number;
  media: MediaItem[];
  specsJson: string | null;
  categories: string[];
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
  sortDir?: 'asc' | 'desc';
  brand?: string;
  model?: string;
  branchName?: string;
}
export interface MediaItem {
  url: string;
  type?: string;
}