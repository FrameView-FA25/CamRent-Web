import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import type { InspectionListItem } from "./InspectionListDialog";

export type EditInspectionFormState = {
  section: string;
  label: string;
  value: string;
  notes: string;
  passed: boolean | null;
};

export interface EditInspectionDialogProps {
  open: boolean;
  inspection?: InspectionListItem | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: EditInspectionFormState) => Promise<void> | void;
}

const defaultState: EditInspectionFormState = {
  section: "",
  label: "",
  value: "",
  notes: "",
  passed: null,
};

const EditInspectionDialog: React.FC<EditInspectionDialogProps> = ({
  open,
  inspection,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = React.useState<EditInspectionFormState>(defaultState);

  React.useEffect(() => {
    if (inspection) {
      setForm({
        section: inspection.section || "",
        label: inspection.label || "",
        value: inspection.value || "",
        notes: inspection.notes || "",
        passed: inspection.passed ?? null,
      });
    } else {
      setForm(defaultState);
    }
  }, [inspection]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePassedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      passed: value === "" ? null : value === "true",
    }));
  };

  const handleSubmit = async () => {
    if (!form.section || !form.label) return;
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        Chỉnh sửa mục kiểm tra
        {inspection?.itemName && (
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
            {inspection.itemName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <TextField
            label="Phần"
            name="section"
            value={form.section}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Nhãn"
            name="label"
            value={form.label}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Giá trị"
            name="value"
            value={form.value}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Ghi chú"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            select
            label="Trạng thái"
            value={
              form.passed === null ? "" : form.passed ? "true" : "false"
            }
            onChange={handlePassedChange}
            fullWidth
          >
            <MenuItem value="">Chưa đánh giá</MenuItem>
            <MenuItem value="true">Đạt</MenuItem>
            <MenuItem value="false">Không đạt</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.section || !form.label || saving}
          sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#F97316" }}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInspectionDialog;

