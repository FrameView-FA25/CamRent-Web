import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Pagination,
  Tabs,
  Tab,
} from "@mui/material";
import { Add as AddIcon, CameraAlt as CameraIcon } from "@mui/icons-material";
import { useCameraManagement } from "../../hooks/useCameraManagement";
import { CameraTable } from "../../components/Management/CameraTable";
import { CameraFilters } from "../../components/Management/CameraFilters";
import type { Camera } from "../../types/product.types";
import { colors } from "../../theme/colors";

const ProductManagementPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  // TODO: Get manager's branch from auth context
  const managerBranchName = "Demo Branch"; // Placeholder

  const {
    cameras,
    loading,
    error,
    total,
    filters,
    updateFilters,
    // refreshCameras,
  } = useCameraManagement(managerBranchName);

  // Extract unique brands for filter
  const brands = useMemo(() => {
    const uniqueBrands = new Set(cameras.map((c) => c.brand));
    return Array.from(uniqueBrands).sort();
  }, [cameras]);

  // Calculate total pages
  const totalPages = Math.ceil(total / filters.pageSize);

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
              Quản lý Sản phẩm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chi nhánh: <strong>{managerBranchName}</strong> • Tổng: {total}{" "}
              camera
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
              bgcolor: colors.primary.main,
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              py: 1.25,
              borderRadius: 2,
              "&:hover": {
                bgcolor: colors.primary.dark,
              },
            }}
          >
            Thêm Camera Mới
          </Button>
        </Stack>

        {/* Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                color: colors.text.primary,
              },
              "& .Mui-selected": {
                color: colors.primary.main,
              },
              "& .MuiTabs-indicator": {
                bgcolor: colors.primary.main,
                height: 3,
              },
            }}
          >
            <Tab
              icon={<CameraIcon />}
              iconPosition="start"
              label={`Cameras (${total})`}
            />
            <Tab label="Phụ kiện (Sắp có)" />
          </Tabs>
        </Box>

        {/* Filters */}
        <CameraFilters
          onSearchChange={(value) => updateFilters({ model: value, page: 1 })}
          onBrandChange={(value) =>
            updateFilters({ brand: value || undefined, page: 1 })
          }
          onSortChange={(sortBy, sortDir) =>
            updateFilters({ sortBy, sortDir, page: 1 })
          }
          brands={brands}
        />

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <CameraTable
              cameras={cameras}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={filters.page}
                  onChange={(_, page) => updateFilters({ page })}
                  color="primary"
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      fontWeight: 600,
                    },
                    "& .Mui-selected": {
                      bgcolor: `${colors.primary.main} !important`,
                      color: "white",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && cameras.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Chưa có camera nào
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                borderColor: colors.primary.main,
                color: colors.primary.main,
                "&:hover": {
                  borderColor: colors.primary.dark,
                  bgcolor: colors.primary.lighter,
                },
              }}
            >
              Thêm Camera Đầu Tiên
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductManagementPage;
