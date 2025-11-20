import React from "react";
import {
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { Search } from "lucide-react";
import { colors } from "../../theme/colors";

interface VerificationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: number;
  onTabChange: (value: number) => void;
}

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const VerificationFilters: React.FC<VerificationFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  return (
    <Box>
      {/* Search Bar */}
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
          placeholder="Tìm kiếm bằng tên, đơn hàng, số điện thoại, ...."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
          onChange={(_, newValue) => onTabChange(newValue)}
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
    </Box>
  );
};

export default VerificationFilters;
