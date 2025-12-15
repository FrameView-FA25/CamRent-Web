import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useCameras, useAccessories } from "../../hooks/useProducts";
import { useCompare } from "../../context/CompareContext/CompareContext";
import { toast } from "react-toastify";
import ProductHeader from "../../components/Product/ProductHeader";
import ProductFilters from "../../components/Product/ProductFilters";
import ProductGrid from "../../components/Product/ProductGrid";
import CompareFloatingButton from "../../components/Product/CompareFloatingButton";
import AIResultsDialog from "../../components/Product/AIResultsDialog";
import type { AISearchResult } from "../../services/ai.service";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://camrent-backend.up.railway.app";

interface AvailableCameraResponse {
  status: boolean;
  cameras: any[];
}

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get defaultTab from navigation state
  const defaultTab = (location.state as { defaultTab?: number })?.defaultTab;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentTab, setCurrentTab] = useState(defaultTab || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Date filter states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filteredByDate, setFilteredByDate] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<any[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // AI Search States
  const [openAIResults, setOpenAIResults] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);

  const { compareIds } = useCompare();

  // Set tab from navigation state on mount or when it changes
  useEffect(() => {
    if (defaultTab !== undefined && defaultTab !== currentTab) {
      setCurrentTab(defaultTab);
      setSelectedCategory("All");
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [defaultTab]);

  // Clear location state after reading it
  useEffect(() => {
    if (location.state?.defaultTab !== undefined) {
      // Clear the state to prevent re-triggering on back navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const {
    cameras,
    loading: camerasLoading,
    error: camerasError,
    total: totalCameras,
  } = useCameras();

  const {
    accessories,
    loading: accessoriesLoading,
    error: accessoriesError,
    total: totalAccessories,
  } = useAccessories(currentTab === 1, currentPage, pageSize, searchQuery);

  const loading =
    currentTab === 0 ? loadingAvailable || camerasLoading : accessoriesLoading;
  const error = currentTab === 0 ? camerasError : accessoriesError;

  const categories = useMemo(() => {
    const items =
      currentTab === 0
        ? filteredByDate
          ? availableCameras
          : cameras
        : accessories;
    const brands = new Set(items.map((c) => c.brand));
    return ["All", ...Array.from(brands)];
  }, [cameras, accessories, currentTab, filteredByDate, availableCameras]);

  const filteredProducts = useMemo(() => {
    const items =
      currentTab === 0
        ? filteredByDate
          ? availableCameras
          : cameras
        : accessories;

    if (!searchQuery) {
      return selectedCategory === "All"
        ? items
        : items.filter((c) => c.brand === selectedCategory);
    }

    const q = searchQuery.toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        (c.model && c.model.toLowerCase().includes(q)) ||
        (c.brand && c.brand.toLowerCase().includes(q)) ||
        (c.variant && c.variant.toLowerCase().includes(q)) ||
        (c.branchName && c.branchName.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All" || c.brand === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [
    cameras,
    accessories,
    searchQuery,
    selectedCategory,
    currentTab,
    filteredByDate,
    availableCameras,
  ]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const items =
      currentTab === 0
        ? filteredByDate
          ? availableCameras
          : cameras
        : accessories;
    const counts: Record<string, number> = { All: items.length };

    items.forEach((item) => {
      counts[item.brand] = (counts[item.brand] || 0) + 1;
    });

    return counts;
  }, [cameras, accessories, currentTab, filteredByDate, availableCameras]);

  // Handle tab change
  const handleTabChange = (newTab: number) => {
    setCurrentTab(newTab);
    setSelectedCategory("All");
    setSearchQuery("");
    setCurrentPage(1);

    // Reset date filter when switching tabs
    if (newTab === 1) {
      setFilteredByDate(false);
      setAvailableCameras([]);
    }
  };

  // Handle AI Search Results
  const handleAISearch = (results: AISearchResult[]) => {
    setAiResults(results);
    setOpenAIResults(true);
    toast.success(`AI đã tìm được ${results.length} kết quả phù hợp!`);
  };

  // Handle date filter changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredByDate(false);
    setAvailableCameras([]);
    setSelectedCategory("All");
    toast.info("Đã xóa bộ lọc ngày");
  };

  const handleApplyDateFilter = async () => {
    if (!startDate || !endDate) {
      toast.warning("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }

    if (startDate > endDate) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    setLoadingAvailable(true);

    try {
      const token = localStorage.getItem("accessToken");

      // Format dates to ISO string
      const start = startDate.toISOString();
      const end = endDate.toISOString();

      const params = new URLSearchParams({
        start: start,
        end: end,
      });

      const url = `${API_BASE_URL}/Cameras/available?${params.toString()}`;
      console.log("Fetching available cameras from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch available cameras: ${response.status} - ${errorText}`
        );
      }

      const data: AvailableCameraResponse = await response.json();
      console.log("Available cameras data:", data);

      if (data.status && data.cameras) {
        setAvailableCameras(data.cameras);
        setFilteredByDate(true);
        setSelectedCategory("All"); // Reset category filter

        toast.success(
          `Tìm thấy ${
            data.cameras.length
          } camera khả dụng từ ${startDate.toLocaleDateString(
            "vi-VN"
          )} đến ${endDate.toLocaleDateString("vi-VN")}`
        );
      } else {
        setAvailableCameras([]);
        setFilteredByDate(true);
        toast.info("Không tìm thấy camera khả dụng trong khoảng thời gian này");
      }
    } catch (err: any) {
      console.error("Error fetching available cameras:", err);
      toast.error(err?.message || "Không thể lọc camera theo ngày");
      setFilteredByDate(false);
      setAvailableCameras([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: grey[50] }}>
      {/* Compare Floating Button */}
      <CompareFloatingButton
        compareCount={compareIds.length}
        onClick={() => navigate("/compare")}
      />

      {/* Header */}
      <ProductHeader
        currentTab={currentTab}
        onTabChange={handleTabChange}
        totalCameras={filteredByDate ? availableCameras.length : totalCameras}
        totalAccessories={totalAccessories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        compareCount={compareIds.length}
        onAISearch={handleAISearch}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onClearDateFilter={handleClearDateFilter}
        onApplyDateFilter={handleApplyDateFilter}
      />
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filters */}
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          itemCounts={categoryCounts}
        />

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          totalProducts={
            currentTab === 0
              ? filteredByDate
                ? availableCameras.length
                : totalCameras
              : totalAccessories
          }
          compareCount={compareIds.length}
          onCompareClick={() => navigate("/compare")}
        />
      </Container>

      {/* AI Results Dialog */}
      <AIResultsDialog
        open={openAIResults}
        onClose={() => setOpenAIResults(false)}
        results={aiResults}
      />
    </Box>
  );
};

export default ProductPage;
