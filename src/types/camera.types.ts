export interface Camera {
  id: string;
  brand: string;
  model: string;
  variant: string;
  serialNumber: string;
  branchName: string | null;
  bookingItemType: number;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number;
  depositCapMaxVnd: number;
  media: Media[];
  specsJson: string;
  categories: Category[];
}

export interface CreateCameraRequest {
  brand: string;
  model: string;
  variant: string;
  serialNumber: string;
  estimatedValueVnd: number;
  specsJson: string;
}

export interface CreateCameraResponse {
  id: string;
  brand: string;
  model: string;
  variant: string;
  serialNumber: string;
  estimatedValueVnd: number;
  specsJson: string;
}

export interface Media {
  id?: string;
  url: string;
  type?: string;
  isPrimary?: boolean;
}

export interface Category {
  id?: string;
  name: string;
}
