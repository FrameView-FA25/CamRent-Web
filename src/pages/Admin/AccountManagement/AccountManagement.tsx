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
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface Account {
  id: number;
  username: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Blocked";
  createdAt: string;
}

const mockAccounts: Account[] = [
  {
    id: 1,
    username: "manager1",
    email: "manager1@camrent.com",
    role: "Manager",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    username: "manager2",
    email: "manager2@camrent.com",
    role: "Manager",
    status: "Active",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    username: "staff1",
    email: "staff1@camrent.com",
    role: "Staff",
    status: "Inactive",
    createdAt: "2024-03-10",
  },
];

const AccountManagement: React.FC = () => {
  const [accounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    account: Account
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAccount(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "warning";
      case "Blocked":
        return "error";
      default:
        return "default";
    }
  };

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
          Account Management
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
          Create Account
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
            placeholder="Search by username or email..."
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
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>{account.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {account.username}
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={account.role}
                      size="small"
                      sx={{ bgcolor: "#EFF6FF", color: "#3B82F6" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.status}
                      size="small"
                      color={getStatusColor(account.status)}
                    />
                  </TableCell>
                  <TableCell>{account.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, account)}
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
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {selectedAccount?.status === "Active" ? (
            <>
              <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
              Block
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              Activate
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "#EF4444" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Account Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Username"
              placeholder="Enter username"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="Enter email address"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              placeholder="Enter password"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" defaultValue="Manager">
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </FormControl>
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
            Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountManagement;
