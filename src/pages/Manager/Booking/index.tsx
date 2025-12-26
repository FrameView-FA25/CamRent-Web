import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
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
import { issueReportService } from "@/services/issueReport.service";
import type { IssueReport } from "@/types/issueReport.types";
import type {
  ContractDetail,
  ContractSignatureDto,
} from "@/services/contract.service";
import { IssueReportCard } from "./components/IssueReportCard";
import { IssueReportDetailDialog } from "./components/dialogs/IssueReportDetailDialog";

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
    sortOrder,
    setSortOrder,
  } = useBookingFilters(bookings);

  // Dialog hooks
  const dialogState = useBookingDialogs();
  const [currentContractDetail, setCurrentContractDetail] =
    useState<ContractDetail | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Confirm/Cancel dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState<
    "confirm" | "cancel"
  >("confirm");
  const [statusLoading, setStatusLoading] = useState(false);

  // Issue reports state
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [selectedIssueReport, setSelectedIssueReport] =
    useState<IssueReport | null>(null);
  const [issueDetailDialogOpen, setIssueDetailDialogOpen] = useState(false);
  const [issueContextMenu, setIssueContextMenu] = useState<HTMLElement | null>(
    null
  );

  const loadIssueReports = useCallback(async () => {
    try {
      setLoadingIssues(true);
      const data = await issueReportService.getIssueReports("open", 50);
      setIssueReports(data);
    } catch (error) {
      console.error("Error loading issue reports:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách báo cáo vấn đề"
      );
    } finally {
      setLoadingIssues(false);
    }
  }, [setError]);

  // Load issue reports when tab is 7 (issues tab)
  useEffect(() => {
    if (selectedTab === 6) {
      loadIssueReports();
    }
  }, [selectedTab, loadIssueReports]);

  // Load latest contract detail when PDF preview opens so canSign uses fresh data
  useEffect(() => {
    if (!dialogState.pdfDialogOpen || !dialogState.currentContractId) {
      setCurrentContractDetail(null);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        // dynamic import to avoid circular deps in some setups; services path uses @ alias
        const { contractService } = await import("@/services/contract.service");
        const c = await contractService.getContract(
          dialogState.currentContractId,
          token
        );
        if (mounted) setCurrentContractDetail(c);
      } catch (err) {
        console.error("Load contract detail failed:", err);
        if (mounted) setCurrentContractDetail(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dialogState.pdfDialogOpen, dialogState.currentContractId]);

  // Determine whether we should show the "Ký hợp đồng" button based on latest contract detail
  const canSign = (() => {
    const c =
      currentContractDetail ?? dialogState.selectedBooking?.contracts?.[0];
    if (!c) return false;
    const status = ((c as { status?: string }).status || "").toString();
    if (["Signed", "Completed"].includes(status)) return false;

    const sigs = c.signatures ?? [];
    if (!Array.isArray(sigs)) return true;

    if (sigs.length === 0) return true;
    if (typeof sigs[0] === "string") {
      // signatures as array of strings (ids) — assume two required
      return sigs.length < 2;
    }
    // signatures as objects with isSigned property
    return (sigs as ContractSignatureDto[]).some((s) => !s?.isSigned);
  })();

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

    if (
      !dialogState.selectedBooking?.contracts ||
      dialogState.selectedBooking.contracts.length === 0
    ) {
      setError("Không tìm thấy hợp đồng cho đơn này");
      return;
    }

    const contractId = dialogState.selectedBooking.contracts[0].id;
    const token = localStorage.getItem("accessToken");

    try {
      dialogState.setContractLoading(true);

      // Load contract detail first so canSign is accurate immediately
      try {
        const { contractService } = await import("@/services/contract.service");
        const contractDetail = await contractService.getContract(
          contractId,
          token
        );
        setCurrentContractDetail(contractDetail);
      } catch (err) {
        console.warn(
          "Không tải được chi tiết hợp đồng trước khi mở preview:",
          err
        );
        setCurrentContractDetail(null);
      }

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

      const contentDisposition = previewResponse.headers.get(
        "content-disposition"
      );
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

  // Issue report handlers
  const handleIssueMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    report: IssueReport
  ) => {
    setIssueContextMenu(event.currentTarget);
    setSelectedIssueReport(report);
  };

  const handleViewIssueDetail = () => {
    setIssueDetailDialogOpen(true);
    setIssueContextMenu(null);
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
          onRefresh={selectedTab === 6 ? loadIssueReports : loadBookings}
          loading={selectedTab === 6 ? loadingIssues : loading}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        {/* Tabs */}
        <BookingTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          bookings={bookings}
        />

        {/* Content - Show Issue Reports or Regular Bookings */}
        {selectedTab === 6 ? (
          <Box>
            {loadingIssues ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <CircularProgress size={50} sx={{ color: "#F97316" }} />
              </Box>
            ) : issueReports.length > 0 ? (
              issueReports.map((report) => (
                <IssueReportCard
                  key={report.id}
                  report={report}
                  onMenuClick={handleIssueMenuClick}
                />
              ))
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Typography variant="h6" sx={{ color: "#9CA3AF", mb: 1 }}>
                  Không có báo cáo vấn đề nào
                </Typography>
                <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                  Tất cả đơn thuê đang hoạt động bình thường
                </Typography>
              </Paper>
            )}
          </Box>
        ) : (
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
        )}

        {/* Context Menu - Regular Bookings */}
        <ContextMenu
          anchorEl={dialogState.contextMenu}
          onClose={() => dialogState.setContextMenu(null)}
          onAssignStaff={handleAssignStaff}
          onViewContract={handleViewContract}
          onConfirmBooking={handleConfirmBookingClick}
          onCancelBooking={handleCancelBookingClick}
          onViewDetails={handleViewDetails}
          bookingStatus={dialogState.selectedBooking?.status}
          hasRenter={
            !!dialogState.selectedBooking?.staffId &&
            dialogState.selectedBooking.staffId !== ""
          }
        />
        {/* Context Menu - Issue Reports */}
        <ContextMenu
          anchorEl={issueContextMenu}
          onClose={() => setIssueContextMenu(null)}
          onViewDetails={handleViewIssueDetail}
          onAssignStaff={() => {}}
          onViewContract={() => {}}
          onConfirmBooking={() => {}}
          onCancelBooking={() => {}}
          bookingStatus="issues"
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
              dialogState.setAssignDialogOpen
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
          canSign={canSign}
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

        {/* Issue Report Detail Dialog */}
        <IssueReportDetailDialog
          open={issueDetailDialogOpen}
          onClose={() => setIssueDetailDialogOpen(false)}
          report={selectedIssueReport}
          onStatusUpdate={loadIssueReports}
        />
      </Container>
    </Box>
  );
};

export default BookingManagement;
