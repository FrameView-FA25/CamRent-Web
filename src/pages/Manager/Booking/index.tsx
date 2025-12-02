import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useBookingData } from "./hooks/useBookingData";
import { useBookingFilters } from "./hooks/useBookingFilters";
import { useBookingDialogs } from "./hooks/useBookingDialogs";
import { StatsCards } from "./components/StatsCards";
import { SearchBar } from "./components/SearchBar";
import { BookingTabs } from "./components/BookingTabs";
import { BookingTable } from "./components/BookingTable";
import { ContextMenu } from "./components/ContextMenu";
import { AssignStaffDialog } from "./components/dialogs/AssignStaffDialog";
import { CreateContractDialog } from "./components/dialogs/CreateContractDialog";
import { PdfPreviewDialog } from "./components/dialogs/PdfPreviewDialog";
import { SignatureDialog } from "./components/dialogs/SignatureDialog";
import { handleAssignConfirm } from "./handlers/assignHandlers";
import {
  handleContractConfirm,
  handleDownloadPdf,
} from "./handlers/contractHandlers";
import { handleSaveSignature } from "./handlers/signatureHandlers";
import { DEFAULT_ROWS_PER_PAGE } from "./constants";

const BookingManagement: React.FC = () => {
  const { bookings, staffList, loading, error, setError, loadBookings } =
    useBookingData();
  const {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    filteredBookings,
  } = useBookingFilters(bookings);
  const dialogState = useBookingDialogs();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F5F5F5",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#F97316" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <ToastContainer />
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCart sx={{ color: "white", fontSize: 30 }} />
            </Box>
            Quản lý Đơn thuê
          </Typography>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            Quản lý tất cả đơn thuê camera trong hệ thống
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <StatsCards bookings={bookings} />
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadBookings}
          loading={loading}
        />
        <BookingTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          bookings={bookings}
        />
        <BookingTable
          filteredBookings={filteredBookings}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onMenuClick={dialogState.handleMenuClick}
          loading={loading}
        />

        <ContextMenu
          anchorEl={dialogState.anchorEl}
          onClose={dialogState.handleMenuClose}
          onAssignStaff={dialogState.handleAssignStaff}
          onCreateContract={dialogState.handleCreateContract}
        />

        <AssignStaffDialog
          open={dialogState.assignDialogOpen}
          onClose={() => dialogState.setAssignDialogOpen(false)}
          selectedBooking={dialogState.selectedBooking}
          staffList={staffList}
          selectedStaff={dialogState.selectedStaff}
          onStaffChange={dialogState.setSelectedStaff}
          loading={dialogState.assignLoading}
          onConfirm={() =>
            handleAssignConfirm(
              dialogState.selectedBooking,
              dialogState.selectedStaff,
              dialogState.setAssignLoading,
              dialogState.setAssignDialogOpen,
              dialogState.setSelectedStaff
            )
          }
        />

        <CreateContractDialog
          open={dialogState.contractDialogOpen}
          onClose={() => dialogState.setContractDialogOpen(false)}
          selectedBooking={dialogState.selectedBooking}
          loading={dialogState.contractLoading}
          onConfirm={() =>
            handleContractConfirm(
              dialogState.selectedBooking,
              dialogState.setContractLoading,
              dialogState.setPdfUrl,
              dialogState.setCurrentContractId,
              dialogState.setCurrentFilename,
              dialogState.setPdfDialogOpen,
              dialogState.setContractDialogOpen
            )
          }
        />

        <PdfPreviewDialog
          open={dialogState.pdfDialogOpen}
          onClose={dialogState.handleClosePdfDialog}
          pdfUrl={dialogState.pdfUrl}
          onSign={dialogState.handleOpenSignature}
          onDownload={() =>
            handleDownloadPdf(
              dialogState.pdfUrl,
              dialogState.currentFilename,
              dialogState.setPdfDialogOpen,
              dialogState.setPdfUrl
            )
          }
        />

        <SignatureDialog
          open={dialogState.signatureDialogOpen}
          onClose={dialogState.handleCloseSignature}
          signatureRef={dialogState.signatureRef}
          onClear={dialogState.handleClearSignature}
          onSave={() =>
            handleSaveSignature(
              dialogState.signatureRef,
              dialogState.selectedBooking,
              dialogState.currentContractId,
              dialogState.handleCloseSignature,
              dialogState.handleClosePdfDialog,
              loadBookings
            )
          }
        />
      </Container>
    </Box>
  );
};

export default BookingManagement;
