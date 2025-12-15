import type {
  Branch,
  CreateBranchRequest,
  UnassignedStaff,
  UserMembership,
} from "../types/branch.types";

const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

export const branchService = {
  /**
   * Lấy danh sách tất cả chi nhánh
   * Quyền: Người dùng đã đăng nhập
   */
  async getBranches(): Promise<Branch[]> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/Branchs`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Lấy danh sách chi nhánh thất bại với mã lỗi ${response.status}`;
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
  // Trả về các user có role Staff chưa có UserBranchMembership
  async getUnassignedStaff(): Promise<UnassignedStaff[]> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/Branchs/unassigned-staff`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Lấy danh sách nhân viên chưa phân công thất bại với mã lỗi ${response.status}`;
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
  // Trả về các user có role Manager chưa có UserBranchMembership
  async getUnassignedManager(): Promise<UnassignedStaff[]> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Branchs/unassigned-managers`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Lấy danh sách nhân viên chưa phân công thất bại với mã lỗi ${response.status}`;
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
  // tạo chi nhánh mới
  async createBranch(
    branchData: CreateBranchRequest
  ): Promise<{ message: string }> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }
    const response = await fetch(`${API_BASE_URL}/Branchs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(branchData),
    });
    if (!response.ok) {
      let errorMessage = `Tạo chi nhánh thất bại với mã lỗi ${response.status}`;
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
   * Gán nhân viên cho chi nhánh
   * PUT /api/Branchs/{branchId}/assign-staff/{staffId}
   * Quyền: Admin
   */
  async assignStaffToBranch(
    branchId: string,
    staffId: string
  ): Promise<{ message: string }> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Branchs/${branchId}/assign-staff/${staffId}`,
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

    return await response.json();
  },

  /**
   * Gán quản lý cho chi nhánh
   * PUT /api/Branchs/{branchId}/assign-manager/{managerId}
   * Quyền: Admin
   */
  async assignManagerToBranch(
    branchId: string,
    managerId: string
  ): Promise<{ message: string }> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Branchs/${branchId}/assign-manager/${managerId}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Gán quản lý thất bại với mã lỗi ${response.status}`;
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
   * Lấy chi tiết chi nhánh theo ID
   * GET /api/Branchs/{id}
   * Quyền: Người dùng đã đăng nhập
   */
  async getBranchById(id: string): Promise<Branch> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/Branchs/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Lấy chi tiết chi nhánh thất bại với mã lỗi ${response.status}`;
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
   * Lấy danh sách memberships của chi nhánh
   * GET /api/Branchs/Memberships
   * Quyền: Người dùng đã đăng nhập
   */
  async getBranchMembershipsByBranchId(
    branchId: string
  ): Promise<UserMembership[]> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Branchs/Memberships?branchId=${branchId}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Lấy danh sách memberships thất bại với mã lỗi ${response.status}`;
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
  // Xóa thành viên khỏi chi nhánh
  async removeMemberFromBranch(
    branchId: string,
    userId: string
  ): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(
      `${API_BASE_URL}/Branchs/${branchId}/members/${userId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = `Xóa thành viên thất bại với mã lỗi ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    // 204 No Content - không có response body
    return;
  },
};
