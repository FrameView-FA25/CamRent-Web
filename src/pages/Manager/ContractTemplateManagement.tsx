import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { Search, FileText, Plus, RefreshCw } from "lucide-react";
import { colors } from "../../theme/colors";
import { useContractTemplates } from "../../hooks/useContractTemplates";
import ContractTemplateStats from "../../components/ContractTemplate/ContractTemplateStats";
import ContractTemplateList from "../../components/ContractTemplate/ContractTemplateList";
import CreateTemplateDialog from "../../components/ContractTemplate/CreateTemplateDialog";
import TemplateDetailDialog from "../../components/ContractTemplate/TemplateDetailDialog";
import type { ContractTemplate } from "../../types/contract.types";

const ContractTemplateManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Rental, 2: Consignment
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContractTemplate | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  const {
    templates,
    loading,
    error,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useContractTemplates();

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.templateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      currentTab === 0 ||
      (currentTab === 1 && template.templateType === "Rental") ||
      (currentTab === 2 && template.templateType === "Consignment");

    const matchesStatus =
      statusFilter === "all" || template.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setOpenDetailDialog(true);
  };

  const handleEditTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setOpenCreateDialog(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa template này?")) {
      const success = await deleteTemplate(id);
      if (success) {
        refreshTemplates();
      }
    }
  };

  const handleDuplicateTemplate = async (id: string) => {
    const success = await duplicateTemplate(id);
    if (success) {
      refreshTemplates();
    }
  };

  const statusCounts = {
    all: templates.length,
    active: templates.filter((t) => t.status === "Active").length,
    inactive: templates.filter((t) => t.status === "Inactive").length,
    draft: templates.filter((t) => t.status === "Draft").length,
  };

  const rentalCount = templates.filter(
    (t) => t.templateType === "Rental"
  ).length;
  const consignmentCount = templates.filter(
    (t) => t.templateType === "Consignment"
  ).length;

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
            }}
          >
            Quản lý mẫu hợp đồng
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Tạo và quản lý các mẫu hợp đồng cho booking
          </Typography>
        </Box>

        {/* Stats */}
        <ContractTemplateStats templates={templates} />

        {/* Tabs & Actions */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${colors.border.light}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              py: 2,
              borderBottom: `1px solid ${colors.border.light}`,
            }}
          >
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => {
                setCurrentTab(newValue);
                setSearchQuery("");
                setStatusFilter("all");
              }}
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
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Tất cả
                    <Chip
                      label={templates.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 12,
                        bgcolor: colors.neutral[100],
                        color: colors.text.primary,
                      }}
                    />
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Hợp đồng thuê
                    <Chip
                      label={rentalCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 12,
                        bgcolor: colors.primary.lighter,
                        color: colors.primary.main,
                      }}
                    />
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Hợp đồng ký gửi
                    <Chip
                      label={consignmentCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 12,
                        bgcolor: colors.status.infoLight,
                        color: colors.status.info,
                      }}
                    />
                  </Box>
                }
              />
            </Tabs>

            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => {
                setSelectedTemplate(null);
                setOpenCreateDialog(true);
              }}
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Tạo mẫu mới
            </Button>
          </Box>

          {/* Search & Filters */}
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                placeholder="Tìm kiếm theo tên, mã, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 300,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color={colors.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={18} />}
                onClick={refreshTemplates}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Làm mới
              </Button>
            </Box>

            {/* Status Filter Chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={`Tất cả (${statusCounts.all})`}
                onClick={() => setStatusFilter("all")}
                sx={{
                  bgcolor:
                    statusFilter === "all"
                      ? colors.primary.main
                      : colors.neutral[100],
                  color:
                    statusFilter === "all" ? "white" : colors.text.secondary,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor:
                      statusFilter === "all"
                        ? colors.primary.dark
                        : colors.neutral[200],
                  },
                }}
              />
              <Chip
                label={`Đang dùng (${statusCounts.active})`}
                onClick={() => setStatusFilter("active")}
                sx={{
                  bgcolor:
                    statusFilter === "active"
                      ? colors.status.success
                      : colors.status.successLight,
                  color:
                    statusFilter === "active" ? "white" : colors.status.success,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor:
                      statusFilter === "active"
                        ? colors.status.success
                        : colors.status.successLight,
                  },
                }}
              />
              <Chip
                label={`Nháp (${statusCounts.draft})`}
                onClick={() => setStatusFilter("draft")}
                sx={{
                  bgcolor:
                    statusFilter === "draft"
                      ? colors.status.warning
                      : colors.status.warningLight,
                  color:
                    statusFilter === "draft" ? "white" : colors.status.warning,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor:
                      statusFilter === "draft"
                        ? colors.status.warning
                        : colors.status.warningLight,
                  },
                }}
              />
              <Chip
                label={`Không dùng (${statusCounts.inactive})`}
                onClick={() => setStatusFilter("inactive")}
                sx={{
                  bgcolor:
                    statusFilter === "inactive"
                      ? colors.neutral[600]
                      : colors.neutral[100],
                  color:
                    statusFilter === "inactive" ? "white" : colors.neutral[600],
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor:
                      statusFilter === "inactive"
                        ? colors.neutral[700]
                        : colors.neutral[200],
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>

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
              <Button color="inherit" size="small" onClick={refreshTemplates}>
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Template List */}
        {!loading && !error && (
          <>
            {filteredTemplates.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: "center",
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <FileText size={64} color={colors.neutral[300]} />
                <Typography
                  variant="h6"
                  sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
                >
                  Không tìm thấy mẫu hợp đồng
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary, mb: 3 }}
                >
                  {searchQuery
                    ? "Thử điều chỉnh từ khóa tìm kiếm"
                    : "Tạo mẫu hợp đồng đầu tiên"}
                </Typography>
                {!searchQuery && (
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => {
                      setSelectedTemplate(null);
                      setOpenCreateDialog(true);
                    }}
                    sx={{
                      bgcolor: colors.primary.main,
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: colors.primary.dark,
                      },
                    }}
                  >
                    Tạo mẫu mới
                  </Button>
                )}
              </Paper>
            ) : (
              <ContractTemplateList
                templates={filteredTemplates}
                onView={handleViewTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
              />
            )}
          </>
        )}

        {/* Dialogs */}
        <CreateTemplateDialog
          open={openCreateDialog}
          onClose={() => {
            setOpenCreateDialog(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSave={async (template) => {
            if (selectedTemplate) {
              await updateTemplate(selectedTemplate.id, template);
            } else {
              await createTemplate(template);
            }
            refreshTemplates();
          }}
        />

        <TemplateDetailDialog
          open={openDetailDialog}
          onClose={() => {
            setOpenDetailDialog(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      </Container>
    </Box>
  );
};

export default ContractTemplateManagement;
