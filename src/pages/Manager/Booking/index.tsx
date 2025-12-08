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
import { ConfirmBookingDialog } from "./components/dialogs/ConfirmBookingDialog";
import { handleAssignConfirm } from "./handlers/assignHandlers";
import {
  handleContractConfirm,
  handleDownloadPdf,
} from "./handlers/contractHandlers";
import { handleSaveSignature } from "./handlers/signatureHandlers";
import {
  handleConfirmBooking,
  handleCancelBooking,
} from "./handlers/bookingStatusHandlers";
import { DEFAULT_ROWS_PER_PAGE } from "./constants";
import { BookingDetailDialog } from "./components/dialogs/BookingDetailDialog";

const BookingManagement: React.FC = () => {
  // Data hooks
  const { bookings, staffList, loading, error, setError, loadBookings } =
    useBookingData();

  // Filter hooks
  const {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    filteredBookings,
  } = useBookingFilters(bookings);

  // Dialog hooks
  const dialogState = useBookingDialogs();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Confirm/Cancel dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState<
    "confirm" | "cancel"
  >("confirm");
  const [statusLoading, setStatusLoading] = useState(false);

  // Handlers for confirm/cancel booking
  const handleConfirmBookingClick = () => {
    setConfirmDialogType("confirm");
    setConfirmDialogOpen(true);
  };

  const handleCancelBookingClick = () => {
    setConfirmDialogType("cancel");
    setConfirmDialogOpen(true);
  };

  const handleConfirmBookingSubmit = async () => {
    setStatusLoading(true);
    await handleConfirmBooking(dialogState.selectedBooking, () => {
      loadBookings();
      setConfirmDialogOpen(false);
      dialogState.setSelectedBooking(null);
    });
    setStatusLoading(false);
  };

  const handleCancelBookingSubmit = async () => {
    setStatusLoading(true);
    await handleCancelBooking(dialogState.selectedBooking, () => {
      loadBookings();
      setConfirmDialogOpen(false);
      dialogState.setSelectedBooking(null);
    });
    setStatusLoading(false);
  };

  // Handler for assign staff
  const handleAssignStaff = () => {
    dialogState.setAssignDialogOpen(true);
    dialogState.setContextMenu(null);
  };

  // Handler for view contract
  const handleViewContract = async () => {
    dialogState.setContextMenu(null);
    
    if (!dialogState.selectedBooking?.contracts || dialogState.selectedBooking.contracts.length === 0) {
      setError("Không tìm thấy hợp đồng cho đơn này");
      return;
    }

    const contractId = dialogState.selectedBooking.contracts[0].id;
    const token = localStorage.getItem("accessToken");

    try {
      dialogState.setContractLoading(true);

      const previewResponse = await fetch(
        `https://camrent-backend.up.railway.app/api/Contracts/${contractId}/preview`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!previewResponse.ok) {
        throw new Error("Không thể lấy preview hợp đồng");
      }

      const contentDisposition = previewResponse.headers.get("content-disposition");
      let filename = `contract_${contractId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=(?:(["'])([^"'\n]*)\1|([^;\n]*));?/
        );
        if (filenameMatch && filenameMatch[2]) {
          filename = filenameMatch[2];
        }
      }

      const blob = await previewResponse.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      dialogState.setPdfUrl(url);
      dialogState.setCurrentContractId(contractId);
      dialogState.setCurrentFilename(filename);
      dialogState.setPdfDialogOpen(true);
    } catch (error) {
      console.error("Contract error:", error);
      setError(error instanceof Error ? error.message : "Lỗi khi xem hợp đồng");
    } finally {
      dialogState.setContractLoading(false);
    }
  };

  // Handler for view details
  const handleViewDetails = () => {
    dialogState.setDetailDialogOpen(true);
    dialogState.setContextMenu(null);
  };

  // Loading state
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

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <StatsCards bookings={bookings} />

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadBookings}
          loading={loading}
        />

        {/* Tabs */}
        <BookingTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          bookings={bookings}
        />

        {/* Table */}
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

        {/* Context Menu */}
        <ContextMenu
          anchorEl={dialogState.contextMenu}
          onClose={() => dialogState.setContextMenu(null)}
          onAssignStaff={handleAssignStaff}
          onViewContract={handleViewContract}
          onConfirmBooking={handleConfirmBookingClick}
          onCancelBooking={handleCancelBookingClick}
          onViewDetails={handleViewDetails}
          bookingStatus={dialogState.selectedBooking?.status}
        />

        {/* Confirm/Cancel Booking Dialog */}
        <ConfirmBookingDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          booking={dialogState.selectedBooking}
          onConfirm={
            confirmDialogType === "confirm"
              ? handleConfirmBookingSubmit
              : handleCancelBookingSubmit
          }
          loading={statusLoading}
          type={confirmDialogType}
        />

        {/* Assign Staff Dialog */}
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
              loadBookings
            )
          }
        />

        {/* Create Contract Dialog */}
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

        {/* PDF Preview Dialog */}
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

        {/* Signature Dialog */}
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
        {/* Booking Detail Dialog */}
        <BookingDetailDialog
          open={dialogState.detailDialogOpen}
          onClose={() => dialogState.setDetailDialogOpen(false)}
          booking={dialogState.selectedBooking}
        />
      </Container>
    </Box>
  );
};

export default BookingManagement;
