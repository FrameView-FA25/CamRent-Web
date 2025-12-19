import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Image as ImageIcon,
  Save,
  Cancel,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  getCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  getHomeBlocks,
  updateBlock,
  deleteBlock,
  getFeedbacks,
  type CarouselSlide,
  type HomeBlock,
  type Feedback,
} from "@/services/homepage.service";
import { colors } from "../../../theme/colors";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const WebsiteManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  // Carousel states
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [carouselDialogOpen, setCarouselDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);

  // Blocks states
  const [blocks, setBlocks] = useState<HomeBlock[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<HomeBlock | null>(null);

  // Feedback states
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchCarouselSlides();
    fetchBlocks();
    fetchFeedbacks();
  }, []);

  // ============== CAROUSEL FUNCTIONS ==============

  const fetchCarouselSlides = async () => {
    try {
      setLoadingCarousel(true);
      const data = await getCarouselSlides();
      setCarouselSlides(data);
    } catch (error) {
      console.error("Error fetching carousel:", error);
      toast.error("Không thể tải carousel");
    } finally {
      setLoadingCarousel(false);
    }
  };

  const handleOpenCarouselDialog = (slide?: CarouselSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        content: slide.content,
        linkUrl: slide.linkUrl,
        sortOrder: slide.sortOrder,
        isActive: slide.isActive,
      });
      setImagePreview(slide.imageUrl || "");
    } else {
      setEditingSlide(null);
      setFormData({
        title: "",
        content: "",
        linkUrl: "",
        sortOrder: carouselSlides.length + 1,
        isActive: true,
      });
      setImagePreview("");
    }
    setSelectedImage(null);
    setCarouselDialogOpen(true);
  };

  const handleCloseCarouselDialog = () => {
    setCarouselDialogOpen(false);
    setEditingSlide(null);
    setFormData({});
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCarousel = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("Content", formData.content);
      formDataToSend.append("LinkUrl", formData.linkUrl || "");
      formDataToSend.append("SortOrder", formData.sortOrder.toString());
      formDataToSend.append("IsActive", formData.isActive.toString());

      if (selectedImage) {
        formDataToSend.append("Image", selectedImage);
      }

      if (editingSlide) {
        await updateCarouselSlide(editingSlide.id, formDataToSend);
        toast.success("Cập nhật slide thành công");
      } else {
        await createCarouselSlide(formDataToSend);
        toast.success("Tạo slide mới thành công");
      }

      handleCloseCarouselDialog();
      fetchCarouselSlides();
    } catch (error) {
      console.error("Error saving carousel:", error);
      toast.error("Không thể lưu slide");
    }
  };

  const handleDeleteCarousel = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa slide này?")) {
      try {
        await deleteCarouselSlide(id);
        toast.success("Xóa slide thành công");
        fetchCarouselSlides();
      } catch (error) {
        console.error("Error deleting carousel:", error);
        toast.error("Không thể xóa slide");
      }
    }
  };

  // ============== BLOCKS FUNCTIONS ==============

  const fetchBlocks = async () => {
    try {
      setLoadingBlocks(true);
      const data = await getHomeBlocks();
      setBlocks(data);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      toast.error("Không thể tải blocks");
    } finally {
      setLoadingBlocks(false);
    }
  };

  const handleOpenBlockDialog = (block: HomeBlock) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      content: block.content,
      isActive: block.isActive,
      sortOrder: block.sortOrder,
    });
    setImagePreview(block.imageUrl || "");
    setSelectedImage(null);
    setBlockDialogOpen(true);
  };

  const handleCloseBlockDialog = () => {
    setBlockDialogOpen(false);
    setEditingBlock(null);
    setFormData({});
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleSaveBlock = async () => {
    if (!editingBlock) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("Content", formData.content);
      formDataToSend.append("IsActive", formData.isActive.toString());
      formDataToSend.append("SortOrder", formData.sortOrder.toString());

      if (selectedImage) {
        formDataToSend.append("Image", selectedImage);
      }

      await updateBlock(editingBlock.key, formDataToSend);
      toast.success("Cập nhật block thành công");
      handleCloseBlockDialog();
      fetchBlocks();
    } catch (error) {
      console.error("Error saving block:", error);
      toast.error("Không thể lưu block");
    }
  };

  const handleDeleteBlock = async (key: string) => {
    if (window.confirm("Bạn có chắc muốn xóa block này?")) {
      try {
        await deleteBlock(key);
        toast.success("Xóa block thành công");
        fetchBlocks();
      } catch (error) {
        console.error("Error deleting block:", error);
        toast.error("Không thể xóa block");
      }
    }
  };

  // ============== FEEDBACK FUNCTIONS ==============

  const fetchFeedbacks = async () => {
    try {
      setLoadingFeedback(true);
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Không thể tải feedback");
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Quản lý Website
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Quản lý nội dung trang chủ website
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Carousel" />
          <Tab label="Blocks" />
          <Tab label="Feedback" />
        </Tabs>

        {/* CAROUSEL TAB */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Quản lý Carousel</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenCarouselDialog()}
            >
              Thêm Slide
            </Button>
          </Box>

          {loadingCarousel ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Hình ảnh</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Nội dung</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell>Thứ tự</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {carouselSlides.map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        {slide.imageUrl ? (
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            style={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <ImageIcon />
                        )}
                      </TableCell>
                      <TableCell>{slide.title}</TableCell>
                      <TableCell>{slide.content.substring(0, 50)}...</TableCell>
                      <TableCell>{slide.linkUrl}</TableCell>
                      <TableCell>{slide.sortOrder}</TableCell>
                      <TableCell>
                        <Chip
                          label={slide.isActive ? "Active" : "Inactive"}
                          color={slide.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenCarouselDialog(slide)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCarousel(slide.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* BLOCKS TAB */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Quản lý Blocks</Typography>
          </Box>

          {loadingBlocks ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Nội dung</TableCell>
                    <TableCell>Hình ảnh</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow key={block.key}>
                      <TableCell>
                        <Chip label={block.key} size="small" />
                      </TableCell>
                      <TableCell>{block.title}</TableCell>
                      <TableCell>{block.content.substring(0, 50)}...</TableCell>
                      <TableCell>
                        {block.imageUrl ? (
                          <img
                            src={block.imageUrl}
                            alt={block.title}
                            style={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <ImageIcon />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={block.isActive ? "Active" : "Inactive"}
                          color={block.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenBlockDialog(block)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBlock(block.key)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* FEEDBACK TAB */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Feedback từ khách hàng</Typography>
          </Box>

          {loadingFeedback ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Người dùng</TableCell>
                    <TableCell>Đánh giá</TableCell>
                    <TableCell>Bình luận</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>{feedback.userName}</TableCell>
                      <TableCell>
                        {"⭐".repeat(feedback.rating)} ({feedback.rating}/5)
                      </TableCell>
                      <TableCell>
                        {feedback.comment.substring(0, 50)}...
                      </TableCell>
                      <TableCell>
                        {new Date(feedback.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={feedback.isActive ? "Active" : "Inactive"}
                          color={feedback.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* CAROUSEL DIALOG */}
      <Dialog
        open={carouselDialogOpen}
        onClose={handleCloseCarouselDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSlide ? "Chỉnh sửa Slide" : "Thêm Slide mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Nội dung"
              value={formData.content || ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Link URL"
              value={formData.linkUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
            />
            <TextField
              fullWidth
              type="number"
              label="Thứ tự"
              value={formData.sortOrder || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value),
                })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Kích hoạt"
            />

            <Box>
              <Button variant="outlined" component="label">
                Chọn hình ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCarouselDialog} startIcon={<Cancel />}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveCarousel}
            variant="contained"
            startIcon={<Save />}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* BLOCK DIALOG */}
      <Dialog
        open={blockDialogOpen}
        onClose={handleCloseBlockDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Block: {editingBlock?.key}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Nội dung"
              value={formData.content || ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <TextField
              fullWidth
              type="number"
              label="Thứ tự"
              value={formData.sortOrder || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value),
                })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Kích hoạt"
            />

            <Box>
              <Button variant="outlined" component="label">
                Chọn hình ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBlockDialog} startIcon={<Cancel />}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveBlock}
            variant="contained"
            startIcon={<Save />}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WebsiteManagement;
