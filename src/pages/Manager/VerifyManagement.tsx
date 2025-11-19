import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Skeleton,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Search,
  MoreVertical,
  Eye,
  Clock,
  Calendar,
  MapPin,
  Phone,
  User,
  FileText,
  AlertCircle,
  UserPlus,
  Camera,
  Package,
} from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { colors } from "../../theme/colors";
import { toast } from "react-toastify";
import { verificationService } from "../../services/verification.service";
import { fetchStaffList } from "../../services/booking.service";
import type { Verification } from "../../types/verification.types";
import type { Staff } from "../../types/booking.types";

const VerifyManagement: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<
    Verification[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
    loadStaffList();
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchQuery, activeTab]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getVerificationsByUserId();
      setVerifications(data);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load verifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const { staff, error } = await fetchStaffList();
      if (error) {
        console.error("Error loading staff:", error);
        return;
      }
      setStaffList(staff);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const filterVerifications = () => {
    let filtered = [...verifications];

    const tabs = ["all", "pending", "in-progress", "approved", "rejected"];
    if (activeTab > 0) {
      filtered = filtered.filter((v) => v.status === tabs[activeTab]);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.phoneNumber.includes(searchQuery) ||
          v.branchName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVerifications(filtered);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    verification: Verification
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedVerification(verification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setOpenDetailDialog(true);
    handleMenuClose();
  };

  const handleOpenAssignDialog = () => {
    setOpenAssignDialog(true);
    setSelectedStaffId("");
    handleMenuClose();
  };

  const handleAssignStaff = async () => {
    if (!selectedVerification || !selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      setAssignLoading(true);
      await verificationService.assignStaff(
        selectedVerification.id,
        selectedStaffId
      );
      toast.success("Staff assigned successfully");
      setOpenAssignDialog(false);
      fetchVerifications();
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign staff"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const getStatusInfo = (status: Verification["status"]) => {
    const statusMap = {
      pending: {
        label: "Pending",
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
        icon: <Clock size={16} />,
      },
      "in-progress": {
        label: "In Progress",
        color: colors.accent.blue,
        bgColor: colors.accent.blueLight,
        icon: <Clock size={16} />,
      },
      approved: {
        label: "Approved",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <Clock size={16} />,
      },
      rejected: {
        label: "Rejected",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <Clock size={16} />,
      },
      completed: {
        label: "Completed",
        color: colors.status.success,
        bgColor: colors.status.successLight,
        icon: <Clock size={16} />,
      },
      cancelled: {
        label: "Cancelled",
        color: colors.status.error,
        bgColor: colors.status.errorLight,
        icon: <Clock size={16} />,
      },
    };
    return statusMap[status];
  };

  const getItemTypeLabel = (itemType: number) => {
    return itemType === 1 ? "Camera" : "Accessory";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
            }}
          >
            Verification Management
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Manage and track verification requests
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Total Requests",
              value: verifications.length,
              icon: <FileText size={32} />,
              color: colors.primary.main,
              bgColor: "#E3F2FD",
            },
            {
              label: "Pending",
              value: verifications.filter((v) => v.status === "pending").length,
              icon: <Clock size={32} />,
              color: "#FF9800",
              bgColor: "#FFF3E0",
            },
            {
              label: "Approved",
              value: verifications.filter((v) => v.status === "approved")
                .length,
              icon: <Clock size={32} />,
              color: "#4CAF50",
              bgColor: "#E8F5E9",
            },
            {
              label: "Rejected",
              value: verifications.filter((v) => v.status === "rejected")
                .length,
              icon: <Clock size={32} />,
              color: "#F44336",
              bgColor: "#FFEBEE",
            },
          ].map((stat, index) => (
            <Box
              key={index}
              sx={{
                flex: {
                  xs: "1 1 calc(50% - 12px)",
                  sm: "1 1 calc(25% - 18px)",
                },
                minWidth: 0,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border.light}`,
                  bgcolor: colors.background.paper,
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: colors.text.primary,
                      mb: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Search & Filter */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, phone number, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: colors.primary.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </Paper>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${colors.border.light}`,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTabs-indicator": {
                bgcolor: colors.primary.main,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: colors.text.secondary,
                "&.Mui-selected": {
                  color: colors.primary.main,
                },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Verifications List */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 3 }}
              />
            ))}
          </Box>
        ) : filteredVerifications.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 3,
              border: `1px solid ${colors.border.light}`,
              textAlign: "center",
            }}
          >
            <FileText size={64} color={colors.neutral[300]} />
            <Typography
              variant="h6"
              sx={{ color: colors.text.secondary, mt: 2, mb: 1 }}
            >
              No verifications found
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              {searchQuery
                ? "Try adjusting your search"
                : "No verification requests at the moment"}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredVerifications.map((verification) => {
              const statusInfo = getStatusInfo(verification.status);
              return (
                <Paper
                  key={verification.id}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${colors.border.light}`,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: colors.neutral[50],
                      borderBottom: `1px solid ${colors.border.light}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: colors.primary.main,
                          width: 40,
                          height: 40,
                          fontSize: "1.25rem",
                          fontWeight: 700,
                        }}
                      >
                        {verification.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 700, color: colors.text.primary }}
                        >
                          {verification.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.text.secondary }}
                        >
                          ID: {verification.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          bgcolor: statusInfo.bgColor,
                          color: statusInfo.color,
                          fontWeight: 600,
                          "& .MuiChip-icon": {
                            color: "inherit",
                          },
                        }}
                      />
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, verification)}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, 1fr)",
                          lg: "repeat(4, 1fr)",
                        },
                        gap: 3,
                      }}
                    >
                      {/* Phone */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Phone
                          size={20}
                          color={colors.text.secondary}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Phone Number
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {verification.phoneNumber}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Inspection Date */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Calendar
                          size={20}
                          color={colors.primary.main}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Inspection Date
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {formatDateTime(verification.inspectionDate)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Branch */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <MapPin
                          size={20}
                          color={colors.accent.blue}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Branch
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {verification.branchName}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Staff */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <User
                          size={20}
                          color={colors.accent.purple}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                            }}
                          >
                            Assigned Staff
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colors.text.primary }}
                          >
                            {verification.staffName || "Not assigned"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Items List */}
                    {verification.items && verification.items.length > 0 && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: colors.background.paper,
                          borderRadius: 2,
                          border: `1px solid ${colors.border.light}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.secondary,
                            display: "block",
                            mb: 1.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Requested Items ({verification.items.length})
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {verification.items.map((item) => (
                            <Box
                              key={item.itemId}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                bgcolor: colors.neutral[50],
                                borderRadius: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1,
                                  bgcolor:
                                    item.itemType === 1
                                      ? colors.primary.lighter
                                      : colors.accent.blueLight,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {item.itemType === 1 ? (
                                  <Camera
                                    size={18}
                                    color={colors.primary.main}
                                  />
                                ) : (
                                  <Package
                                    size={18}
                                    color={colors.accent.blue}
                                  />
                                )}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                  }}
                                >
                                  {item.itemName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: colors.text.secondary }}
                                >
                                  {getItemTypeLabel(item.itemType)}
                                </Typography>
                              </Box>
                              <Chip
                                label={getItemTypeLabel(item.itemType)}
                                size="small"
                                sx={{
                                  bgcolor:
                                    item.itemType === 1
                                      ? colors.primary.lighter
                                      : colors.accent.blueLight,
                                  color:
                                    item.itemType === 1
                                      ? colors.primary.main
                                      : colors.accent.blue,
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Address */}
                    {verification.address && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: colors.neutral[50],
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.secondary,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Address
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.text.primary }}
                        >
                          {verification.address}
                        </Typography>
                      </Box>
                    )}

                    {/* Notes */}
                    {verification.notes && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: colors.status.infoLight,
                          borderRadius: 2,
                          display: "flex",
                          gap: 1.5,
                        }}
                      >
                        <AlertCircle
                          size={20}
                          color={colors.status.info}
                          style={{ flexShrink: 0 }}
                        />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Notes
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.text.primary }}
                          >
                            {verification.notes}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetails}>
            <Eye size={16} style={{ marginRight: 8 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleOpenAssignDialog}>
            <UserPlus size={16} style={{ marginRight: 8 }} />
            Assign Staff
          </MenuItem>
        </Menu>

        {/* Assign Staff Dialog */}
        <Dialog
          open={openAssignDialog}
          onClose={() => setOpenAssignDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Assign Staff
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Staff</InputLabel>
                <Select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  label="Select Staff"
                >
                  {staffList.map((staff) => (
                    <MenuItem key={staff.userId} value={staff.userId}>
                      {staff.fullName} - {staff.role || "Staff"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenAssignDialog(false)}
              disabled={assignLoading}
              sx={{
                borderColor: colors.border.light,
                color: colors.text.primary,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAssignStaff}
              disabled={!selectedStaffId || assignLoading}
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
              {assignLoading ? "Assigning..." : "Assign"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Verification Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedVerification && (
              <Box sx={{ py: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Customer Name
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {selectedVerification.name}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Phone Number
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {selectedVerification.phoneNumber}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Inspection Date
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {formatDateTime(selectedVerification.inspectionDate)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Branch
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {selectedVerification.branchName}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      Address
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: colors.text.primary }}
                    >
                      {selectedVerification.address}
                    </Typography>
                  </Box>

                  {/* Items in Dialog */}
                  {selectedVerification.items &&
                    selectedVerification.items.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text.secondary,
                              display: "block",
                              mb: 1.5,
                            }}
                          >
                            Requested Items ({selectedVerification.items.length}
                            )
                          </Typography>
                          <List dense sx={{ p: 0 }}>
                            {selectedVerification.items.map((item) => (
                              <ListItem
                                key={item.itemId}
                                sx={{
                                  bgcolor: colors.neutral[50],
                                  borderRadius: 1,
                                  mb: 1,
                                  "&:last-child": { mb: 0 },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  {item.itemType === 1 ? (
                                    <Camera
                                      size={20}
                                      color={colors.primary.main}
                                    />
                                  ) : (
                                    <Package
                                      size={20}
                                      color={colors.accent.blue}
                                    />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.itemName}
                                  secondary={getItemTypeLabel(item.itemType)}
                                  primaryTypographyProps={{
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                  }}
                                  secondaryTypographyProps={{
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </>
                    )}

                  {selectedVerification.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.text.secondary }}
                        >
                          Notes
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ color: colors.text.primary }}
                        >
                          {selectedVerification.notes}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDetailDialog(false)}
              sx={{
                borderColor: colors.border.light,
                color: colors.text.primary,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default VerifyManagement;
