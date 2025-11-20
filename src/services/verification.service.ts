import type {
  CreateVerificationRequest,
  CreateVerificationResponse,
  Verification,
} from "../types/verification.types";

const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export type { CreateVerificationRequest, CreateVerificationResponse };

export const verificationService = {
  /**
   * Tạo một yêu cầu xác minh mới
   * Quyền: Owner, Admin
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
   * Cập nhật yêu cầu xác minh
   * Quyền: Owner, Admin
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
   * Lấy danh sách yêu cầu xác minh theo user
   * Quyền: Owner, BranchManager, Staff, Admin
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

    // Nếu không tìm thấy (404), trả về mảng rỗng thay vì throw error
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
   * Gán nhân viên cho verification
   * Quyền: BranchManager, Admin
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

// Delete verification
