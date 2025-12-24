import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    buttonclr: '#F09E54',
    primary: '#6200EE',
    secondary: '#03DAC6',
    error: '#B00020',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#9E9E9E',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    // Custom colors
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    // Severity colors
    severityRed: '#F44336',
    severityYellow: '#FFC107',
    severityGreen: '#4CAF50',
  },
  roundness: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: '#757575',
  },
};
