import React, { useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { getRoleLabel } from "../../utils/roleUtils";
import { authService } from "../../services/auth.service";
import {
  userService,
  type UserProfileResponse,
} from "../../services/user.service";
import { toast } from "react-toastify";

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

const UserProfile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<
    "success" | "error"
  >("success");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    joinDate: "",
    status: "",
    avatar: "",
    branch: null as { id: string; name: string; address: { country: string | null; province: string | null; district: string | null }; isManager: boolean } | null,
  });

  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Kiểm tra role có cần thông tin ngân hàng không
  const needsBankInfo = () => {
    const rolesNeedBank = ["Owner", "Renter"];
    return rolesNeedBank.includes(profileData.role);
  };

  // Kiểm tra role có thông tin chi nhánh không
  const hasBranchInfo = () => {
    const rolesWithBranch = ["Staff", "BranchManager"];
    const userRole = profileData.role;
    const hasRole = rolesWithBranch.includes(userRole);
    const hasBranch = profileData.branch !== null && profileData.branch !== undefined;
    
    // Debug log để kiểm tra
    console.log("hasBranchInfo check:", {
      userRole,
      hasRole,
      hasBranch,
      branch: profileData.branch,
      branchName: profileData.branch?.name
    });
    
    return hasRole && hasBranch;
  };

  const showNotificationMessage = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setShowNotification(true);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: UserProfileResponse =
        await userService.getCurrentUserProfile();

      // Helper function để lấy role string
      const getUserRole = (): string => {
        if (data.roles && data.roles.length > 0) {
          // Backend có thể trả về roles là array of strings hoặc array of objects
          const firstRole = data.roles[0];
          if (typeof firstRole === "string") {
            return firstRole;
          }
          if (typeof firstRole === "object" && firstRole !== null && "role" in firstRole) {
            const roleValue = (firstRole as { role: string }).role;
            return Array.isArray(roleValue)
              ? roleValue[0] || ""
              : roleValue || "";
          }
        }
        return "";
      };

      // 🔹 Helper function để lấy URL avatar từ object avatar backend
      const getAvatarUrl = (): string => {
        if (!data.avatar) return "";
        // backend trả avatar là object FileAsset { id, url, ... }
        const raw = data.avatar.url || "";
        if (!raw) return "";

        // Nếu chỉ là path tương đối thì cứ trả lại, backend có thể handle reverse proxy
        return raw;
      };

      // Helper function để format address từ backend
      const formatAddress = (): string => {
        if (!data.address) return "";
        // Nếu là string thì trả về luôn
        if (typeof data.address === "string") return data.address;
        // Nếu là object thì format lại
        if (typeof data.address === "object") {
          const parts = [
            data.address.district,
            data.address.province,
            data.address.country,
          ].filter(Boolean);
          return parts.join(", ");
        }
        return "";
      };

      const userRole = getUserRole();
      
      // Debug: Log branch info để kiểm tra
      console.log("User Profile Data from API:", {
        role: userRole,
        roles: data.roles,
        branch: data.branch,
        hasBranch: !!data.branch,
        branchName: data.branch?.name,
        branchId: data.branch?.id
      });

      setProfileData({
        id: data.id || "",
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: formatAddress(),
        role: userRole,
        joinDate: data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("vi-VN")
          : "",
        status: data.status || "",
        avatar: getAvatarUrl(),
        branch: data.branch || null, // Thông tin chi nhánh từ backend
      });
      
      // Debug sau khi set state
      console.log("ProfileData after setState:", {
        role: userRole,
        branch: data.branch || null
      });

      setBankData({
        bankName: data.bankName || "",
        accountNumber: data.bankAccountNumber || "",
        accountName: data.bankAccountName || "",
      });
    } catch (err) {
      console.error("Fetch user profile failed", err);
      const message = err instanceof Error ? err.message : "Tải hồ sơ thất bại";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await userService.updateUserProfile(profileData.id, {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        bankNo: bankData.accountNumber || null,
        bankName: bankData.bankName || null,
        bankAccName: bankData.accountName || null,
      });
      setIsEditing(false);
      showNotificationMessage("Cập nhật thông tin thành công!");
      fetchProfile();
    } catch (err) {
      console.error("Update user profile failed", err);
      const message =
        err instanceof Error ? err.message : "Cập nhật thông tin thất bại";
      showNotificationMessage(message, "error");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showNotificationMessage("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotificationMessage("Mật khẩu xác nhận không khớp!", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotificationMessage("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
      return;
    }

    try {
      setIsLoading(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showNotificationMessage("Cập nhật mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Cập nhật mật khẩu thất bại!";
      showNotificationMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Dùng API /UserProfiles/me/avatar, cập nhật luôn URL avatar mới
  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const newUrl = await userService.updateMyAvatar(file);

      // Thêm query để tránh cache ảnh cũ
      const finalUrl = newUrl
        ? `${newUrl}${newUrl.includes("?") ? "&" : "?"}t=${Date.now()}`
        : "";

      setProfileData((prev) => ({
        ...prev,
        avatar: finalUrl || prev.avatar,
      }));

      showNotificationMessage("Cập nhật ảnh đại diện thành công!");
      // Optionally: fetchProfile(); // nếu muốn đồng bộ thêm thông tin khác
    } catch (error) {
      showNotificationMessage("Cập nhật ảnh đại diện thất bại!", "error");
      console.error("Update avatar failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = <T,>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    data: T,
    field: string,
    value: string
  ) => setter({ ...data, [field]: value });

  const renderEditButtons = () =>
    !isEditing ? (
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => setIsEditing(true)}
      >
        Chỉnh Sửa
      </Button>
    ) : (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isLoading}
          sx={{ bgcolor: "#DC2626", "&:hover": { bgcolor: "#B91C1C" } }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "Lưu"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
        >
          Hủy
        </Button>
      </Stack>
    );

  const renderFieldRow = <T extends Record<string, string | null | undefined>>(
    fields: FormField[],
    data: T,
    setter: React.Dispatch<React.SetStateAction<T>>,
    isPasswordTab?: boolean
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
          value={
            field.field === "role"
              ? getRoleLabel(data[field.field] || "")
              : (data[field.field] || "")
          }
          onChange={(e) =>
            handleFieldChange(setter, data, field.field, e.target.value)
          }
          disabled={field.disabled || (!isPasswordTab && !isEditing)}
          variant="outlined"
          multiline={field.multiline}
          rows={field.rows}
        />
      ))}
    </Box>
  );

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchProfile}>
          Thử lại
        </Button>
      </Container>
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
                    src={profileData.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "#DC2626",
                      fontSize: "3rem",
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(profileData.fullName)}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      component="span"
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
                  </label>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {profileData.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {getRoleLabel(profileData.role)}
                </Typography>
                {profileData.status && (
                  <Chip
                    label={profileData.status}
                    color="success"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                  display="block"
                    >
                  Tham gia từ: {profileData.joinDate}
                    </Typography>
              </Box>

              <Box>
                <Divider sx={{ my: 3 }} />

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {profileData.email}
                    </Typography>
                  </Box>
                  {profileData.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalanceIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {profileData.phone}
                      </Typography>
                    </Box>
                  )}
                  {/* Hiển thị thông tin chi nhánh cho Staff và BranchManager */}
                  {hasBranchInfo() && profileData.branch && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {profileData.branch.name}
                        </Typography>
                        {profileData.branch.address.district && profileData.branch.address.province && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {[profileData.branch.address.district, profileData.branch.address.province]
                              .filter(Boolean)
                              .join(", ")}
                          </Typography>
                        )}
                        {profileData.branch.isManager && (
                            <Chip
                              label="Quản lý"
                              size="small"
                              color="primary"
                            sx={{ mt: 0.5, fontSize: "0.65rem", height: "18px" }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </Stack>
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
                <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
                  <Tab
                    label="Thông Tin Chung"
                    icon={<PersonIcon />}
                    iconPosition="start"
                  />
                  {/* Chỉ hiển thị tab Ngân Hàng cho Owner và Renter */}
                  {needsBankInfo() && (
                    <Tab
                      label="Ngân Hàng"
                      icon={<AccountBalanceIcon />}
                      iconPosition="start"
                    />
                  )}
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
                    profileData as Record<string, string | null | undefined>,
                    setProfileData as React.Dispatch<React.SetStateAction<Record<string, string | null | undefined>>>
                  )}
                  {renderFieldRow(
                    [
                      { label: "Số Điện Thoại", field: "phone" },
                      { label: "Chức Vụ", field: "role", disabled: true },
                    ],
                    profileData as Record<string, string | null | undefined>,
                    setProfileData as React.Dispatch<React.SetStateAction<Record<string, string | null | undefined>>>
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
                    profileData as Record<string, string | null | undefined>,
                    setProfileData as React.Dispatch<React.SetStateAction<Record<string, string | null | undefined>>>
                  )}
                  {/* Hiển thị thông tin chi nhánh cho Staff và BranchManager */}
                  {hasBranchInfo() && profileData.branch && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: "#F9FAFB",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                          Chi Nhánh Làm Việc
                        </Typography>
                      </Box>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Tên chi nhánh
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {profileData.branch.name}
                          </Typography>
                        </Box>
                        {(profileData.branch.address.district || profileData.branch.address.province) && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Địa chỉ
                            </Typography>
                            <Typography variant="body1">
                              {[
                                profileData.branch.address.district,
                                profileData.branch.address.province,
                                profileData.branch.address.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Vai trò
                          </Typography>
                          <Chip
                            label={profileData.branch.isManager ? "Quản lý chi nhánh" : "Nhân viên"}
                            color={profileData.branch.isManager ? "primary" : "default"}
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </TabPanel>

              {/* Tab 2: Bank Information - Chỉ cho Owner và Renter */}
              {needsBankInfo() && (
                <TabPanel value={tabValue} index={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Thông Tin Ngân Hàng
                    </Typography>
                    {renderEditButtons()}
                  </Box>

                  {profileData.role === "Owner" && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Vui lòng cập nhật thông tin ngân hàng để nhận thanh toán
                      từ việc cho thuê thiết bị
                    </Alert>
                  )}

                  {profileData.role === "Renter" && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Thông tin ngân hàng để nhận hoàn tiền cọc hoặc hoàn tiền
                      khi hủy đơn
                    </Alert>
                  )}

                  <Stack spacing={3}>
                    {renderFieldRow(
                      [
                        { label: "Tên Ngân Hàng", field: "bankName" },
                        { label: "Số Tài Khoản", field: "accountNumber" },
                      ],
                      bankData,
                      setBankData
                    )}
                    {renderFieldRow(
                      [{ label: "Tên Chủ Tài Khoản", field: "accountName" }],
                      bankData,
                      setBankData
                    )}
                  </Stack>
                </TabPanel>
              )}

              {/* Tab 3: Security - Index động dựa vào có tab Bank hay không */}
              <TabPanel value={tabValue} index={needsBankInfo() ? 2 : 1}>
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
                    setPasswordData,
                    true
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
                    setPasswordData,
                    true
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
                    setPasswordData,
                    true
                  )}
                  <Button
                    variant="contained"
                    onClick={handlePasswordUpdate}
                    disabled={isLoading}
                    sx={{
                      bgcolor: "#DC2626",
                      "&:hover": { bgcolor: "#B91C1C" },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Cập Nhật Mật Khẩu"
                    )}
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
          severity={notificationSeverity}
          sx={{ width: "100%" }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;
