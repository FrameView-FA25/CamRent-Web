// Import các dependencies từ React
import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Camera } from "../../services/camera.service";

/**
 * Interface định nghĩa cấu trúc dữ liệu của CameraContext
 * Chứa state và các methods để quản lý camera
 */
export interface CameraContextType {
  cameras: Camera[]; // Danh sách camera
  loading: boolean; // Trạng thái đang tải
  error: string | null; // Thông báo lỗi (nếu có)
  fetchCameras: () => Promise<void>; // Load camera (có cache)
  refreshCameras: () => Promise<void>; // Load lại camera (bỏ qua cache)
  deleteCamera: (cameraId: string) => Promise<void>; // Xóa camera
  updateCameraInList: (cameraId: string, updatedCamera: Camera) => void; // Cập nhật camera trong danh sách (giữ nguyên vị trí)
  setCameras: Dispatch<SetStateAction<Camera[]>>; // Cập nhật state cameras
}

/**
 * Tạo Context để chia sẻ state camera giữa các component
 * Giá trị mặc định: undefined (bắt buộc phải dùng trong Provider)
 */
export const CameraContext = createContext<CameraContextType | undefined>(
  undefined
);
