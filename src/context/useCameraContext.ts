import { useContext } from "react";
import { CameraContext } from "./CameraContext.types";

export const useCameraContext = () => {
  // Lấy context value
  const context = useContext(CameraContext);

  // Kiểm tra: Component phải được wrap trong CameraProvider
  if (!context) {
    throw new Error("useCameraContext phải được sử dụng trong CameraProvider");
  }

  // Trả về context
  return context;
};
