import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { InspectionListItem } from "./InspectionListDialog";
import {
  getInspectionFormById,
  getInspectionMethods,
} from "@/services/inspection.service";

export type EditInspectionFormState = {
  section: string;
  label: string;
  value: string; // Giữ lại để tương thích, nhưng sẽ dùng methodIds chính
  methodIds: string[]; // List of method IDs (theo API backend)
  notes: string;
  passed: boolean | null;
  files: File[];
  removeMediaIds: string[];
};

export interface EditInspectionDialogProps {
  open: boolean;
  inspection?: InspectionListItem | null;
  formId?: string; // ID của form chứa inspection này
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: EditInspectionFormState) => Promise<void> | void;
}

const defaultState: EditInspectionFormState = {
  section: "",
  label: "",
  value: "",
  methodIds: [],
  notes: "",
  passed: null,
  files: [],
  removeMediaIds: [],
};

const EditInspectionDialog: React.FC<EditInspectionDialogProps> = ({
  open,
  inspection,
  formId,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = React.useState<EditInspectionFormState>(defaultState);
  const [filePreviews, setFilePreviews] = React.useState<string[]>([]);
  const [loadingTemplate, setLoadingTemplate] = React.useState(false);
  const [availableMethods, setAvailableMethods] = React.useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedMethodIds, setSelectedMethodIds] = React.useState<string[]>(
    []
  );

  // Load methods khi mở dialog - luôn load từ API để đảm bảo có methods
  React.useEffect(() => {
    console.log("🔍 EditInspectionDialog useEffect triggered:", {
      open,
      hasInspection: !!inspection,
      formId,
      inspectionId: inspection?.id,
    });

    if (open && inspection) {
      setLoadingTemplate(true);
      const loadMethods = async () => {
        try {
          console.log("🚀 Starting to load methods...");

          // Load form detail để lấy methods đã được sử dụng (nếu có formId)
          let formRow = null;
          if (formId) {
            try {
              const formDetail = await getInspectionFormById(formId);
              formRow = formDetail.rows.find(
                (r) => r.inspectionId === inspection.id
              );
              console.log("  - Form detail loaded, formRow:", formRow);
            } catch (formErr) {
              console.warn("  - Could not load form detail:", formErr);
            }
          } else {
            console.log("  - No formId provided, skipping form detail load");
          }

          console.log("🔍 Debug EditInspectionDialog:");
          console.log("  - Inspection label:", inspection.label);
          console.log("  - Inspection ID:", inspection.id);
          console.log("  - Form row:", formRow);

          // Luôn load tất cả methods từ API trước (bao gồm cả inactive để có đủ options)
          console.log("📡 Calling getInspectionMethods API...");
          const allMethods = await getInspectionMethods(true); // includeInactive = true
          console.log("✅ getInspectionMethods API response received");
          console.log("  - All methods from API:", allMethods);
          console.log("  - Methods count:", allMethods?.length || 0);
          console.log("  - Methods structure:", allMethods?.[0]);

          // Kiểm tra và xử lý dữ liệu methods
          if (!Array.isArray(allMethods) || allMethods.length === 0) {
            console.error("❌ API returned invalid data:", allMethods);
            // Thử load lại chỉ active methods
            try {
              const activeOnlyMethods = await getInspectionMethods(false);
              if (
                Array.isArray(activeOnlyMethods) &&
                activeOnlyMethods.length > 0
              ) {
                const mapped = activeOnlyMethods
                  .map((m) => ({
                    id: m.id || "",
                    name: m.name || "",
                  }))
                  .filter((m) => m.id && m.name);
                setAvailableMethods(mapped);
                // Set selected IDs nếu có
                if (formRow?.methods && formRow.methods.length > 0) {
                  const ids = formRow.methods.map((m) => m.id);
                  setSelectedMethodIds(ids);
                  setForm((prev) => ({ ...prev, methodIds: ids }));
                }
                return;
              }
            } catch (retryErr) {
              console.error("❌ Retry failed:", retryErr);
            }
            setAvailableMethods([]);
            return;
          }

          // Lọc và map methods - ưu tiên active nhưng vẫn hiển thị inactive nếu cần
          const mappedMethods = allMethods
            .map((m) => {
              const method = {
                id: m.id || "",
                name: m.name || "",
                isActive: m.isActive ?? true,
              };
              console.log(
                `  - Method: ${method.name}, ID: ${method.id}, Active: ${method.isActive}`
              );
              return method;
            })
            .filter((m) => m.id && m.name); // Loại bỏ items không có id hoặc name

          // Ưu tiên hiển thị active methods, nhưng vẫn hiển thị inactive nếu không có active nào
          const activeMethods = mappedMethods.filter((m) => m.isActive);
          const methodsToShow =
            activeMethods.length > 0 ? activeMethods : mappedMethods;

          console.log("  - Mapped methods:", mappedMethods);
          console.log("  - Active methods:", activeMethods);
          console.log("  - Methods to show:", methodsToShow);
          console.log("  - Methods to show count:", methodsToShow.length);

          const finalMethods = methodsToShow.map((m) => ({
            id: m.id,
            name: m.name,
          }));
          setAvailableMethods(finalMethods);

          // Lấy selected method IDs từ formRow hoặc từ form.value (parse names)
          let initialSelectedIds: string[] = [];
          if (formRow?.methods && formRow.methods.length > 0) {
            // Ưu tiên lấy từ formRow.methods (có IDs)
            initialSelectedIds = formRow.methods.map((m) => m.id);
            console.log(
              "  - Selected method IDs from formRow:",
              initialSelectedIds
            );
          } else if (inspection?.value) {
            // Nếu không có formRow, parse từ form.value (names)
            const methodNames = inspection.value
              .split(", ")
              .filter((n) => n.trim() !== "");
            // Dùng finalMethods để map names sang IDs
            initialSelectedIds = finalMethods
              .filter((m) => methodNames.includes(m.name))
              .map((m) => m.id);
            console.log(
              "  - Selected method IDs from inspection.value:",
              initialSelectedIds
            );
          }
          setSelectedMethodIds(initialSelectedIds);
          // Cập nhật form.methodIds
          setForm((prev) => ({ ...prev, methodIds: initialSelectedIds }));
        } catch (err) {
          console.error("❌ Error loading methods:", err);
          console.error("  - Error details:", err);
          setAvailableMethods([]);
        } finally {
          setLoadingTemplate(false);
        }
      };
      loadMethods();
    } else {
      console.log("⚠️ EditInspectionDialog useEffect skipped:", {
        open,
        hasInspection: !!inspection,
      });
      setAvailableMethods([]);
      setSelectedMethodIds([]);
    }
  }, [open, inspection, formId]);

  React.useEffect(() => {
    if (inspection) {
      // Đảm bảo tất cả giá trị đều là string, không phải null hoặc undefined
      const newForm = {
        section: inspection.section || "",
        label: inspection.label || "",
        value: inspection.value || "",
        methodIds: [], // Sẽ được set từ selectedMethodIds sau khi load methods
        notes: inspection.notes || "",
        passed: inspection.passed ?? null,
        files: [],
        removeMediaIds: [],
      };
      setForm(newForm);
      setFilePreviews([]);
    } else {
      setForm(defaultState);
      setFilePreviews([]);
      setSelectedMethodIds([]);
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

  const handleMethodChange = (selectedIds: string[]) => {
    setSelectedMethodIds(selectedIds);
    // Convert IDs sang names để lưu vào form.value (giữ tương thích)
    const selectedNames = availableMethods
      .filter((m) => selectedIds.includes(m.id))
      .map((m) => m.name)
      .join(", ");
    // Cập nhật cả methodIds (chính) và value (tương thích)
    setForm((prev) => ({
      ...prev,
      methodIds: selectedIds,
      value: selectedNames,
    }));
  };

  const handleSubmit = async () => {
    if (!form.label) return;
    // Phải có ít nhất một method được chọn nếu có methods available
    if (availableMethods.length > 0 && selectedMethodIds.length === 0) {
      return;
    }
    // Đảm bảo methodIds được sync với selectedMethodIds
    const finalForm = {
      ...form,
      methodIds: selectedMethodIds,
    };
    await onSubmit(finalForm);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      key={inspection?.id || "new"}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        Chỉnh sửa mục kiểm tra
        {inspection && (
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", fontWeight: 500 }}
          >
            {inspection.itemName ||
              inspection.itemId ||
              "Thiết bị không xác định"}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {loadingTemplate ? (
          <Box
            sx={{
              py: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress size={32} sx={{ color: "#F97316" }} />
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Đang tải danh mục kiểm tra...
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Section - Disabled, chỉ hiển thị */}
            <TextField
              label="Phần kiểm tra"
              value={form.section}
              fullWidth
              disabled
              helperText="Không thể thay đổi phần kiểm tra"
            />
            {/* Label - Disabled, chỉ hiển thị */}
            <TextField
              label="Tên kiểm tra"
              value={form.label}
              fullWidth
              disabled
              helperText="Không thể thay đổi tên kiểm tra"
            />
            {/* Methods - Multi-select từ checklist template */}
            <FormControl fullWidth>
              <InputLabel>Phương pháp được chọn</InputLabel>
              <Select
                label="Phương pháp được chọn"
                multiple
                value={selectedMethodIds}
                onChange={(e) => handleMethodChange(e.target.value as string[])}
                renderValue={(selected) =>
                  availableMethods
                    .filter((m) => selected.includes(m.id))
                    .map((m) => m.name)
                    .join(", ")
                }
              >
                {availableMethods.length === 0 ? (
                  <MenuItem disabled>
                    Không có phương pháp nào khả dụng
                  </MenuItem>
                ) : (
                  availableMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
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
                          <Typography
                            variant="caption"
                            sx={{ color: "#4B5563" }}
                          >
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
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !form.section ||
            !form.label ||
            (availableMethods.length > 0 && selectedMethodIds.length === 0) ||
            saving
          }
          sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#F97316" }}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInspectionDialog;
