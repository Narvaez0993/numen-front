import * as SystemUI from 'expo-system-ui';
import { createContext, ReactNode, useEffect, useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { buildTheme, Theme, ThemeMode } from './tokens';
import { usePalettePreference } from './usePalettePreference';
import { useThemePreference } from './useThemePreference';

export type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type Props = { children: ReactNode };

export function ThemeProvider({ children }: Props) {
  const systemScheme = useColorScheme();
  const preference = useThemePreference((state) => state.mode);
  const palette = usePalettePreference((state) => state.palette);

  // Two axes: the mode decides the surfaces, the palette decides the accent.
  // Both are resolved here so no screen ever has to compose them itself.
  const { theme, mode } = useMemo<ThemeContextValue>(() => {
    let resolved: ThemeMode;
    if (preference === 'dark' || preference === 'light') {
      resolved = preference;
    } else {
      // 'auto' → follow system; dark is the product default when unknown.
      resolved = systemScheme === 'light' ? 'light' : 'dark';
    }
    return { theme: buildTheme(resolved, palette), mode: resolved };
  }, [preference, systemScheme, palette]);

  // Force React Native's appearance to match the user's preference. On
  // Android, also set the native window background — otherwise the OS's
  // dark window bleeds gray under the React layout when the user forces
  // light on top of an OS in dark mode.
  useEffect(() => {
    if (preference === 'light' || preference === 'dark') {
      Appearance.setColorScheme(preference);
    } else {
      Appearance.setColorScheme(null);
    }
  }, [preference]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bgBase);
  }, [theme.colors.bgBase]);

  return (
    <ThemeContext.Provider value={{ theme, mode }}>{children}</ThemeContext.Provider>
  );
}
