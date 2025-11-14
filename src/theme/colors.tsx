/**
 * CamRent Color Palette
 * Centralized color management for consistent theming
 */

export const colors = {
  // Primary Colors
  primary: {
    main: "#F97316", // Orange-500
    light: "#FB923C", // Orange-400
    dark: "#EA580C", // Orange-600
    lighter: "#FFF7ED", // Orange-50
    darker: "#C2410C", // Orange-700
  },

  // Secondary Colors
  secondary: {
    main: "#FACC15", // Yellow-400
    light: "#FDE68A", // Yellow-200
    dark: "#EAB308", // Yellow-500
  },

  // Neutral Colors
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Status Colors
  status: {
    success: "#059669", // Green-600
    successLight: "#D1FAE5", // Green-100
    warning: "#F59E0B", // Amber-500
    warningLight: "#FEF3C7", // Amber-100
    error: "#DC2626", // Red-600
    errorLight: "#FEE2E2", // Red-100
    info: "#0284C7", // Sky-600
    infoLight: "#E0F2FE", // Sky-100
  },

  // Accent Colors
  accent: {
    purple: "#4F46E5", // Indigo-600
    purpleLight: "#EEF2FF", // Indigo-50
    blue: "#1D4ED8", // Blue-700
    blueLight: "#DBEAFE", // Blue-100
  },

  // Background Colors
  background: {
    default: "#F5F5F5",
    paper: "#FFFFFF",
    dark: "#111827",
  },

  // Border Colors
  border: {
    light: "#E5E7EB",
    main: "#D1D5DB",
    dark: "#9CA3AF",
  },

  // Text Colors
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    disabled: "#9CA3AF",
    hint: "#D1D5DB",
  },

  // Component Specific
  components: {
    card: {
      border: "#E5E7EB",
      hover: "#FFF7ED",
    },
    input: {
      border: "#E5E7EB",
      focus: "#F97316",
      error: "#DC2626",
    },
    button: {
      primary: "#F97316",
      primaryHover: "#EA580C",
      secondary: "#FACC15",
      secondaryHover: "#EAB308",
    },
  },
} as const;

// Export individual color groups for convenience
export const {
  primary,
  secondary,
  neutral,
  status,
  accent,
  background,
  border,
  text,
  components,
} = colors;

// Type exports for TypeScript
export type ColorPalette = typeof colors;
export type PrimaryColor = typeof primary;
export type SecondaryColor = typeof secondary;
