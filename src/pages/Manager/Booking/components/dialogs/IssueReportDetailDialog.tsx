import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Stack,
  ImageList,
  ImageListItem,
  Modal,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning,
  Error as ErrorIcon,
  Info as InfoIcon,
  Camera,
  Person,
  AccessTime,
  Description,
  Image as ImageIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { issueReportService } from "@/services/issueReport.service";
import type { IssueReport, IssueReportDetail } from "@/types/issueReport.types";
import { formatDate } from "../../../../../utils/booking.utils";

interface IssueReportDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: IssueReport | null;
  onStatusUpdate?: () => void;
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        label: "Nghiêm trọng",
        color: "#DC2626",
        bgcolor: "#FEE2E2",
        icon: <ErrorIcon />,
      };
    case "major":
      return {
        label: "Quan trọng",
        color: "#F97316",
        bgcolor: "#FFEDD5",
        icon: <Warning />,
      };
    case "minor":
      return {
        label: "Nhỏ",
        color: "#3B82F6",
        bgcolor: "#DBEAFE",
        icon: <InfoIcon />,
      };
    default:
      return {
        label: severity,
        color: "#6B7280",
        bgcolor: "#F3F4F6",
        icon: <InfoIcon />,
      };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "open":
      return { label: "Đang mở", color: "warning" as const };
    case "in_progress":
      return { label: "Đang xử lý", color: "info" as const };
    case "resolved":
      return { label: "Đã giải quyết", color: "success" as const };
    case "closed":
      return { label: "Đã đóng", color: "default" as const };
    default:
      return { label: status, color: "default" as const };
  }
};

export const IssueReportDetailDialog: React.FC<
  IssueReportDetailDialogProps
> = ({ open, onClose, report, onStatusUpdate }) => {
  const [detail, setDetail] = useState<IssueReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (open && report?.id) {
      fetchDetail();
    } else {
      setDetail(null);
    }
  }, [open, report?.id]);

  const fetchDetail = async () => {
    if (!report?.id) return;

    try {
      setLoading(true);
      const data = await issueReportService.getIssueReportDetail(report.id);
      setDetail(data);
    } catch (error) {
      console.error("Error fetching issue report detail:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết báo cáo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!detail?.id) return;

    try {
      setUpdating(true);
      await issueReportService.updateIssueReportStatus(detail.id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (!report) return null;

  const severityConfig = getSeverityConfig(detail?.severity || report.severity);
  const statusConfig = getStatusConfig(detail?.status || report.status);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
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
              Chi tiết báo cáo vấn đề
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              ID: {report.id}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {loading ? (
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
          ) : detail ? (
            <Box>
              {/* Status & Severity */}
              <Box sx={{ mb: 3, display: "flex", gap: 1 }}>
                <Chip
                  icon={severityConfig.icon}
                  label={severityConfig.label}
                  sx={{
                    bgcolor: severityConfig.bgcolor,
                    color: severityConfig.color,
                    fontWeight: 600,
                    "& .MuiChip-icon": {
                      color: severityConfig.color,
                    },
                  }}
                />
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Title & Description */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: "#F9FAFB",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Description sx={{ color: "#F97316" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {detail.title}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: "#4B5563" }}>
                  {detail.description}
                </Typography>
              </Paper>

              {/* Reporter Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: "#F9FAFB",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Person sx={{ color: "#F97316" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Người báo cáo
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {detail.reporterName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: "#9CA3AF" }} />
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    {formatDate(detail.createdAt)}
                  </Typography>
                </Box>
              </Paper>

              {/* Devices */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: "#F9FAFB",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Camera sx={{ color: "#F97316" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Thiết bị ({detail.devices.length})
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  {detail.devices.map((device, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        bgcolor: "white",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#FFF7ED",
                          color: "#F97316",
                        }}
                      >
                        <Camera />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {device.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6B7280" }}>
                          {device.itemType} • SN: {device.serialNumber}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Images */}
              {detail.imageUrls && detail.imageUrls.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#F9FAFB",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <ImageIcon sx={{ color: "#F97316" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Hình ảnh ({detail.imageUrls.length})
                    </Typography>
                  </Box>
                  <ImageList cols={3} gap={12} sx={{ borderRadius: 2 }}>
                    {detail.imageUrls.map((url, idx) => (
                      <ImageListItem
                        key={idx}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 2,
                          overflow: "hidden",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                        onClick={() => setSelectedImage(url)}
                      >
                        <img
                          src={url}
                          alt={`Evidence ${idx + 1}`}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Paper>
              )}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#6B7280", textAlign: "center", py: 4 }}
            >
              Không có dữ liệu
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid #E5E7EB",
            gap: 1,
          }}
        >
          {detail && detail.status === "open" && (
            <Button
              variant="contained"
              onClick={() => handleUpdateStatus("in_progress")}
              disabled={updating}
              sx={{
                bgcolor: "#3B82F6",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#2563EB",
                },
              }}
            >
              {updating ? <CircularProgress size={20} /> : "Bắt đầu xử lý"}
            </Button>
          )}
          {detail && detail.status === "in_progress" && (
            <Button
              variant="contained"
              onClick={() => handleUpdateStatus("resolved")}
              disabled={updating}
              sx={{
                bgcolor: "#10B981",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#059669",
                },
              }}
            >
              {updating ? (
                <CircularProgress size={20} />
              ) : (
                "Đánh dấu đã giải quyết"
              )}
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "#E5E7EB",
              color: "#6B7280",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Modal */}
      <Modal
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            outline: "none",
          }}
        >
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              zIndex: 1,
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};
