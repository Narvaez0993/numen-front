import { ReactNode } from 'react';
import { type DimensionValue, Modal, Pressable, View, ViewStyle } from 'react-native';

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

export function BottomSheet({
  visible,
  onClose,
  children,
  maxHeight = '88%',
  showClose = true,
  contentStyle,
}: Props) {
  const { theme, mode } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.scrim,
          }}
        />
        <View
          style={[
            {
              backgroundColor: theme.colors.bgSurface,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              maxHeight,
              overflow: 'hidden',
              ...(mode === 'light'
                ? {
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowOffset: { width: 0, height: -4 },
                    shadowRadius: 24,
                    elevation: 24,
                  }
                : {
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowOffset: { width: 0, height: -4 },
                    shadowRadius: 24,
                    elevation: 24,
                  }),
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
        </View>
      </View>
    </Modal>
  );
}
