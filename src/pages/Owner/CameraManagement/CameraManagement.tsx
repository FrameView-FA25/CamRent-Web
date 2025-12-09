import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  QrCodeScanner as QrCodeScannerIcon,
  HourglassEmptyRounded,
  CheckCircleRounded,
  DoNotDisturbOnRounded,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import ModalAddCamera from "../../../components/Modal/Owner/ModalAddCamera";
import ModalEditCamera from "../../../components/Modal/Owner/ModalEditCamera";
import { useCameraContext } from "../../../context/CameraContexts/useCameraContext";
import type { Camera, CameraMedia } from "../../../services/camera.service";
import ModalCreateQRCode from "../../../components/Modal/Owner/ModalCreateQR";
import QRCode from "qrcode";
import { toast } from "react-toastify";

export default function CameraManagement() {
  // Sử dụng context thay vì state local
  const {
    cameras,
    loading,
    error,
    fetchCameras,
    refreshCameras,
    deleteCamera: deleteCameraFromContext,
    updateCameraInList,
  } = useCameraContext();

  // State quản lý modal thêm camera
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // State cho QR Code Modal
  const [openQRModal, setOpenQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrCameraId, setQrCameraId] = useState<string>("");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Số lượng camera hiển thị mỗi trang (cố định)

  // State cho gallery preview: danh sách ảnh và index hiện tại (null = đóng)
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [menuCamera, setMenuCamera] = useState<Camera | null>(null);

  /**
   * useEffect: Gọi API lấy danh sách camera khi component được mount
   * Với context, hàm fetchCameras sẽ kiểm tra cache trước khi gọi API
   */
  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Hàm tạo và hiển thị QR Code cho camera

  const handleGenerateQRCode = async (cameraId: string) => {
    try {
      // Tạo QR code từ camera ID
      const qrDataUrl = await QRCode.toDataURL(cameraId, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1E293B",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
      setQrCameraId(cameraId);
      setOpenQRModal(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  /**
   * Hàm xử lý khi thêm camera mới thành công
   * Callback được gọi từ ModalAddCamera sau khi API thành công
   */
  const handleAddCamera = () => {
    // Tải lại danh sách camera sau khi thêm thành công (force refresh)
    refreshCameras();
    // Reset về trang 1 khi thêm mới
    setCurrentPage(1);
    // Hiển thị toast thông báo thành công
    toast.success("Thêm camera thành công! 📷", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    camera: Camera
  ) => {
    setActionMenuAnchor(event.currentTarget);
    setMenuCamera(camera);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setMenuCamera(null);
  };

  /**
   * Hàm xử lý xóa camera
   * @param cameraId - ID của camera cần xóa
   */
  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await deleteCameraFromContext(cameraId);
    } catch {
      // Lỗi đã được xử lý trong context
    }
  };

  const handleOpenEdit = (camera: Camera) => {
    setSelectedCamera(camera);
    setOpenEditModal(true);
  };

  const handleCloseEdit = () => {
    setSelectedCamera(null);
    setOpenEditModal(false);
  };

  const handleUpdatedCamera = (updatedCamera?: Camera) => {
    // Nếu có camera đã update và có đầy đủ thông tin (có id),
    // cập nhật vào danh sách (giữ nguyên vị trí)
    // Nếu không có hoặc không đầy đủ, vẫn refresh toàn bộ (fallback)
    if (
      updatedCamera &&
      selectedCamera &&
      updatedCamera.id &&
      updatedCamera.brand &&
      updatedCamera.model
    ) {
      updateCameraInList(selectedCamera.id, updatedCamera);
    } else {
      refreshCameras();
    }

    handleCloseEdit();
  };

  // Sắp xếp cameras theo createdAt (mới nhất trước)
  const sortedCameras = [...(cameras || [])].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
  });

  /**
   * Tính toán phân trang
   */
  const totalPages = Math.ceil((sortedCameras?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCameras = sortedCameras?.slice(startIndex, endIndex) || [];

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (_: unknown, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Hàm format giá tiền VNĐ
   * @param price - Giá tiền cần format
   * @returns Chuỗi giá tiền đã format
   */
  const formatPrice = (price: number) => {
    return `₫${price.toLocaleString("vi-VN")}/ngày`;
  };

  const statusStyles = {
    pending: {
      label: "Chờ xử lý",
      bg: "#FFF4ED",
      color: "#C8501D",
      border: "1px solid rgba(255, 107, 53, 0.35)",
      icon: (
        <HourglassEmptyRounded
          fontSize="small"
          sx={{ color: "#FF6B35", mr: 0.5 }}
        />
      ),
    },
    approved: {
      label: "Đã duyệt",
      bg: "#E6F4EA",
      color: "#15803D",
      border: "1px solid rgba(59, 246, 112, 0.3)",
      icon: (
        <CheckCircleRounded
          fontSize="small"
          sx={{ color: "#15803D", mr: 0.5, fill: "#15803D" }}
        />
      ),
    },
    cancelled: {
      label: "Đã hủy",
      bg: "#F4F4F5",
      color: "#52525B",
      border: "1px solid rgba(148, 163, 184, 0.35)",
      icon: (
        <DoNotDisturbOnRounded
          fontSize="small"
          sx={{ color: "#64748B", mr: 0.5 }}
        />
      ),
    },
  } as const;

  type StatusKey = keyof typeof statusStyles;

  const renderStatusChip = (statusKey: StatusKey, labelOverride?: string) => {
    const config = statusStyles[statusKey] || statusStyles.pending;
    return (
      <Chip
        label={labelOverride ?? config.label}
        size="small"
        icon={config.icon}
        sx={{
          bgcolor: config.bg,
          color: config.color,
          border: config.border,
          borderRadius: 999,
          fontWeight: 600,
          fontSize: "0.75rem",
          px: 0.5,
          "& .MuiChip-icon": {
            marginLeft: 0,
          },
        }}
        variant="outlined"
      />
    );
  };

  const mapCameraStatus = (
    cameraItem: Camera
  ): { key: StatusKey; label?: string } => {
    if (!cameraItem.isConfirmed) {
      return { key: "pending", label: "Chờ xác minh" };
    }
    return { key: "approved", label: "Đã xác minh" };
  };

  // Tính toán thống kê dựa trên trạng thái camera
  const stats = {
    total: cameras?.length || 0,
    verified: cameras?.filter((c) => c.isConfirmed).length || 0,
    pending: cameras?.filter((c) => !c.isConfirmed).length || 0,
    rented: 0, // Có thể tính từ dữ liệu booking nếu có
    maintenance: 0, // Có thể tính từ dữ liệu maintenance nếu có
  };

  const actionButtonBaseSx = {
    width: 42,
    height: 42,
    borderRadius: 2,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          blockSize: "60vh",
          bgcolor: "#F8FAFC",
        }}
      >
        <CircularProgress size={50} thickness={4} sx={{ color: "#FF6B35" }} />
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            color: "#64748B",
            fontWeight: 500,
          }}
        >
          Đang tải camera...
        </Typography>
      </Box>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F8FAFC", minHeight: "60vh" }}>
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            border: "1px solid #FEE2E2",
            "& .MuiAlert-icon": {
              color: "#EF4444",
            },
          }}
        >
          {error}
        </Alert>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => refreshCameras()}
            sx={{
              bgcolor: "#FF6B35",
              color: "#FFFFFF",
              fontWeight: 600,
              px: 3,
              py: 1,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
              "&:hover": {
                bgcolor: "#E85D2A",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
              },
            }}
          >
            Thử lại
          </Button>
          {!localStorage.getItem("accessToken") && (
            <Button
              variant="outlined"
              onClick={() => (window.location.href = "/")}
              sx={{
                borderColor: "#CBD5E1",
                color: "#64748B",
                fontWeight: 600,
                px: 3,
                py: 1,
                textTransform: "none",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#94A3B8",
                  bgcolor: "#F8FAFC",
                },
              }}
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 3,
          borderBottom: "3px solid #E2E8F0",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{
              color: "#1E293B",
              letterSpacing: "-0.5px",
              mb: 0.5,
            }}
          >
            Quản Lý Camera
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            Quản lý và theo dõi kho thiết bị cho thuê của bạn
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenAddModal(true)}
          sx={{
            bgcolor: "#FF6B35",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.95rem",
            px: 3,
            py: 1.25,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#E85D2A",
              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.35)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Thêm Camera Mới
        </Button>
      </Box>

      {/* Stats - Thống kê tổng quan */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#FF6B35",
              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Tổng Camera
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#1E293B" }}
                >
                  {stats.total}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#FFF5F0",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>📦</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#10B981",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Đã xác minh
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#10B981" }}
                >
                  {stats.verified}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#F0FDF4",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>✅</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#3B82F6",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.08)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontWeight: 600,
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                  }}
                >
                  Chờ Xác Minh
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#FF6B35" }}
                >
                  {stats.pending}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#FFF5F0",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>⏳</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Camera Table - Danh sách camera dạng bảng */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        {(cameras?.length || 0) === 0 ? (
          // Hiển thị khi không có camera
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ mb: 2, opacity: 0.5 }}>
              <Typography sx={{ fontSize: "4rem" }}>📷</Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                color: "#475569",
                mb: 1,
              }}
            >
              Chưa có camera nào
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#94A3B8",
                fontWeight: 500,
              }}
            >
              Bắt đầu bằng cách thêm camera đầu tiên vào kho
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Camera
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Phiên Bản
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Số Serial
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Chi nhánh
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Thông Số
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Giá Thuê/Ngày
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Giá Trị
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Trạng Thái
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    py: 2,
                  }}
                >
                  Thao Tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentCameras.map((camera) => (
                <TableRow
                  key={camera.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "#F8FAFC",
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {(() => {
                          const mediaList: Array<CameraMedia | string> =
                            Array.isArray(camera.media)
                              ? (camera.media as Array<CameraMedia | string>)
                              : [];
                          const mediaUrls = mediaList.map((mediaItem) =>
                            typeof mediaItem === "string"
                              ? mediaItem
                              : mediaItem?.url || ""
                          );
                          const first =
                            mediaUrls.find(Boolean) ||
                            "https://via.placeholder.com/80?text=No+Image";
                          return (
                            <Box
                              component="img"
                              src={first}
                              alt={`${camera.brand} ${camera.model}`}
                              onClick={() => {
                                setPreviewImages(mediaUrls.filter(Boolean));
                                setPreviewIndex(0);
                              }}
                              sx={{
                                width: 90,
                                height: 90,
                                objectFit: "contain",
                                bgcolor: "#F8FAFC",
                                border: "2px solid #E2E8F0",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                borderRadius: 1,
                                "&:hover": {
                                  borderColor: "#FF6B35",
                                  transform: "scale(1.02)",
                                  boxShadow:
                                    "0 4px 12px rgba(255, 107, 53, 0.12)",
                                },
                              }}
                            />
                          );
                        })()}
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "#1E293B", mb: 0.25 }}
                        >
                          {camera.brand} {camera.model}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Rating
                            value={4.5}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{ fontSize: "0.9rem", color: "#F59E0B" }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "#94A3B8", fontSize: "0.7rem" }}
                          >
                            (0)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontWeight: 500 }}
                    >
                      {camera.variant}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748B",
                        fontFamily: "monospace",
                        bgcolor: "#F8FAFC",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                      }}
                    >
                      {camera.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#334155", fontWeight: 600 }}
                    >
                      {camera.branchName || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748B",
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {camera.specsJson}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "#FF6B35" }}
                    >
                      {formatPrice(camera.baseDailyRate)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94A3B8", fontSize: "0.7rem" }}
                    >
                      Đặt cọc: {(camera.depositPercent * 100).toFixed(0)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontWeight: 500 }}
                    >
                      ₫{camera.estimatedValueVnd.toLocaleString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = mapCameraStatus(camera);
                      return renderStatusChip(status.key, status.label);
                    })()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Thao tác" arrow>
                      <IconButton
                        aria-label="more actions"
                        size="medium"
                        onClick={(event) => handleOpenActionMenu(event, camera)}
                        sx={{
                          ...actionButtonBaseSx,
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          color: "#0F172A",
                          bgcolor: "#FFFFFF",
                          "&:hover": {
                            bgcolor: "#F8FAFC",
                            borderColor: "#94A3B8",
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Phân trang */}
      {(cameras?.length || 0) > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#64748B",
                border: "1px solid #E2E8F0",
                borderRadius: 1.5,
                "&:hover": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#CBD5E1",
                },
                "&.Mui-selected": {
                  bgcolor: "#FF6B35",
                  color: "#FFFFFF",
                  borderColor: "#FF6B35",
                  "&:hover": {
                    bgcolor: "#E85D2A",
                  },
                },
              },
            }}
          />
        </Box>
      )}

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.18)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (!menuCamera) return;
            handleOpenEdit(menuCamera);
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#1D4ED8" }} />
          </ListItemIcon>
          <ListItemText primary="Chỉnh sửa camera" />
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuCamera) return;
            await handleGenerateQRCode(menuCamera.id);
            handleCloseActionMenu();
          }}
        >
          <ListItemIcon>
            <QrCodeScannerIcon fontSize="small" sx={{ color: "#C8501D" }} />
          </ListItemIcon>
          <ListItemText primary="Tạo QR code" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={async () => {
            if (!menuCamera) return;
            const cameraId = menuCamera.id;
            handleCloseActionMenu();
            await handleDeleteCamera(cameraId);
          }}
          sx={{ color: "#B91C1C" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#B91C1C" }} />
          </ListItemIcon>
          <ListItemText primary="Xóa camera" />
        </MenuItem>
      </Menu>

      {/* Add Camera Modal */}
      <ModalAddCamera
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddCamera}
      />
      <ModalEditCamera
        open={openEditModal}
        camera={selectedCamera}
        onClose={handleCloseEdit}
        onUpdated={handleUpdatedCamera}
      />
      <ModalCreateQRCode
        open={openQRModal}
        onClose={() => setOpenQRModal(false)}
        qrCodeUrl={qrCodeUrl}
        cameraId={qrCameraId}
      />

      {/* Image Preview Dialog */}
      <Dialog
        open={previewIndex !== null}
        onClose={() => {
          setPreviewIndex(null);
          setPreviewImages([]);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "#1E293B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            position: "relative",
          }}
        >
          {previewIndex !== null && previewImages.length > 0 && (
            <>
              <Box sx={{ position: "absolute", left: 8 }}>
                <IconButton
                  onClick={() => {
                    if (previewIndex === null) return;
                    const prev =
                      (previewIndex - 1 + previewImages.length) %
                      previewImages.length;
                    setPreviewIndex(prev);
                  }}
                  sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                >
                  <Typography sx={{ fontSize: 20 }}>{"‹"}</Typography>
                </IconButton>
              </Box>

              <img
                src={previewImages[previewIndex]}
                alt={`Preview ${previewIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />

              <Box sx={{ position: "absolute", right: 8 }}>
                <IconButton
                  onClick={() => {
                    if (previewIndex === null) return;
                    const next = (previewIndex + 1) % previewImages.length;
                    setPreviewIndex(next);
                  }}
                  sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                >
                  <Typography sx={{ fontSize: 20 }}>{"›"}</Typography>
                </IconButton>
              </Box>

              <IconButton
                onClick={() => {
                  setPreviewIndex(null);
                  setPreviewImages([]);
                }}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 56,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  color: "#1E293B",
                  "&:hover": { bgcolor: "#FFFFFF" },
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  display: "flex",
                  gap: 1,
                }}
              >
                {previewImages.map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor:
                        i === previewIndex
                          ? "#FFFFFF"
                          : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
