import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Visibility,
  HourglassEmpty,
  Assignment,
} from "@mui/icons-material";

interface AssignedBooking {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  camera: string;
  rentalPeriod: string;
  totalAmount: number;
  deposit: number;
  status: "pending" | "completed" | "cancelled";
  assignedDate: string;
  notes?: string;
}

const MyAssignments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] =
    useState<AssignedBooking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Mock data - đơn hàng được gán cho staff
  const [assignments, setAssignments] = useState<AssignedBooking[]>([
    {
      id: "ORD001",
      date: "2024-01-10",
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      camera: "Canon EOS R5",
      rentalPeriod: "2024-01-15 — 2024-01-18",
      totalAmount: 1200000,
      deposit: 300000,
      status: "pending",
      assignedDate: "2024-01-14",
      notes: "Kiểm tra kỹ thân máy và lens trước khi giao",
    },
    {
      id: "ORD002",
      date: "2024-01-12",
      customerName: "Trần Thị B",
      customerPhone: "0812345678",
      camera: "Sony A7 IV",
      rentalPeriod: "2024-01-20 — 2024-01-25",
      totalAmount: 1500000,
      deposit: 400000,
      status: "pending",
      assignedDate: "2024-01-15",
    },
    {
      id: "ORD003",
      date: "2024-01-05",
      customerName: "Lê Minh C",
      customerPhone: "0923456789",
      camera: "Fujifilm X-T5",
      rentalPeriod: "2024-01-08 — 2024-01-12",
      totalAmount: 800000,
      deposit: 200000,
      status: "completed",
      assignedDate: "2024-01-07",
    },
  ]);

  const stats = [
    {
      label: "Tổng đơn được gán",
      value: assignments.length,
      icon: <Assignment />,
      color: "#2196f3",
    },
    {
      label: "Đang xử lý",
      value: assignments.filter((a) => a.status === "pending").length,
      icon: <HourglassEmpty />,
      color: "#ff9800",
    },
    {
      label: "Đã hoàn thành",
      value: assignments.filter((a) => a.status === "completed").length,
      icon: <CheckCircle />,
      color: "#4caf50",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang xử lý";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleViewDetail = (booking: AssignedBooking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleCompleteClick = (booking: AssignedBooking) => {
    setSelectedBooking(booking);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = () => {
    if (selectedBooking) {
      // Update booking status
      setAssignments(
        assignments.map((a) =>
          a.id === selectedBooking.id ? { ...a, status: "completed" } : a
        )
      );
      setSnackbarMessage(
        `Đơn hàng ${selectedBooking.id} đã được đánh dấu hoàn thành!`
      );
      setSnackbarOpen(true);
      setCompleteDialogOpen(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.customerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      assignment.camera.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
            Đơn hàng được gán
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Danh sách đơn hàng mà quản lý đã gán cho bạn để kiểm tra
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat, index) => (
            <Paper
              key={index}
              sx={{
                flex: {
                  xs: "1 1 100%",
                  sm: "1 1 calc(50% - 12px)",
                  md: "1 1 calc(33.333% - 16px)",
                },
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Main Content */}
        <Paper sx={{ p: 3 }}>
          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "#999" }} />,
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Camera</TableCell>
                  <TableCell>Thời gian thuê</TableCell>
                  <TableCell>Ngày được gán</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, color: "#2196f3" }}>
                        {assignment.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        {assignment.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "#2196f3" }}
                        >
                          {assignment.customerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {assignment.customerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {assignment.customerPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{assignment.camera}</TableCell>
                    <TableCell>{assignment.rentalPeriod}</TableCell>
                    <TableCell>{assignment.assignedDate}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: "#2196f3" }}>
                        ₫{assignment.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        Cọc: ₫{assignment.deposit.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(assignment.status)}
                        color={getStatusColor(assignment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(assignment)}
                          title="Xem chi tiết"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        {assignment.status === "pending" && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleCompleteClick(assignment)}
                            title="Hoàn thành"
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5", mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Mã đơn:</strong> {selectedBooking?.id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khách hàng:</strong> {selectedBooking?.customerName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedBooking?.customerPhone}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Camera:</strong> {selectedBooking?.camera}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Thời gian thuê:</strong>{" "}
                  {selectedBooking?.rentalPeriod}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ngày được gán:</strong>{" "}
                  {selectedBooking?.assignedDate}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tổng tiền:</strong> ₫
                  {selectedBooking?.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Tiền cọc:</strong> ₫
                  {selectedBooking?.deposit.toLocaleString()}
                </Typography>
              </Paper>
              {selectedBooking?.notes && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Ghi chú:</strong> {selectedBooking.notes}
                  </Typography>
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Complete Confirmation Dialog */}
        <Dialog
          open={completeDialogOpen}
          onClose={() => setCompleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Xác nhận hoàn thành</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Bạn có chắc chắn đã kiểm tra xong đơn hàng này?
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Mã đơn:</strong> {selectedBooking?.id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khách hàng:</strong> {selectedBooking?.customerName}
                </Typography>
                <Typography variant="body2">
                  <strong>Camera:</strong> {selectedBooking?.camera}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={handleCompleteConfirm}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
            >
              Xác nhận hoàn thành
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MyAssignments;
