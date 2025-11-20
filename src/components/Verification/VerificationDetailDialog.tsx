import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Camera, Package } from "lucide-react";
import { colors } from "../../theme/colors";
import type { Verification } from "../../types/verification.types";

interface VerificationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  verification: Verification | null;
}

const VerificationDetailDialog: React.FC<VerificationDetailDialogProps> = ({
  open,
  onClose,
  verification,
}) => {
  if (!verification) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getItemTypeLabel = (itemType: string) => {
    return itemType === "1" || itemType === "Camera" ? "Camera" : "Accessory";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Verification Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                Customer Name
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.name}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                Phone Number
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.phoneNumber}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                Inspection Date
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {formatDateTime(verification.inspectionDate)}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                Branch
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.branchName}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.text.secondary }}
              >
                Address
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                {verification.address}
              </Typography>
            </Box>

            {verification.items && verification.items.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text.secondary,
                      display: "block",
                      mb: 1.5,
                    }}
                  >
                    Requested Items ({verification.items.length})
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {verification.items.map((item) => (
                      <ListItem
                        key={item.itemId}
                        sx={{
                          bgcolor: colors.neutral[50],
                          borderRadius: 1,
                          mb: 1,
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {item.itemType === "1" || item.itemType === "Camera" ? (
                            <Camera size={20} color={colors.primary.main} />
                          ) : (
                            <Package size={20} color={colors.accent.blue} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.itemName}
                          secondary={getItemTypeLabel(item.itemType)}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                          secondaryTypographyProps={{
                            fontSize: "0.75rem",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            {verification.notes && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.text.secondary }}
                  >
                    Notes
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: colors.text.primary }}
                  >
                    {verification.notes}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: colors.border.light,
            color: colors.text.primary,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationDetailDialog;
