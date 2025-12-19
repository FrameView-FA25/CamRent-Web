import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  workSlotService,
  type WorkSlot,
  type CreateWorkSlotRequest,
  type UpdateWorkSlotRequest,
} from "@/services/workSlot.service";

const WorkSlotManagement: React.FC = () => {
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<WorkSlot | null>(null);
  const [formData, setFormData] = useState<CreateWorkSlotRequest>({
    slotIndex: 0,
    startTime: "08:00",
    endTime: "09:00",
    isActive: true,
  });

  useEffect(() => {
    loadWorkSlots();
  }, []);

  const loadWorkSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const slots = await workSlotService.getWorkSlots();
      // Sắp xếp theo slotIndex
      slots.sort((a, b) => a.slotIndex - b.slotIndex);
      setWorkSlots(slots);
    } catch (err) {
      console.error("Error loading work slots:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách khung giờ làm việc";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      slotIndex:
        workSlots.length > 0
          ? Math.max(...workSlots.map((s) => s.slotIndex)) + 1
          : 0,
      startTime: "08:00",
      endTime: "09:00",
      isActive: true,
    });
    setSelectedSlot(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (slot: WorkSlot) => {
    setSelectedSlot(slot);
    setFormData({
      slotIndex: slot.slotIndex,
      startTime: slot.startTime.substring(0, 5), // Chỉ lấy HH:mm
      endTime: slot.endTime.substring(0, 5),
      isActive: slot.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (slot: WorkSlot) => {
    setSelectedSlot(slot);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      // Validate time format
      if (!formData.startTime || !formData.endTime) {
        toast.error("Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc");
        return;
      }

      // Convert time to HH:mm:ss format if needed
      const startTime =
        formData.startTime.length === 5
          ? `${formData.startTime}:00`
          : formData.startTime;
      const endTime =
        formData.endTime.length === 5
          ? `${formData.endTime}:00`
          : formData.endTime;

      await workSlotService.createWorkSlot({
        ...formData,
        startTime,
        endTime,
      });
      toast.success("Tạo khung giờ làm việc thành công");
      setCreateDialogOpen(false);
      loadWorkSlots();
    } catch (err) {
      console.error("Error creating work slot:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo khung giờ làm việc";
      toast.error(errorMessage);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedSlot) return;

    try {
      const updateData: UpdateWorkSlotRequest = {};

      if (formData.startTime) {
        updateData.startTime =
          formData.startTime.length === 5
            ? `${formData.startTime}:00`
            : formData.startTime;
      }
      if (formData.endTime) {
        updateData.endTime =
          formData.endTime.length === 5
            ? `${formData.endTime}:00`
            : formData.endTime;
      }
      updateData.isActive = formData.isActive;

      await workSlotService.updateWorkSlot(selectedSlot.id, updateData);
      toast.success("Cập nhật khung giờ làm việc thành công");
      setEditDialogOpen(false);
      setSelectedSlot(null);
      loadWorkSlots();
    } catch (err) {
      console.error("Error updating work slot:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật khung giờ làm việc";
      toast.error(errorMessage);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSlot) return;

    try {
      await workSlotService.deleteWorkSlot(selectedSlot.id);
      toast.success("Xóa khung giờ làm việc thành công");
      setDeleteDialogOpen(false);
      setSelectedSlot(null);
      loadWorkSlots();
    } catch (err) {
      console.error("Error deleting work slot:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể xóa khung giờ làm việc";
      toast.error(errorMessage);
    }
  };

  // Render timetable view
  const renderTimetable = () => {
    const sortedSlots = [...workSlots].sort(
      (a, b) => a.slotIndex - b.slotIndex
    );

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mt: 2,
        }}
      >
        {sortedSlots.map((slot) => (
          <Paper
            key={slot.id}
            elevation={slot.isActive ? 2 : 0}
            sx={{
              p: 2,
              border: `2px solid ${slot.isActive ? "#10B981" : "#E5E7EB"}`,
              borderRadius: 2,
              bgcolor: slot.isActive ? "#F0FDF4" : "#F9FAFB",
              opacity: slot.isActive ? 1 : 0.6,
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Ca {slot.slotIndex}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: slot.isActive ? "#059669" : "#6B7280",
                  }}
                >
                  {slot.startTime.substring(0, 5)} -{" "}
                  {slot.endTime.substring(0, 5)}
                </Typography>
              </Box>
              <Chip
                icon={slot.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                label={slot.isActive ? "Hoạt động" : "Tạm dừng"}
                size="small"
                color={slot.isActive ? "success" : "default"}
                sx={{ height: 24 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(slot)}
                  sx={{ color: "#3B82F6" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(slot)}
                  sx={{ color: "#EF4444" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              bgcolor: "#FF5722",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ScheduleIcon sx={{ color: "white", fontSize: 30 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1F2937",
              }}
            >
              Quản lý khung giờ làm việc
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Cấu hình các ca làm việc trong hệ thống
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              bgcolor: "#FF5722",
              "&:hover": { bgcolor: "#F4511E" },
              textTransform: "none",
              borderRadius: 2,
              px: 3,
            }}
          >
            Tạo ca mới
          </Button>
          <IconButton
            onClick={loadWorkSlots}
            disabled={loading}
            sx={{
              bgcolor: "white",
              border: "1px solid #E5E7EB",
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          bgcolor: "white",
          p: 3,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <CircularProgress sx={{ color: "#FF5722" }} />
          </Box>
        ) : workSlots.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <ScheduleIcon sx={{ fontSize: 60, color: "#E5E7EB", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
              Chưa có khung giờ làm việc nào
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              Tạo ca làm việc đầu tiên để bắt đầu
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Danh sách ca làm việc ({workSlots.length})
            </Typography>
            {renderTimetable()}
          </>
        )}
      </Paper>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo ca làm việc mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Chỉ số ca"
              type="number"
              value={formData.slotIndex}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slotIndex: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
            />
            <TextField
              label="Giờ bắt đầu"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Giờ kết thúc"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Kích hoạt ca làm việc"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            sx={{ bgcolor: "#FF5722", "&:hover": { bgcolor: "#F4511E" } }}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedSlot(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa ca làm việc</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Chỉ số ca"
              type="number"
              value={formData.slotIndex}
              disabled
              fullWidth
            />
            <TextField
              label="Giờ bắt đầu"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Giờ kết thúc"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Kích hoạt ca làm việc"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedSlot(null);
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            sx={{ bgcolor: "#FF5722", "&:hover": { bgcolor: "#F4511E" } }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedSlot(null);
        }}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa ca {selectedSlot?.slotIndex} (
            {selectedSlot?.startTime.substring(0, 5)} -{" "}
            {selectedSlot?.endTime.substring(0, 5)})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedSlot(null);
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkSlotManagement;
