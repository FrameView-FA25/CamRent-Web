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

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: number;
  onTabChange: (value: number) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ duyệt", value: "PendingApproval" },
    { label: "Đã xác nhận", value: "Confirmed" },
    { label: "Đang thuê", value: "InProgress" },
    { label: "Hoàn thành", value: "Completed" },
    { label: "Đã hủy", value: "Cancelled" },
  ];

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
          placeholder="Tìm kiếm theo ID đơn hàng hoặc tên sản phẩm..."
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
          variant="scrollable"
          scrollButtons="auto"
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

export default OrderFilters;
