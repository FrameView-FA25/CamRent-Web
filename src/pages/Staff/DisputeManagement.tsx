import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Button,
  TextField,
} from "@mui/material";
import { Info, Search } from "@mui/icons-material";
import { getDisputeById, addDisputeItem } from "../../services/dispute.service";
import type { Dispute, AddDisputeItemRequest } from "../../types/booking.types";
import { toast } from "react-toastify";
import DisputeDetailDialog from "../../components/Modal/Staff/DisputeDetailDialog";
import BookingDisputeListDialog from "../../components/Modal/Staff/BookingDisputeListDialog";

const DisputeManagement: React.FC = () => {
  const [bookingId, setBookingId] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [listDialogOpen, setListDialogOpen] = useState(false);

  const handleSearchByBooking = () => {
    if (!bookingId.trim()) {
      toast.error("Vui lòng nhập Booking ID");
      return;
    }
    setListDialogOpen(true);
  };

  const handleAddItem = async (
    disputeId: string,
    item: AddDisputeItemRequest
  ) => {
    await addDisputeItem(disputeId, item);
    toast.success("Đã thêm bồi thường thành công");
    // Reload dispute detail
    const updatedDispute = await getDisputeById(disputeId);
    setSelectedDispute(updatedDispute);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quản lý Disputes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tra cứu và xử lý các disputes từ bookings
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Để xem disputes của một booking, vui lòng nhập Booking ID bên dưới
          hoặc truy cập từ trang chi tiết booking.
        </Typography>
      </Alert>

      {/* Search by Booking ID */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tìm kiếm Disputes theo Booking
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
          <TextField
            placeholder="Nhập Booking ID..."
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchByBooking();
              }
            }}
          />
          <Button
            startIcon={<Search />}
            onClick={handleSearchByBooking}
            variant="contained"
          >
            Tìm kiếm
          </Button>
        </Box>
      </Paper>

      {/* Instructions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hướng dẫn sử dụng
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2" color="text.secondary">
              Nhập Booking ID ở trên để xem tất cả disputes liên quan đến
              booking đó
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              Hoặc truy cập vào trang "Kiểm tra đơn hàng" → Chọn booking → Xem
              disputes
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              Từ danh sách disputes, bạn có thể xem chi tiết và thêm bồi thường
            </Typography>
          </li>
        </Box>
      </Paper>

      {/* Dialogs */}
      <BookingDisputeListDialog
        open={listDialogOpen}
        onClose={() => setListDialogOpen(false)}
        bookingId={bookingId}
      />

      <DisputeDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedDispute(null);
        }}
        dispute={selectedDispute}
        onAddItem={handleAddItem}
      />
    </Container>
  );
};

export default DisputeManagement;
