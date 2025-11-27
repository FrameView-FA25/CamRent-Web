import React, { useState } from "react";
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { getRoleLabel } from "../../../utils/roleUtils";

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

const AdminProfile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn Admin",
    email: "admin@camrent.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    role: "Admin",
    joinDate: "01/01/2024",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const showSuccess = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    showSuccess("Cập nhật thông tin thành công!");
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSuccess("Mật khẩu xác nhận không khớp!");
      return;
    }
    showSuccess("Cập nhật mật khẩu thành công!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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
          sx={{ bgcolor: "#DC2626", "&:hover": { bgcolor: "#B91C1C" } }}
        >
          Lưu
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => setIsEditing(false)}
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
          value={
            field.field === "role"
              ? getRoleLabel(data[field.field])
              : data[field.field]
          }
          onChange={(e) =>
            handleFieldChange(setter, data, field.field, e.target.value)
          }
          disabled={field.disabled || !isEditing}
          variant="outlined"
          multiline={field.multiline}
          rows={field.rows}
        />
      ))}
    </Box>
  );

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
                    {profileData.fullName.charAt(0)}
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
                  {profileData.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {profileData.role}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SecurityIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {profileData.phone}
                    </Typography>
                  </Box>
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
                      { label: "Email", field: "email" },
                    ],
                    profileData,
                    setProfileData
                  )}
                  {renderFieldRow(
                    [
                      { label: "Số Điện Thoại", field: "phone" },
                      { label: "Chức Vụ", field: "role", disabled: true },
                    ],
                    profileData,
                    setProfileData
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
                    profileData,
                    setProfileData
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
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProfile;
