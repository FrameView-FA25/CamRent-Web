import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import type {
  AISearchCriteria,
  AISearchResponse,
} from "../../types/aiSearch.type";

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentTab, setCurrentTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // AI Search States
  const [openAIResults, setOpenAIResults] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchResponse | null>(null);
  const [isAISearching, setIsAISearching] = useState(false);

  const { compareIds } = useCompare();

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

  // Mock AI Search Handler
  const handleAISearch = async (criteria: AISearchCriteria) => {
    try {
      setIsAISearching(true);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock AI recommendations
      const mockRecommendations = cameras
        .filter((camera) => {
          if (criteria.budget) {
            const estimatedCost =
              camera.baseDailyRate * (criteria.rentalDuration?.days || 3);
            if (
              estimatedCost < criteria.budget.min ||
              estimatedCost > criteria.budget.max
            ) {
              return false;
            }
          }
          return true;
        })
        .slice(0, 5)
        .map((camera, index) => {
          let matchScore = 85 - index * 5;

          const reasons: string[] = [
            "Đánh giá cao từ người dùng",
            "Giá thuê hợp lý trong tầm ngân sách",
            "Thiết bị được bảo dưỡng tốt",
          ];

          if (criteria.purpose.includes("Portrait")) {
            reasons.push("Chất lượng ảnh chân dung xuất sắc");
          }

          const suggestedAccessories: string[] = [];
          if (criteria.accessories?.includes("Lens")) {
            suggestedAccessories.push("Ống kính 50mm f/1.8");
          }

          const estimatedTotalCost =
            camera.baseDailyRate * (criteria.rentalDuration?.days || 3) +
            suggestedAccessories.length * 100000;

          return {
            camera: camera.id,
            matchScore,
            reasons,
            suggestedAccessories,
            estimatedTotalCost,
          };
        });

      const formatCurrency = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value);

      const response: AISearchResponse = {
        recommendations: mockRecommendations,
        searchSummary: `Dựa trên yêu cầu ${criteria.purpose
          .join(", ")
          .toLowerCase()} với ngân sách ${formatCurrency(
          criteria.budget?.min || 0
        )} - ${formatCurrency(criteria.budget?.max || 0)}, chúng tôi tìm thấy ${
          mockRecommendations.length
        } camera phù hợp nhất cho bạn.`,
        tips: [
          "Đặt thuê sớm để có giá tốt hơn",
          "Xem xét thuê thêm pin dự phòng",
          "Kiểm tra kỹ thiết bị trước khi nhận",
        ],
      };

      setAiResults(response);
      setOpenAIResults(true);
      toast.success("AI đã tìm được camera phù hợp!");
    } catch (error) {
      console.error("AI Search error:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm với AI");
    } finally {
      setIsAISearching(false);
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
        totalCameras={totalCameras}
        totalAccessories={totalAccessories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        compareCount={compareIds.length}
        onAISearch={handleAISearch}
        isAISearching={isAISearching}
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
        cameras={cameras}
      />
    </Box>
  );
};

export default ProductPage;
