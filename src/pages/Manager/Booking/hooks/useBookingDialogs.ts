import { useState, useRef } from "react";
import type { Booking } from "@/types/booking.types";
import SignatureCanvas from "react-signature-canvas";

export const useBookingDialogs = () => {
  const [contextMenu, setContextMenu] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentContractId, setCurrentContractId] = useState<string>("");
  const [currentFilename, setCurrentFilename] = useState<string>("");
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    setContextMenu(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setContextMenu(null);
  };

  const handleAssignStaff = () => {
    setAssignDialogOpen(true);
    handleMenuClose();
  };

  const handleCreateContract = () => {
    setContractDialogOpen(true);
    handleMenuClose();
  };

  const handleClosePdfDialog = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfDialogOpen(false);
    setPdfUrl(null);
  };

  const handleOpenSignature = () => {
    setSignatureDialogOpen(true);
  };

  const handleCloseSignature = () => {
    setSignatureDialogOpen(false);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return {
    // States
    contextMenu,
    setContextMenu,
    selectedBooking,
    setSelectedBooking,
    assignDialogOpen,
    setAssignDialogOpen,
    contractDialogOpen,
    setContractDialogOpen,
    pdfDialogOpen,
    setPdfDialogOpen,
    signatureDialogOpen,
    setSignatureDialogOpen,
    detailDialogOpen,
    setDetailDialogOpen,
    selectedStaff,
    setSelectedStaff,
    assignLoading,
    setAssignLoading,
    contractLoading,
    setContractLoading,
    pdfUrl,
    setPdfUrl,
    currentContractId,
    setCurrentContractId,
    currentFilename,
    setCurrentFilename,
    signatureRef,
    
    // Handlers
    handleMenuClick,
    handleMenuClose,
    handleAssignStaff,
    handleCreateContract,
    handleClosePdfDialog,
    handleOpenSignature,
    handleCloseSignature,
    handleClearSignature,
  };
};