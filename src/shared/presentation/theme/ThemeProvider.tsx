import { createContext, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Theme, ThemeMode, themes } from './tokens';
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

  const value = useMemo<ThemeContextValue>(() => {
    let mode: ThemeMode;
    if (preference === 'dark' || preference === 'light') {
      mode = preference;
    } else {
      // 'auto' → follow system; dark is the product default when unknown.
      mode = systemScheme === 'light' ? 'light' : 'dark';
    }
    return { theme: themes[mode], mode };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
