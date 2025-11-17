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
  data?: any;
}

export interface Verification {
  id: string;
  name: string;
  phoneNumber: string;
  inspectionDate: string;
  notes?: string;
  branchId: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "pending" | "approved" | "rejected";
}
