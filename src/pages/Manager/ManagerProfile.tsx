import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Draw as DrawIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { SignatureDialog } from "./Verification/components/dialogs/SignatureDialog";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import { userService } from "../../services/user.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface FormField {
  label: string;
  field: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

interface UserProfileData {
  email: string;
  phone: string;
  fullName: string;
  address: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  signatureAssetId: string | null;
  signatureAsset?: {
    url: string;
    contentType: string;
    sizeBytes: number;
    label: string;
  } | null;
  avatarId: string | null;
  id: string;
  roles: Array<{
    role: string;
  }>;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3, minHeight: 400 }}>{children}</Box>}
  </Box>
);

const ManagerProfile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    address: "",
    bankAccountNumber: "",
    bankName: "",
    bankAccountName: "",
  });

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getCurrentUserProfile();
      setProfileData(data);

      setUserData({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        role: (data.roles || []).map((r) => r.role).join(", ") || "",
        address: data.address || "",
        bankAccountNumber: data.bankAccountNumber || "",
        bankName: data.bankName || "",
        bankAccountName: data.bankAccountName || "",
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin người dùng"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // const showSuccess = (message: string) => {
  //   setNotificationMessage(message);
  //   setShowNotification(true);
  // };

  const handleSave = async () => {
    try {
      if (!profileData?.id) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }

      await userService.updateUserProfile(profileData.id, {
        fullName: userData.fullName,
        phone: userData.phone,
        address: userData.address,
        bankAccountNumber: userData.bankAccountNumber,
        bankName: userData.bankName,
        bankAccountName: userData.bankAccountName,
      });

      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");

      // Refresh profile data
      await fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật thông tin"
      );
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/Auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Không thể cập nhật mật khẩu");
      }

      toast.success("Cập nhật mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật mật khẩu"
      );
    }
  };

  const handleFieldChange = <T,>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    data: T,
    field: string,
    value: string
  ) => setter({ ...data, [field]: value });

  const handleOpenSignature = () => {
    setSignatureDialogOpen(true);
  };

  const handleCloseSignature = () => {
    setSignatureDialogOpen(false);
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleConfirmSignature = async () => {
    try {
      if (
        !signatureRef.current ||
        typeof signatureRef.current.isEmpty !== "function" ||
        signatureRef.current.isEmpty()
      ) {
        toast.error("Vui lòng ký tên trước khi xác nhận");
        return;
      }

      const token = localStorage.getItem("accessToken");

      // Get signature as base64
      let signatureDataUrl: string;
      try {
        signatureDataUrl = signatureRef.current.toDataURL("image/png");
      } catch (err) {
        console.error("Cannot get signature dataURL:", err);
        toast.error("Không thể lấy dữ liệu chữ ký, thử lại.");
        return;
      }

      // Extract base64 string (remove data:image/png;base64, prefix)
      const base64Data = signatureDataUrl.split(",")[1] || "";
      if (!base64Data) {
        throw new Error("Dữ liệu chữ ký không hợp lệ");
      }

      // POST as JSON with signatureBase64
      const response = await fetch(`${API_BASE_URL}/UserProfiles/sign`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signatureBase64: base64Data,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật chữ ký");
      }

      toast.success("Cập nhật chữ ký thành công!");
      handleCloseSignature();

      // Refresh profile data
      await fetchUserProfile();
    } catch (error) {
      console.error("Error updating signature:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật chữ ký"
      );
    }
  };

  const renderEditButtons = () =>
    !isEditing ? (
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => setIsEditing(true)}
        sx={{
          borderColor: "#DC2626",
          color: "#DC2626",
          "&:hover": {
            borderColor: "#B91C1C",
            bgcolor: "#FEF2F2",
          },
        }}
      >
        Chỉnh Sửa
      </Button>
    ) : (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ bgcolor: "#DC2626", "&:hover": { bgcolor: "#B91C1C" } }}
        >
          Lưu
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => setIsEditing(false)}
          sx={{
            borderColor: "#6B7280",
            color: "#6B7280",
            "&:hover": {
              borderColor: "#4B5563",
              bgcolor: "#F9FAFB",
            },
          }}
        >
          Hủy
        </Button>
      </Stack>
    );

  const renderFieldRow = <T extends Record<string, string>>(
    fields: FormField[],
    data: T,
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      {fields.map((field) => (
        <TextField
          key={field.field}
          fullWidth
          label={field.label}
          type={field.type || "text"}
          value={data[field.field] || ""}
          onChange={(e) =>
            handleFieldChange(setter, data, field.field, e.target.value)
          }
          disabled={field.disabled || (!isEditing && tabValue === 0)}
          variant="outlined"
          multiline={field.multiline}
          rows={field.rows}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: isEditing ? "#DC2626" : undefined,
              },
              "&.Mui-focused fieldset": {
                borderColor: "#DC2626",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#DC2626",
            },
          }}
        />
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#DC2626" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1F2937",
            mb: 1,
          }}
        >
          Thông Tin Cá Nhân
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin tài khoản và cài đặt bảo mật của bạn
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
        }}
      >
        {/* Profile Card */}
        <Box sx={{ flexBasis: { md: "33.333%" }, display: "flex" }}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                py: 4,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box
                  sx={{ position: "relative", display: "inline-block", mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "#DC2626",
                      fontSize: "3rem",
                      fontWeight: 700,
                    }}
                  >
                    {userData.fullName.charAt(0)}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "#F3F4F6" },
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {userData.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {userData.role}
                </Typography>
              </Box>

              <Box>
                <Divider sx={{ my: 3 }} />

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {userData.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SecurityIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {userData.phone || "Chưa cập nhật"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Signature Section */}
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, fontWeight: 600, color: "#1F2937" }}
                  >
                    Chữ ký
                  </Typography>
                  {profileData?.signatureAssetId ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Đã có chữ ký
                      </Alert>

                      {/* Display signature image */}
                      {profileData?.signatureAsset?.url && (
                        <Box
                          sx={{
                            mb: 2,
                            p: 2,
                            border: "2px dashed #E5E7EB",
                            borderRadius: 2,
                            bgcolor: "#F9FAFB",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={profileData.signatureAsset.url}
                            alt="Chữ ký"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "150px",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      )}

                      <Button
                        variant="outlined"
                        startIcon={<DrawIcon />}
                        onClick={handleOpenSignature}
                        fullWidth
                        sx={{
                          borderColor: "#DC2626",
                          color: "#DC2626",
                          "&:hover": {
                            borderColor: "#B91C1C",
                            bgcolor: "#FEF2F2",
                          },
                        }}
                      >
                        Cập nhật chữ ký
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Chưa có chữ ký
                      </Alert>
                      <Button
                        variant="contained"
                        startIcon={<DrawIcon />}
                        onClick={handleOpenSignature}
                        fullWidth
                        sx={{
                          bgcolor: "#DC2626",
                          "&:hover": { bgcolor: "#B91C1C" },
                        }}
                      >
                        Thêm chữ ký
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Information Card */}
        <Box sx={{ flex: 1, display: "flex" }}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
              flex: 1,
            }}
          >
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, val) => setTabValue(val)}
                  sx={{
                    "& .MuiTab-root": {
                      color: "#6B7280",
                      "&.Mui-selected": {
                        color: "#DC2626",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#DC2626",
                    },
                  }}
                >
                  <Tab
                    label="Thông Tin Chung"
                    icon={<PersonIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Bảo Mật"
                    icon={<LockIcon />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab 1: General Information */}
              <TabPanel value={tabValue} index={0}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Thông Tin Cá Nhân
                  </Typography>
                  {renderEditButtons()}
                </Box>

                <Stack spacing={3}>
                  {renderFieldRow(
                    [
                      { label: "Họ và Tên", field: "fullName" },
                      { label: "Email", field: "email", disabled: true },
                    ],
                    userData,
                    setUserData
                  )}
                  {renderFieldRow(
                    [
                      { label: "Số Điện Thoại", field: "phone" },
                      { label: "Chức Vụ", field: "role", disabled: true },
                    ],
                    userData,
                    setUserData
                  )}
                  {renderFieldRow(
                    [
                      {
                        label: "Địa Chỉ",
                        field: "address",
                        multiline: true,
                        rows: 2,
                      },
                    ],
                    userData,
                    setUserData
                  )}

                  <Divider />

                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Thông Tin Ngân Hàng
                  </Typography>

                  {renderFieldRow(
                    [
                      { label: "Tên Ngân Hàng", field: "bankName" },
                      { label: "Số Tài Khoản", field: "bankAccountNumber" },
                    ],
                    userData,
                    setUserData
                  )}
                  {renderFieldRow(
                    [{ label: "Tên Chủ Tài Khoản", field: "bankAccountName" }],
                    userData,
                    setUserData
                  )}
                </Stack>
              </TabPanel>

              {/* Tab 2: Security */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Đổi Mật Khẩu
                </Typography>

                <Stack spacing={3}>
                  {renderFieldRow(
                    [
                      {
                        label: "Mật Khẩu Hiện Tại",
                        field: "currentPassword",
                        type: "password",
                      },
                    ],
                    passwordData,
                    setPasswordData
                  )}
                  {renderFieldRow(
                    [
                      {
                        label: "Mật Khẩu Mới",
                        field: "newPassword",
                        type: "password",
                      },
                    ],
                    passwordData,
                    setPasswordData
                  )}
                  {renderFieldRow(
                    [
                      {
                        label: "Xác Nhận Mật Khẩu Mới",
                        field: "confirmPassword",
                        type: "password",
                      },
                    ],
                    passwordData,
                    setPasswordData
                  )}
                  <Button
                    variant="contained"
                    onClick={handlePasswordUpdate}
                    sx={{
                      bgcolor: "#DC2626",
                      "&:hover": { bgcolor: "#B91C1C" },
                    }}
                  >
                    Cập Nhật Mật Khẩu
                  </Button>
                </Stack>
              </TabPanel>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="success"
          sx={{ width: "100%" }}
        ></Alert>
      </Snackbar>

      {/* Signature Dialog */}
      <SignatureDialog
        open={signatureDialogOpen}
        onClose={handleCloseSignature}
        signatureRef={signatureRef}
        onClear={handleClearSignature}
        onSave={handleConfirmSignature}
      />
    </Container>
  );
};

export default ManagerProfile;
