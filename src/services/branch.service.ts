import type { Branch } from "../types/branch.types";

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
  // tạo chi nhánh mới
  async createBranch(branchData: Partial<Branch>): Promise<Branch> {
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
};
