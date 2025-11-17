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
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  staffId: string | null;
  staffName: string | null;
  branchId: string;
  branchName: string;
  address: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}
