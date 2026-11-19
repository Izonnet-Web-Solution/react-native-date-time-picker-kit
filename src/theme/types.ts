export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  background: string;
  card: string;
  modalOverlay: string;
  modalBackground: string;
  modalHandle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
  divider: string;
  selected: string;
  selectedText: string;
  rangeHighlight: string;
  rangeHighlightText: string;
  todayIndicator: string;
  disabled: string;
  disabledText: string;
  error: string;
  errorText: string;
  headerBackground: string;
  footerBackground: string;
}

export interface ThemeTypography {
  fontSizeSmall: number;
  fontSizeMedium: number;
  fontSizeLarge: number;
  fontSizeTitle: number;
  fontWeightRegular: '400' | 'normal';
  fontWeightMedium: '500' | '600';
  fontWeightBold: '700' | 'bold';
  fontFamily?: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBorderRadius {
  sm: number;
  md: number;
  lg: number;
  full: number;
}

export interface ThemeConfig {
  mode?: ThemeMode;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  borderRadius?: Partial<ThemeBorderRadius>;
}

export interface ResolvedTheme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}
