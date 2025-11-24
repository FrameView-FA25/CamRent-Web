import type {
  CreateVerificationRequest,
  CreateVerificationResponse,
  Verification,
} from "../types/verification.types";

// URL cơ sở của API backend
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

// Export lại các type để sử dụng ở nơi khác
export type { CreateVerificationRequest, CreateVerificationResponse };

/**
 * Service quản lý các thao tác liên quan đến xác minh (Verification)
 * Bao gồm: tạo, cập nhật, xóa, gán nhân viên cho yêu cầu xác minh
 */
export const verificationService = {
  /**
   * Tạo một yêu cầu xác minh mới
   * Dùng để Owner gửi yêu cầu xác minh tài khoản hoặc thiết bị
   * Quyền: Owner, Admin
   * @param data - Dữ liệu yêu cầu xác minh
   * @returns Promise chứa kết quả tạo verification
   */
  async createVerification(
    data: CreateVerificationRequest
  ): Promise<CreateVerificationResponse> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/Verifications`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Tạo yêu cầu xác minh thất bại với mã lỗi ${response.status}`;
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
      const result = await response.json();
      return { success: true, data: result };
    }

    const text = await response.text();
    return { success: true, message: text };
  },

  /**
   * Cập nhật yêu cầu xác minh đã tồn tại
   * Quyền: Owner, Admin
   * @param id - ID của verification cần cập nhật
   * @param data - Dữ liệu cập nhật
   * @returns Promise chứa kết quả cập nhật verification
   */
  async updateVerification(
    id: string,
    data: CreateVerificationRequest
  ): Promise<CreateVerificationResponse> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/Verifications/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Cập nhật yêu cầu xác minh thất bại với mã lỗi ${response.status}`;
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
      const result = await response.json();
      return { success: true, data: result };
    }

    const text = await response.text();
    return { success: true, message: text };
  },

  /**
   * Lấy danh sách yêu cầu xác minh của user hiện tại
   * Quyền: Owner, BranchManager, Staff, Admin
   * @returns Promise chứa danh sách verification của user
   */
  async getVerificationsByUserId(): Promise<Verification[]> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Verifications/get_by_user_id`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Nếu không tìm thấy (404), trả về mảng rỗng thay vì throw error (user chưa có verification nào)
    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      let errorMessage = `Lấy danh sách yêu cầu xác minh thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  /**
   * Lấy thông tin chi tiết của một yêu cầu xác minh theo ID
   * Quyền: Owner, BranchManager, Staff, Admin
   * @param id - ID của verification cần lấy
   * @returns Promise chứa thông tin verification
   */
  async getVerificationById(id: string): Promise<Verification> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/Verifications/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Lấy thông tin yêu cầu xác minh thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  /**
   * Gán nhân viên (Staff) để xử lý yêu cầu xác minh
   * Dành cho BranchManager để phân công nhân viên kiểm tra và xác minh
   * Quyền: BranchManager, Admin
   * @param verificationId - ID của verification cần gán nhân viên
   * @param staffId - ID của nhân viên được gán
   * @returns Promise<void>
   */
  async assignStaff(verificationId: string, staffId: string): Promise<void> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Verifications/assign_staff?verificationId=${verificationId}&staffId=${staffId}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Gán nhân viên thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }
  },
  /**
   * Xóa yêu cầu xác minh
   * Quyền: Owner, Admin
   * @param verificationId - ID của verification cần xóa
   * @returns Promise<void>
   */
  async deleteVerification(verificationId: string): Promise<void> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Verifications/${verificationId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Xóa yêu cầu xác minh thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }
  },
};

