import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

const AdminSettings: React.FC = () => {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: "#1F2937",
        }}
      >
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              General Settings
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="System Name"
                defaultValue="CamRent Admin System"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Admin Email"
                defaultValue="admin@camrent.com"
                type="email"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Support Email"
                defaultValue="support@camrent.com"
                type="email"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              Notification Settings
            </Typography>

            <Box>
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Email notifications for new accounts"
                sx={{ mb: 2, display: "block" }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Email notifications for new agencies"
                sx={{ mb: 2, display: "block" }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Email notifications for device approvals"
                sx={{ mb: 2, display: "block" }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="System alerts"
                sx={{ display: "block" }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              Security Settings
            </Typography>

            <Box>
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Two-factor authentication"
                sx={{ mb: 2, display: "block" }}
              />
              <FormControlLabel
                control={<Switch defaultChecked color="error" />}
                label="Session timeout (30 minutes)"
                sx={{ mb: 2, display: "block" }}
              />
              <FormControlLabel
                control={<Switch color="error" />}
                label="IP whitelist"
                sx={{ display: "block" }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: "#DC2626",
                  "&:hover": { bgcolor: "#B91C1C" },
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              System Information
            </Typography>
            <Box sx={{ color: "#6B7280" }}>
              <Typography sx={{ mb: 2 }}>
                <strong>Version:</strong> 1.0.0
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <strong>Last Update:</strong> Oct 27, 2025
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <strong>Database:</strong> MongoDB
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <strong>Server Status:</strong>{" "}
                <span style={{ color: "#10B981" }}>Online</span>
              </Typography>
              <Typography>
                <strong>Uptime:</strong> 99.9%
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  justifyContent: "flex-start",
                  borderRadius: 1.5,
                }}
              >
                Backup Database
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  justifyContent: "flex-start",
                  borderRadius: 1.5,
                }}
              >
                View System Logs
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  justifyContent: "flex-start",
                  borderRadius: 1.5,
                }}
              >
                Clear Cache
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettings;
