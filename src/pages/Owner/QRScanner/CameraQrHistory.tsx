import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  CheckCircle,
  ErrorOutline,
  History,
  Info,
  Inventory,
  ListAlt,
  QrCodeScanner,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import type { CameraQrHistoryResponse } from "@/services/camera.service";
import { cameraService } from "@/services/camera.service";
import { accessoryService } from "@/services/accessory.service";
import type {
  AccessoryQrHistoryResponse,
  AccessoryBooking,
  AccessoryInspection,
} from "../../../types/accessory.types";
import QRScannerDialog from "../../../components/QRScanner/QRScannerDialog";

const bookingStatusColors: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  PendingApproval: {
    bg: "#FEF3C7",
    color: "#92400E",
    label: "Chờ duyệt",
  },
  Approved: {
    bg: "#DCFCE7",
    color: "#166534",
    label: "Đã duyệt",
  },
  Rejected: {
    bg: "#FEE2E2",
    color: "#991B1B",
    label: "Từ chối",
  },
  Completed: {
    bg: "#E0F2FE",
    color: "#075985",
    label: "Hoàn tất",
  },
};
// Dùng để định dạng tiền tệ VND
const formatCurrency = (value?: number | null) => {
  if (!value) {
    return "—";
  }
  return `₫${value.toLocaleString("vi-VN")}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return value;
  }
};

const parseSpecs = (specsJson?: string | null) => {
  if (!specsJson) return [];
  try {
    const data = JSON.parse(specsJson);
    return Object.entries(data).map(([key, val]) => ({
      key,
      value: String(val),
    }));
  } catch {
    return [];
  }
};

const CameraQrHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [cameraIdInput, setCameraIdInput] = useState(
    searchParams.get("cameraId") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyData, setHistoryData] =
    useState<CameraQrHistoryResponse | null>(null);
  const [accessoryData, setAccessoryData] =
    useState<AccessoryQrHistoryResponse | null>(null);

  useEffect(() => {
    const cameraId = searchParams.get("cameraId");
    if (cameraId) {
      handleFetch(cameraId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Hàm gọi API để lấy lịch sử QR
  const handleFetch = async (cameraId: string) => {
    setLoading(true);
    setError("");
    setHistoryData(null);
    setAccessoryData(null);
    try {
      const data = await cameraService.getCameraQrHistory(cameraId);
      setHistoryData(data);
    } catch {
      // Nếu không tìm thấy camera, thử gọi phụ kiện
      try {
        const accessoryRes = await accessoryService.getAccessoryQrHistory(
          cameraId
        );
        setAccessoryData(accessoryRes);
      } catch {
        setError("Không tìm thấy thông tin thiết bị hoặc phụ kiện.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = (result: string) => {
    setCameraIdInput(result);
    setSearchParams({ cameraId: result });
    handleFetch(result);
  };

  const handleSubmit = () => {
    if (!cameraIdInput.trim()) {
      setError("Vui lòng nhập ID camera hoặc quét mã QR.");
      return;
    }
    const id = cameraIdInput.trim();
    setSearchParams({ cameraId: id });
    handleFetch(id);
  };

  const camera = historyData?.camera;
  const hasActiveBooking = historyData?.bookings?.some(
    (b) => b.status && b.status !== "Completed" && b.status !== "Cancelled"
  );
  const cameraAvailable = !hasActiveBooking;
  const specs = useMemo(
    () => parseSpecs(camera?.specsJson),
    [camera?.specsJson]
  );

  //  dòng này để lấy dữ liệu phụ kiện
  const accessory = accessoryData?.accessory;
  const accessorySpecs = useMemo(
    () => parseSpecs(accessory?.specsJson),
    [accessory?.specsJson]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="#0F172A" mb={1}>
            Kiểm tra thiết bị
          </Typography>
          <Typography variant="body1" color="#475569">
            Quét QR code để xem chi tiết camera cùng lịch sử booking/inspection
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            fullWidth
            label="Nhập ID camera / QR token"
            value={cameraIdInput}
            onChange={(e) => setCameraIdInput(e.target.value)}
            placeholder="Ví dụ: f35669fa-6af5-4dd7-98a4-2a4ce9cf506e"
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
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            startIcon={<QrCodeScanner />}
            sx={{
              minWidth: 200,
              bgcolor: "#F97316",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              "&:hover": {
                bgcolor: "#EA580C",
              },
            }}
          >
            Kiểm tra thiết bị
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setQrScannerOpen(true)}
            startIcon={<QrCodeScanner />}
            sx={{
              minWidth: 200,
              borderColor: "#F97316",
              color: "#F97316",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              "&:hover": {
                borderColor: "#EA580C",
                bgcolor: "#FFF5F0",
              },
            }}
          >
            Quét QR
          </Button>
        </Stack>
        <Alert
          icon={<Info sx={{ color: "#0284C7" }} />}
          sx={{
            mt: 3,
            borderRadius: 2,
            bgcolor: "#E0F2FE",
            color: "#0C4A6E",
            "& .MuiAlert-icon": {
              color: "#0284C7",
            },
          }}
        >
          Cần quét QR trên thân máy để tự động điền ID hoặc nhập manual tại đây.
        </Alert>
      </Paper>

      {error && (
        <Alert
          severity="error"
          icon={<ErrorOutline />}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: "1px solid #FEE2E2",
            bgcolor: "#FEF2F2",
            color: "#991B1B",
          }}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
          }}
        >
          <CircularProgress size={48} sx={{ color: "#F97316" }} />
        </Box>
      )}

      {!loading && !historyData && !accessoryData && !error && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed #CBD5F5",
            bgcolor: "#FFFFFF",
          }}
        >
          <QrCodeScanner sx={{ fontSize: 72, color: "#F97316", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="#0F172A" mb={1}>
            Chưa có dữ liệu
          </Typography>
          <Typography color="#64748B">
            Quét mã QR hoặc nhập ID để xem thông tin thiết bị.
          </Typography>
        </Paper>
      )}

      {!loading && historyData && camera && (
        <Stack spacing={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    borderRadius: 3,
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {camera.media?.[0]?.url ? (
                    <img
                      src={camera.media[0].url}
                      alt={`${camera.brand} ${camera.model}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <CameraAlt sx={{ fontSize: 48, color: "#94A3B8" }} />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="#111827">
                        {camera.brand} {camera.model}
                      </Typography>
                      {camera.variant && (
                        <Typography color="#6B7280">
                          {camera.variant}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          mt: 1,
                          fontFamily: "monospace",
                          color: "#475569",
                          bgcolor: "#F8FAFC",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-flex",
                          fontSize: "0.85rem",
                        }}
                      >
                        {camera.serialNumber || "Chưa cập nhật serial"}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        icon={<CheckCircle />}
                        label={cameraAvailable ? "Đang rảnh" : "Đã đặt"}
                        sx={{
                          bgcolor: cameraAvailable ? "#DCFCE7" : "#FEE2E2",
                          color: cameraAvailable ? "#166534" : "#991B1B",
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                      <Chip
                        icon={<ListAlt />}
                        label={camera.location || "WithOwner"}
                        sx={{
                          bgcolor: "#EEF2FF",
                          color: "#3730A3",
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                    </Stack>
                  </Stack>

                  <Box
                    mt={2}
                    display="grid"
                    gap={2}
                    gridTemplateColumns={{
                      xs: "repeat(1, minmax(0, 1fr))",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="#94A3B8">
                        Giá thuê / ngày
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(camera.baseDailyRate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="#94A3B8">
                        Giá trị thiết bị
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(camera.estimatedValueVnd)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="#94A3B8">
                        Đặt cọc
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {(camera.depositPercent * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>

                  {specs.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {specs.map((spec) => (
                          <Chip
                            key={spec.key}
                            label={`${spec.key}: ${spec.value}`}
                            sx={{
                              bgcolor: "#F1F5F9",
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Lịch sử booking
                </Typography>
                <Chip
                  icon={<History />}
                  label={`${historyData.bookings.length} lượt`}
                  sx={{
                    bgcolor: "#EEF2FF",
                    color: "#4338CA",
                    fontWeight: 600,
                  }}
                />
              </Stack>
              {historyData.bookings.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "#94A3B8" }}>
                  Chưa có booking nào.
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã booking</TableCell>
                      <TableCell>Người thuê</TableCell>
                      <TableCell>Nhận</TableCell>
                      <TableCell>Trả</TableCell>
                      <TableCell align="right">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.bookings.map((booking) => {
                      const status =
                        bookingStatusColors[booking.status] ||
                        bookingStatusColors.PendingApproval;
                      return (
                        <TableRow key={booking.bookingId}>
                          <TableCell>
                            <Typography
                              fontFamily="monospace"
                              fontWeight={600}
                              color="#0F172A"
                            >
                              {booking.bookingId.slice(0, 8)}…
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {booking.renterName || "Chưa cập nhật"}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(booking.pickupAt)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(booking.returnAt)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                bgcolor: status.bg,
                                color: status.color,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Lịch sử inspection
                </Typography>
                <Chip
                  icon={<ListAlt />}
                  label={`${historyData.inspections.length} báo cáo`}
                  sx={{
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontWeight: 600,
                  }}
                />
              </Stack>

              {historyData.inspections.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "#94A3B8" }}>
                  Chưa có inspection nào.
                </Box>
              ) : (
                <Stack spacing={2}>
                  {historyData.inspections.map((inspection) => (
                    <Paper
                      key={inspection.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: inspection.passed ? "#BBF7D0" : "#FECACA",
                        bgcolor: inspection.passed ? "#F0FDF4" : "#FEF2F2",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography fontWeight={600} color="#0F172A">
                            {inspection.label || inspection.itemName}
                          </Typography>
                          <Typography variant="body2" color="#64748B">
                            {inspection.section} · {inspection.itemType}
                          </Typography>
                          {inspection.notes && (
                            <Typography
                              variant="body2"
                              color="#475569"
                              sx={{ mt: 1 }}
                            >
                              Ghi chú: {inspection.notes}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          icon={
                            inspection.passed ? (
                              <CheckCircle />
                            ) : (
                              <ErrorOutline />
                            )
                          }
                          label={inspection.passed ? "Đạt" : "Không đạt"}
                          sx={{
                            alignSelf: "flex-start",
                            bgcolor: inspection.passed ? "#22C55E" : "#EF4444",
                            color: "#FFFFFF",
                            fontWeight: 600,
                          }}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
      {/* Hiển thị thông tin phụ kiện nếu có */}
      {!loading && accessoryData && accessory && (
        <Stack spacing={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    borderRadius: 3,
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {accessory.media?.[0]?.url ? (
                    <img
                      src={accessory.media[0].url}
                      alt={`${accessory.brand} ${accessory.model}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Inventory sx={{ fontSize: 48, color: "#94A3B8" }} />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="#111827">
                        {accessory.brand} {accessory.model}
                      </Typography>
                      {accessory.variant && (
                        <Typography color="#6B7280">
                          {accessory.variant}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          mt: 1,
                          fontFamily: "monospace",
                          color: "#475569",
                          bgcolor: "#F8FAFC",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-flex",
                          fontSize: "0.85rem",
                        }}
                      >
                        {accessory.serialNumber || "Chưa cập nhật serial"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    mt={2}
                    display="grid"
                    gap={2}
                    gridTemplateColumns={{
                      xs: "repeat(1, minmax(0, 1fr))",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="#94A3B8">
                        Giá thuê / ngày
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(accessory.baseDailyRate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="#94A3B8">
                        Giá trị phụ kiện
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(accessory.estimatedValueVnd)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="#94A3B8">
                        Đặt cọc
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {(accessory.depositPercent * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>

                  {accessorySpecs.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {accessorySpecs.map((spec) => (
                          <Chip
                            key={spec.key}
                            label={`${spec.key}: ${spec.value}`}
                            sx={{
                              bgcolor: "#F1F5F9",
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Lịch sử booking
                </Typography>
                <Chip
                  icon={<History />}
                  label={`${accessoryData.bookings.length} lượt`}
                  sx={{
                    bgcolor: "#EEF2FF",
                    color: "#4338CA",
                    fontWeight: 600,
                  }}
                />
              </Stack>
              {accessoryData.bookings.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "#94A3B8" }}>
                  Chưa có booking nào.
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã booking</TableCell>
                      <TableCell>Người thuê</TableCell>
                      <TableCell>Nhận</TableCell>
                      <TableCell>Trả</TableCell>
                      <TableCell align="right">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accessoryData.bookings.map((booking: AccessoryBooking) => {
                      const status =
                        bookingStatusColors[booking.status] ||
                        bookingStatusColors.PendingApproval;
                      return (
                        <TableRow key={booking.bookingId}>
                          <TableCell>
                            <Typography
                              fontFamily="monospace"
                              fontWeight={600}
                              color="#0F172A"
                            >
                              {booking.bookingId
                                ? booking.bookingId.slice(0, 8) + "…"
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {booking.renterName || "Chưa cập nhật"}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(booking.pickupAt)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(booking.returnAt)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                bgcolor: status.bg,
                                color: status.color,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Lịch sử inspection
                </Typography>
                <Chip
                  icon={<ListAlt />}
                  label={`${accessoryData.inspections.length} báo cáo`}
                  sx={{
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontWeight: 600,
                  }}
                />
              </Stack>

              {accessoryData.inspections.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "#94A3B8" }}>
                  Chưa có inspection nào.
                </Box>
              ) : (
                <Stack spacing={2}>
                  {accessoryData.inspections.map(
                    (inspection: AccessoryInspection) => (
                      <Paper
                        key={inspection.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderColor: inspection.passed
                            ? "#BBF7D0"
                            : "#FECACA",
                          bgcolor: inspection.passed ? "#F0FDF4" : "#FEF2F2",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography fontWeight={600} color="#0F172A">
                              {inspection.label || inspection.itemName}
                            </Typography>
                            <Typography variant="body2" color="#64748B">
                              {inspection.section} · {inspection.itemType}
                            </Typography>
                            {inspection.notes && (
                              <Typography
                                variant="body2"
                                color="#475569"
                                sx={{ mt: 1 }}
                              >
                                Ghi chú: {inspection.notes}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            icon={
                              inspection.passed ? (
                                <CheckCircle />
                              ) : (
                                <ErrorOutline />
                              )
                            }
                            label={inspection.passed ? "Đạt" : "Không đạt"}
                            sx={{
                              alignSelf: "flex-start",
                              bgcolor: inspection.passed
                                ? "#22C55E"
                                : "#EF4444",
                              color: "#FFFFFF",
                              fontWeight: 600,
                            }}
                          />
                        </Stack>
                      </Paper>
                    )
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
      <QRScannerDialog
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </Box>
  );
};

export default CameraQrHistory;
