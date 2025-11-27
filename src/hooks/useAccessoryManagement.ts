import { useState, useEffect } from "react";
import type { Accessory } from "../types/product.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAccessoryManagement = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${API_BASE_URL}/Accessories?page=1&pageSize=100`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accessories: ${response.status}`);
      }

      const data = await response.json();
      setAccessories(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching accessories:", err);
      setError(err instanceof Error ? err.message : "Failed to load accessories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  return {
    accessories,
    loading,
    error,
    total,
    refreshAccessories: fetchAccessories,
  };
};