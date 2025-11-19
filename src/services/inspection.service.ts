// API endpoint base
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

/**
 * Tạo inspection và upload file liên quan (Staff)
 * @param {FormData} formData - Dữ liệu inspection và file (multipart/form-data)
 * @returns {Promise<any>} Kết quả tạo inspection
 */
export async function createInspection(formData: FormData): Promise<any> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
  const response = await fetch(`${API_BASE_URL}/Inspections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    let errorMessage = `Tạo inspection thất bại với mã lỗi ${response.status}`;
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
