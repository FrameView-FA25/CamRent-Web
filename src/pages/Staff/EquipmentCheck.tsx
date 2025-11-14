import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  CameraAlt,
  QrCodeScanner,
  PhotoCamera,
  Upload,
  NavigateBefore,
  NavigateNext,
  TaskAlt,
  Warning,
  Info,
} from "@mui/icons-material";

interface EquipmentItem {
  id: string;
  name: string;
  serialNumber: string;
  condition: "good" | "damaged" | "missing" | "";
  notes: string;
  photos: File[];
}

const steps = ["Quét mã QR", "Kiểm tra thiết bị", "Chụp ảnh", "Xác nhận"];

const EquipmentCheck: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [equipment, setEquipment] = useState<EquipmentItem[]>([
    {
      id: "1",
      name: "Canon EOS R5",
      serialNumber: "R5-2024-001",
      condition: "",
      notes: "",
      photos: [],
    },
    {
      id: "2",
      name: "Lens RF 24-70mm f/2.8",
      serialNumber: "RF-2024-045",
      condition: "",
      notes: "",
      photos: [],
    },
  ]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const handleNext = () => {
    if (activeStep === 1 && currentItemIndex < equipment.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      if (activeStep === 1) {
        setCurrentItemIndex(0);
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 1 && currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    } else if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleConditionChange = (condition: EquipmentItem["condition"]) => {
    const newEquipment = [...equipment];
    newEquipment[currentItemIndex].condition = condition;
    setEquipment(newEquipment);
  };

  const handleNotesChange = (notes: string) => {
    const newEquipment = [...equipment];
    newEquipment[currentItemIndex].notes = notes;
    setEquipment(newEquipment);
  };

  const handleSubmit = () => {
    console.log("Submitted:", { bookingId, equipment });
    alert("Kiểm tra thiết bị hoàn tất!");
  };

  const currentItem = equipment[currentItemIndex];
  const allItemsChecked = equipment.every((item) => item.condition !== "");

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle sx={{ color: "white", fontSize: 30 }} />
            </Box>
            Kiểm tra thiết bị
          </Typography>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            Kiểm tra tình trạng thiết bị trước khi giao/nhận
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active": {
                        color: "#F97316",
                      },
                      "&.Mui-completed": {
                        color: "#F97316",
                      },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#6B7280",
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          {/* Step 0: Scan QR */}
          {activeStep === 0 && (
            <Box>
              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    bgcolor: "#FFF7ED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 3,
                  }}
                >
                  <QrCodeScanner sx={{ color: "#F97316", fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
                >
                  Quét mã QR đơn thuê
                </Typography>
                <Typography variant="body1" sx={{ color: "#6B7280", mb: 4 }}>
                  Quét mã QR trên đơn thuê để bắt đầu kiểm tra thiết bị
                </Typography>
              </Box>

              <Box sx={{ maxWidth: 500, margin: "0 auto" }}>
                <TextField
                  fullWidth
                  label="Hoặc nhập mã đơn thuê"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Nhập mã đơn thuê..."
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#F97316",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#F97316",
                      },
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<QrCodeScanner />}
                  sx={{
                    bgcolor: "#F97316",
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "#EA580C",
                    },
                  }}
                  onClick={() => {
                    if (bookingId) {
                      handleNext();
                    } else {
                      alert("Vui lòng nhập mã đơn thuê");
                    }
                  }}
                >
                  Quét mã QR
                </Button>
              </Box>

              <Alert
                severity="info"
                icon={<Info sx={{ color: "#0284C7" }} />}
                sx={{
                  mt: 4,
                  borderRadius: 2,
                  bgcolor: "#E0F2FE",
                  color: "#1F2937",
                  "& .MuiAlert-icon": {
                    color: "#0284C7",
                  },
                }}
              >
                Mã QR có thể được tìm thấy trên email xác nhận đơn thuê hoặc
                trong hệ thống
              </Alert>
            </Box>
          )}

          {/* Step 1: Check Equipment */}
          {activeStep === 1 && (
            <Box>
              {/* Progress */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                  p: 3,
                  bgcolor: "#F9FAFB",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                  >
                    Đơn thuê: {bookingId}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Thiết bị {currentItemIndex + 1} / {equipment.length}
                  </Typography>
                </Box>
                <Chip
                  label={`${
                    equipment.filter((e) => e.condition !== "").length
                  }/${equipment.length} đã kiểm tra`}
                  sx={{
                    bgcolor: "#FFF7ED",
                    color: "#F97316",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                />
              </Box>

              {/* Current Item Card */}
              <Card
                elevation={0}
                sx={{
                  mb: 4,
                  border: "2px solid #F97316",
                  borderRadius: 3,
                  bgcolor: "#FFFBF5",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: "#F97316",
                      }}
                    >
                      <CameraAlt sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}
                      >
                        {currentItem.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6B7280" }}>
                        Serial: {currentItem.serialNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Condition Selection */}
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel
                      component="legend"
                      sx={{
                        fontWeight: 600,
                        color: "#1F2937",
                        mb: 2,
                        fontSize: "1rem",
                      }}
                    >
                      Tình trạng thiết bị
                    </FormLabel>
                    <RadioGroup
                      value={currentItem.condition}
                      onChange={(e) =>
                        handleConditionChange(
                          e.target.value as EquipmentItem["condition"]
                        )
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        {/* Good */}
                        <Paper
                          elevation={0}
                          sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            border: "2px solid",
                            borderColor:
                              currentItem.condition === "good"
                                ? "#059669"
                                : "#E5E7EB",
                            bgcolor:
                              currentItem.condition === "good"
                                ? "#D1FAE5"
                                : "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#059669",
                            },
                          }}
                          onClick={() => handleConditionChange("good")}
                        >
                          <FormControlLabel
                            value="good"
                            control={
                              <Radio
                                sx={{
                                  color: "#059669",
                                  "&.Mui-checked": {
                                    color: "#059669",
                                  },
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <CheckCircle sx={{ color: "#059669" }} />
                                <Typography
                                  sx={{ fontWeight: 600, color: "#1F2937" }}
                                >
                                  Tốt
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0 }}
                          />
                        </Paper>

                        {/* Damaged */}
                        <Paper
                          elevation={0}
                          sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            border: "2px solid",
                            borderColor:
                              currentItem.condition === "damaged"
                                ? "#F97316"
                                : "#E5E7EB",
                            bgcolor:
                              currentItem.condition === "damaged"
                                ? "#FFF7ED"
                                : "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#F97316",
                            },
                          }}
                          onClick={() => handleConditionChange("damaged")}
                        >
                          <FormControlLabel
                            value="damaged"
                            control={
                              <Radio
                                sx={{
                                  color: "#F97316",
                                  "&.Mui-checked": {
                                    color: "#F97316",
                                  },
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Warning sx={{ color: "#F97316" }} />
                                <Typography
                                  sx={{ fontWeight: 600, color: "#1F2937" }}
                                >
                                  Hư hỏng
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0 }}
                          />
                        </Paper>

                        {/* Missing */}
                        <Paper
                          elevation={0}
                          sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: 2,
                            border: "2px solid",
                            borderColor:
                              currentItem.condition === "missing"
                                ? "#DC2626"
                                : "#E5E7EB",
                            bgcolor:
                              currentItem.condition === "missing"
                                ? "#FEE2E2"
                                : "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#DC2626",
                            },
                          }}
                          onClick={() => handleConditionChange("missing")}
                        >
                          <FormControlLabel
                            value="missing"
                            control={
                              <Radio
                                sx={{
                                  color: "#DC2626",
                                  "&.Mui-checked": {
                                    color: "#DC2626",
                                  },
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Cancel sx={{ color: "#DC2626" }} />
                                <Typography
                                  sx={{ fontWeight: 600, color: "#1F2937" }}
                                >
                                  Thiếu
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0 }}
                          />
                        </Paper>
                      </Box>
                    </RadioGroup>
                  </FormControl>

                  {/* Notes */}
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Ghi chú (tuỳ chọn)"
                    value={currentItem.notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Mô tả chi tiết tình trạng thiết bị..."
                    sx={{
                      mt: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#F97316",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#F97316",
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 2: Take Photos */}
          {activeStep === 2 && (
            <Box>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    bgcolor: "#FFF7ED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 3,
                  }}
                >
                  <PhotoCamera sx={{ color: "#F97316", fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
                >
                  Chụp ảnh thiết bị
                </Typography>
                <Typography variant="body1" sx={{ color: "#6B7280", mb: 4 }}>
                  Chụp ảnh tất cả các thiết bị để làm bằng chứng
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                {equipment.map((item, index) => (
                  <Card
                    key={item.id}
                    elevation={0}
                    sx={{
                      flex: 1,
                      borderRadius: 3,
                      border: "1px solid #E5E7EB",
                      overflow: "hidden",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "#F97316",
                          }}
                        >
                          <CameraAlt />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: "#1F2937" }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B7280" }}
                          >
                            {item.serialNumber}
                          </Typography>
                        </Box>
                        <Chip
                          label={
                            item.condition === "good"
                              ? "Tốt"
                              : item.condition === "damaged"
                              ? "Hư hỏng"
                              : "Thiếu"
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              item.condition === "good"
                                ? "#D1FAE5"
                                : item.condition === "damaged"
                                ? "#FFF7ED"
                                : "#FEE2E2",
                            color:
                              item.condition === "good"
                                ? "#059669"
                                : item.condition === "damaged"
                                ? "#F97316"
                                : "#DC2626",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id={`upload-photo-${index}`}
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              const newEquipment = [...equipment];
                              newEquipment[index].photos = [
                                ...newEquipment[index].photos,
                                ...Array.from(e.target.files),
                              ];
                              setEquipment(newEquipment);
                            }
                          }}
                        />
                        <label htmlFor={`upload-photo-${index}`}>
                          <Button
                            fullWidth
                            variant="outlined"
                            component="span"
                            startIcon={<Upload />}
                            sx={{
                              borderColor: "#F97316",
                              color: "#F97316",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              py: 1.5,
                              "&:hover": {
                                bgcolor: "#FFF7ED",
                                borderColor: "#F97316",
                              },
                            }}
                          >
                            Tải ảnh lên ({item.photos.length})
                          </Button>
                        </label>

                        {item.photos.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280", display: "block" }}
                            >
                              {item.photos.length} ảnh đã tải lên
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Alert
                severity="warning"
                icon={<Warning sx={{ color: "#F97316" }} />}
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  bgcolor: "#FFF7ED",
                  color: "#1F2937",
                  "& .MuiAlert-icon": {
                    color: "#F97316",
                  },
                }}
              >
                Vui lòng chụp ảnh rõ ràng tất cả các góc độ của thiết bị
              </Alert>
            </Box>
          )}

          {/* Step 3: Confirm */}
          {activeStep === 3 && (
            <Box>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    bgcolor: "#D1FAE5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 3,
                  }}
                >
                  <TaskAlt sx={{ color: "#059669", fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
                >
                  Xác nhận thông tin
                </Typography>
                <Typography variant="body1" sx={{ color: "#6B7280", mb: 4 }}>
                  Kiểm tra lại thông tin trước khi hoàn tất
                </Typography>
              </Box>

              {/* Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "#F9FAFB",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1F2937", mb: 3 }}
                >
                  Tổng quan
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{ flex: "1 1 0", minWidth: 120, textAlign: "center" }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#059669", mb: 1 }}
                    >
                      {equipment.filter((e) => e.condition === "good").length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Tốt
                    </Typography>
                  </Box>
                  <Box
                    sx={{ flex: "1 1 0", minWidth: 120, textAlign: "center" }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#F97316", mb: 1 }}
                    >
                      {
                        equipment.filter((e) => e.condition === "damaged")
                          .length
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Hư hỏng
                    </Typography>
                  </Box>
                  <Box
                    sx={{ flex: "1 1 0", minWidth: 120, textAlign: "center" }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#DC2626", mb: 1 }}
                    >
                      {
                        equipment.filter((e) => e.condition === "missing")
                          .length
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Thiếu
                    </Typography>
                  </Box>
                  <Box
                    sx={{ flex: "1 1 0", minWidth: 120, textAlign: "center" }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#0284C7", mb: 1 }}
                    >
                      {equipment.reduce(
                        (acc, item) => acc + item.photos.length,
                        0
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280" }}>
                      Ảnh
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Equipment List */}
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}
              >
                Chi tiết thiết bị
              </Typography>
              <Stack spacing={2}>
                {equipment.map((item) => (
                  <Card
                    key={item.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: "#1F2937", mb: 0.5 }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6B7280", mb: 1 }}
                          >
                            Serial: {item.serialNumber}
                          </Typography>
                          {item.notes && (
                            <Typography
                              variant="body2"
                              sx={{ color: "#6B7280", fontStyle: "italic" }}
                            >
                              Ghi chú: {item.notes}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          icon={
                            item.condition === "good" ? (
                              <CheckCircle />
                            ) : item.condition === "damaged" ? (
                              <Warning />
                            ) : (
                              <Cancel />
                            )
                          }
                          label={
                            item.condition === "good"
                              ? "Tốt"
                              : item.condition === "damaged"
                              ? "Hư hỏng"
                              : "Thiếu"
                          }
                          sx={{
                            bgcolor:
                              item.condition === "good"
                                ? "#D1FAE5"
                                : item.condition === "damaged"
                                ? "#FFF7ED"
                                : "#FEE2E2",
                            color:
                              item.condition === "good"
                                ? "#059669"
                                : item.condition === "damaged"
                                ? "#F97316"
                                : "#DC2626",
                            fontWeight: 600,
                            "& .MuiChip-icon": {
                              color:
                                item.condition === "good"
                                  ? "#059669"
                                  : item.condition === "damaged"
                                  ? "#F97316"
                                  : "#DC2626",
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#6B7280" }}>
                        Số ảnh: {item.photos.length}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={handleBack}
            disabled={activeStep === 0 && currentItemIndex === 0}
            sx={{
              minWidth: 150,
              borderColor: "#E5E7EB",
              color: "#6B7280",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              py: 1.5,
              "&:hover": {
                borderColor: "#F97316",
                bgcolor: "#FFF7ED",
                color: "#F97316",
              },
              "&:disabled": {
                borderColor: "#E5E7EB",
                color: "#9CA3AF",
              },
            }}
          >
            Quay lại
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<TaskAlt />}
              onClick={handleSubmit}
              disabled={!allItemsChecked}
              sx={{
                minWidth: 200,
                bgcolor: "#F97316",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "#EA580C",
                },
                "&:disabled": {
                  bgcolor: "#E5E7EB",
                  color: "#9CA3AF",
                },
              }}
            >
              Hoàn tất kiểm tra
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<NavigateNext />}
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !bookingId) ||
                (activeStep === 1 && !currentItem.condition)
              }
              sx={{
                minWidth: 150,
                bgcolor: "#F97316",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#EA580C",
                },
                "&:disabled": {
                  bgcolor: "#E5E7EB",
                  color: "#9CA3AF",
                },
              }}
            >
              {activeStep === 1 && currentItemIndex < equipment.length - 1
                ? "Thiết bị tiếp theo"
                : "Tiếp tục"}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default EquipmentCheck;
