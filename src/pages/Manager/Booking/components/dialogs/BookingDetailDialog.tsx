import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday,
  AccessTime,
  LocationOn,
  Camera,
  Person,
  Receipt,
  Description,
  CheckCircle,
  Image as ImageIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import type { Booking } from "@/types/booking.types";
import {
  formatCurrency,
  formatDate,
  getStatusInfo,
} from "../../../../../utils/booking.utils";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface InspectionForm {
  id: string;
  templateId: string;
  templateName: string;
  staffId: string;
  staffName: string;
  itemType: string;
  itemId: string;
  type: string;
  handoverType: string | null;
  inspectionTypeId: string;
  branchId: string | null;
  overallPassed: boolean;
  createdAt: string;
}

interface BookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({
  open,
  onClose,
  booking,
}) => {
  const [inspectionForms, setInspectionForms] = useState<InspectionForm[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  // Fetch inspection forms when dialog opens
  useEffect(() => {
    if (open && booking?.id) {
      fetchInspectionForms();
    } else {
      // Reset when dialog closes
      setInspectionForms([]);
    }
  }, [open, booking?.id]);

  const fetchInspectionForms = async () => {
    if (!booking?.id) return;

    try {
      setLoadingInspections(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/inspection-forms/booking/${booking.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu kiểm tra");
      }

      const data: InspectionForm[] = await response.json();
      setInspectionForms(data);
    } catch (error) {
      console.error("Error fetching inspection forms:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu kiểm tra"
      );
      setInspectionForms([]);
    } finally {
      setLoadingInspections(false);
    }
  };

  if (!booking) return null;

  const statusInfo = getStatusInfo(booking.status);

  // Calculate rental days
  const pickupDate = new Date(booking.pickupAt);
  const returnDate = new Date(booking.returnAt);
  const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
  const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Get first image from item media
  const getItemImage = (item: any) => {
    if (item.media && item.media.length > 0) {
      return item.media[0].url;
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Chi tiết đơn thuê
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
            ID: {booking.id}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Status & Type */}
        <Box sx={{ mb: 3, display: "flex", gap: 1 }}>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            icon={
              statusInfo.label === "Đã xác nhận" ? (
                <CheckCircle sx={{ fontSize: 18 }} />
              ) : undefined
            }
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={booking.type === "Rental" ? "Thuê" : booking.type}
            sx={{
              bgcolor: "#FFF7ED",
              color: "#F97316",
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* Left Column - Rental Information */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <CalendarToday sx={{ fontSize: 20 }} />
                Thông tin thuê
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 0.5 }}
                >
                  Ngày nhận
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(booking.pickupAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 0.5 }}
                >
                  Ngày trả
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(booking.returnAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <AccessTime sx={{ fontSize: 16 }} />
                  Thời gian thuê
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {rentalDays} ngày
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <LocationOn sx={{ fontSize: 16 }} />
                  Địa điểm
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {booking.location.district}, {booking.location.province}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {booking.location.country}
                </Typography>
              </Box>
            </Paper>

            {/* Renter Information */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 2,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Person sx={{ fontSize: 20 }} />
                Thông tin khách hàng
              </Typography>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {booking.renter?.fullName || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280", mb: 0.5 }}>
                  {booking.renter?.phone || "N/A"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                  ID: {booking.renterId}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Right Column - Items & Payment */}
          <Box sx={{ flex: 1 }}>
            {/* Items List */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Camera sx={{ fontSize: 20 }} />
                Sản phẩm ({booking.items.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {booking.items.map((item, index) => {
                  const itemImage = getItemImage(item);

                  return (
                    <ListItem
                      key={index}
                      sx={{
                        p: 2,
                        mb: 1,
                        bgcolor: "white",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      {/* Image or Icon */}
                      {itemImage ? (
                        <Avatar
                          src={itemImage}
                          alt={item.itemName}
                          variant="rounded"
                          sx={{
                            mr: 2,
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            mr: 2,
                            width: 64,
                            height: 64,
                            bgcolor: "#FFF7ED",
                            color: "#F97316",
                            borderRadius: 2,
                          }}
                        >
                          <Camera sx={{ fontSize: 32 }} />
                        </Avatar>
                      )}

                      <ListItemText
                        primary={item.itemName || item.itemType}
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ display: "block" }}
                            >
                              {item.itemType} • ID:{" "}
                              {item.itemId.substring(0, 8)}
                              ...
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#F97316",
                                fontWeight: 700,
                                mt: 0.5,
                              }}
                            >
                              {formatCurrency(item.unitPrice)}/ngày
                            </Typography>
                            {item.depositAmount > 0 && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#6B7280" }}
                              >
                                Cọc: {formatCurrency(item.depositAmount)}
                              </Typography>
                            )}
                            {item.media && item.media.length > 1 && (
                              <Box sx={{ mt: 0.5 }}>
                                <Chip
                                  icon={<ImageIcon sx={{ fontSize: 14 }} />}
                                  label={`${item.media.length} ảnh`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.65rem",
                                    bgcolor: "#F3F4F6",
                                    color: "#6B7280",
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>

            {/* Payment Details */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Receipt sx={{ fontSize: 20 }} />
                Chi tiết thanh toán
              </Typography>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Giá thuê cơ bản
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.snapshotBaseDailyRate)}/ngày
                </Typography>
              </Box>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Tổng phí thuê
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.snapshotRentalTotal)}
                </Typography>
              </Box>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Phí nền tảng (
                  {(booking.snapshotPlatformFeePercent * 100).toFixed(0)}%)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(
                    booking.snapshotRentalTotal *
                      booking.snapshotPlatformFeePercent
                  )}
                </Typography>
              </Box>

              <Box
                sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Tiền cọc
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.snapshotDepositAmount)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tổng cộng
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#F97316" }}
                >
                  {formatCurrency(
                    booking.snapshotRentalTotal +
                      booking.snapshotRentalTotal *
                        booking.snapshotPlatformFeePercent +
                      booking.snapshotDepositAmount
                  )}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Inspection Forms Section */}
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#F9FAFB",
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
            >
              <AssignmentIcon sx={{ fontSize: 20 }} />
              Danh Sách Kiểm Tra ({inspectionForms.length})
            </Typography>

            {loadingInspections ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 4,
                }}
              >
                <CircularProgress size={40} sx={{ color: "#F97316" }} />
              </Box>
            ) : inspectionForms.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F3F4F6" }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Template
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Nhân viên
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Loại thiết bị
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Kết quả
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        Ngày kiểm tra
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inspectionForms.map((form, index) => (
                      <TableRow
                        key={form.id}
                        sx={{
                          bgcolor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                          "&:hover": {
                            bgcolor: "#F3F4F6",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#1E293B",
                              fontSize: "0.875rem",
                            }}
                          >
                            {form.templateName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: "#64748B",
                              fontSize: "0.875rem",
                            }}
                          >
                            {form.staffName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={form.itemType}
                            size="small"
                            sx={{
                              bgcolor:
                                form.itemType === "Camera"
                                  ? "#EFF6FF"
                                  : "#F0FDF4",
                              color:
                                form.itemType === "Camera"
                                  ? "#3B82F6"
                                  : "#10B981",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              form.overallPassed ? (
                                <CheckCircle sx={{ fontSize: 16 }} />
                              ) : (
                                <CancelIcon sx={{ fontSize: 16 }} />
                              )
                            }
                            label={form.overallPassed ? "Đạt" : "Không đạt"}
                            size="small"
                            sx={{
                              bgcolor: form.overallPassed
                                ? "#D1FAE5"
                                : "#FEE2E2",
                              color: form.overallPassed ? "#059669" : "#DC2626",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              "& .MuiChip-icon": {
                                color: "inherit",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: "#64748B",
                              fontSize: "0.875rem",
                            }}
                          >
                            {formatDate(form.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                }}
              >
                <AssignmentIcon
                  sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#94A3B8", fontStyle: "italic" }}
                >
                  Chưa có dữ liệu kiểm tra nào
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Contracts Section */}
        {booking.contracts && booking.contracts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <Description sx={{ fontSize: 20 }} />
                Hợp đồng ({booking.contracts.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {booking.contracts.slice(0, 3).map((contract, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {contract.branchName || "Chi nhánh"}
                          </Typography>
                          <Chip
                            label={contract.status}
                            size="small"
                            sx={{
                              bgcolor: "#FFF7ED",
                              color: "#F97316",
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            ID: {contract.id.substring(0, 8)}...
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            Tạo: {formatDate(contract.createdAt)}
                          </Typography>
                          {contract.branchAddress && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280" }}
                            >
                              {contract.branchAddress}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {booking.contracts.length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", ml: 2 }}
                  >
                    và {booking.contracts.length - 3} hợp đồng khác...
                  </Typography>
                )}
              </List>
            </Paper>
          </Box>
        )}

        {/* Old Inspections Section - Keep if still needed */}
        {booking.inspections && booking.inspections.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, display: "flex", gap: 1 }}
              >
                <ImageIcon sx={{ fontSize: 20 }} />
                Kiểm định ({booking.inspections.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {booking.inspections.map((inspection, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {inspection.itemName} - {inspection.label}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            Section: {inspection.section} • Value:{" "}
                            {inspection.value}
                          </Typography>
                          {inspection.notes && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280" }}
                            >
                              Ghi chú: {inspection.notes}
                            </Typography>
                          )}
                          {inspection.media && inspection.media.length > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#F97316" }}
                            >
                              {inspection.media.length} ảnh
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
