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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import ModalAddAccessory from "../../../components/Modal/Owner/ModalAddAccessory";
import ModalEditAccessory from "../../../components/Modal/Owner/ModalEditAccessory";
import { accessoryService } from "../../../services/accessory.service";
import { useAccessoryContext } from "../../../context/AccessoryContext/useAccessoryContext";
import type { Accessory } from "../../../types/accessory.types";

export default function AccessoryManagement() {
  const {
    accessories,
    loading,
    error,
    fetchAccessories,
    updateAccessoryInList,
    refreshAccessories,
  } = useAccessoryContext();

  // State quản lý modal thêm phụ kiện
  const [openAddModal, setOpenAddModal] = useState(false);

  // State quản lý modal edit phụ kiện
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null
  );

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Số lượng phụ kiện hiển thị mỗi trang

  // State cho gallery preview: danh sách ảnh và index hiện tại (null = đóng)
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  /**
   * Hàm tải danh sách phụ kiện từ API
   */

  /**
   * useEffect: Gọi API lấy danh sách phụ kiện khi component được mount
   */
  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  /**
   * Hàm xử lý khi thêm phụ kiện mới thành công
   */
  const handleAddAccessory = () => {
    fetchAccessories();
    setCurrentPage(1);
  };

  /**
   * Hàm mở modal edit phụ kiện
   */
  const handleOpenEdit = (accessory: Accessory) => {
    setSelectedAccessory(accessory);
    setOpenEditModal(true);
  };

  /**
   * Hàm đóng modal edit phụ kiện
   */
  const handleCloseEdit = () => {
    setSelectedAccessory(null);
    setOpenEditModal(false);
  };

  /**
   * Hàm xử lý sau khi cập nhật phụ kiện thành công
   */
  const handleUpdatedAccessory = (updatedAccessory?: Accessory) => {
    // Nếu có phụ kiện đã update và có đầy đủ thông tin (có id),
    // cập nhật vào danh sách (giữ nguyên vị trí)
    // Nếu không có hoặc không đầy đủ, vẫn refresh toàn bộ (fallback)
    if (
      updatedAccessory &&
      selectedAccessory &&
      updatedAccessory.id &&
      updatedAccessory.brand &&
      updatedAccessory.model
    ) {
      updateAccessoryInList(selectedAccessory.id, updatedAccessory);
    } else {
      // Fallback: refresh toàn bộ danh sách để đảm bảo data chính xác
      refreshAccessories();
    }
    handleCloseEdit();
  };

  /**
   * Hàm xử lý xóa phụ kiện
   */
  const handleDeleteAccessory = async (accessoryId: string) => {
    await accessoryService.deleteAccessory(accessoryId);
  };

  /**
   * Tính toán phân trang
   */
  const totalPages = Math.ceil(accessories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccessories = accessories.slice(startIndex, endIndex);

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Hàm format giá tiền VNĐ
   */
  const formatPrice = (price: number) => {
    return `₫${price.toLocaleString("vi-VN")}/ngày`;
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
          Đang tải phụ kiện...
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
            onClick={() => fetchAccessories()}
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
            Quản Lý Phụ Kiện
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            Quản lý và theo dõi kho phụ kiện cho thuê của bạn
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
          Thêm Phụ Kiện Mới
        </Button>
      </Box>

      {/* Stats - Thống kê tổng quan */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
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
                  Tổng Phụ Kiện
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#1E293B" }}
                >
                  {accessories.length}
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
                <Typography sx={{ fontSize: "1.5rem" }}>🎒</Typography>
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
                  Có Sẵn
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#10B981" }}
                >
                  {accessories.length}
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
                  Đã Cho Thuê
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#3B82F6" }}
                >
                  0
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#EFF6FF",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>🔒</Typography>
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
              borderColor: "#F59E0B",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.08)",
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
                  Bảo Trì
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#F59E0B" }}
                >
                  0
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#FFFBEB",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>🔧</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Accessory Table - Danh sách phụ kiện dạng bảng */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        {accessories.length === 0 ? (
          // Hiển thị khi không có phụ kiện
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ mb: 2, opacity: 0.5 }}>
              <Typography sx={{ fontSize: "4rem" }}>🎒</Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                color: "#475569",
                mb: 1,
              }}
            >
              Chưa có phụ kiện nào
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#94A3B8",
                fontWeight: 500,
              }}
            >
              Bắt đầu bằng cách thêm phụ kiện đầu tiên vào kho
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
                  Phụ Kiện
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
              {currentAccessories.map((accessory) => (
                <TableRow
                  key={accessory.id}
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
                          const mediaList: Array<
                            string | { url?: string; type?: string }
                          > = Array.isArray(accessory.media)
                            ? accessory.media
                            : accessory.media
                            ? [accessory.media]
                            : [];
                          const mediaUrls = mediaList
                            .map((m) =>
                              typeof m === "string" ? m : m?.url || ""
                            )
                            .filter(Boolean);
                          const first =
                            mediaUrls[0] ||
                            "https://via.placeholder.com/80?text=No+Image";
                          return (
                            <Box
                              component="img"
                              src={first}
                              alt={`${accessory.brand} ${accessory.model}`}
                              onClick={() => {
                                if (mediaUrls.length > 0) {
                                  setPreviewImages(mediaUrls);
                                  setPreviewIndex(0);
                                }
                              }}
                              sx={{
                                width: 90,
                                height: 90,
                                objectFit: "contain",
                                bgcolor: "#F8FAFC",
                                border: "2px solid #E2E8F0",
                                cursor:
                                  mediaUrls.length > 0 ? "pointer" : "default",
                                transition: "all 0.3s ease",
                                borderRadius: 1,
                                "&:hover": {
                                  borderColor:
                                    mediaUrls.length > 0
                                      ? "#FF6B35"
                                      : "#E2E8F0",
                                  transform:
                                    mediaUrls.length > 0
                                      ? "scale(1.02)"
                                      : "none",
                                  boxShadow:
                                    mediaUrls.length > 0
                                      ? "0 4px 12px rgba(255, 107, 53, 0.12)"
                                      : "none",
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
                          {accessory.brand} {accessory.model}
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
                      {accessory.variant}
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
                      {accessory.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748B",
                        maxWidth: 100,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {accessory.specsJson}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "#FF6B35" }}
                    >
                      {formatPrice(accessory.baseDailyRate)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94A3B8", fontSize: "0.7rem" }}
                    >
                      Đặt cọc: {(accessory.depositPercent * 100).toFixed(0)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontWeight: 500 }}
                    >
                      ₫{accessory.estimatedValueVnd.toLocaleString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Có sẵn"
                      size="small"
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#059669",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: "24px",
                        border: "1px solid #A7F3D0",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      <Tooltip title="Chỉnh sửa phụ kiện">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(accessory)}
                          sx={{
                            color: "#64748B",
                            "&:hover": {
                              bgcolor: "#EFF6FF",
                              color: "#3B82F6",
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa phụ kiện">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAccessory(accessory.id)}
                          sx={{
                            color: "#64748B",
                            "&:hover": {
                              bgcolor: "#FEF2F2",
                              color: "#EF4444",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Phân trang */}
      {accessories.length > 0 && (
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

      {/* Add Accessory Modal */}
      <ModalAddAccessory
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddAccessory}
      />

      {/* Edit Accessory Modal */}
      <ModalEditAccessory
        open={openEditModal}
        accessory={selectedAccessory}
        onClose={handleCloseEdit}
        onUpdated={handleUpdatedAccessory}
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
