import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';

import { IconBox } from './IconBox';
import { Text } from './Text';

type Props = {
  visible: boolean;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
  onDismiss?: () => void;
  durationMs?: number;
};

export function Toast({
  visible,
  message,
  undoLabel,
  onUndo,
  onDismiss,
  durationMs = 4000,
}: Props) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!visible || !onDismiss) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 110,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 90,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 11,
          backgroundColor: theme.colors.bgElevated,
          borderColor: theme.colors.borderDefault,
          borderWidth: 1,
          borderRadius: 14,
          minWidth: 240,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <IconBox name="check" color="mint" size={26} iconSize={13} radius={8} />
        <Text variant="label" style={{ flex: 1, fontSize: 12.5 }}>
          {message}
        </Text>
        {undoLabel && onUndo ? (
          <Pressable onPress={onUndo} hitSlop={6}>
            <Text
              variant="label"
              color={theme.colors.accentMint}
              style={{ fontSize: 12 }}
            >
              {undoLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
