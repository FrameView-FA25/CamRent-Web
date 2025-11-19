import { useMemo, useState } from "react";
import type { Camera } from "../types/product.types";

export const useProductFilters = (cameras: Camera[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<"model" | "brand" | "serialNumber">("model");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique brands
  const brands = useMemo(() => {
    const uniqueBrands = new Set(cameras.map((c) => c.brand));
    return Array.from(uniqueBrands).sort();
  }, [cameras]);

  // Filter and sort
  const filteredAndSortedCameras = useMemo(() => {
    let result = [...cameras];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (camera) =>
          camera.model.toLowerCase().includes(query) ||
          camera.brand.toLowerCase().includes(query) ||
          camera.serialNumber?.toLowerCase().includes(query)
      );
    }

    // Filter by brand
    if (selectedBrand) {
      result = result.filter((camera) => camera.brand === selectedBrand);
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortBy]?.toString().toLowerCase() || "";
      const bValue = b[sortBy]?.toString().toLowerCase() || "";

      if (sortDir === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return result;
  }, [cameras, searchQuery, selectedBrand, sortBy, sortDir]);

  // Paginate
  const paginatedCameras = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedCameras.slice(startIndex, endIndex);
  }, [filteredAndSortedCameras, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCameras.length / pageSize);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newSortDir: "asc" | "desc") => {
    setSortBy(newSortBy as "model" | "brand" | "serialNumber");
    setSortDir(newSortDir);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("");
    setCurrentPage(1);
  };

  return {
    searchQuery,
    selectedBrand,
    brands,
    sortBy,
    sortDir,
    currentPage,
    pageSize,
    filteredAndSortedCameras,
    paginatedCameras,
    totalPages,
    handleSearchChange,
    handleBrandChange,
    handleSortChange,
    setCurrentPage,
    resetFilters,
  };
};