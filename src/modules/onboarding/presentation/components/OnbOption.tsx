import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  /** A glyph in its own well, for options that are things (a bank, cash). The
   *  objectives go without: they are sentences, and an icon would be decoration. */
  icon?: string;
};

/**
 * One answer to an entry-screen question, as the design's «¿Qué te trae por
 * acá?» draws it: a glass row with a line and its explanation, and the
 * palette's accent once it is the chosen one.
 */
export function OnbOption({ title, subtitle, selected, onPress, icon }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 64,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: selected
          ? withAlpha(theme.palette.acc, 0.14)
          : theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: selected
          ? withAlpha(theme.palette.acc, 0.3)
          : theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon !== undefined ? (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected
              ? withAlpha(theme.palette.acc, 0.18)
              : theme.colors.bgFloat,
          }}
        >
          <Icon
            name={icon}
            size={18}
            stroke={1.8}
            color={selected ? theme.palette.acc2 : theme.colors.textSecondary}
          />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14.5, fontWeight: '500' }}>{title}</Text>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11.5, marginTop: 3 }}>
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <Icon name="check" size={18} stroke={2.2} color={theme.palette.acc} />
      ) : null}
    </Pressable>
  );
}
