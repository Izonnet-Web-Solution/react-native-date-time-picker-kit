import type {
  ResolvedTheme,
  ThemeBorderRadius,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
} from './types';

export const defaultTypography: ThemeTypography = {
  fontSizeSmall: 12,
  fontSizeMedium: 14,
  fontSizeLarge: 16,
  fontSizeTitle: 18,
  fontWeightRegular: '400',
  fontWeightMedium: '600',
  fontWeightBold: '700',
};

export const defaultSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const defaultBorderRadius: ThemeBorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  card: '#F8FAFC',
  modalOverlay: 'rgba(0, 0, 0, 0.45)',
  modalBackground: '#FFFFFF',
  modalHandle: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  accent: '#3B82F6',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  selected: '#2563EB',
  selectedText: '#FFFFFF',
  rangeHighlight: '#DBEAFE',
  rangeHighlightText: '#1D4ED8',
  todayIndicator: '#2563EB',
  disabled: '#F1F5F9',
  disabledText: '#CBD5E1',
  error: '#EF4444',
  errorText: '#FFFFFF',
  headerBackground: '#FFFFFF',
  footerBackground: '#F8FAFC',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: '#1E293B',
  modalHandle: '#475569',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  accent: '#60A5FA',
  border: '#334155',
  divider: '#1E293B',
  selected: '#3B82F6',
  selectedText: '#FFFFFF',
  rangeHighlight: '#1E3A8A',
  rangeHighlightText: '#93C5FD',
  todayIndicator: '#60A5FA',
  disabled: '#1E293B',
  disabledText: '#475569',
  error: '#F87171',
  errorText: '#FFFFFF',
  headerBackground: '#1E293B',
  footerBackground: '#0F172A',
};

export const defaultLightTheme: ResolvedTheme = {
  mode: 'light',
  colors: lightColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
};

export const defaultDarkTheme: ResolvedTheme = {
  mode: 'dark',
  colors: darkColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
};
