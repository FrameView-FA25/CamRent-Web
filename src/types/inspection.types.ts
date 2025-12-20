export type ItemType = 1 | 2 | 3;

export const ITEM_TYPE_OPTIONS: Array<{ value: ItemType; label: string }> = [
  { value: 1, label: "Camera" },
  { value: 2, label: "Phụ kiện" },
  { value: 3, label: "Combo" },
];

export type InspectionType = 1 | 2;

export const INSPECTION_TYPE_OPTIONS: Array<{
  value: InspectionType;
  label: string;
}> = [
  { value: 1, label: "Booking" },
  { value: 2, label: "Verification" },
];

export interface InspectionMethod {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  sortOrder: number;
  allowedMethods: InspectionMethod[];
}

export interface ChecklistSection {
  id: string;
  name: string;
  sortOrder: number;
  items: ChecklistItem[];
}

export interface ChecklistTemplateSummary {
  id: string;
  name: string;
  itemType: ItemType | string;
  inspectionType?: InspectionType | string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ChecklistTemplateDetail extends ChecklistTemplateSummary {
  sections: ChecklistSection[];
}

export interface UpsertInspectionMethodRequest {
  code: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpsertChecklistItemRequest {
  label: string;
  sortOrder?: number;
  allowedMethodIds?: string[];
}

export interface UpsertChecklistSectionRequest {
  sortOrder?: number;
  items: UpsertChecklistItemRequest[];
}

export interface UpsertChecklistTemplateRequest {
  name: string;
  itemType: ItemType;
  inspectionType?: InspectionType | null;
  isActive?: boolean;
  sections: UpsertChecklistSectionRequest[];
}
