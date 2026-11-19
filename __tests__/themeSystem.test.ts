import { describe, expect, it } from '@jest/globals';
import {
  defaultDarkTheme,
  defaultLightTheme,
  resolveTheme,
} from '../src/theme';

describe('Theme System', () => {
  it('resolves default light theme when mode is light', () => {
    const theme = resolveTheme('light');
    expect(theme.mode).toBe('light');
    expect(theme.colors.background).toBe('#FFFFFF');
    expect(theme.colors.text).toBe('#0F172A');
    expect(theme.colors.primary).toBe('#2563EB');
  });

  it('resolves default dark theme when mode is dark', () => {
    const theme = resolveTheme('dark');
    expect(theme.mode).toBe('dark');
    expect(theme.colors.background).toBe('#0F172A');
    expect(theme.colors.text).toBe('#F8FAFC');
    expect(theme.colors.primary).toBe('#3B82F6');
  });

  it('resolves auto mode based on system scheme', () => {
    const themeLight = resolveTheme('auto', 'light');
    expect(themeLight.mode).toBe('light');

    const themeDark = resolveTheme('auto', 'dark');
    expect(themeDark.mode).toBe('dark');
  });

  it('handles custom theme overrides', () => {
    const custom = resolveTheme({
      mode: 'light',
      colors: {
        primary: '#FF0055',
        background: '#FAFAFA',
      },
      spacing: {
        lg: 20,
      },
      borderRadius: {
        md: 12,
      },
    });

    expect(custom.mode).toBe('light');
    expect(custom.colors.primary).toBe('#FF0055');
    expect(custom.colors.background).toBe('#FAFAFA');
    expect(custom.spacing.lg).toBe(20);
    expect(custom.borderRadius.md).toBe(12);
    // Unspecified fields should inherit defaults
    expect(custom.colors.text).toBe(defaultLightTheme.colors.text);
    expect(custom.typography.fontSizeTitle).toBe(
      defaultLightTheme.typography.fontSizeTitle
    );
  });

  it('handles dark mode with custom overrides', () => {
    const customDark = resolveTheme({
      mode: 'dark',
      colors: {
        primary: '#10B981',
      },
    });

    expect(customDark.mode).toBe('dark');
    expect(customDark.colors.primary).toBe('#10B981');
    expect(customDark.colors.background).toBe(
      defaultDarkTheme.colors.background
    );
  });
});
