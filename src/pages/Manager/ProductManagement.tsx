import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Button,
} from "@mui/material";
import { CameraAlt as CameraIcon } from "@mui/icons-material";
import { useCameraManagement } from "../../hooks/useCameraManagement";
import { CameraTable } from "../../components/Management/CameraTable";
import { CameraFilters } from "../../components/Management/CameraFilters";
import { useProductFilters } from "../../hooks/useProductFilters";
import ProductStats from "../../components/ProductManagement/ProductStats";
import ProductSearchBar from "../../components/ProductManagement/ProductSearchBar";
import ProductEmptyState from "../../components/ProductManagement/ProductEmptyState";
import ProductNoResults from "../../components/ProductManagement/ProductNoResults";
import type { Camera } from "../../types/product.types";
import { colors } from "../../theme/colors";

const ProductManagementPage: React.FC = () => {
  const { cameras, loading, error, total, refreshCameras } =
    useCameraManagement();

  const {
    searchQuery,
    brands,
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
  } = useProductFilters(cameras);

  const handleView = (camera: Camera) => {
    console.log("View camera:", camera);
    // TODO: Implement view dialog
  };

  const handleEdit = (camera: Camera) => {
    console.log("Edit camera:", camera);
    // TODO: Implement edit dialog
  };

  const handleDelete = (camera: Camera) => {
    console.log("Delete camera:", camera);
    // TODO: Implement delete confirmation
  };

  const handleAddNew = () => {
    console.log("Add new camera");
    // TODO: Implement add dialog
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.background.default, py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: colors.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <CameraIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
            }}
          >
            Quản lý sản phẩm
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: colors.text.secondary, mb: 4, fontSize: 15 }}
        >
          Danh sách sản phẩm chi nhánh
        </Typography>

        {/* Stats */}
        <ProductStats cameras={cameras} total={total} />

        {/* Search Bar */}
        <ProductSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={refreshCameras}
        />

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <CameraFilters
            onSearchChange={handleSearchChange}
            onBrandChange={handleBrandChange}
            onSortChange={handleSortChange}
            brands={brands}
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
              <Button color="inherit" size="small" onClick={refreshCameras}>
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
            {cameras.length === 0 ? (
              <ProductEmptyState onAddNew={handleAddNew} />
            ) : filteredAndSortedCameras.length === 0 ? (
              <ProductNoResults onReset={resetFilters} />
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
                  <CameraTable
                    cameras={paginatedCameras}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Paper>

                {/* Pagination */}
                {totalPages > 1 && (
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
                      Số hàng mỗi trang: {pageSize}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary }}
                      >
                        {(currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, total)} của {total}
                      </Typography>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
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
