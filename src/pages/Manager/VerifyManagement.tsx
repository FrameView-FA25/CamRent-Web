import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Skeleton,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { Search, FileText } from "lucide-react";
import { colors } from "../../theme/colors";
import { useVerifications } from "../../hooks/useVerifications";
import VerificationStats from "../../components/Verification/VerificationStats";
import VerificationListItem from "../../components/Verification/VerificationListItem";
import VerificationDetailDialog from "../../components/Verification/VerificationDetailDialog";
import type { Verification } from "../../types/verification.types";

const VerifyManagement: React.FC = () => {
  const { verifications, loading, refreshVerifications } = useVerifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // Filter verifications
  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phoneNumber.includes(searchQuery) ||
      v.branchName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" || v.status.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const handleViewDetails = (verification: Verification) => {
    setSelectedVerification(verification);
    setOpenDetailDialog(true);
  };

  const statusCounts = {
    all: verifications.length,
    pending: verifications.filter((v) => v.status === "Pending").length,
    approved: verifications.filter((v) => v.status === "Approved").length,
    rejected: verifications.filter((v) => v.status === "Rejected").length,
  };

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
            Quản lý yêu cầu xác minh
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Quản lý và theo dõi các yêu cầu xác minh sản phẩm
          </Typography>
        </Box>

        {/* Stats */}
        <VerificationStats verifications={verifications} />

        {/* Search & Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên, số điện thoại, chi nhánh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={colors.text.secondary} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 15,
                minWidth: 100,
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
                    label={statusCounts.all}
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
              value="all"
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Chờ xử lý
                  <Chip
                    label={statusCounts.pending}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 12,
                      bgcolor: colors.status.warningLight,
                      color: colors.status.warning,
                    }}
                  />
                </Box>
              }
              value="pending"
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Đã duyệt
                  <Chip
                    label={statusCounts.approved}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 12,
                      bgcolor: colors.status.successLight,
                      color: colors.status.success,
                    }}
                  />
                </Box>
              }
              value="approved"
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Từ chối
                  <Chip
                    label={statusCounts.rejected}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 12,
                      bgcolor: colors.status.errorLight,
                      color: colors.status.error,
                    }}
                  />
                </Box>
              }
              value="rejected"
            />
          </Tabs>
        </Paper>

        {/* Verifications List */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={100}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : filteredVerifications.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              textAlign: "center",
            }}
          >
            <FileText size={64} color={colors.neutral[300]} />
            <Typography
              variant="h6"
              sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
            >
              Không tìm thấy yêu cầu xác minh
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              {searchQuery
                ? "Thử điều chỉnh từ khóa tìm kiếm"
                : "Chưa có yêu cầu xác minh nào"}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredVerifications.map((verification) => (
              <VerificationListItem
                key={verification.id}
                verification={verification}
                onViewDetails={handleViewDetails}
                onRefresh={refreshVerifications}
              />
            ))}
          </Box>
        )}

        {/* Detail Dialog */}
        <VerificationDetailDialog
          open={openDetailDialog}
          onClose={() => {
            setOpenDetailDialog(false);
            setSelectedVerification(null);
          }}
          verification={selectedVerification}
          onRefresh={refreshVerifications}
        />
      </Container>
    </Box>
  );
};

export default VerifyManagement;
