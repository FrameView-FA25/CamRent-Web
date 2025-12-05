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

  const loading = currentTab === 0 ? camerasLoading : accessoriesLoading;
  const error = currentTab === 0 ? camerasError : accessoriesError;

  const categories = useMemo(() => {
    const items = currentTab === 0 ? cameras : accessories;
    const brands = new Set(items.map((c) => c.brand));
    return ["All", ...Array.from(brands)];
  }, [cameras, accessories, currentTab]);

  const filteredProducts = useMemo(() => {
    const items = currentTab === 0 ? cameras : accessories;

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
  }, [cameras, accessories, searchQuery, selectedCategory, currentTab]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const items = currentTab === 0 ? cameras : accessories;
    const counts: Record<string, number> = { All: items.length };

    items.forEach((item) => {
      counts[item.brand] = (counts[item.brand] || 0) + 1;
    });

    return counts;
  }, [cameras, accessories, currentTab]);

  // Handle tab change
  const handleTabChange = (newTab: number) => {
    setCurrentTab(newTab);
    setSelectedCategory("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle AI Search Results
  const handleAISearch = (results: AISearchResult[]) => {
    setAiResults(results);
    setOpenAIResults(true);
    toast.success(`AI đã tìm được ${results.length} kết quả phù hợp!`);
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
        totalCameras={totalCameras}
        totalAccessories={totalAccessories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        compareCount={compareIds.length}
        onAISearch={handleAISearch}
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
          totalProducts={currentTab === 0 ? totalCameras : totalAccessories}
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
