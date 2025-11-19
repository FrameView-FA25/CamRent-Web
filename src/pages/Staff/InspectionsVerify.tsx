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
} from "@mui/material";
import {
  Assignment,
  Search,
  Refresh,
  AddTask,
  Visibility,
} from "@mui/icons-material";
import { createInspection } from "../../services/inspection.service";
import InspectionDialog from "../../components/Modal/InspectionDialog";
import { verificationService } from "../../services/verification.service";
import type { Verification } from "../../types/verification.types";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "info";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "completed":
      return "primary";
    default:
      return "default";
  }
};

const Inspections: React.FC = () => {
  const [data, setData] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  // State cho dialog tạo inspection
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogRow, setDialogRow] = useState<Verification | null>(null);

  // Mở dialog với row tương ứng
  const openInspectionDialog = (row: Verification) => {
    setDialogRow(row);
    setOpenDialog(true);
  };

  // Xử lý submit tạo inspection
  const handleSubmitInspection = async (form: Record<string, unknown>) => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "files" && value instanceof FileList) {
          Array.from(value).forEach((file) => formData.append("files", file));
        } else {
          formData.append(key, value != null ? String(value) : "");
        }
      });
      await createInspection(formData);
      alert("Tạo inspection thành công!");
      setOpenDialog(false);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: unknown }).message
          : err;
      alert("Lỗi tạo inspection: " + (message || "Không xác định"));
    }
  };
  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="xl">
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
              <Assignment sx={{ color: "white", fontSize: 30 }} />
            </Box>
            Yêu cầu kiểm tra
          </Typography>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            Danh sách yêu cầu kiểm tra được phân công cho bạn
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{ p: 2, mb: 3, borderRadius: 3, display: "flex", gap: 2 }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã, tên, thiết bị, chi nhánh..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#F97316" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#F97316",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#F97316",
                },
              },
            }}
          />

          <IconButton
            onClick={load}
            sx={{ bgcolor: "#FFF7ED", color: "#F97316" }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#F97316" }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Paper>

        {/* Error */}
        {error && (
          <Paper
            elevation={0}
            sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "#FEF2F2" }}
          >
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Mã
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Tên
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Thiết bị
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Chi nhánh
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Ngày kiểm tra
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                      <CircularProgress sx={{ color: "#F97316" }} />
                      <Typography sx={{ mt: 2, color: "#6B7280" }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 8 }}>
                      <Assignment
                        sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }}
                      />
                      <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                        Chưa có yêu cầu kiểm tra
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                        Bạn chưa được phân công hoặc chưa có yêu cầu
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ "&:hover": { bgcolor: "#FFF7ED" } }}
                    >
                      <TableCell
                        sx={{ maxWidth: 260, wordBreak: "break-word" }}
                      >
                        {row.id}
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>
                        {row.items?.map((it) => (
                          <Chip
                            key={it.itemId}
                            label={it.itemName}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>{row.branchName}</TableCell>
                      <TableCell>
                        {new Date(row.inspectionDate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={getStatusColor(row.status)}
                          size="small"
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
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility fontSize="small" />}
                            onClick={() => alert(JSON.stringify(row, null, 2))}
                            sx={{
                              borderColor: "#F97316",
                              color: "#F97316",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              minWidth: 0,
                              px: 1.2,
                              py: 0.5,
                              fontSize: "0.85rem",
                              lineHeight: 1.2,
                              "& .MuiButton-startIcon": { mr: 0.5 },
                              "&:hover": {
                                bgcolor: "#FFF7ED",
                                borderColor: "#F97316",
                              },
                            }}
                          >
                            Xem
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddTask fontSize="small" />}
                            onClick={() => openInspectionDialog(row)}
                            sx={{
                              bgcolor: "#F97316",
                              color: "#fff",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2.5,
                              minWidth: 0,
                              px: 1.2,
                              py: 0.5,
                              fontSize: "0.85rem",
                              lineHeight: 1.2,
                              boxShadow: "none",
                              "& .MuiButton-startIcon": { mr: 0.5 },
                              "&:hover": {
                                bgcolor: "#fb923c",
                                color: "#fff",
                                boxShadow: "0 2px 8px 0 #F9731633",
                              },
                            }}
                          >
                            Kiểm tra
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
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
    </Box>
  );
};

export default Inspections;
