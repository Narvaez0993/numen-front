import { StatusBar } from 'expo-status-bar';

import { useTheme } from '../theme';

/**
 * Wraps Expo's StatusBar so its icon color follows the app's theme mode
 * (not the OS). With `style="auto"` the OS-derived scheme can mismatch the
 * user's preference (e.g. light theme override on a dark OS).
 */
export function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}
