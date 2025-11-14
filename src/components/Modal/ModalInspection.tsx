import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  CheckCircle,
  Cancel,
  CloudUpload,
  Image as ImageIcon,
} from "@mui/icons-material";
import type {
  InspectionItem,
  CreateInspectionRequest,
} from "../../types/booking.types";
import { createInspection } from "../../services/booking.service";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

interface ModalInspectionProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess?: () => void;
}

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  branchId?: string;
}

const ModalInspection: React.FC<ModalInspectionProps> = ({
  open,
  onClose,
  bookingId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [inspectionType, setInspectionType] = useState<number>(1); // 1: Check-in, 2: Check-out
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InspectionItem[]>([
    {
      section: "Thiết bị",
      label: "Tình trạng bên ngoài",
      value: "",
      passed: true,
      notes: "",
      images: [],
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        section: "Thiết bị",
        label: "",
        value: "",
        passed: true,
        notes: "",
        images: [],
      },
    ]);
  };

  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    // Convert files to base64 URLs (in production, upload to server)
    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          const newItems = [...items];
          newItems[index] = {
            ...newItems[index],
            images: [...(newItems[index].images || []), ...newImages],
          };
          setItems(newItems);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (itemIndex: number, imageIndex: number) => {
    const newItems = [...items];
    const currentImages = newItems[itemIndex].images || [];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      images: currentImages.filter((_, i) => i !== imageIndex),
    };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InspectionItem,
    value: string | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    // Validation
    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một mục kiểm tra");
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.section || !item.label || !item.value
    );
    if (invalidItems.length > 0) {
      toast.error("Vui lòng điền đầy đủ thông tin cho tất cả các mục kiểm tra");
      return;
    }

    setLoading(true);

    try {
      // Decode token to get user info
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      const decoded = jwtDecode<DecodedToken>(token);
      const branchId =
        decoded.branchId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // Fallback to example ID

      const inspectionData: CreateInspectionRequest = {
        bookingId,
        type: inspectionType,
        performedByUserId: decoded.sub,
        branchId,
        notes,
        items,
      };

      const result = await createInspection(inspectionData);

      if (result.success) {
        toast.success("Tạo phiếu kiểm tra thành công!");
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "Có lỗi xảy ra khi tạo phiếu kiểm tra");
      }
    } catch (error) {
      console.error("Error creating inspection:", error);
      toast.error("Có lỗi xảy ra khi tạo phiếu kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInspectionType(1);
    setNotes("");
    setItems([
      {
        section: "Thiết bị",
        label: "Tình trạng bên ngoài",
        value: "",
        passed: true,
        notes: "",
        images: [],
      },
    ]);
    onClose();
  };

  const sectionOptions = ["Thiết bị", "Phụ kiện", "Tài liệu", "Bao bì"];

  const getStatusColor = () => {
    const passedCount = items.filter((item) => item.passed).length;
    const totalCount = items.length;
    if (totalCount === 0) return "#94A3B8";
    if (passedCount === totalCount) return "#10B981";
    if (passedCount === 0) return "#EF4444";
    return "#F59E0B";
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
          color: "white",
          py: 3,
          px: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Tạo Phiếu Kiểm Tra
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Kiểm tra và ghi nhận tình trạng thiết bị
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
                transform: "rotate(90deg)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 4, bgcolor: "#F8FAFC" }}>
        {/* Inspection Type & Notes Section */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            mb: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, color: "#1E293B" }}
          >
            Thông Tin Cơ Bản
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Loại kiểm tra</InputLabel>
                <Select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(Number(e.target.value))}
                  label="Loại kiểm tra"
                  sx={{
                    bgcolor: "#F8FAFC",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#CBD5E1",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0EA5E9",
                    },
                  }}
                >
                  <MenuItem value={1}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#DBEAFE",
                          borderRadius: "50%",
                          p: 0.5,
                          display: "flex",
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 20, color: "#0284C7" }} />
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Check-in
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          Kiểm tra khi nhận thiết bị
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value={2}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#D1FAE5",
                          borderRadius: "50%",
                          p: 0.5,
                          display: "flex",
                        }}
                      >
                        <Cancel sx={{ fontSize: 20, color: "#059669" }} />
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Check-out
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          Kiểm tra khi trả thiết bị
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  bgcolor: "#F0F9FF",
                  borderRadius: 2,
                  p: 2,
                  border: "2px solid #BFDBFE",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: getStatusColor(),
                    borderRadius: "50%",
                    p: 1,
                    display: "flex",
                  }}
                >
                  <CheckCircle sx={{ color: "white", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748B", display: "block" }}
                  >
                    Tổng quan kiểm tra
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1E293B" }}
                  >
                    {items.filter((item) => item.passed).length}/{items.length}{" "}
                    Mục đạt
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Ghi chú chung"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về quá trình kiểm tra, tình trạng tổng thể..."
                sx={{
                  bgcolor: "#F8FAFC",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#CBD5E1",
                    },
                    "&:hover fieldset": {
                      borderColor: "#0EA5E9",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Inspection Items Section */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1E293B" }}
              >
                Danh Sách Kiểm Tra
              </Typography>
              <Chip
                label={`${items.length} mục`}
                size="small"
                sx={{
                  bgcolor: "#0EA5E9",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Box>
            <Button
              startIcon={<Add />}
              onClick={handleAddItem}
              variant="contained"
              sx={{
                bgcolor: "#0EA5E9",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
                "&:hover": {
                  bgcolor: "#0284C7",
                  boxShadow: "0 6px 16px rgba(14,165,233,0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Thêm Mục Kiểm Tra
            </Button>
          </Box>

          {items.length === 0 && (
            <Alert
              severity="info"
              icon={<CheckCircle />}
              sx={{
                borderRadius: 2,
                bgcolor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                "& .MuiAlert-icon": {
                  color: "#3B82F6",
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Chưa có mục kiểm tra nào. Vui lòng thêm mục kiểm tra bằng nút
                "Thêm Mục Kiểm Tra".
              </Typography>
            </Alert>
          )}

          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                p: 3,
                mb: 3,
                border: "2px solid",
                borderColor: item.passed ? "#10B981" : "#EF4444",
                boxShadow: item.passed
                  ? "0 4px 12px rgba(16,185,129,0.15)"
                  : "0 4px 12px rgba(239,68,68,0.15)",
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: item.passed
                    ? "0 8px 24px rgba(16,185,129,0.25)"
                    : "0 8px 24px rgba(239,68,68,0.25)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  pb: 2,
                  borderBottom: "2px solid",
                  borderColor: item.passed ? "#D1FAE5" : "#FEE2E2",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: item.passed ? "#D1FAE5" : "#FEE2E2",
                      color: item.passed ? "#059669" : "#DC2626",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    #{index + 1}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1E293B" }}
                  >
                    Mục Kiểm Tra {index + 1}
                  </Typography>
                  <Chip
                    icon={item.passed ? <CheckCircle /> : <Cancel />}
                    label={item.passed ? "Đạt" : "Không đạt"}
                    color={item.passed ? "success" : "error"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <IconButton
                  onClick={() => handleRemoveItem(index)}
                  sx={{
                    bgcolor: "#FEE2E2",
                    color: "#DC2626",
                    "&:hover": {
                      bgcolor: "#FECACA",
                      transform: "rotate(90deg)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>

              {/* Form Fields */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phân loại</InputLabel>
                    <Select
                      value={item.section}
                      onChange={(e) =>
                        handleItemChange(index, "section", e.target.value)
                      }
                      label="Phân loại"
                      sx={{
                        bgcolor: "#F8FAFC",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#CBD5E1",
                        },
                      }}
                    >
                      {sectionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hạng mục"
                    value={item.label}
                    onChange={(e) =>
                      handleItemChange(index, "label", e.target.value)
                    }
                    placeholder="VD: Tình trạng bên ngoài"
                    sx={{
                      bgcolor: "#F8FAFC",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#CBD5E1",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Kết quả kiểm tra"
                    value={item.value}
                    onChange={(e) =>
                      handleItemChange(index, "value", e.target.value)
                    }
                    placeholder="VD: Không có trầy xước, hoạt động tốt"
                    sx={{
                      bgcolor: "#F8FAFC",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#CBD5E1",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "#F8FAFC",
                      borderRadius: 1,
                      border: "1px solid #CBD5E1",
                      p: 1,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RadioGroup
                      row
                      value={item.passed ? "passed" : "failed"}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "passed",
                          e.target.value === "passed"
                        )
                      }
                      sx={{
                        gap: 1,
                      }}
                    >
                      <FormControlLabel
                        value="passed"
                        control={
                          <Radio
                            size="small"
                            sx={{
                              color: "#10B981",
                              "&.Mui-checked": {
                                color: "#10B981",
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: item.passed ? 700 : 500,
                              color: item.passed ? "#10B981" : "#64748B",
                            }}
                          >
                            Đạt
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="failed"
                        control={
                          <Radio
                            size="small"
                            sx={{
                              color: "#EF4444",
                              "&.Mui-checked": {
                                color: "#EF4444",
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: !item.passed ? 700 : 500,
                              color: !item.passed ? "#EF4444" : "#64748B",
                            }}
                          >
                            Không đạt
                          </Typography>
                        }
                      />
                    </RadioGroup>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      bgcolor: "#F8FAFC",
                      borderRadius: 1,
                      border: "1px solid #CBD5E1",
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#475569", mb: 1.5 }}
                    >
                      Ghi chú chi tiết
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={item.notes}
                      onChange={(e) =>
                        handleItemChange(index, "notes", e.target.value)
                      }
                      placeholder="Thêm ghi chú chi tiết về mục này..."
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          height: "100%",
                          alignItems: "flex-start",
                          bgcolor: "white",
                          "& fieldset": {
                            borderColor: "#CBD5E1",
                          },
                        },
                        "& .MuiInputBase-input": {
                          height: "100% !important",
                          overflow: "auto !important",
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      bgcolor: "#F8FAFC",
                      borderRadius: 1,
                      border: "1px solid #CBD5E1",
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ImageIcon sx={{ fontSize: 20, color: "#64748B" }} />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#475569" }}
                        >
                          Hình ảnh minh họa
                        </Typography>
                        {item.images && item.images.length > 0 && (
                          <Chip
                            label={item.images.length}
                            size="small"
                            sx={{
                              bgcolor: "#0EA5E9",
                              color: "white",
                              fontWeight: 600,
                              height: 20,
                              fontSize: "0.75rem",
                            }}
                          />
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUpload />}
                        size="small"
                        sx={{
                          textTransform: "none",
                          bgcolor: "#0EA5E9",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          px: 2,
                          "&:hover": {
                            bgcolor: "#0284C7",
                          },
                        }}
                      >
                        Tải ảnh
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(index, e)}
                        />
                      </Button>
                    </Box>

                    {item.images && item.images.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        {item.images.map((image, imgIdx) => (
                          <Box
                            key={imgIdx}
                            sx={{
                              position: "relative",
                              width: 70,
                              height: 70,
                              borderRadius: 1.5,
                              overflow: "hidden",
                              border: "2px solid #E2E8F0",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.1)",
                                borderColor: "#0EA5E9",
                                boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
                              },
                            }}
                          >
                            <img
                              src={image}
                              alt={`Preview ${imgIdx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              onClick={() => handleRemoveImage(index, imgIdx)}
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "rgba(239, 68, 68, 0.95)",
                                color: "white",
                                p: 0.5,
                                "&:hover": {
                                  bgcolor: "#DC2626",
                                  transform: "scale(1.1)",
                                },
                              }}
                              size="small"
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 2,
                          color: "#94A3B8",
                          border: "2px dashed #CBD5E1",
                          borderRadius: 1,
                          bgcolor: "white",
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
                        <Typography
                          variant="caption"
                          sx={{ display: "block", fontSize: "0.75rem" }}
                        >
                          Chưa có hình ảnh
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            fontSize: "0.65rem",
                            mt: 0.5,
                          }}
                        >
                          Click "Tải ảnh" để thêm
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 3,
          bgcolor: "#F8FAFC",
          borderTop: "2px solid #E2E8F0",
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderColor: "#CBD5E1",
            color: "#475569",
            "&:hover": {
              borderColor: "#94A3B8",
              bgcolor: "#F1F5F9",
            },
          }}
        >
          Hủy Bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? null : <CheckCircle />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "#0EA5E9",
            boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
            "&:hover": {
              bgcolor: "#0284C7",
              boxShadow: "0 6px 16px rgba(14,165,233,0.4)",
              transform: "translateY(-2px)",
            },
            "&:disabled": {
              bgcolor: "#CBD5E1",
            },
            transition: "all 0.3s ease",
          }}
        >
          {loading ? "Đang xử lý..." : "Tạo Phiếu Kiểm Tra"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalInspection;
