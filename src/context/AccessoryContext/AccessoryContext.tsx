import { useState, useCallback, type ReactNode } from "react";
import { AccessoryContext } from "./AccessoryContext.type";
import { accessoryService } from "../../services/accessory.service";
import type { Accessory } from "../../types/accessory.types";

export const AccessoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAccessories = useCallback(async () => {
    if (hasFetched && accessories.length > 0) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem phụ kiện.");
      setAccessories([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await accessoryService.getAccessoriesByOwnerId();
      setAccessories(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải danh sách phụ kiện";
      setError(message);
      console.error("Lỗi tải phụ kiện:", err);
    } finally {
      setLoading(false);
    }
  }, [hasFetched, accessories.length]);

  const refreshAccessories = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem phụ kiện.");
      setAccessories([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await accessoryService.getAccessoriesByOwnerId();
      setAccessories(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải danh sách phụ kiện";
      setError(message);
      console.error("Lỗi tải phụ kiện:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccessory = useCallback(async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phụ kiện này?")) return;

    await accessoryService.deleteAccessory(id);
    setAccessories((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <AccessoryContext.Provider
      value={{
        accessories,
        loading,
        error,
        fetchAccessories,
        refreshAccessories,
        deleteAccessory,
        setAccessories,
      }}
    >
      {children}
    </AccessoryContext.Provider>
  );
};
