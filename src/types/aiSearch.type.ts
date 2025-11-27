export interface AISearchCriteria {
  budget?: {
    min: number;
    max: number;
  };
  purpose: string[]; // ['Outdoor', 'Portrait', 'Wedding', 'Event', 'Product', 'Video']
  experience: string; // 'Beginner', 'Intermediate', 'Professional'
  rentalDuration?: {
    days: number;
  };
  features?: string[]; // ['Autofocus', 'Image Stabilization', 'Weather Sealed', '4K Video']
  accessories?: string[]; // ['Lens', 'Tripod', 'Flash', 'Memory Card']
  location?: string;
  additionalRequirements?: string;
}

export interface AIRecommendation {
  camera: string; // camera ID
  matchScore: number; // 0-100
  reasons: string[];
  suggestedAccessories: string[];
  estimatedTotalCost: number;
}

export interface AISearchResponse {
  recommendations: AIRecommendation[];
  searchSummary: string;
  tips: string[];
}