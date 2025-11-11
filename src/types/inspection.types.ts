export interface InspectionItem {
  section: string;
  label: string;
  value: string;
  passed: boolean;
  notes: string;
}

export interface InspectionPayload {
  bookingId: string;
  type: number; // 1 = Before Rental, 2 = After Return
  performedByUserId: string;
  branchId: string;
  notes: string;
  items: InspectionItem[];
}

export interface Inspection {
  id: string;
  bookingId: string;
  type: number;
  performedByUserId: string;
  performedByUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  notes: string;
  items: InspectionItem[];
  createdAt: string;
  updatedAt: string;
}

export const InspectionType = {
  BEFORE_RENTAL: 1,
  AFTER_RETURN: 2,
} as const;

export const getInspectionTypeText = (type: number): string => {
  switch (type) {
    case InspectionType.BEFORE_RENTAL:
      return "Kiểm tra trước cho thuê";
    case InspectionType.AFTER_RETURN:
      return "Kiểm tra sau khi trả";
    default:
      return "Không xác định";
  }
};
