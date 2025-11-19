import { useState, useEffect } from 'react';
import { cameraService } from '../services/camera.service';
import type { Camera } from '../types/product.types';
import type { Accessory } from '../services/camera.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCameras = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Cameras`, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cameras");
        }

        const data: Camera[] = await response.json();
        
        setCameras(data || []);
        setTotal(data.length || 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching cameras:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  return { cameras, loading, error, total };
};

export const useAccessories = (
  enabled: boolean,
  currentPage: number,
  pageSize: number,
  searchQuery: string
) => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const fetchAccessories = async () => {
      try {
        setLoading(true);
        const data = await cameraService.getAccessories(
          currentPage,
          pageSize,
          searchQuery
        );
        setAccessories(data.items || []);
        setTotal(data.total || 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching accessories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, [enabled, currentPage, pageSize, searchQuery]);

  return { accessories, loading, error, total };
};