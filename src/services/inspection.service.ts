// URL cơ sở của API backend
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

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
