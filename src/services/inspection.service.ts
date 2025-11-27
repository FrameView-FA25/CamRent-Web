// URL cơ sở của API backend
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export type UpdateInspectionPayload = FormData;

/**
 * Tạo bản kiểm tra thiết bị (Inspection) và upload file ảnh
 * Dành cho Staff để kiểm tra tình trạng thiết bị khi nhận/trả
 * FormData chứa: bookingId, itemId, condition, notes, và các file ảnh
 * @param formData - FormData chứa dữ liệu inspection và file ảnh (multipart/form-data)
 * @returns Promise chứa kết quả tạo inspection
 */
export async function createInspection(formData: FormData): Promise<any> {
  // Lấy token xác thực từ localStorage
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  // Gọi API để tạo inspection
  const response = await fetch(`${API_BASE_URL}/Inspections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Không set Content-Type, browser sẽ tự set với boundary cho FormData
    },
    body: formData,
  });

  // Xử lý lỗi nếu response không thành công
  if (!response.ok) {
    let errorMessage = `Tạo inspection thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Nếu không parse được JSON, thử lấy text
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  // Kiểm tra content-type để parse response đúng cách
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

/**
 * Cập nhật thông tin một inspection hiện có
 * @param inspectionId - ID inspection cần cập nhật
 * @param payload - Dữ liệu cần cập nhật
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

  // optional: consume body to avoid unresolved promise for some backends
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    await response.json().catch(() => undefined);
  } else {
    await response.text().catch(() => "");
  }
}

/**
 * Xóa một inspection theo ID
 * @param inspectionId - ID inspection cần xóa
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
 * @param inspectionId - ID inspection cần duyệt
 * @param pass - true: duyệt, false: từ chối
 * @returns Promise chứa kết quả approve
 */
export async function approveInspection(
  inspectionId: string,
  pass: boolean = true
): Promise<any> {
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
    let errorMessage = `${pass ? "Duyệt" : "Từ chối"} inspection thất bại với mã lỗi ${response.status}`;
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
 * Lấy chi tiết một inspection theo ID
 * @param inspectionId - ID inspection cần lấy
 * @returns Promise chứa thông tin inspection
 */
export async function getInspectionById(inspectionId: string): Promise<any> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(`${API_BASE_URL}/Inspections/${inspectionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Lấy thông tin inspection thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

/**
 * Lấy danh sách inspections theo booking ID
 * @param bookingId - ID booking cần lấy inspections
 * @returns Promise chứa danh sách inspections
 */
export async function getInspectionsByBookingId(
  bookingId: string
): Promise<any[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");

  const response = await fetch(
    `${API_BASE_URL}/Inspections/booking/${bookingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Lấy danh sách inspections thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return await response.json();
  }
  return [];
}