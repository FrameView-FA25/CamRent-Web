import { useState, useEffect, useCallback } from 'react';
import type { Camera, CameraResponse, CameraFilters } from '../types/product.types';
import { cameraManagementService } from '../services/cameraManagement.service.ts';

export const useCameraManagement = (managerBranchName: string) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CameraFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    branchName: managerBranchName,
  });

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: CameraResponse = await cameraManagementService.getCameras(filters);
      setCameras(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Không thể tải danh sách camera. Vui lòng thử lại.');
      console.error('Error fetching cameras:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  const updateFilters = (newFilters: Partial<CameraFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refreshCameras = () => {
    fetchCameras();
  };

  return {
    cameras,
    loading,
    error,
    total,
    filters,
    updateFilters,
    refreshCameras,
  };
};