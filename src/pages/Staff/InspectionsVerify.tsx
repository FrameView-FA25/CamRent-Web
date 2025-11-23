import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  TablePagination,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Assignment,
  Search,
  Refresh,
  AddTask,
  Visibility,
  PendingActions,
  CheckCircle,
  Cancel,
  TaskAlt,
  FilterList,
} from "@mui/icons-material";
import { createInspection } from "../../services/inspection.service";
import InspectionDialog from "../../components/Modal/InspectionDialog";
import { verificationService } from "../../services/verification.service";
import type { Verification } from "../../types/verification.types";
import VerificationDetailDialog from "../../components/Verification/VerificationDetailDialog";
import { toast } from "react-toastify";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { color: "#F59E0B", bg: "#FEF3C7", icon: PendingActions };
    case "approved":
      return { color: "#10B981", bg: "#D1FAE5", icon: CheckCircle };
    case "rejected":
      return { color: "#EF4444", bg: "#FEE2E2", icon: Cancel };
    case "completed":
      return { color: "#3B82F6", bg: "#DBEAFE", icon: TaskAlt };
    default:
      return { color: "#6B7280", bg: "#F3F4F6", icon: Assignment };
  }
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "Chờ xử lý",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return statusMap[status.toLowerCase()] || status;
};

const Inspections: React.FC = () => {
  const [data, setData] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationService.getVerificationsByUserId();
      setData(res || []);
    } catch (err: unknown) {
      let message = "";
      if (typeof err === "object" && err !== null && "message" in err) {
        message = String((err as { message?: unknown }).message);
      } else {
        message = String(err);
      }
      setError(message || "Lỗi khi tải dữ liệu");
      toast.error(message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((d) => {
      return (
        d.id.toLowerCase().includes(q) ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.branchName || "").toLowerCase().includes(q) ||
        d.items?.some((it) => it.itemName.toLowerCase().includes(q))
      );
    });
  }, [data, query]);

  const paginatedData = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: data.length,
      pending: data.filter((d) => d.status.toLowerCase() === "pending").length,
      approved: data.filter((d) => d.status.toLowerCase() === "approved")
        .length,
      completed: data.filter((d) => d.status.toLowerCase() === "completed")
        .length,
    };
  }, [data]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // State cho dialog tạo inspection
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogRow, setDialogRow] = useState<Verification | null>(null);

  // Mở dialog với row tương ứng
  const openInspectionDialog = (row: Verification) => {
    setDialogRow(row);
    setOpenDialog(true);
  };

  const handleViewDetail = (row: Verification) => {
    setSelectedVerification(row);
    setOpenDetailDialog(true);
  };

  // Xử lý submit tạo inspection
  const handleSubmitInspection = async (form: Record<string, unknown>) => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          // Xử lý images array từ InspectionDialog
          value.forEach((file) => formData.append("files", file));
        } else if (key === "files" && value instanceof FileList) {
          Array.from(value).forEach((file) => formData.append("files", file));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      await createInspection(formData);
      toast.success("Tạo kiểm tra thành công!");
      setOpenDialog(false);
      await load();
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: unknown }).message
          : err;
      toast.error("Lỗi tạo kiểm tra: " + (message || "Không xác định"));
    }
  };
  return (
    <Box
      sx={{
        bgcolor: "#F9FAFB",
        minHeight: "100vh",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  bgcolor: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
                }}
              >
                <Assignment sx={{ color: "white", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 0.5,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                  }}
                >
                  Yêu cầu kiểm tra
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#6B7280", fontSize: "0.95rem" }}
                >
                  Danh sách yêu cầu kiểm tra được phân công cho bạn
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={load}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: "#F97316",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    bgcolor: "#FFF7ED",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#F97316" }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Tổng yêu cầu
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#111827", mt: 0.5 }}
                >
                  {stats.total}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#3B82F6", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Assignment sx={{ color: "#3B82F6", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Chờ xử lý
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#F59E0B", mt: 0.5 }}
                >
                  {stats.pending}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#F59E0B", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PendingActions sx={{ color: "#F59E0B", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Đã duyệt
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#10B981", mt: 0.5 }}
                >
                  {stats.approved}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#10B981", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle sx={{ color: "#10B981", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              p: 2.5,
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                >
                  Hoàn thành
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#3B82F6", mt: 0.5 }}
                >
                  {stats.completed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#3B82F6", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TaskAlt sx={{ color: "#3B82F6", fontSize: 24 }} />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid #E5E7EB",
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã, tên, thiết bị, chi nhánh..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F9FAFB",
                "& fieldset": {
                  borderColor: "#E5E7EB",
                },
                "&:hover fieldset": {
                  borderColor: "#F97316",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#F97316",
                  borderWidth: 2,
                },
              },
            }}
          />
          {query && (
            <IconButton
              onClick={() => setQuery("")}
              sx={{
                color: "#6B7280",
                "&:hover": { bgcolor: "#F3F4F6", color: "#F97316" },
              }}
            >
              <FilterList />
            </IconButton>
          )}
        </Paper>

        {/* Error */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FEF2F2",
              border: "1px solid #FEE2E2",
            }}
          >
            <Typography color="error" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Paper>
        )}

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Mã yêu cầu
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Tên khách hàng
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Thiết bị
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Chi nhánh
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Ngày kiểm tra
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "#374151",
                      fontSize: "0.875rem",
                      py: 2,
                      borderBottom: "2px solid #E5E7EB",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 8 }}>
                      <CircularProgress sx={{ color: "#F97316", mb: 2 }} />
                      <Typography sx={{ color: "#6B7280", fontWeight: 500 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 10 }}>
                      <Assignment
                        sx={{
                          fontSize: 72,
                          color: "#E5E7EB",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#374151", mb: 1, fontWeight: 600 }}
                      >
                        Chưa có yêu cầu kiểm tra
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                        {query
                          ? "Không tìm thấy kết quả phù hợp"
                          : "Bạn chưa được phân công hoặc chưa có yêu cầu"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const statusInfo = getStatusColor(row.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:hover": { bgcolor: "#FFF7ED" },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            wordBreak: "break-word",
                            color: "#6B7280",
                            fontSize: "0.875rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {row.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#111827",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {row.items?.slice(0, 2).map((it) => (
                              <Chip
                                key={it.itemId}
                                label={it.itemName}
                                size="small"
                                sx={{
                                  bgcolor: "#F3F4F6",
                                  color: "#374151",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            ))}
                            {row.items && row.items.length > 2 && (
                              <Chip
                                label={`+${row.items.length - 2}`}
                                size="small"
                                sx={{
                                  bgcolor: "#FFF7ED",
                                  color: "#F97316",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#374151",
                            fontSize: "0.875rem",
                          }}
                        >
                          {row.branchName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#6B7280",
                            fontSize: "0.875rem",
                          }}
                        >
                          {new Date(row.inspectionDate).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<StatusIcon sx={{ fontSize: 16 }} />}
                            label={getStatusLabel(row.status)}
                            size="small"
                            sx={{
                              bgcolor: statusInfo.bg,
                              color: statusInfo.color,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 28,
                              "& .MuiChip-icon": {
                                color: statusInfo.color,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip title="Xem chi tiết">
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Visibility fontSize="small" />}
                                onClick={() => handleViewDetail(row)}
                                sx={{
                                  borderColor: "#D1D5DB",
                                  color: "#374151",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  minWidth: 0,
                                  px: 1.5,
                                  py: 0.75,
                                  fontSize: "0.8125rem",
                                  "& .MuiButton-startIcon": { mr: 0.5 },
                                  "&:hover": {
                                    bgcolor: "#F9FAFB",
                                    borderColor: "#F97316",
                                    color: "#F97316",
                                  },
                                }}
                              >
                                Xem
                              </Button>
                            </Tooltip>
                            <Tooltip title="Bắt đầu kiểm tra">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddTask fontSize="small" />}
                                onClick={() => openInspectionDialog(row)}
                                disabled={
                                  row.status.toLowerCase() !== "pending"
                                }
                                sx={{
                                  bgcolor: "#F97316",
                                  color: "#fff",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  minWidth: 0,
                                  px: 1.5,
                                  py: 0.75,
                                  fontSize: "0.8125rem",
                                  boxShadow:
                                    "0 2px 8px rgba(249, 115, 22, 0.25)",
                                  "& .MuiButton-startIcon": { mr: 0.5 },
                                  "&:hover": {
                                    bgcolor: "#EA580C",
                                    boxShadow:
                                      "0 4px 12px rgba(249, 115, 22, 0.35)",
                                  },
                                  "&:disabled": {
                                    bgcolor: "#E5E7EB",
                                    color: "#9CA3AF",
                                  },
                                }}
                              >
                                Kiểm tra
                              </Button>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length > 0 && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng ${
                  count !== -1 ? count : `nhiều hơn ${to}`
                }`
              }
              sx={{
                borderTop: "1px solid #E5E7EB",
                "& .MuiTablePagination-toolbar": {
                  px: 2,
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  },
              }}
            />
          )}
        </Paper>
      </Container>

      {/* Dialogs */}
      <InspectionDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitInspection}
        defaultValues={
          dialogRow
            ? {
                verifyId: dialogRow.id,
                items: dialogRow.items || [],
                ItemType:
                  dialogRow.items && dialogRow.items[0]?.itemType
                    ? String(dialogRow.items[0].itemType)
                    : undefined,
                Notes: dialogRow.notes || "",
                Type: "Verification",
              }
            : {}
        }
      />
      <VerificationDetailDialog
        open={openDetailDialog}
        onClose={() => {
          setOpenDetailDialog(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
      />
    </Box>
  );
};

export default Inspections;
