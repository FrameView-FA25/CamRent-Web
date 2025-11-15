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
  media: string[];
  specsJson: string | null;
  categories: string[];
}
export interface CameraResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Camera[];
}
