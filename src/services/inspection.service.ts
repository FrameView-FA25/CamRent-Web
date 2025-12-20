import type { ChecklistTemplateDetail } from "@/types/inspection.types";

// URL cơ sở của API backend
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export type UpdateInspectionPayload = FormData;

// Interface cho inspection DTO (Data Transfer Object)
export interface InspectionDto {
  id: string;
  bookingId: string;
  itemId: string;
  itemName?: string;
  itemType?: string;
  condition: string;
  notes?: string | null;
  passed: boolean;
  createdAt: string;
  updatedAt?: string;
  media?: Array<{
    id: string;
    url: string;
    label?: string;
    contentType?: string;
  }>;
}

// Request để submit một dòng trong checklist
export interface SubmitChecklistRowRequest {
  itemId: string; // ID của checklist item (Guid)
  methodIds: string[]; // Danh sách ID của các phương pháp kiểm tra
  passed?: boolean | null; // Trạng thái đạt/không đạt
  notes?: string; // Ghi chú
}

// Request để tạo phiếu kiểm tra mới
export interface CreateInspectionFormRequest {
  itemType: number; // Loại thiết bị: 1 = Camera, 2 = Accessory, 3 = Combo
  itemId: string; // ID của thiết bị (Guid)
  type: number; // Loại kiểm tra: 1 = Booking, 2 = Verification
  inspectionTypeId: string; // ID của booking hoặc verification request (Guid)
  handoverType?: number | null; // Loại bàn giao: 0 = Pickup, 1 = Return (chỉ dùng cho Booking)
  branchId?: string | null; // ID của chi nhánh (Guid)
  passed?: boolean | null; // Trạng thái tổng thể đạt/không đạt
  rows: SubmitChecklistRowRequest[]; // Danh sách các dòng checklist
}

// Response khi tạo phiếu kiểm tra thành công
export interface CreateInspectionFormResponse {
  id: string; // ID của phiếu kiểm tra (Guid)
}

// Request để cập nhật một dòng trong phiếu kiểm tra
export interface UpdateInspectionFormRowRequest {
  inspectionId: string; // ID của dòng kiểm tra (Guid)
  methodIds?: string[]; // Danh sách ID của các phương pháp kiểm tra
  passed?: boolean | null; // Trạng thái đạt/không đạt
  notes?: string; // Ghi chú
}

// Request để cập nhật phiếu kiểm tra
export interface UpdateInspectionFormRequest {
  passed?: boolean | null; // Trạng thái tổng thể đạt/không đạt
  rows: UpdateInspectionFormRowRequest[]; // Danh sách các dòng cần cập nhật
}

// Response chi tiết của phiếu kiểm tra
export interface InspectionFormResponse {
  id: string;
  templateId: string;
  templateName: string;
  staffId?: string;
  staffName?: string;
  itemType: number;
  itemId: string;
  type: number;
  handoverType?: number | null;
  inspectionTypeId: string;
  branchId?: string | null;
  overallPassed?: boolean | null;
  createdAt: string;
  rows: InspectionFormRowResponse[];
}

// Response của một dòng trong phiếu kiểm tra
export interface InspectionFormRowResponse {
  inspectionId: string;
  label: string;
  passed?: boolean | null;
  notes: string;
  methods: InspectionMethodResponse[];
  media: FileAssetDTO[];
}

// Response của phương pháp kiểm tra
export interface InspectionMethodResponse {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

// Type cho raw API response (có thể là PascalCase hoặc camelCase)
interface RawInspectionMethodResponse {
  Id?: string;
  id?: string;
  Code?: string;
  code?: string;
  Name?: string;
  name?: string;
  SortOrder?: number;
  sortOrder?: number;
  IsActive?: boolean;
  isActive?: boolean;
}

// DTO cho file đính kèm
export interface FileAssetDTO {
  id: string;
  url: string;
  contentType?: string;
  sizeBytes?: number;
  label?: string;
}

// Response tóm tắt của phiếu kiểm tra
export interface InspectionFormSummaryResponse {
  id: string;
  templateId: string;
  templateName: string;
  staffId?: string;
  staffName?: string;
  itemType: number | string; // Chấp nhận cả number và string
  itemId: string;
  type: number | string; // Chấp nhận cả number và string
  handoverType?: number | null;
  inspectionTypeId: string;
  branchId?: string | null;
  overallPassed?: boolean | null;
  createdAt: string;
}

/**
 * Lấy checklist template đang active theo loại thiết bị và loại kiểm tra
 * GET /api/inspection-checklists/active
 * @param itemType - Loại thiết bị (1 = Camera, 2 = Accessory, 3 = Combo)
 * @param inspectionType - Loại kiểm tra (1 = Booking, 2 = Verification)
 * @returns Promise chứa thông tin checklist template
 */
export async function getActiveChecklistTemplate(
  itemType: number,
  inspectionType?: number
): Promise<ChecklistTemplateDetail> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const params = new URLSearchParams();
  params.append("itemType", String(itemType));
  if (inspectionType !== undefined) {
    params.append("inspectionType", String(inspectionType));
  }

  const response = await fetch(
    `${API_BASE_URL}/inspection-checklists/active?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Lấy checklist thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as ChecklistTemplateDetail;
}

/**
 * Cập nhật thông tin một inspection hiện có
 * PUT /api/Inspections/{inspectionId}
 * @param inspectionId - ID của inspection cần cập nhật
 * @param payload - Dữ liệu cần cập nhật (FormData)
 */
export async function updateInspection(
  inspectionId: string,
  payload: UpdateInspectionPayload
): Promise<void> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(`${API_BASE_URL}/Inspections/${inspectionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });

  if (!response.ok) {
    let errorMessage = `Cập nhật inspection thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  // Tiêu thụ response body để tránh promise không được giải quyết ở một số backend
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    await response.json().catch(() => undefined);
  } else {
    await response.text().catch(() => "");
  }
}

/**
 * Cập nhật phiếu kiểm tra (Inspection Form) theo API mới
 * PUT /api/inspection-forms/{id}
 * @param formId - ID của phiếu kiểm tra cần cập nhật
 * @param request - Dữ liệu cập nhật
 */
export async function updateInspectionForm(
  formId: string,
  request: UpdateInspectionFormRequest
): Promise<void> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(`${API_BASE_URL}/inspection-forms/${formId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = `Cập nhật phiếu kiểm tra thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  // Tiêu thụ response body để tránh promise không được giải quyết ở một số backend
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    await response.json().catch(() => undefined);
  } else {
    await response.text().catch(() => "");
  }
}

/**
 * Lấy danh sách các phương pháp kiểm tra
 * GET /api/inspection-methods
 * @param includeInactive - Có bao gồm các phương pháp không active không
 * @returns Promise chứa danh sách các phương pháp kiểm tra
 */
export async function getInspectionMethods(
  includeInactive: boolean = false
): Promise<InspectionMethodResponse[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const query = includeInactive ? "?includeInactive=true" : "";
  const url = `${API_BASE_URL}/inspection-methods${query}`;
  console.log("📡 getInspectionMethods - Calling API:", url);
  console.log("📡 getInspectionMethods - includeInactive:", includeInactive);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("📡 getInspectionMethods - Response status:", response.status);

  if (!response.ok) {
    let errorMessage = `Lấy danh sách methods thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("📡 getInspectionMethods - Raw response data:", data);

  // Backend có thể trả về array trực tiếp hoặc wrapped trong object
  let methodsArray: RawInspectionMethodResponse[] = [];
  if (Array.isArray(data)) {
    methodsArray = data as RawInspectionMethodResponse[];
    console.log(
      "📡 getInspectionMethods - Data is array, length:",
      methodsArray.length
    );
  } else if (data && typeof data === "object") {
    // Thử các key phổ biến
    methodsArray = (data.data ||
      data.results ||
      data.items ||
      data.methods ||
      []) as RawInspectionMethodResponse[];
    console.log(
      "📡 getInspectionMethods - Data is object, extracted array length:",
      methodsArray.length
    );
  } else {
    console.warn(
      "📡 getInspectionMethods - Unexpected data format:",
      typeof data
    );
  }

  // Backend trả về PascalCase, convert sang camelCase
  const mapped = methodsArray.map((item: RawInspectionMethodResponse) => ({
    id: item.Id || item.id || "",
    code: item.Code || item.code || "",
    name: item.Name || item.name || "",
    sortOrder: item.SortOrder ?? item.sortOrder ?? 0,
    isActive: item.IsActive ?? item.isActive ?? true,
  }));

  // Sắp xếp theo sortOrder
  mapped.sort((a, b) => a.sortOrder - b.sortOrder);

  console.log("📡 getInspectionMethods - Final mapped methods:", mapped);
  console.log("📡 getInspectionMethods - Final count:", mapped.length);

  return mapped;
}

/**
 * Xóa một inspection theo ID
 * DELETE /api/Inspections/{inspectionId}
 * @param inspectionId - ID của inspection cần xóa
 */
export async function deleteInspection(inspectionId: string): Promise<void> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(`${API_BASE_URL}/Inspections/${inspectionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `Xóa inspection thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Duyệt hoặc từ chối một inspection
 * Chỉ dành cho BranchManager
 * PUT /api/Inspections/{id}/approve?pass=true|false
 * @param inspectionId - ID của inspection cần duyệt
 * @param pass - true: duyệt, false: từ chối
 * @returns Promise chứa kết quả approve
 */
interface ApproveInspectionResponse {
  id: string;
  status: "Approved" | "Rejected";
  approvedBy: string;
  approvedAt: string;
}

export async function approveInspection(
  inspectionId: string,
  pass: boolean = true
): Promise<ApproveInspectionResponse | string> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(
    `${API_BASE_URL}/Inspections/${inspectionId}/approve?pass=${pass}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `${
      pass ? "Duyệt" : "Từ chối"
    } inspection thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  // Parse response
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

/**
 * Tạo phiếu kiểm tra (Inspection Form)
 * POST /api/inspection-forms
 * @param request - Dữ liệu để tạo phiếu kiểm tra
 * @returns Promise chứa ID của phiếu kiểm tra vừa tạo
 */
export async function createInspectionForm(
  request: CreateInspectionFormRequest
): Promise<CreateInspectionFormResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(`${API_BASE_URL}/inspection-forms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemType: request.itemType,
      itemId: request.itemId,
      type: request.type,
      inspectionTypeId: request.inspectionTypeId,
      handoverType: request.handoverType ?? null,
      branchId: request.branchId ?? null,
      passed: request.passed ?? null,
      rows: request.rows.map((row) => ({
        itemId: row.itemId,
        methodIds: row.methodIds,
        passed: row.passed ?? null,
        notes: row.notes ?? "",
      })),
    }),
  });

  if (!response.ok) {
    let errorMessage = `Tạo phiếu kiểm tra thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  // Backend trả về { Id: formId }, convert sang { id: formId }
  return { id: result.Id || result.id };
}

/**
 * Lấy chi tiết phiếu kiểm tra theo ID
 * GET /api/inspection-forms/{id}
 * @param formId - ID của phiếu kiểm tra cần lấy
 * @returns Promise chứa thông tin chi tiết phiếu kiểm tra
 */
export async function getInspectionFormById(
  formId: string
): Promise<InspectionFormResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(`${API_BASE_URL}/inspection-forms/${formId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Lấy chi tiết phiếu kiểm tra thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as InspectionFormResponse;
}

/**
 * Lấy danh sách phiếu kiểm tra theo booking ID
 * GET /api/inspection-forms/booking/{bookingId}
 * @param bookingId - ID của booking cần lấy danh sách phiếu kiểm tra
 * @returns Promise chứa danh sách phiếu kiểm tra
 */
export async function getInspectionFormsByBookingId(
  bookingId: string
): Promise<InspectionFormSummaryResponse[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(
    `${API_BASE_URL}/inspection-forms/booking/${bookingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Lấy danh sách phiếu kiểm tra thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("🔍 Raw API response for booking forms:", data);

  // Kiểm tra nếu data không phải là array hoặc có structure của checklist template
  if (!Array.isArray(data)) {
    console.error("❌ API returned non-array data:", data);
    // Nếu data có structure của checklist template (có sections), thì đây là lỗi
    if (data && typeof data === "object" && "sections" in data) {
      console.error(
        "⚠️ API returned checklist template instead of inspection forms!"
      );
      throw new Error(
        "API đang trả về checklist template thay vì danh sách phiếu kiểm tra. Vui lòng kiểm tra lại backend."
      );
    }
    return [];
  }

  // Backend trả về PascalCase, convert sang camelCase
  const mapped: InspectionFormSummaryResponse[] = [];
  for (const item of data) {
    // Kiểm tra nếu item có structure của checklist template
    if (item && typeof item === "object" && "sections" in item) {
      console.error("⚠️ Item has checklist template structure:", item);
      continue;
    }

    mapped.push({
      id: item.Id || item.id,
      templateId: item.TemplateId || item.templateId,
      templateName: item.TemplateName || item.templateName,
      staffId: item.StaffId || item.staffId,
      staffName: item.StaffName || item.staffName,
      itemType: item.ItemType || item.itemType,
      itemId: item.ItemId || item.itemId,
      type: item.Type || item.type,
      handoverType: item.HandoverType ?? item.handoverType ?? null,
      inspectionTypeId: item.InspectionTypeId || item.inspectionTypeId,
      branchId: item.BranchId ?? item.branchId ?? null,
      overallPassed: item.OverallPassed ?? item.overallPassed ?? null,
      createdAt: item.CreatedAt || item.createdAt,
    });
  }
  return mapped;
}

/**
 * Lấy danh sách phiếu kiểm tra theo verification ID
 * GET /api/inspection-forms/verification/{verificationId}
 * @param verificationId - ID của verification request cần lấy danh sách phiếu kiểm tra
 * @returns Promise chứa danh sách phiếu kiểm tra
 */
export async function getInspectionFormsByVerificationId(
  verificationId: string
): Promise<InspectionFormSummaryResponse[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(
    `${API_BASE_URL}/inspection-forms/verification/${verificationId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Lấy danh sách phiếu kiểm tra thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("🔍 Raw API response for verification forms:", data);

  // Kiểm tra nếu data không phải là array hoặc có structure của checklist template
  if (!Array.isArray(data)) {
    console.error("❌ API returned non-array data:", data);
    // Nếu data có structure của checklist template (có sections), thì đây là lỗi
    if (data && typeof data === "object" && "sections" in data) {
      console.error(
        "⚠️ API returned checklist template instead of inspection forms!"
      );
      throw new Error(
        "API đang trả về checklist template thay vì danh sách phiếu kiểm tra. Vui lòng kiểm tra lại backend."
      );
    }
    return [];
  }

  // Backend trả về PascalCase, convert sang camelCase
  const mapped: InspectionFormSummaryResponse[] = [];
  for (const item of data) {
    // Kiểm tra nếu item có structure của checklist template
    if (item && typeof item === "object" && "sections" in item) {
      console.error("⚠️ Item has checklist template structure:", item);
      continue;
    }

    mapped.push({
      id: item.Id || item.id,
      templateId: item.TemplateId || item.templateId,
      templateName: item.TemplateName || item.templateName,
      staffId: item.StaffId || item.staffId,
      staffName: item.StaffName || item.staffName,
      itemType: item.ItemType || item.itemType,
      itemId: item.ItemId || item.itemId,
      type: item.Type || item.type,
      handoverType: item.HandoverType ?? item.handoverType ?? null,
      inspectionTypeId: item.InspectionTypeId || item.inspectionTypeId,
      branchId: item.BranchId ?? item.branchId ?? null,
      overallPassed: item.OverallPassed ?? item.overallPassed ?? null,
      createdAt: item.CreatedAt || item.createdAt,
    });
  }
  return mapped;
}
