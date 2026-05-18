import { createContext, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Theme, ThemeMode, themes } from './tokens';

export type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type Props = { children: ReactNode };

export function ThemeProvider({ children }: Props) {
  const systemScheme = useColorScheme();
  const value = useMemo<ThemeContextValue>(() => {
    // Dark is the product's default per the brief; light only when explicitly set.
    const mode: ThemeMode = systemScheme === 'light' ? 'light' : 'dark';
    return { theme: themes[mode], mode };
  }, [systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
