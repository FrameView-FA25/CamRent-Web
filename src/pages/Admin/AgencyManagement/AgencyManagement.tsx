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
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

interface Agency {
  id: number;
  name: string;
  location: string;
  manager: string;
  devices: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

const mockAgencies: Agency[] = [
  {
    id: 1,
    name: "Ha Noi",
    location: "123 Main St, District 1",
    manager: "John Doe",
    devices: 150,
    status: "Active",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "Ho Chi Minh",
    location: "456 North Ave, District 3",
    manager: "Jane Smith",
    devices: 98,
    status: "Active",
    createdAt: "2024-02-15",
  },
  {
    id: 3,
    name: "Da Nang",
    location: "789 South Rd, District 7",
    manager: "Bob Johnson",
    devices: 75,
    status: "Inactive",
    createdAt: "2024-03-20",
  },
];

const AgencyManagement: React.FC = () => {
  const [agencies] = useState<Agency[]>(mockAgencies);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [_selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    agency: Agency
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgency(agency);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAgency(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1F2937",
          }}
        >
          Agency Management
        </Typography>
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
          Create Agency
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
            placeholder="Search by name, location, or manager..."
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
                <TableCell sx={{ fontWeight: 600 }}>Agency Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Devices</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAgencies.map((agency) => (
                <TableRow key={agency.id} hover>
                  <TableCell>{agency.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon sx={{ fontSize: 18, color: "#DC2626" }} />
                      {agency.name}
                    </Box>
                  </TableCell>
                  <TableCell>{agency.location}</TableCell>
                  <TableCell>{agency.manager}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${agency.devices} devices`}
                      size="small"
                      sx={{ bgcolor: "#FEF3C7", color: "#F59E0B" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={agency.status}
                      size="small"
                      color={agency.status === "Active" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>{agency.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, agency)}
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
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Agency Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Agency</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Agency Name"
              placeholder="Enter agency name"
            />
            <TextField
              fullWidth
              label="Location"
              placeholder="Enter location address"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Manager Email"
              type="email"
              placeholder="Enter manager email"
            />
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="Enter phone number"
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
            Create Agency
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgencyManagement;
