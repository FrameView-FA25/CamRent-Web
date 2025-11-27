import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import { useCameraManagement } from "../../hooks/useCameraManagement";
import { useAccessoryManagement } from "../../hooks/useAccessoryManagement";
import { CameraTable } from "../../components/Management/CameraTable";
import { AccessoryTable } from "../../components/Management/AccessoryTable";
import { CameraFilters } from "../../components/Management/CameraFilters";
import { useProductFilters } from "../../hooks/useProductFilters";
import ProductStats from "../../components/ProductManagement/ProductStats";
import ProductSearchBar from "../../components/ProductManagement/ProductSearchBar";
import ProductEmptyState from "../../components/ProductManagement/ProductEmptyState";
import ProductNoResults from "../../components/ProductManagement/ProductNoResults";
import type { Camera } from "../../types/product.types";
import type { Accessory } from "../../types/product.types";
import { colors } from "../../theme/colors";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductManagementPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0: Cameras, 1: Accessories

  // Camera management
  const {
    cameras,
    loading: camerasLoading,
    error: camerasError,
    total: camerasTotal,
    refreshCameras,
  } = useCameraManagement();

  // Accessory management
  const {
    accessories,
    loading: accessoriesLoading,
    error: accessoriesError,
    total: accessoriesTotal,
    refreshAccessories,
  } = useAccessoryManagement();

  // Filters for cameras
  const {
    searchQuery: cameraSearchQuery,
    brands: cameraBrands,
    currentPage: cameraCurrentPage,
    pageSize: cameraPageSize,
    filteredAndSortedCameras,
    paginatedCameras,
    totalPages: cameraTotalPages,
    handleSearchChange: handleCameraSearchChange,
    handleBrandChange: handleCameraBrandChange,
    handleSortChange: handleCameraSortChange,
    setCurrentPage: setCameraCurrentPage,
    resetFilters: resetCameraFilters,
  } = useProductFilters(cameras);

  // Filters for accessories
  const {
    searchQuery: accessorySearchQuery,
    brands: accessoryBrands,
    currentPage: accessoryCurrentPage,
    pageSize: accessoryPageSize,
    filteredAndSortedCameras: filteredAndSortedAccessories,
    paginatedCameras: paginatedAccessories,
    totalPages: accessoryTotalPages,
    handleSearchChange: handleAccessorySearchChange,
    handleBrandChange: handleAccessoryBrandChange,
    handleSortChange: handleAccessorySortChange,
    setCurrentPage: setAccessoryCurrentPage,
    resetFilters: resetAccessoryFilters,
  } = useProductFilters(accessories);

  const handleView = (item: Camera | Accessory) => {
    console.log("View item:", item);
    // TODO: Implement view dialog
  };

  const handleEdit = (item: Camera | Accessory) => {
    console.log("Edit item:", item);
    // TODO: Implement edit dialog
  };

  const handleToggleAvailability = async (item: Camera | Accessory) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const endpoint =
        currentTab === 0
          ? `${API_BASE_URL}/Cameras/${item.id}/availability`
          : `${API_BASE_URL}/Accessories/${item.id}/availability`;

      const newStatus = !item.isAvailable;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update availability: ${response.status}`);
      }

      toast.success(
        `Đã ${newStatus ? "bật" : "tắt"} trạng thái có sẵn cho ${item.brand} ${
          item.model
        }`
      );

      // Refresh list
      if (currentTab === 0) {
        refreshCameras();
      } else {
        refreshAccessories();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const loading = currentTab === 0 ? camerasLoading : accessoriesLoading;
  const error = currentTab === 0 ? camerasError : accessoriesError;
  const total = currentTab === 0 ? camerasTotal : accessoriesTotal;
  const items = currentTab === 0 ? cameras : accessories;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.background.default, py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: colors.text.primary }}
          >
            Quản lý sản phẩm
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: colors.text.secondary, mb: 4, fontSize: 15 }}
        >
          Danh sách sản phẩm chi nhánh
        </Typography>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                minWidth: 120,
                color: colors.text.secondary,
              },
              "& .Mui-selected": {
                color: `${colors.primary.main} !important`,
              },
              "& .MuiTabs-indicator": {
                bgcolor: colors.primary.main,
                height: 3,
              },
            }}
          >
            <Tab label={`Cameras (${camerasTotal})`} />
            <Tab label={`Phụ kiện (${accessoriesTotal})`} />
          </Tabs>
        </Box>

        {/* Stats */}
        <ProductStats cameras={items} total={total} />

        {/* Search Bar */}
        <ProductSearchBar
          searchQuery={
            currentTab === 0 ? cameraSearchQuery : accessorySearchQuery
          }
          onSearchChange={
            currentTab === 0
              ? handleCameraSearchChange
              : handleAccessorySearchChange
          }
          onRefresh={currentTab === 0 ? refreshCameras : refreshAccessories}
        />

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <CameraFilters
            onSearchChange={
              currentTab === 0
                ? handleCameraSearchChange
                : handleAccessorySearchChange
            }
            onBrandChange={
              currentTab === 0
                ? handleCameraBrandChange
                : handleAccessoryBrandChange
            }
            onSortChange={
              currentTab === 0
                ? handleCameraSortChange
                : handleAccessorySortChange
            }
            brands={currentTab === 0 ? cameraBrands : accessoryBrands}
          />
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={currentTab === 0 ? refreshCameras : refreshAccessories}
              >
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <ProductEmptyState
                type={currentTab === 0 ? "camera" : "accessory"}
              />
            ) : (currentTab === 0
                ? filteredAndSortedCameras
                : filteredAndSortedAccessories
              ).length === 0 ? (
              <ProductNoResults
                onReset={
                  currentTab === 0 ? resetCameraFilters : resetAccessoryFilters
                }
              />
            ) : (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${colors.border.light}`,
                    overflow: "hidden",
                    mb: 3,
                  }}
                >
                  {currentTab === 0 ? (
                    <CameraTable
                      cameras={paginatedCameras}
                      onView={handleView}
                      onEdit={handleEdit}
                      onToggleAvailability={handleToggleAvailability}
                    />
                  ) : (
                    <AccessoryTable
                      accessories={paginatedAccessories}
                      onView={handleView}
                      onEdit={handleEdit}
                      onToggleAvailability={handleToggleAvailability}
                    />
                  )}
                </Paper>

                {/* Pagination */}
                {(currentTab === 0 ? cameraTotalPages : accessoryTotalPages) >
                  1 && (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 3 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      Số hàng mỗi trang:{" "}
                      {currentTab === 0 ? cameraPageSize : accessoryPageSize}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary }}
                      >
                        {((currentTab === 0
                          ? cameraCurrentPage
                          : accessoryCurrentPage) -
                          1) *
                          (currentTab === 0
                            ? cameraPageSize
                            : accessoryPageSize) +
                          1}
                        -
                        {Math.min(
                          (currentTab === 0
                            ? cameraCurrentPage
                            : accessoryCurrentPage) *
                            (currentTab === 0
                              ? cameraPageSize
                              : accessoryPageSize),
                          total
                        )}{" "}
                        của {total}
                      </Typography>
                      <Pagination
                        count={
                          currentTab === 0
                            ? cameraTotalPages
                            : accessoryTotalPages
                        }
                        page={
                          currentTab === 0
                            ? cameraCurrentPage
                            : accessoryCurrentPage
                        }
                        onChange={(_, page) =>
                          currentTab === 0
                            ? setCameraCurrentPage(page)
                            : setAccessoryCurrentPage(page)
                        }
                        color="primary"
                        size="medium"
                        showFirstButton
                        showLastButton
                        sx={{
                          "& .MuiPaginationItem-root": {
                            borderRadius: 1,
                            fontWeight: 600,
                            color: colors.text.secondary,
                            "&:hover": {
                              bgcolor: colors.background.default,
                            },
                          },
                          "& .Mui-selected": {
                            bgcolor: `${colors.primary.main} !important`,
                            color: "white",
                            "&:hover": {
                              bgcolor: `${colors.primary.dark} !important`,
                            },
                          },
                        }}
                      />
                    </Stack>
                  </Stack>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProductManagementPage;
