// URL cơ sở của API backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

// Interface định nghĩa cấu trúc media/hình ảnh của camera
export interface CameraMedia {
  url: string; // URL của hình ảnh
  id?: string;
  contentType?: string; // Loại content (VD: image/jpeg)
  sizeBytes?: number; // Kích thước file
  label?: string; // Nhãn mô tả
}

// Interface định nghĩa danh mục của camera
export interface CameraCategory {
  id: string; // ID danh mục
  name: string; // Tên danh mục
}

// Interface định nghĩa cấu trúc dữ liệu của Camera
export interface Camera {
  id: string; // ID duy nhất của camera
  brand: string; // Thương hiệu (VD: Sony, Canon)
  model: string; // Model của camera (VD: Alpha A7 IV, R5)
  variant: string | null; // Phiên bản (VD: Body Only, Kit)
  serialNumber: string | null; // Số serial của camera
  branchName: string | null; // Tên chi nhánh (có thể null)
  branchAddress?: string | null;
  itemType: string | number; // Loại mục đặt hàng (1: camera, 2: lens, ...)
  baseDailyRate: number; // Giá thuê cơ bản theo ngày (VNĐ)
  estimatedValueVnd: number; // Giá trị ước tính của camera (VNĐ)
  depositPercent: number; // Phần trăm đặt cọc (VD: 0.2 = 20%, hoặc 30 = 30%)
  depositCapMinVnd: number | null; // Mức đặt cọc tối thiểu (VNĐ)
  depositCapMaxVnd: number | null; // Mức đặt cọc tối đa (VNĐ)
  media: CameraMedia[]; // Danh sách hình ảnh/media của camera
  specsJson: string | null; // Thông số kỹ thuật dạng JSON string
  isConfirmed?: boolean; // Trạng thái đã được xác minh hay chưa
  status?: string | null; // Trạng thái tổng hợp trả về từ API (nếu có)
  location?: string | null;
  ownerUserId?: string | null;
  ownerName?: string | null;
  branchId?: string;
  createdAt?: string | null;
}

// Interface cho response khi gọi API lấy danh sách camera
export interface GetCamerasByOwnerResponse {
  cameras: Camera[]; // Mảng chứa danh sách camera
  total?: number; // Tổng số camera (optional)
}

// Interface cho response API Cameras với phân trang
export interface CamerasResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Camera[];
}

// Interface cho Accessory (phụ kiện)
export interface Accessory {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchName: string | null;
  branchAddress: string | null;
  bookingItemType?: number;
  baseDailyRate: number;
  platformFeePercent: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number | null;
  depositCapMaxVnd: number | null;
  ownerName: string | null;
  media: CameraMedia[];
  specsJson: string | null;
  categories?: string[];
  isConfirmed: boolean;
  location?: string | null;
  createdAt?: string | null;
}

// Interface cho response API Accessories với phân trang
export interface AccessoriesResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Accessory[];
}

export interface CameraQrHistoryMedia extends CameraMedia {
  id?: string;
}

export interface CameraQrHistoryCamera {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  serialNumber: string | null;
  branchName: string | null;
  branchAddress: string | null;
  itemType: string | number;
  baseDailyRate: number;
  estimatedValueVnd: number;
  depositPercent: number;
  depositCapMinVnd: number | null;
  depositCapMaxVnd: number | null;
  specsJson: string | null;
  isConfirmed: boolean;
  location?: string | null;
  ownerUserId?: string;
  ownerName?: string | null;
  media: CameraQrHistoryMedia[];
}

export interface CameraQrHistoryBooking {
  bookingId: string;
  pickupAt: string;
  returnAt: string;
  status: string;
  statusText: string;
  renterName: string | null;
}

export interface CameraQrHistoryInspection {
  id: string;
  itemName: string;
  itemType: string;
  section: string;
  label: string;
  value: string;
  passed: boolean;
  notes: string | null;
  media: CameraQrHistoryMedia[];
}

export interface CameraQrHistoryResponse {
  camera: CameraQrHistoryCamera;
  bookings: CameraQrHistoryBooking[];
  inspections: CameraQrHistoryInspection[];
}

// Service xử lý các API liên quan đến Camera
export const cameraService = {
  /**
   * Lấy danh sách camera theo Owner ID với phân trang
   * @param page - Số trang (mặc định: 1)
   * @param pageSize - Số lượng items mỗi trang (mặc định: 20)
   * @returns Promise chứa danh sách camera và thông tin phân trang
   */
  async getCamerasByOwner(
    page: number = 1,
    pageSize: number = 20
  ): Promise<CamerasResponse> {
    try {
      // Lấy token xác thực từ localStorage (key là "accessToken" theo auth service)
      const token = localStorage.getItem("accessToken");

      // Kiểm tra xem có token không
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      // Xây dựng query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      // Gọi API để lấy danh sách camera của owner
      const response = await fetch(
        `${API_BASE_URL}/Cameras/GetCamerasByOwnerId?${params.toString()}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`, // Token xác thực
          },
        }
      );

      // Kiểm tra nếu response không thành công
      if (!response.ok) {
        // Thử parse error message từ response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách camera thất bại với status ${response.status}`
        );
      }

      // Parse dữ liệu JSON từ response (có thể là array hoặc object phân trang)
      const responseData = await response.json();

      // Trường hợp backend trả về object chuẩn với trường items
      if (
        responseData &&
        typeof responseData === "object" &&
        Array.isArray(responseData.items)
      ) {
        return responseData as CamerasResponse;
      }

      // Trường hợp backend trả về object với trường cameras
      if (
        responseData &&
        typeof responseData === "object" &&
        Array.isArray(responseData.cameras)
      ) {
        return {
          page,
          pageSize,
          total:
            typeof responseData.total === "number"
              ? responseData.total
              : responseData.cameras.length,
          items: responseData.cameras,
        };
      }

      // Trường hợp backend trả về array trực tiếp
      if (Array.isArray(responseData)) {
        return {
          page,
          pageSize,
          total: responseData.length,
          items: responseData,
        };
      }

      console.warn("Unexpected camera response structure:", responseData);

      // Fallback: trả về object rỗng để tránh crash UI
      return {
        page,
        pageSize,
        total: 0,
        items: [],
      };
    } catch (error) {
      // Log lỗi ra console để debug
      console.error("Lỗi khi lấy danh sách camera:", error);
      // Ném lỗi để component xử lý
      throw error;
    }
  },

  /**
   * Lấy danh sách camera công khai cho Admin/khách (có phân trang)
   */
  async getAllCameras(
    page: number = 1,
    pageSize: number = 20,
    searchQuery?: string
  ): Promise<CamerasResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchQuery && searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }

      const urlParams = params.toString();
      const response = await fetch(
        urlParams
          ? `${API_BASE_URL}/Cameras?${urlParams}`
          : `${API_BASE_URL}/Cameras`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách camera thất bại với status ${response.status}`
        );
      }

      const responseData = await response.json();

      if (
        responseData &&
        typeof responseData === "object" &&
        Array.isArray(responseData.items)
      ) {
        return responseData as CamerasResponse;
      }

      if (Array.isArray(responseData)) {
        return {
          page,
          pageSize,
          total: responseData.length,
          items: responseData,
        };
      }

      console.warn("Unexpected camera list response:", responseData);
      return {
        page,
        pageSize,
        total: 0,
        items: [],
      };
    } catch (error) {
      console.error("Lỗi khi tải danh sách camera:", error);
      throw error;
    }
  },

  /**
   * Tạo camera mới
   * @param cameraData - Dữ liệu camera cần tạo
   * @param mediaFiles - Danh sách file ảnh (optional)
   * @returns Promise chứa thông tin camera vừa tạo
   */
  async createCamera(cameraData: {
    brand: string;
    model: string;
    variant: string;
    serialNumber: string;
    baseDailyRate?: number;
    depositPercent: number;
    estimatedValueVnd: number;
    specsJson: string;
    mediaFiles?: File[];
  }): Promise<Camera | null> {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }
      // Tạo FormData để gửi cả file và dữ liệu
      const formData = new FormData();
      // Thêm các trường dữ liệu text
      formData.append("Brand", cameraData.brand);
      formData.append("Model", cameraData.model);
      formData.append("Variant", cameraData.variant);
      formData.append("SerialNumber", cameraData.serialNumber);
      formData.append("DepositPercent", cameraData.depositPercent.toString());
      // Nếu frontend không cung cấp BaseDailyRate thì không append (backend có thể dùng default)
      if (
        typeof cameraData.baseDailyRate === "number" &&
        !isNaN(cameraData.baseDailyRate)
      ) {
        formData.append("BaseDailyRate", cameraData.baseDailyRate.toString());
      }
      formData.append(
        "EstimatedValueVnd",
        cameraData.estimatedValueVnd.toString()
      );
      formData.append("SpecsJson", cameraData.specsJson);
      // Thêm các file ảnh nếu có
      if (cameraData.mediaFiles && cameraData.mediaFiles.length > 0) {
        // Only send up to 4 files to match frontend limit
        cameraData.mediaFiles.slice(0, 4).forEach((file) => {
          formData.append("MediaFiles", file);
        });
      }
      const response = await fetch(`${API_BASE_URL}/Cameras`, {
        method: "POST",
        headers: {
          accept: "*/*",
          // Không set Content-Type khi dùng FormData, browser tự set với boundary
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        // Thử parse error message từ response
        let errorMessage = `Tạo camera thất bại với status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Nếu không parse được JSON, dùng text
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
      // Kiểm tra xem response có body không
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data: Camera = await response.json();
        return data;
      } else {
        // Nếu API không trả về JSON (có thể chỉ trả về 201 Created)
        // Trả về null để báo hiệu thành công nhưng không có data
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi tạo camera:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin camera
   * @param cameraId - ID của camera cần cập nhật
   * @param cameraData - Dữ liệu camera cần cập nhật
   * @returns Promise chứa thông tin camera sau khi cập nhật
   */
  async updateCamera(
    cameraId: string,
    cameraData: Partial<Camera> & {
      mediaFiles?: File[];
      removeMediaIds?: string[];
    }
  ): Promise<Camera> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const formData = new FormData();

      // Thêm Id vào FormData (bắt buộc theo API spec)
      formData.append("Id", cameraId);

      const appendIfDefined = (key: string, value: unknown) => {
        if (value === undefined || value === null) {
          return;
        }
        if (typeof value === "number" && Number.isNaN(value)) {
          return;
        }
        formData.append(key, String(value));
      };

      appendIfDefined("Brand", cameraData.brand);
      appendIfDefined("Model", cameraData.model);
      appendIfDefined("Variant", cameraData.variant);
      appendIfDefined("SerialNumber", cameraData.serialNumber);
      appendIfDefined("BaseDailyRate", cameraData.baseDailyRate);
      appendIfDefined("EstimatedValueVnd", cameraData.estimatedValueVnd);
      appendIfDefined("DepositPercent", cameraData.depositPercent);
      appendIfDefined("SpecsJson", cameraData.specsJson);

      // Thêm media files mới nếu có
      if (
        cameraData.mediaFiles &&
        Array.isArray(cameraData.mediaFiles) &&
        cameraData.mediaFiles.length > 0
      ) {
        cameraData.mediaFiles.forEach((file) => {
          if (file instanceof File) {
            formData.append("MediaFiles", file);
          }
        });
      }

      // Thêm removeMediaIds nếu có (để xóa media cũ)
      if (
        cameraData.removeMediaIds &&
        Array.isArray(cameraData.removeMediaIds) &&
        cameraData.removeMediaIds.length > 0
      ) {
        cameraData.removeMediaIds.forEach((mediaId) => {
          if (mediaId) {
            formData.append("RemoveMediaIds", mediaId);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/Cameras`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      console.log(formData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật camera thất bại với status ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data: Camera = await response.json();
        return data;
      }

      return {
        ...(cameraData as Camera),
        id: cameraId,
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật camera:", error);
      throw error;
    }
  },

  /**
   * Xóa camera
   * @param cameraId - ID của camera cần xóa
   * @returns Promise<void>
   */
  async deleteCamera(cameraId: string): Promise<void> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetch(`${API_BASE_URL}/Cameras/${cameraId}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Xóa camera thất bại với status ${response.status}`
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa camera:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phụ kiện (Accessories) với phân trang
   * @param page - Số trang (mặc định: 1)
   * @param pageSize - Số lượng items mỗi trang (mặc định: 20)
   * @param searchQuery - Từ khóa tìm kiếm (optional)
   * @param sortBy - Sắp xếp theo trường (mặc định: "createdAt")
   * @param sortDir - Hướng sắp xếp "asc" hoặc "desc" (mặc định: "desc")
   * @returns Promise chứa danh sách accessories với thông tin phân trang
   */
  async getAccessories(
    page: number = 1,
    pageSize: number = 20,
    searchQuery?: string,
    sortBy: string = "createdAt",
    sortDir: "asc" | "desc" = "desc"
  ): Promise<AccessoriesResponse> {
    try {
      // Xây dựng query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDir,
      });

      // Thêm search query nếu có
      if (searchQuery && searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }

      // Gọi API để lấy danh sách accessories
      const response = await fetch(
        `${API_BASE_URL}/Accessories?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Kiểm tra nếu response không thành công
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách phụ kiện thất bại với status ${response.status}`
        );
      }

      // Parse dữ liệu JSON từ response
      const data: AccessoriesResponse = await response.json();

      // Trả về dữ liệu accessories
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phụ kiện:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin QR history cho camera
   */
  async getCameraQrHistory(cameraId: string): Promise<CameraQrHistoryResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Cameras/${cameraId}/qr-history`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Không thể lấy lịch sử camera (mã ${response.status})`
        );
      }

      const data = (await response.json()) as CameraQrHistoryResponse;

      if (!data || typeof data !== "object" || !data.camera) {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }

      return {
        camera: data.camera,
        bookings: Array.isArray(data.bookings) ? data.bookings : [],
        inspections: Array.isArray(data.inspections) ? data.inspections : [],
      };
    } catch (error) {
      console.error("Lỗi khi lấy QR history của camera:", error);
      throw error;
    }
  },
};
