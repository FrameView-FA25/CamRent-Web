import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
  Alert,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
} from "lucide-react";
import { colors } from "../../theme/colors";
import { toast } from "react-toastify";
import { userService } from "../../services/user.service";

interface UserProfile {
  id: string;
  email: string;
  normalizedEmail: string;
  phone: string;
  fullName: string;
  address: string | null;
  status: string;
  nationalIdNumber: string | null;
  kycStatus: string;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  avatar: string[];
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  updatedByUserId: string | null;
}

const RenterProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await userService.getCurrentUserProfile();
      setProfile(data);
      setEditedProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setOpenEditDialog(true);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setOpenEditDialog(false);
    setIsEditing(false);
    setEditedProfile(profile || {});
    setSelectedAvatar(null);
    setAvatarPreview(null);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.warning("Please login");
        return;
      }

      // TODO: Implement update profile API call
      toast.success("Profile updated successfully!");
      setOpenEditDialog(false);
      setIsEditing(false);
      fetchProfile(); // Refresh profile
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getKycStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        color: string;
        bgColor: string;
        icon: React.ReactElement;
      }
    > = {
      pending: {
        label: "Pending Verification",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: <Clock size={16} />,
      },
      verified: {
        label: "Verified",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <CheckCircle size={16} />,
      },
      rejected: {
        label: "Rejected",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <XCircle size={16} />,
      },
    };

    return (
      statusMap[status.toLowerCase()] || {
        label: status,
        color: colors.neutral[600],
        bgColor: colors.neutral[100],
        icon: <Shield size={16} />,
      }
    );
  };

  const getAccountStatusInfo = (status: string) => {
    return status === "Active"
      ? {
          label: "Active",
          color: colors.status.success,
          bgColor: colors.status.successLight,
        }
      : {
          label: status,
          color: colors.status.error,
          bgColor: colors.status.errorLight,
        };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}
      >
        <Container maxWidth="lg">
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 3, mb: 3 }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 3 }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 3 }}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box
        sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              textAlign: "center",
            }}
          >
            <User size={64} color={colors.neutral[300]} />
            <Typography
              variant="h6"
              sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
            >
              {error || "Profile not found"}
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                mt: 2,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
              onClick={fetchProfile}
            >
              Retry
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const kycInfo = getKycStatusInfo(profile.kycStatus);
  const accountInfo = getAccountStatusInfo(profile.status);
  const avatarUrl =
    profile.avatar && profile.avatar.length > 0 ? profile.avatar[0] : null;

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            mb: 3,
            background: `linear-gradient(135deg, ${colors.primary.lighter} 0%, ${colors.background.paper} 100%)`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar
                src={avatarUrl || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: colors.primary.main,
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  border: `4px solid ${colors.background.paper}`,
                  boxShadow: 3,
                }}
              >
                {profile.fullName?.charAt(0) || "R"}
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: colors.text.primary, mb: 1 }}
                >
                  {profile.fullName || "Unknown User"}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip
                    label={accountInfo.label}
                    size="small"
                    sx={{
                      bgcolor: accountInfo.bgColor,
                      color: accountInfo.color,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={kycInfo.icon}
                    label={kycInfo.label}
                    size="small"
                    sx={{
                      bgcolor: kycInfo.bgColor,
                      color: kycInfo.color,
                      fontWeight: 600,
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
                  Member since {formatDate(profile.createdAt)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<Edit size={18} />}
              onClick={handleEditClick}
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Left Column - Personal Info */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Personal Information
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Mail size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      Email
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.email || "Not provided"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Phone size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      Phone Number
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.phone || "Not provided"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <MapPin size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      Address
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.address || "Not provided"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CreditCard size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      National ID
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.nationalIdNumber || "Not provided"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* KYC Status Card */}
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${colors.border.light}`,
                borderRadius: 3,
                bgcolor: kycInfo.bgColor,
              }}
            >
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: colors.background.paper,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: kycInfo.color,
                    }}
                  >
                    <Shield size={24} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: colors.text.primary }}
                    >
                      KYC Verification
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      {kycInfo.label}
                    </Typography>
                  </Box>
                </Box>

                {profile.kycStatus === "pending" && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Your identity verification is being processed. This usually
                    takes 24-48 hours.
                  </Alert>
                )}

                {profile.kycStatus === "verified" && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Your identity has been verified. You can now rent equipment
                    without restrictions.
                  </Alert>
                )}

                {profile.kycStatus === "rejected" && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Your identity verification was rejected. Please contact
                    support for assistance.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Bank Info */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Banking Information
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Building2 size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      Bank Name
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.bankName || "Not provided"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <User size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      Account Name
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.bankAccountName || "Not provided"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CreditCard size={18} color={colors.text.secondary} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      Account Number
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {profile.bankAccountNumber || "Not provided"}
                  </Typography>
                </Box>
              </Stack>

              {!profile.bankName &&
                !profile.bankAccountName &&
                !profile.bankAccountNumber && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    Add your banking information to receive refunds and payments
                    faster.
                  </Alert>
                )}
            </Paper>

            {/* Account Info Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}
              >
                Account Information
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Account ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontFamily: "monospace",
                    }}
                  >
                    {profile.id.slice(0, 13)}...
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Created At
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatDate(profile.createdAt)}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    Last Updated
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {formatDate(profile.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Edit Profile Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={handleCancelEdit}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Edit Profile
              </Typography>
              <IconButton onClick={handleCancelEdit}>
                <X size={20} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Avatar Upload */}
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  src={avatarPreview || avatarUrl || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    bgcolor: colors.primary.main,
                    fontSize: "3rem",
                  }}
                >
                  {profile.fullName?.charAt(0) || "R"}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload size={18} />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Change Avatar
                  </Button>
                </label>
              </Box>

              <TextField
                fullWidth
                label="Full Name"
                value={editedProfile.fullName || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    fullName: e.target.value,
                  })
                }
              />

              <TextField
                fullWidth
                label="Email"
                value={editedProfile.email || ""}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, email: e.target.value })
                }
                disabled
              />

              <TextField
                fullWidth
                label="Phone"
                value={editedProfile.phone || ""}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, phone: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Address"
                value={editedProfile.address || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    address: e.target.value,
                  })
                }
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="National ID Number"
                value={editedProfile.nationalIdNumber || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    nationalIdNumber: e.target.value,
                  })
                }
              />

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Banking Information
              </Typography>

              <TextField
                fullWidth
                label="Bank Name"
                value={editedProfile.bankName || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    bankName: e.target.value,
                  })
                }
              />

              <TextField
                fullWidth
                label="Account Name"
                value={editedProfile.bankAccountName || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    bankAccountName: e.target.value,
                  })
                }
              />

              <TextField
                fullWidth
                label="Account Number"
                value={editedProfile.bankAccountNumber || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    bankAccountNumber: e.target.value,
                  })
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<X size={18} />}
              onClick={handleCancelEdit}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={handleSaveProfile}
              sx={{
                bgcolor: colors.primary.main,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default RenterProfile;
