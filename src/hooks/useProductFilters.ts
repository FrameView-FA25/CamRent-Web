import { useMemo, useState } from "react";

type FilterableProduct = {
  id: string;
  brand: string;
  model: string;
  serialNumber?: string | null;
};

export const useProductFilters = <T extends FilterableProduct>(products: T[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<"model" | "brand" | "serialNumber">("model");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique brands
  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map((item) => item.brand));
    return Array.from(uniqueBrands).sort();
  }, [products]);

  // Filter and sort
  const filteredAndSortedItems = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.model.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.serialNumber?.toLowerCase().includes(query)
      );
    }

    // Filter by brand
    if (selectedBrand) {
      result = result.filter((item) => item.brand === selectedBrand);
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
  }, [products, searchQuery, selectedBrand, sortBy, sortDir]);

  // Paginate
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / pageSize);

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
    filteredAndSortedItems,
    paginatedItems,
    totalPages,
    handleSearchChange,
    handleBrandChange,
    handleSortChange,
    setCurrentPage,
    resetFilters,
  };
};