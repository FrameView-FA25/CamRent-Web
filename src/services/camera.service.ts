// API Base URL
const API_BASE_URL = "https://camrent-backend.up.railway.app/api";

// Interface định nghĩa cấu trúc media/hình ảnh của camera
export interface CameraMedia {
  id?: string; // ID của media
  url: string; // URL của hình ảnh/video
  type?: string; // Loại media (image, video)
  isPrimary?: boolean; // Có phải ảnh chính không
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
  variant: string; // Phiên bản (VD: Body Only, Kit)
  serialNumber: string; // Số serial của camera
  branchName: string | null; // Tên chi nhánh (có thể null)
  bookingItemType: number; // Loại mục đặt hàng (1: camera, 2: lens, ...)
  baseDailyRate: number; // Giá thuê cơ bản theo ngày (VNĐ)
  estimatedValueVnd: number; // Giá trị ước tính của camera (VNĐ)
  depositPercent: number; // Phần trăm đặt cọc (VD: 0.2 = 20%)
  depositCapMinVnd: number; // Mức đặt cọc tối thiểu (VNĐ)
  depositCapMaxVnd: number; // Mức đặt cọc tối đa (VNĐ)
  media: CameraMedia[]; // Danh sách hình ảnh/media của camera
  specsJson: string; // Thông số kỹ thuật dạng JSON string
  categories: CameraCategory[]; // Danh sách danh mục
}

// Interface cho response khi gọi API lấy danh sách camera
export interface GetCamerasByOwnerResponse {
  cameras: Camera[]; // Mảng chứa danh sách camera
  total?: number; // Tổng số camera (optional)
}

// Service xử lý các API liên quan đến Camera
export const cameraService = {
  /**
   * Lấy danh sách camera theo Owner ID
   * @returns Promise chứa danh sách camera của owner
   */
  async getCamerasByOwner(): Promise<Camera[]> {
    try {
      // Lấy token xác thực từ localStorage (key là "accessToken" theo auth service)
      const token = localStorage.getItem("accessToken");

      // Kiểm tra xem có token không
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      // Gọi API để lấy danh sách camera của owner
      const response = await fetch(
        `${API_BASE_URL}/Cameras/GetCamerasByOwnerId`,
        {
          method: "GET",
          headers: {
            accept: "*/*", // Chấp nhận mọi loại response
            "Content-Type": "application/json", // Định dạng dữ liệu gửi đi
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

      // Parse dữ liệu JSON từ response
      const data: Camera[] = await response.json();

      // Trả về danh sách camera
      return data;
    } catch (error) {
      // Log lỗi ra console để debug
      console.error("Lỗi khi lấy danh sách camera:", error);
      // Ném lỗi để component xử lý
      throw error;
    }
  },

  /**
   * Tạo camera mới
   * @param cameraData - Dữ liệu camera cần tạo
   * @returns Promise chứa thông tin camera vừa tạo
   */
  async createCamera(cameraData: Partial<Camera>): Promise<Camera | null> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetch(`${API_BASE_URL}/Cameras`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cameraData),
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
    cameraData: Partial<Camera>
  ): Promise<Camera> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetch(`${API_BASE_URL}/Cameras/${cameraId}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cameraData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật camera thất bại với status ${response.status}`
        );
      }

      const data: Camera = await response.json();
      return data;
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
};
