// Import React hooks để quản lý state và tối ưu performance
import { useState, useCallback } from "react";
import { CameraContext } from "./CameraContext.types";
import type { ReactNode, Dispatch, SetStateAction } from "react";

// Import service để gọi API camera
import { cameraService } from "../../services/camera.service";
import type { Camera } from "../../services/camera.service";

/**
 * Interface định nghĩa kiểu dữ liệu của CameraContext
 * Chứa tất cả state và methods để quản lý camera
 */
interface CameraContextType {
  cameras: Camera[]; // Danh sách camera
  loading: boolean; // Trạng thái loading khi gọi API
  error: string | null; // Thông báo lỗi (null = không có lỗi)
  fetchCameras: () => Promise<void>; // Load camera từ cache hoặc API
  refreshCameras: () => Promise<void>; // Force reload từ API
  deleteCamera: (cameraId: string) => Promise<void>; // Xóa camera
  updateCameraInList: (cameraId: string, updatedCamera: Camera) => void; // Cập nhật camera trong danh sách (giữ nguyên vị trí)
  setCameras: Dispatch<SetStateAction<Camera[]>>; // Cập nhật state
}

/**
 * Props cho CameraProvider component
 */
interface CameraProviderProps {
  children: ReactNode; // Các component con
}

/**
 * CameraProvider Component
 * Provider bọc OwnerLayout để cung cấp camera state cho các component con
 *
 * Chức năng:
 * - Quản lý state: cameras, loading, error
 * - Caching: Chỉ gọi API lần đầu, các lần sau dùng cache
 * - Cung cấp methods: fetchCameras, refreshCameras, deleteCamera
 *
 * @param children - Component con được wrap
 */
export const CameraProvider: React.FC<CameraProviderProps> = ({ children }) => {
  // State: Danh sách camera
  const [cameras, setCameras] = useState<Camera[]>([]);

  // State: Trạng thái loading (true khi đang gọi API)
  const [loading, setLoading] = useState(false);

  // State: Thông báo lỗi (null = không có lỗi)
  const [error, setError] = useState<string | null>(null);

  // State: Flag đánh dấu đã fetch API (dùng cho caching)
  const [hasFetched, setHasFetched] = useState(false);

  /**
   * Hàm load danh sách camera (có caching)
   *
   * Caching Logic:
   * - Đã fetch VÀ có data → Dùng cache (không gọi API)
   * - Chưa fetch HOẶC không có data → Gọi API
   *
   * Mục đích: Tránh gọi API lại khi chuyển trang
   */
  const fetchCameras = useCallback(async () => {
    // Nếu đã có cache → return (không gọi API)
    if (hasFetched && cameras.length > 0) {
      return;
    }

    // Kiểm tra token đăng nhập
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError(
        "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách camera."
      );
      setLoading(false);
      setCameras([]);
      return;
    }

    try {
      setLoading(true); // Bắt đầu loading
      setError(null); // Clear lỗi cũ

      // Gọi API lấy camera của owner
      const data = await cameraService.getCamerasByOwner();

      // Xử lý response: API có thể trả về object {items: []} hoặc array []
      if (data && data.items && Array.isArray(data.items)) {
        // Case 1: Response có property items
        setCameras(data.items);
      } else if (Array.isArray(data)) {
        // Case 2: Response là array trực tiếp
        setCameras(data);
      } else {
        // Case 3: Response không đúng format
        console.warn("Unexpected data structure:", data);
        setCameras([]);
      }

      // Đánh dấu đã fetch (để lần sau dùng cache)
      setHasFetched(true);
    } catch (err) {
      // Xử lý lỗi
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải danh sách camera";
      setError(errorMessage);
      console.error("Lỗi khi tải camera:", err);
    } finally {
      setLoading(false); // Tắt loading (dù thành công hay lỗi)
    }
  }, [hasFetched, cameras.length]); // Dependencies: Chỉ tạo lại khi 2 giá trị này đổi

  /**
   * Hàm refresh camera (FORCE RELOAD - bỏ qua cache)
   *
   * So sánh:
   * - fetchCameras: Dùng cache nếu có
   * - refreshCameras: LUÔN gọi API
   *
   * Dùng khi:
   * - Thêm/sửa camera → cần data mới nhất
   * - User click "Tải lại"
   */
  const refreshCameras = useCallback(async () => {
    // Kiểm tra token
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError(
        "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách camera."
      );
      setLoading(false);
      setCameras([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API (BỎ QUA cache)
      const data = await cameraService.getCamerasByOwner();

      // Xử lý response (giống fetchCameras)
      if (data && data.items && Array.isArray(data.items)) {
        setCameras(data.items);
      } else if (Array.isArray(data)) {
        setCameras(data);
      } else {
        console.warn("Unexpected data structure:", data);
        setCameras([]);
      }

      setHasFetched(true); // Cập nhật flag
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải danh sách camera";
      setError(errorMessage);
      console.error("Lỗi khi tải camera:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Không dependencies → function không đổi

  /**
   * Hàm xóa camera
   *
   * Flow:
   * 1. Confirm với user
   * 2. Gọi API delete
   * 3. Cập nhật state local (filter camera đã xóa)
   *    → KHÔNG cần gọi lại API (tăng performance)
   * 4. Thông báo kết quả
   *
   * @param cameraId - ID camera cần xóa
   */
  const deleteCamera = useCallback(async (cameraId: string) => {
    // Confirm với user
    if (!window.confirm("Bạn có chắc chắn muốn xóa camera này?")) {
      return; // User hủy → thoát
    }

    try {
      // Gọi API xóa
      await cameraService.deleteCamera(cameraId);

      // Cập nhật state: Lọc bỏ camera vừa xóa
      // Dùng functional update để đảm bảo state mới nhất
      setCameras((prevCameras) =>
        prevCameras.filter((camera) => camera.id !== cameraId)
      );

      alert("Xóa camera thành công!");
    } catch (err) {
      // Xử lý lỗi
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa camera";
      alert(`Lỗi: ${errorMessage}`);
      console.error("Lỗi khi xóa camera:", err);
      throw err; // Throw để caller biết có lỗi
    }
  }, []); // Không dependencies

  /**
   * Hàm cập nhật camera trong danh sách (giữ nguyên vị trí)
   *
   * Flow:
   * 1. Tìm camera trong danh sách theo ID
   * 2. Cập nhật camera đó với dữ liệu mới
   * 3. Giữ nguyên thứ tự trong danh sách
   *
   * @param cameraId - ID camera cần cập nhật
   * @param updatedCamera - Dữ liệu camera đã cập nhật
   */
  const updateCameraInList = useCallback(
    (cameraId: string, updatedCamera: Camera) => {
      setCameras((prevCameras) =>
        prevCameras.map((camera) =>
          camera.id === cameraId ? updatedCamera : camera
        )
      );
    },
    []
  ); // Không dependencies

  // Tạo context value chứa tất cả state và methods
  const value: CameraContextType = {
    cameras, // Danh sách camera
    loading, // Trạng thái loading
    error, // Thông báo lỗi
    fetchCameras, // Load camera (có cache)
    refreshCameras, // Force reload (bỏ qua cache)
    deleteCamera, // Xóa camera
    updateCameraInList, // Cập nhật camera trong danh sách (giữ nguyên vị trí)
    setCameras, // Cập nhật state (dùng khi cần)
  };

  // Render Provider bọc children
  return (
    <CameraContext.Provider value={value}>{children}</CameraContext.Provider>
  );
};
