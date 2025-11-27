export interface VerificationItem {
  itemId: string;
  itemName: string;
  itemType: "Camera" | "Accessory";
}

export interface InspectionMedia {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  label: string;
}

export interface Inspection {
  id: string;
  itemName: string;
  itemType: "Camera" | "Accessory";
  section: string;
  label: string;
  value: string;
  passed: boolean | null;
  notes: string | null;
  media: InspectionMedia[];
}

export interface Verification {
  id: string;
  name: string;
  phoneNumber: string;
  inspectionDate: string;
  status: "Pending" | "Approved" | "Rejected";
  staffId: string | null;
  staffName: string | null;
  branchId: string;
  branchName: string | null;
  address: string;
  notes: string | null;
  createdByUserId: string;
  items: VerificationItem[];
  inspections: Inspection[];
}