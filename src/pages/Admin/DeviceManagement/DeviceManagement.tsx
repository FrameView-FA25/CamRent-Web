import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";

interface Device {
  id: number;
  name: string;
  type: string;
  brand: string;
  agency: string;
  owner: string;
  status: "Active" | "Pending" | "Rejected" | "Inactive";
  createdAt: string;
}

const mockDevices: Device[] = [
  {
    id: 1,
    name: "Canon EOS R5",
    type: "Camera",
    brand: "Canon",
    agency: "Downtown Branch",
    owner: "owner1@camrent.com",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Sony A7 IV",
    type: "Camera",
    brand: "Sony",
    agency: "North Branch",
    owner: "owner2@camrent.com",
    status: "Pending",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "DJI Mavic 3",
    type: "Drone",
    brand: "DJI",
    agency: "South Branch",
    owner: "owner3@camrent.com",
    status: "Active",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "GoPro Hero 12",
    type: "Action Camera",
    brand: "GoPro",
    agency: "Downtown Branch",
    owner: "owner1@camrent.com",
    status: "Rejected",
    createdAt: "2024-03-25",
  },
  {
    id: 5,
    name: "Nikon Z9",
    type: "Camera",
    brand: "Nikon",
    agency: "North Branch",
    owner: "owner2@camrent.com",
    status: "Pending",
    createdAt: "2024-04-05",
  },
];

const DeviceManagement: React.FC = () => {
  const [devices] = useState<Device[]>(mockDevices);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    device: Device
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedDevice(device);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDevice(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.agency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "error";
      case "Inactive":
        return "default";
      default:
        return "default";
    }
  };

  const pendingCount = devices.filter((d) => d.status === "Pending").length;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 0.5,
            }}
          >
            Device Management
          </Typography>
          {pendingCount > 0 && (
            <Typography
              variant="body2"
              sx={{ color: "#F59E0B", fontWeight: 500 }}
            >
              {pendingCount} device{pendingCount > 1 ? "s" : ""} pending
              approval
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: "#DC2626",
            "&:hover": { bgcolor: "#B91C1C" },
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
        >
          Add Device
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <TextField
            fullWidth
            placeholder="Search by name, type, brand, or agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#F9FAFB" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Device Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Agency</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow
                  key={device.id}
                  hover
                  sx={{
                    bgcolor:
                      device.status === "Pending" ? "#FFFBEB" : "transparent",
                  }}
                >
                  <TableCell>{device.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CameraIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                      {device.name}
                    </Box>
                  </TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>{device.brand}</TableCell>
                  <TableCell>{device.agency}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      {device.owner}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={device.status}
                      size="small"
                      color={getStatusColor(device.status)}
                    />
                  </TableCell>
                  <TableCell>{device.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, device)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedDevice?.status === "Pending" && (
          <>
            <MenuItem onClick={handleMenuClose} sx={{ color: "#10B981" }}>
              <ApproveIcon sx={{ mr: 1, fontSize: 20 }} />
              Approve Device
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
              <RejectIcon sx={{ mr: 1, fontSize: 20 }} />
              Reject Device
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Device Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Device</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Device Name"
              placeholder="Enter device name"
            />
            <FormControl fullWidth>
              <InputLabel>Device Type</InputLabel>
              <Select label="Device Type" defaultValue="">
                <MenuItem value="Camera">Camera</MenuItem>
                <MenuItem value="Drone">Drone</MenuItem>
                <MenuItem value="Action Camera">Action Camera</MenuItem>
                <MenuItem value="Lens">Lens</MenuItem>
                <MenuItem value="Accessories">Accessories</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Brand" placeholder="Enter brand name" />
            <FormControl fullWidth>
              <InputLabel>Agency</InputLabel>
              <Select label="Agency" defaultValue="">
                <MenuItem value="Downtown Branch">Downtown Branch</MenuItem>
                <MenuItem value="North Branch">North Branch</MenuItem>
                <MenuItem value="South Branch">South Branch</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              placeholder="Enter device description"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              color: "#6B7280",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              bgcolor: "#DC2626",
              "&:hover": { bgcolor: "#B91C1C" },
              textTransform: "none",
            }}
          >
            Add Device
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeviceManagement;
