export type VerificationItemType = "1" | "2" | "Camera" | "Accessory";

export interface VerificationItem {
  itemId: string;
  itemName: string;
  itemType: VerificationItemType;
}

export interface CreateVerificationRequest {
  name: string;
  phoneNumber: string;
  inspectionDate: string; // ISO 8601 format
  notes?: string;
  branchId: string;
  // Cho phép gửi nhiều item
  items: VerificationItem[];
}

export interface CreateVerificationResponse {
  success: boolean;
  message?: string;
  data?: [];
}

export interface VerificationInspection {
  id: string;
  itemName: string;
  itemType: string; // "Camera" | "Accessory"
  section: string;
  label: string;
  value: string;
  passed: boolean;
  notes: string;
  media: string[];
}

export interface Verification {
  id: string;
  name: string;
  phoneNumber: string;
  inspectionDate: string;
  status: "Pending" | "approved" | "rejected" | "completed" | "cancelled";
  staffId: string | null;
  staffName: string | null;
  branchId: string;
  branchName: string;
  address: string;
  notes: string;
  // Danh sách item đi kèm với yêu cầu (camera / accessory)
  items?: VerificationItem[];
  inspections?: VerificationInspection[];

  createdAt?: string;
  updatedAt?: string;
}
