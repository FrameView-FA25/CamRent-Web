// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

export interface WorkSlot {
  id: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateWorkSlotRequest {
  slotIndex: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface UpdateWorkSlotRequest {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export const workSlotService = {
  /**
   * Lấy danh sách tất cả các slot làm việc
   */
  async getWorkSlots(): Promise<WorkSlot[]> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/WorkSlots`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể tải danh sách khung giờ làm việc (mã ${response.status})`
      );
    }

    const json = (await response.json()) as WorkSlot[];
    return json;
  },

  /**
   * Tạo slot làm việc mới (chỉ Admin)
   */
  async createWorkSlot(request: CreateWorkSlotRequest): Promise<string> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/WorkSlots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể tạo khung giờ làm việc (mã ${response.status})`
      );
    }

    const json = (await response.json()) as string;
    return json;
  },

  /**
   * Cập nhật slot làm việc (chỉ Admin)
   */
  async updateWorkSlot(
    id: string,
    request: UpdateWorkSlotRequest
  ): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/WorkSlots/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể cập nhật khung giờ làm việc (mã ${response.status})`
      );
    }
  },

  /**
   * Xóa slot làm việc (chỉ Admin)
   */
  async deleteWorkSlot(id: string): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const response = await fetch(`${API_BASE_URL}/WorkSlots/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Không thể xóa khung giờ làm việc (mã ${response.status})`
      );
    }
  },
};
