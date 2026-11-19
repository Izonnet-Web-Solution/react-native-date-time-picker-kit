import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  defaultBorderRadius,
  defaultDarkTheme,
  defaultLightTheme,
  defaultSpacing,
  defaultTypography,
} from './defaultTheme';
import type { ResolvedTheme, ThemeConfig, ThemeMode } from './types';

export function resolveTheme(
  themeInput?: ThemeMode | ThemeConfig | null,
  systemScheme?: 'light' | 'dark' | null
): ResolvedTheme {
  let mode: 'light' | 'dark' = 'light';
  let config: ThemeConfig | undefined;

  if (typeof themeInput === 'string') {
    if (themeInput === 'dark') {
      mode = 'dark';
    } else if (themeInput === 'light') {
      mode = 'light';
    } else {
      mode = systemScheme === 'dark' ? 'dark' : 'light';
    }
  } else if (themeInput && typeof themeInput === 'object') {
    config = themeInput;
    if (config.mode === 'dark') {
      mode = 'dark';
    } else if (config.mode === 'light') {
      mode = 'light';
    } else {
      mode = systemScheme === 'dark' ? 'dark' : 'light';
    }
  } else {
    mode = systemScheme === 'dark' ? 'dark' : 'light';
  }

  const baseTheme = mode === 'dark' ? defaultDarkTheme : defaultLightTheme;

  if (!config) {
    return baseTheme;
  }

  return {
    mode,
    colors: {
      ...baseTheme.colors,
      ...config.colors,
    },
    typography: {
      ...defaultTypography,
      ...config.typography,
    },
    spacing: {
      ...defaultSpacing,
      ...config.spacing,
    },
    borderRadius: {
      ...defaultBorderRadius,
      ...config.borderRadius,
    },
  };
}

export function useTheme(
  themeInput?: ThemeMode | ThemeConfig | null
): ResolvedTheme {
  const systemScheme = useColorScheme();

  return useMemo(() => {
    return resolveTheme(themeInput, systemScheme);
  }, [themeInput, systemScheme]);
}
