import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  VerifiedUser as VerifiedUserIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { verificationService } from "../../../services/verification.service";
import { branchService } from "../../../services/branch.service";
import type { CreateVerificationRequest } from "../../../services/verification.service";
import type { Branch } from "../../../types/branch.types";

export default function VerificationManagement() {
  const [formData, setFormData] = useState<CreateVerificationRequest>({
    name: "",
    phoneNumber: "",
    inspectionDate: "",
    notes: "",
    branchId: "",
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Lấy danh sách chi nhánh khi component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách chi nhánh",
      });
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.phoneNumber ||
        !formData.inspectionDate ||
        !formData.branchId
      ) {
        throw new Error("Vui lòng điền đầy đủ các trường bắt buộc");
      }

      // Convert date to ISO 8601 format with time
      const inspectionDateTime = new Date(
        formData.inspectionDate
      ).toISOString();

      const result = await verificationService.createVerification({
        ...formData,
        inspectionDate: inspectionDateTime,
      });

      setMessage({
        type: "success",
        text: result.message || "Tạo yêu cầu xác minh thành công!",
      });

      // Reset form
      setFormData({
        name: "",
        phoneNumber: "",
        inspectionDate: "",
        notes: "",
        branchId: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Đã xảy ra lỗi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      inspectionDate: "",
      notes: "",
      branchId: "",
    });
    setMessage(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F5F5",
        p: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(251, 146, 60, 0.3)",
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1F2937",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Yêu Cầu Xác Minh
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                Tạo yêu cầu xác minh thay đổi mật khẩu chủ sở hữu
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alert Message */}
        {message && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(null)}
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Main Form Card */}
        <Card
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E5E7EB",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 }, bgcolor: "white" }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#F97316",
                  fontSize: "1.125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <VerifiedUserIcon sx={{ fontSize: 22 }} />
                Thông Tin Xác Minh
              </Typography>
              <Box
                sx={{
                  height: 3,
                  width: 60,
                  bgcolor: "#F97316",
                  mt: 1,
                  borderRadius: 1,
                }}
              />
            </Box>
            <form onSubmit={handleSubmit}>
              <Stack direction="row" spacing={2}>
                {/* Row 1: Họ và tên, Số điện thoại, Ngày kiểm tra, Chi nhánh */}
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                      }}
                    >
                      Họ và Tên{" "}
                      <Box component="span" sx={{ color: "#EF4444" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập họ và tên đầy đủ"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#F9FAFB",
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#FB923C",
                            },
                          },
                          "&.Mui-focused": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#F97316",
                              borderWidth: 2,
                            },
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          py: 1.5,
                          fontSize: "0.95rem",
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                      }}
                    >
                      Số Điện Thoại{" "}
                      <Box component="span" sx={{ color: "#EF4444" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      fullWidth
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập số điện thoại"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#F9FAFB",
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#FB923C",
                            },
                          },
                          "&.Mui-focused": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#F97316",
                              borderWidth: 2,
                            },
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          py: 1.5,
                          fontSize: "0.95rem",
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                      }}
                    >
                      Ngày Kiểm Tra{" "}
                      <Box component="span" sx={{ color: "#EF4444" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      fullWidth
                      name="inspectionDate"
                      type="datetime-local"
                      value={formData.inspectionDate}
                      onChange={handleInputChange}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#F9FAFB",
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#FB923C",
                            },
                          },
                          "&.Mui-focused": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#F97316",
                              borderWidth: 2,
                            },
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          py: 1.5,
                          fontSize: "0.95rem",
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                      }}
                    >
                      Chi Nhánh{" "}
                      <Box component="span" sx={{ color: "#EF4444" }}>
                        *
                      </Box>
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleInputChange}
                      required
                      disabled={isLoadingBranches}
                      placeholder="Chọn chi nhánh"
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (selected) => {
                          if (!selected) {
                            return (
                              <span style={{ color: "#9CA3AF" }}>
                                Chọn chi nhánh
                              </span>
                            );
                          }
                          const selectedBranch = branches.find(
                            (b) => b.id === selected
                          );
                          return selectedBranch ? selectedBranch.name : "";
                        },
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              mt: 1,
                              borderRadius: 2,
                              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                              "& .MuiMenuItem-root": {
                                py: 1.5,
                                px: 1,
                                fontSize: "0.95rem",
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                "&:hover": {
                                  bgcolor: "#FFF7ED",
                                },
                                "&.Mui-selected": {
                                  bgcolor: "#FFEDD5",
                                  fontWeight: 600,
                                  "&:hover": {
                                    bgcolor: "#FED7AA",
                                  },
                                },
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#F9FAFB",
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#FB923C",
                            },
                          },
                          "&.Mui-focused": {
                            bgcolor: "white",
                            "& fieldset": {
                              borderColor: "#F97316",
                              borderWidth: 2,
                            },
                          },
                        },
                        "& .MuiSelect-select": {
                          py: 1.5,
                          fontSize: "0.95rem",
                        },
                      }}
                      InputProps={{
                        endAdornment: isLoadingBranches ? (
                          <CircularProgress
                            size={20}
                            sx={{ color: "#F97316", mr: 2 }}
                          />
                        ) : null,
                      }}
                    >
                      {branches.length === 0 && !isLoadingBranches ? (
                        <MenuItem value="" disabled>
                          Không có chi nhánh nào
                        </MenuItem>
                      ) : (
                        branches.map((branch) => (
                          <MenuItem key={branch.id} value={branch.id}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#1F2937" }}
                              >
                                {branch.name}
                              </Typography>
                              {branch.managerName && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#6B7280",
                                    display: "block",
                                    mt: 0.3,
                                  }}
                                >
                                  Quản lý: {branch.managerName}
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Box>
                </Box>
              </Stack>

              {/* Row 2: Ghi chú - Full width - Outside Grid */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.875rem",
                  }}
                >
                  Ghi Chú
                </Typography>
                <TextField
                  fullWidth
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Nhập ghi chú hoặc thông tin bổ sung (không bắt buộc)"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#F9FAFB",
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "white",
                        "& fieldset": {
                          borderColor: "#FB923C",
                        },
                      },
                      "&.Mui-focused": {
                        bgcolor: "white",
                        "& fieldset": {
                          borderColor: "#F97316",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: "0.95rem",
                    },
                  }}
                />
              </Box>

              {/* Action Buttons - Outside Grid */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 4,
                  pt: 3,
                  borderTop: "2px solid #F3F4F6",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={isLoading}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderColor: "#E5E7EB",
                    color: "#6B7280",
                    px: 3,
                    py: 1.25,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#FB923C",
                      color: "#F97316",
                      bgcolor: "#FFF7ED",
                    },
                  }}
                >
                  Đặt Lại
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || isLoadingBranches}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <VerifiedUserIcon />
                    )
                  }
                  sx={{
                    background:
                      "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
                    px: 4,
                    py: 1.25,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(251, 146, 60, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                      boxShadow: "0 6px 16px rgba(251, 146, 60, 0.5)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: "#FED7AA",
                      color: "#9CA3AF",
                    },
                    transition: "all 0.3s",
                  }}
                >
                  {isLoading ? "Đang Xử Lý..." : "Tạo Yêu Cầu Xác Minh"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            bgcolor: "#FFFBEB",
            border: "2px solid #FDE68A",
            borderRadius: 3,
            borderLeft: "6px solid #F59E0B",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "#FBBF24",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ color: "white", fontWeight: 700, fontSize: 20 }}
              >
                !
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#92400E",
                  mb: 1.5,
                  fontSize: "1rem",
                }}
              >
                Lưu Ý Quan Trọng
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, color: "#78350F" }}>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{ mb: 1, fontSize: "0.875rem", lineHeight: 1.6 }}
                >
                  <strong>Các trường bắt buộc:</strong> Tất cả các trường đánh
                  dấu (
                  <Box
                    component="span"
                    sx={{ color: "#EF4444", fontWeight: 700 }}
                  >
                    *
                  </Box>
                  ) phải được điền đầy đủ
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{ mb: 1, fontSize: "0.875rem", lineHeight: 1.6 }}
                >
                  <strong>Ngày kiểm tra:</strong> Phải là ngày trong tương lai
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{ mb: 1, fontSize: "0.875rem", lineHeight: 1.6 }}
                >
                  <strong>Chi nhánh:</strong> Vui lòng chọn chi nhánh từ danh
                  sách có sẵn
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{ fontSize: "0.875rem", lineHeight: 1.6 }}
                >
                  <strong>Số điện thoại:</strong> Phải có định dạng hợp lệ
                  (10-11 chữ số)
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
