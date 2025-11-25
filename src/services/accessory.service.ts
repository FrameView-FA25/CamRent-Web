import type {
  Accessory,
  AccessoryResponse,
  AccessoryFilters,
  AccessoryQrHistoryResponse,
} from "../types/accessory.types";

// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

/**
 * Hàm helper để lấy token xác thực từ localStorage
 * @returns Token xác thực hoặc null nếu không tìm thấy
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

/**
 * Service quản lý các thao tác liên quan đến phụ kiện (Accessories)
 * Bao gồm: lấy danh sách, tạo mới, cập nhật, xóa phụ kiện
 */
export const accessoryService = {
  /**
   * Lấy danh sách tất cả phụ kiện với các bộ lọc (phân trang, sắp xếp, tìm kiếm)
   * @param filters - Đối tượng chứa các bộ lọc: page, pageSize, sortBy, sortDir, brand, model
   * @returns Promise chứa danh sách phụ kiện với thông tin phân trang
   */
  getAccessories: async (
    filters: AccessoryFilters
  ): Promise<AccessoryResponse> => {
    // Tạo query parameters từ filters
    const params = new URLSearchParams();
    params.append("page", filters.page.toString());
    params.append("pageSize", filters.pageSize.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.model) params.append("model", filters.model);

    // Lấy token xác thực và chuẩn bị headers
    const token = getAuthToken();
    const headers: HeadersInit = {};

    // Thêm token vào header nếu có
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Gọi API để lấy danh sách phụ kiện
    const response = await fetch(
      `${API_BASE_URL}/Accessories?${params.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    // Kiểm tra nếu response không thành công
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Trả về dữ liệu JSON
    return await response.json();
  },

  /**
   * Lấy thông tin chi tiết của một phụ kiện theo ID
   * @param id - ID của phụ kiện cần lấy
   * @returns Promise chứa thông tin chi tiết của phụ kiện
   */
  getAccessoryById: async (id: string): Promise<Accessory> => {
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/Accessories/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Lấy danh sách tất cả phụ kiện của chủ sở hữu hiện tại (dựa trên token)
   * Yêu cầu đăng nhập
   * @returns Promise chứa danh sách phụ kiện của owner
   */
  getAccessoriesByOwnerId: async (): Promise<Accessory[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${API_BASE_URL}/Accessories/GetAccessoriesByOwnerId`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Tạo phụ kiện mới
   * FormData có thể chứa: thông tin phụ kiện (brand, model, variant, ...) và file ảnh
   * Yêu cầu đăng nhập với quyền Owner
   * @param formData - FormData chứa thông tin phụ kiện và file ảnh
   * @returns Promise chứa thông tin phụ kiện vừa tạo
   */
  createAccessory: async (formData: FormData): Promise<Accessory> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/Accessories`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Cập nhật thông tin phụ kiện
   * Có thể cập nhật: thông tin cơ bản, thêm ảnh mới, xóa ảnh cũ
   * Yêu cầu đăng nhập với quyền Owner
   * @param accessoryId - ID của phụ kiện cần cập nhật
   * @param accessoryData - Dữ liệu cập nhật (có thể là một phần), bao gồm mediaFiles và removeMediaIds
   * @returns Promise chứa thông tin phụ kiện sau khi cập nhật
   */
  updateAccessory: async (
    accessoryId: string,
    accessoryData: Partial<Accessory> & {
      mediaFiles?: File[]; // Danh sách file ảnh mới cần thêm
      removeMediaIds?: string[]; // Danh sách ID của ảnh cũ cần xóa
    }
  ): Promise<Accessory> => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      // Tạo FormData để gửi dữ liệu cập nhật
      const formData = new FormData();

      // Thêm Id vào FormData (bắt buộc theo API spec)
      formData.append("Id", accessoryId);

      /**
       * Hàm helper để thêm field vào FormData chỉ khi giá trị được định nghĩa
       * Bỏ qua các giá trị undefined, null, hoặc NaN
       */
      const appendIfDefined = (key: string, value: unknown) => {
        if (value === undefined || value === null) {
          return;
        }
        if (typeof value === "number" && Number.isNaN(value)) {
          return;
        }
        formData.append(key, String(value));
      };

      // Thêm các trường dữ liệu vào FormData (chỉ thêm nếu có giá trị)
      appendIfDefined("Brand", accessoryData.brand); // Thương hiệu
      appendIfDefined("Model", accessoryData.model); // Model
      appendIfDefined("Variant", accessoryData.variant); // Phiên bản
      appendIfDefined("SerialNumber", accessoryData.serialNumber); // Số serial
      appendIfDefined("BaseDailyRate", accessoryData.baseDailyRate); // Giá thuê cơ bản/ngày
      appendIfDefined("EstimatedValueVnd", accessoryData.estimatedValueVnd); // Giá trị ước tính (VNĐ)
      appendIfDefined("DepositPercent", accessoryData.depositPercent); // Phần trăm đặt cọc
      appendIfDefined("DepositCapMinVnd", accessoryData.depositCapMinVnd); // Mức đặt cọc tối thiểu (VNĐ)
      appendIfDefined("DepositCapMaxVnd", accessoryData.depositCapMaxVnd); // Mức đặt cọc tối đa (VNĐ)
      appendIfDefined("SpecsJson", accessoryData.specsJson); // Thông số kỹ thuật dạng JSON

      // Thêm các file ảnh mới nếu có
      if (
        accessoryData.mediaFiles &&
        Array.isArray(accessoryData.mediaFiles) &&
        accessoryData.mediaFiles.length > 0
      ) {
        accessoryData.mediaFiles.forEach((file) => {
          if (file instanceof File) {
            formData.append("MediaFiles", file);
          }
        });
      }

      // Thêm danh sách ID của ảnh cũ cần xóa nếu có
      if (
        accessoryData.removeMediaIds &&
        Array.isArray(accessoryData.removeMediaIds) &&
        accessoryData.removeMediaIds.length > 0
      ) {
        accessoryData.removeMediaIds.forEach((mediaId) => {
          if (mediaId) {
            formData.append("RemoveMediaIds", mediaId);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/Accessories`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật phụ kiện thất bại với status ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data: Accessory = await response.json();
        return data;
      }

      return {
        ...(accessoryData as Accessory),
        id: accessoryId,
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật phụ kiện:", error);
      throw error;
    }
  },

  /**
   * Xóa phụ kiện theo ID
   * Yêu cầu đăng nhập với quyền Owner
   * @param id - ID của phụ kiện cần xóa
   * @returns Promise<void>
   */
  deleteAccessory: async (id: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/Accessories/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
  getAccessoryQrHistory: async (
    id: string
  ): Promise<AccessoryQrHistoryResponse> => {
    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(
      `${API_BASE_URL}/Accessories/${id}/qr-history`,
      {
        method: "GET",
        headers,
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `Lỗi lấy QR history phụ kiện (mã ${response.status})`
      );
    }
    return await response.json();
  },
};
