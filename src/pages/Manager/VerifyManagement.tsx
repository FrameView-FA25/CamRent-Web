import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Skeleton,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import { Eye, UserPlus, FileText, Edit } from "lucide-react";
import { colors } from "../../theme/colors";
import { useVerifications } from "../../hooks/useVerifications";
import VerificationStats from "../../components/Verification/VerificationStats";
import VerificationFilters from "../../components/Verification/VerificationFilters";
import VerificationCard from "../../components/Verification/VerificationCard";
import AssignStaffDialog from "../../components/Verification/AssignStaffDialog";
import VerificationDetailDialog from "../../components/Verification/VerificationDetailDialog";
import UpdateStatusDialog from "../../components/Verification/UpdateStatusDialog";
import type { Verification } from "../../types/verification.types";

const VerifyManagement: React.FC = () => {
  const {
    verifications,
    filteredVerifications,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    loading,
    staffList,
    assignStaff,
    updateStatus, // ✅ Get updateStatus function
  } = useVerifications();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false); // ✅ New state

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    verification: Verification
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedVerification(verification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setOpenDetailDialog(true);
    handleMenuClose();
  };

  const handleOpenAssignDialog = () => {
    setOpenAssignDialog(true);
    handleMenuClose();
  };

  // ✅ NEW: Handle open update dialog
  const handleOpenUpdateDialog = () => {
    setOpenUpdateDialog(true);
    handleMenuClose();
  };

  const handleAssignStaff = async (staffId: string) => {
    if (!selectedVerification) return false;
    return await assignStaff(selectedVerification.id, staffId);
  };

  // ✅ NEW: Handle update status
  const handleUpdateStatus = async (status: string, note: string) => {
    if (!selectedVerification) return false;
    return await updateStatus(selectedVerification.id, status, note);
  };

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
            }}
          >
            Verification Management
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Manage and track verification requests
          </Typography>
        </Box>

        {/* Stats */}
        <VerificationStats verifications={verifications} />

        {/* Filters */}
        <VerificationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Verifications List */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 3 }}
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
              No verifications found
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              {searchQuery
                ? "Try adjusting your search"
                : "No verification requests at the moment"}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredVerifications.map((verification) => (
              <VerificationCard
                key={verification.id}
                verification={verification}
                onMenuOpen={(e) => handleMenuOpen(e, verification)}
              />
            ))}
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetails}>
            <Eye size={16} style={{ marginRight: 8 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleOpenAssignDialog}>
            <UserPlus size={16} style={{ marginRight: 8 }} />
            Assign Staff
          </MenuItem>
          <MenuItem onClick={handleOpenUpdateDialog}>
            {" "}
            {/* ✅ Fixed */}
            <Edit size={16} style={{ marginRight: 8 }} />
            Update Status
          </MenuItem>
        </Menu>

        {/* Dialogs */}
        <AssignStaffDialog
          open={openAssignDialog}
          onClose={() => setOpenAssignDialog(false)}
          staffList={staffList}
          onAssign={handleAssignStaff}
        />

        <VerificationDetailDialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          verification={selectedVerification}
        />

        {/* ✅ NEW: Update Status Dialog */}
        <UpdateStatusDialog
          open={openUpdateDialog}
          onClose={() => setOpenUpdateDialog(false)}
          verification={selectedVerification}
          onUpdate={handleUpdateStatus}
        />
      </Container>
    </Box>
  );
};

export default VerifyManagement;
