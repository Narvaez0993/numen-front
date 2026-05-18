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
    const mode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
    return { theme: themes[mode], mode };
  }, [systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
