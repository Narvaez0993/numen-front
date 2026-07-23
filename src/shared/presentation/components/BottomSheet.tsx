import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  type DimensionValue,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: DimensionValue;
  /**
   * When true, the close X stays at the top-right of the sheet. Default true.
   */
  showClose?: boolean;
  contentStyle?: ViewStyle;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function BottomSheet({
  visible,
  onClose,
  children,
  maxHeight = '88%',
  showClose = true,
  contentStyle,
}: Props) {
  const { theme, mode } = useTheme();

  // Mount/unmount the Modal off the animation, so the closing animation can
  // play before the Modal is removed.
  const [mounted, setMounted] = useState(visible);
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(scrimOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(scrimOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, scrimOpacity, translateY]);

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.scrim,
            opacity: scrimOpacity,
          }}
        >
          <Pressable
            onPress={onClose}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.bgSurface,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              maxHeight,
              overflow: 'hidden',
              transform: [{ translateY }],
              ...(mode === 'light'
                ? {
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowOffset: { width: 0, height: -2 },
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : {}),
            },
            contentStyle,
          ]}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.textTertiary,
                opacity: 0.4,
              }}
            />
          </View>

          {/* Close X */}
          {showClose ? (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.bgFloat,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
                zIndex: 2,
              })}
            >
              <Icon name="x" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
