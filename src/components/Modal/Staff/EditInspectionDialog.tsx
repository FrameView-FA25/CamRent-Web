import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import type { InspectionListItem } from "./InspectionListDialog";

export type EditInspectionFormState = {
  section: string;
  label: string;
  value: string;
  notes: string;
  passed: boolean | null;
  files: File[];
  removeMediaIds: string[];
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
  files: [],
  removeMediaIds: [],
};

const EditInspectionDialog: React.FC<EditInspectionDialogProps> = ({
  open,
  inspection,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = React.useState<EditInspectionFormState>(defaultState);
  const [filePreviews, setFilePreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (inspection) {
      setForm({
        section: inspection.section || "",
        label: inspection.label || "",
        value: inspection.value || "",
        notes: inspection.notes || "",
        passed: inspection.passed ?? null,
        files: [],
        removeMediaIds: [],
      });
      setFilePreviews([]);
    } else {
      setForm(defaultState);
      setFilePreviews([]);
    }
  }, [inspection]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    setForm((prev) => ({
      ...prev,
      files: files ? Array.from(files) : [],
    }));
  };

  React.useEffect(() => {
    if (form.files.length === 0) {
      setFilePreviews([]);
      return;
    }
    const urls = form.files.map((file) => URL.createObjectURL(file));
    setFilePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.files]);

  const toggleRemoveMedia = (mediaId: string) => {
    setForm((prev) => {
      const exists = prev.removeMediaIds.includes(mediaId);
      return {
        ...prev,
        removeMediaIds: exists
          ? prev.removeMediaIds.filter((id) => id !== mediaId)
          : [...prev.removeMediaIds, mediaId],
      };
    });
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
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", fontWeight: 500 }}
          >
            {inspection.itemName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <TextField
            select
            label="Phần kiểm tra"
            name="section"
            value={form.section}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="Ngoại quan">Ngoại quan</MenuItem>
            <MenuItem value="Chức năng">Chức năng</MenuItem>
            <MenuItem value="Phụ kiện">Phụ kiện</MenuItem>
            <MenuItem value="Khác">Khác</MenuItem>
          </TextField>
          <TextField
            select
            label="Tên kiểm tra"
            name="label"
            value={form.label}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="Vết xước">Vết xước</MenuItem>
            <MenuItem value="Vết móp">Vết móp</MenuItem>
            <MenuItem value="Màu sắc">Màu sắc</MenuItem>
            <MenuItem value="Độ sạch">Độ sạch</MenuItem>
            <MenuItem value="Hoạt động bình thường">
              Hoạt động bình thường
            </MenuItem>
            <MenuItem value="Pin">Pin</MenuItem>
            <MenuItem value="Sạc">Sạc</MenuItem>
            <MenuItem value="Dây cáp">Dây cáp</MenuItem>
            <MenuItem value="Thẻ nhớ">Thẻ nhớ</MenuItem>
            <MenuItem value="Túi đựng">Túi đựng</MenuItem>
            <MenuItem value="Khác">Khác</MenuItem>
          </TextField>
          <TextField
            select
            label="Giá trị"
            name="value"
            value={form.value}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Tốt">Tốt</MenuItem>
            <MenuItem value="Trung bình">Trung bình</MenuItem>
            <MenuItem value="Khá">Khá</MenuItem>
            <MenuItem value="Kém">Kém</MenuItem>
            <MenuItem value="Hoạt động">Hoạt động</MenuItem>
            <MenuItem value="Không hoạt động">Không hoạt động</MenuItem>
          </TextField>
          <TextField
            label="Ghi chú"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />

          {inspection?.media && inspection.media.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#374151" }}
              >
                Ảnh hiện có
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={2}>
                {inspection.media.map((media) => (
                  <Box
                    key={media.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={media.url}
                      alt={media.label || "inspection-media"}
                      sx={{
                        width: 96,
                        height: 96,
                        borderRadius: 1.5,
                        objectFit: "cover",
                        border: "1px solid #E5E7EB",
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.removeMediaIds.includes(media.id)}
                          onChange={() => toggleRemoveMedia(media.id)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ color: "#4B5563" }}>
                          Xóa ảnh
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: "#374151" }}
            >
              Thêm ảnh mới
            </Typography>
            <Button
              component="label"
              variant="outlined"
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Chọn ảnh
              <input
                hidden
                multiple
                accept="image/*"
                type="file"
                onChange={handleFilesChange}
              />
            </Button>
            {form.files.length > 0 && (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, color: "#6B7280" }}
              >
                {form.files.length} ảnh đã chọn
              </Typography>
            )}
            {filePreviews.length > 0 && (
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                rowGap={2}
                sx={{ mt: 2 }}
              >
                {filePreviews.map((src, index) => (
                  <Box
                    key={`${src}-${index}`}
                    component="img"
                    src={src}
                    alt={`preview-${index}`}
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 1.5,
                      objectFit: "cover",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
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
