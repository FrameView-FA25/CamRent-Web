export interface CreateVerificationRequest {
  name: string;
  phoneNumber: string;
  inspectionDate: string; // ISO 8601 format
  notes?: string;
  branchId: string;
}

export interface CreateVerificationResponse {
  success: boolean;
  message?: string;
  data?: [];
}

export interface Verification {
  id: string;
  name: string;
  phoneNumber: string;
  inspectionDate: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  staffId: string | null;
  staffName: string | null;
  branchId: string;
  branchName: string;
  address: string;
  notes: string;
  items: VerificationItem[];
  inspections: [];

  createdAt?: string;
  updatedAt?: string;
  
}
export interface VerificationItem {
  itemId: string;
  itemName: string;
  itemType: number; // 1: Camera, 2: Accessory
}