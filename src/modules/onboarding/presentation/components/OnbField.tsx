import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = TextInputProps & {
  icon: string;
  error?: string | null;
  /** Inside the box, after the text — the password's «Mostrar». */
  right?: React.ReactNode;
};

/**
 * One field as the design draws it: a glass box with its icon, no floating
 * label. The placeholder says what goes in, and the box lights up with the
 * palette's accent while it has the cursor — the only colour on the screen
 * until the button.
 */
export const OnbField = forwardRef<TextInput, Props>(function OnbField(
  { icon, error, right, onFocus, onBlur, style, ...rest },
  ref,
) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const border = error
    ? withAlpha(theme.colors.accentCoral, 0.6)
    : focused
      ? withAlpha(theme.palette.acc, 0.34)
      : theme.colors.borderSubtle;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 56,
          paddingHorizontal: 16,
          borderRadius: 18,
          backgroundColor: theme.colors.bgSurface,
          borderWidth: 1,
          borderColor: border,
        }}
      >
        <Icon
          name={icon}
          size={18}
          stroke={1.8}
          color={focused ? theme.palette.acc2 : theme.colors.textTertiary}
        />
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textTertiary}
          selectionColor={theme.palette.acc2}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              paddingVertical: 16,
              fontSize: 15,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
            },
            style,
          ]}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <Text
          color={theme.colors.accentCoral}
          style={{ fontSize: 12, marginTop: 6, marginLeft: 4 }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});
