type CanonicalVerificationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Assigned"
  | "Completed"
  | "Cancelled";

export type VerificationStatus =
  | CanonicalVerificationStatus
  | Lowercase<CanonicalVerificationStatus>;

export type VerificationItemType = "Camera" | "Accessory" | "Combo" | "1" | "2" | "3";

export interface VerificationItem {
  itemId: string;
  itemName: string;
  itemType: VerificationItemType;
}

export interface InspectionMedia {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  label: string;
}

export interface VerificationInspection {
  id: string;
  itemId?: string | null;
  itemName: string;
  itemType: VerificationItemType | string;
  section: string;
  label: string;
  value: string | null;
  passed: boolean | null;
  notes: string | null;
  media: InspectionMedia[];
  inspectionTypeId?: string | null;
  type?: string | null;
  itemTypeValue?: number | string | null;
}

export interface CreateVerificationRequest {
  name: string;
  phoneNumber: string;
  inspectionDate: string;
  branchId: string;
  items: VerificationItem[];
  notes?: string;
}

export interface CreateVerificationResponse {
  success: boolean;
  message?: string;
  data?: Verification | null;
}

export interface Verification {
  id: string;
  name: string;
  phoneNumber: string;
  inspectionDate: string;
  status: VerificationStatus;
  staffId: string | null;
  staffName: string | null;
  branchId: string;
  branchName: string | null;
  address: string;
  notes: string | null;
  createdByUserId: string;
  inspections?: Inspection[];
  items: VerificationItem[];
  contracts?: Contract[];
  createdAt: string;
}
export interface Inspection {
  id: string;
  verificationId: string;
  itemName: string;
  section: string;
  media?: InspectionMedia[];
  itemType: VerificationItemType | string;
  label: string;
  inspectorId: string;
  value: string;
  inspectorName?: string;
  inspectionDate: string;
  passed: boolean;
  notes?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractSignature {
  role: string;
  fullName: string | null;
  isSigned: boolean;
  signedAt: string | null;
}

export interface Contract {
  id: string;
  status: string;
  branchName: string | null;
  branchAddress: string | null;
  createdAt: string;
  signedAt: string | null;
  signatures: ContractSignature[];
}