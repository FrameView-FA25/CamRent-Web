import { useState, useEffect, useCallback } from 'react';
import type { Camera } from '../types/product.types';
import { cameraManagementService } from '../services/cameraManagement.service';

export const useCameraManagement = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Gọi API mới: /api/Cameras/my-branch
      const data = await cameraManagementService.getCamerasByBranch();
      setCameras(data);
      setTotal(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách camera. Vui lòng thử lại.');
      console.error('Error fetching cameras:', err);
      setCameras([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Không cần dependencies vì API tự động lấy theo branch của user

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  const refreshCameras = () => {
    fetchCameras();
  };

  return {
    cameras,
    loading,
    error,
    total,
    refreshCameras,
  };
};