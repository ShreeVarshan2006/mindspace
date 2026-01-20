import { DefaultTheme } from 'react-native-paper';

// PRODUCTION DESIGN SYSTEM - DO NOT MODIFY WITHOUT DESIGN APPROVAL

// Color System
export const colors = {
  // Brand Colors
  primary: '#F5A962',
  primaryLight: '#FFF4EC',
  primaryDark: '#D98F4A',

  // Semantic Colors
  success: '#6BCF7F',
  error: '#FF6B6B',
  warning: '#FF9A5A',
  info: '#F5A962',

  // Severity Scale
  severityRed: '#FF6B6B',
  severityYellow: '#F5A962',
  severityGreen: '#6BCF7F',

  // Light Mode
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#F8F8F8',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E0E0E0',
    disabled: '#CCCCCC',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },

  // Dark Mode
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#252525',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    border: '#333333',
    disabled: '#444444',
    placeholder: '#888888',
    backdrop: 'rgba(0, 0, 0, 0.85)',
  },
};

// Spacing System (8px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography System
export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },

  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  // Captions & Labels
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Button Text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
};

// Border Radius System
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

// Elevation/Shadow System
export const elevation = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Icon Sizes
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

// Logo Sizes
export const logoSizes = {
  sm: 40,
  md: 48,
  lg: 56,
};

// Button Styles
export const buttonStyles = {
  primary: {
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  secondary: {
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  small: {
    height: 36,
    borderRadius: borderRadius.sm,
  },
};

// Card Styles
export const cardStyles = {
  default: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  compact: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
};

// React Native Paper Theme (backward compatibility)
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.primaryLight,
    error: colors.error,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    onSurface: '#000000',
    disabled: colors.light.disabled,
    placeholder: colors.light.placeholder,
    backdrop: colors.light.backdrop,
  },
  roundness: borderRadius.md,
};
