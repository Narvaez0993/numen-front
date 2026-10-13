import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useTheme } from '../theme';
import { withAlpha } from '../theme/tokens';

import { ChooseSheet, type ChooseOption } from './ChooseSheet';
import { Text } from './Text';

export type FilterOption = ChooseOption;

type Props = {
  label: string;
  value: string | null;
  options: FilterOption[];
  onChange: (next: string | null) => void;
  allLabel?: string;
};

/**
 * A filter, and the list it opens.
 *
 * The chip is a pill that says either what it filters or what it is filtering
 * BY — a chip reading "Mercado" is worth more than one reading "Categoría" with
 * a tick somewhere, because the row of chips then reads as a sentence about what
 * is on screen.
 *
 * The list itself is `ChooseSheet`, the same one every form field opens. The
 * design draws that picker once for the whole app and this is one of its callers,
 * not a variant of it.
 */
export function FilterChip({ label, value, options, onChange, allLabel }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const active = value !== null && value !== undefined;
  const displayLabel = active
    ? (options.find((o) => o.value === value)?.label ?? label)
    : label;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          minHeight: 36,
          paddingHorizontal: 13,
          borderRadius: 999,
          backgroundColor: active
            ? withAlpha(theme.palette.acc, 0.15)
            : theme.colors.bgSurface,
          borderColor: active
            ? withAlpha(theme.palette.acc, 0.3)
            : theme.colors.borderSubtle,
          borderWidth: 1,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {/* No arrow: the design draws these as plain pills. Four of them in a
            row already read as a set of filters, and an arrow on each one was
            four extra marks saying the same thing. */}
        <Text
          numberOfLines={1}
          color={active ? theme.palette.acc2 : theme.colors.textSecondary}
          style={{ fontSize: 12 }}
        >
          {displayLabel}
        </Text>
      </Pressable>

      <ChooseSheet
        visible={open}
        title={label}
        options={options}
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
        allLabel={allLabel ?? t('common.all', { defaultValue: 'Todas' })}
        onClear={() => onChange(null)}
      />
    </>
  );
}
