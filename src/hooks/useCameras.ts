import { useState, useEffect } from "react";
import { cameraService } from "../services/camera.service";
import type { Camera } from "../types/camera.types";

export const useCameras = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cameraService.getCamerasByOwnerId();
      setCameras(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch cameras";
      setError(errorMessage);
      console.error("Error fetching cameras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return {
    cameras,
    loading,
    error,
    refetch: fetchCameras,
  };
};
