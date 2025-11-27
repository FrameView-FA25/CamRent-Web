import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
} from "@mui/material";
import { X, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { colors } from "../../theme/colors";
import type {
  ContractTemplate,
  ContractClause,
} from "../../types/contract.types";

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: ContractTemplate | null;
  onSave: (
    template: Omit<
      ContractTemplate,
      "id" | "createdAt" | "updatedAt" | "usageCount"
    >
  ) => void;
}

const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  open,
  onClose,
  template,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    templateName: "",
    templateCode: "",
    templateType: "Rental" as "Rental" | "Consignment",
    description: "",
    title: "",
    introduction: "",
    conclusion: "",
    status: "Draft" as "Active" | "Inactive" | "Draft",
    isDefault: false,
    createdBy: "Admin",
  });

  const [clauses, setClauses] = useState<ContractClause[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        templateName: template.templateName,
        templateCode: template.templateCode,
        templateType: template.templateType,
        description: template.description,
        title: template.title,
        introduction: template.introduction,
        conclusion: template.conclusion,
        status: template.status,
        isDefault: template.isDefault,
        createdBy: template.createdBy,
      });
      setClauses(template.clauses);
    } else {
      // Reset form
      setFormData({
        templateName: "",
        templateCode: "",
        templateType: "Rental",
        description: "",
        title: "",
        introduction: "",
        conclusion: "",
        status: "Draft",
        isDefault: false,
        createdBy: "Admin",
      });
      setClauses([]);
    }
  }, [template, open]);

  const handleAddClause = () => {
    const newClause: ContractClause = {
      id: `clause-${Date.now()}`,
      title: "",
      content: "",
      order: clauses.length + 1,
    };
    setClauses([...clauses, newClause]);
  };

  const handleUpdateClause = (
    id: string,
    field: keyof ContractClause,
    value: string | number
  ) => {
    setClauses(
      clauses.map((clause) =>
        clause.id === id ? { ...clause, [field]: value } : clause
      )
    );
  };

  const handleDeleteClause = (id: string) => {
    setClauses(clauses.filter((clause) => clause.id !== id));
  };

  const handleSubmit = () => {
    const templateData = {
      ...formData,
      clauses: clauses.map((clause, index) => ({
        ...clause,
        order: index + 1,
      })),
    };
    onSave(templateData);
    onClose();
  };

  const isValid = () => {
    return (
      formData.templateName &&
      formData.templateCode &&
      formData.description &&
      formData.title &&
      clauses.length > 0 &&
      clauses.every((c) => c.title && c.content)
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {template ? "Chỉnh sửa mẫu hợp đồng" : "Tạo mẫu hợp đồng mới"}
          </Typography>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Basic Info */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Thông tin cơ bản
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Tên mẫu hợp đồng"
                value={formData.templateName}
                onChange={(e) =>
                  setFormData({ ...formData, templateName: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Mã mẫu"
                value={formData.templateCode}
                onChange={(e) =>
                  setFormData({ ...formData, templateCode: e.target.value })
                }
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Loại hợp đồng</InputLabel>
                <Select
                  value={formData.templateType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      templateType: e.target.value as "Rental" | "Consignment",
                    })
                  }
                  label="Loại hợp đồng"
                >
                  <MenuItem value="Rental">Hợp đồng thuê</MenuItem>
                  <MenuItem value="Consignment">Hợp đồng ký gửi</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={2}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Active" | "Inactive" | "Draft",
                    })
                  }
                  label="Trạng thái"
                >
                  <MenuItem value="Draft">Nháp</MenuItem>
                  <MenuItem value="Active">Đang dùng</MenuItem>
                  <MenuItem value="Inactive">Không dùng</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                  />
                }
                label="Đặt làm mẫu mặc định"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Contract Content */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: colors.text.primary }}
            >
              Nội dung hợp đồng
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Tiêu đề hợp đồng"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Phần mở đầu"
                value={formData.introduction}
                onChange={(e) =>
                  setFormData({ ...formData, introduction: e.target.value })
                }
                multiline
                rows={3}
                placeholder="Hôm nay, ngày ... tháng ... năm ..., tại TP. Hồ Chí Minh, chúng tôi gồm:"
              />
              <TextField
                fullWidth
                label="Phần kết luận"
                value={formData.conclusion}
                onChange={(e) =>
                  setFormData({ ...formData, conclusion: e.target.value })
                }
                multiline
                rows={2}
                placeholder="Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau..."
              />
            </Stack>
          </Box>

          <Divider />

          {/* Clauses */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.text.primary }}
              >
                Điều khoản ({clauses.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={handleAddClause}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Thêm điều khoản
              </Button>
            </Box>

            <Stack spacing={2}>
              {clauses.map((clause, index) => (
                <Paper
                  key={clause.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <IconButton size="small" sx={{ cursor: "grab", mt: 1 }}>
                      <GripVertical size={16} />
                    </IconButton>
                    <TextField
                      fullWidth
                      label={`Điều ${index + 1} - Tiêu đề`}
                      value={clause.title}
                      onChange={(e) =>
                        handleUpdateClause(clause.id, "title", e.target.value)
                      }
                      size="small"
                      required
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClause(clause.id)}
                      sx={{
                        color: colors.status.error,
                        mt: 1,
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Nội dung"
                    value={clause.content}
                    onChange={(e) =>
                      handleUpdateClause(clause.id, "content", e.target.value)
                    }
                    multiline
                    rows={3}
                    size="small"
                    required
                    sx={{ ml: 5 }}
                  />
                </Paper>
              ))}

              {clauses.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    bgcolor: colors.neutral[50],
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary, mb: 2 }}
                  >
                    Chưa có điều khoản nào
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Plus size={18} />}
                    onClick={handleAddClause}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Thêm điều khoản đầu tiên
                  </Button>
                </Paper>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          startIcon={<Save size={18} />}
          onClick={handleSubmit}
          disabled={!isValid()}
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
          {template ? "Cập nhật" : "Tạo mẫu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTemplateDialog;
