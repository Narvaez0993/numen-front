import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '../theme';
import { withAlpha } from '../theme/tokens';

import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Text } from './Text';

export type FilterOption = {
  value: string;
  label: string;
};

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
 * The list rises from the bottom rather than appearing in the middle. A centred
 * dialog puts the options as far from the thumb as the screen allows, and these
 * are lists people scroll.
 */
export function FilterChip({ label, value, options, onChange, allLabel }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const active = value !== null && value !== undefined;
  const displayLabel = active
    ? (options.find((o) => o.value === value)?.label ?? label)
    : label;
  const resolvedAllLabel = allLabel ?? t('common.all', { defaultValue: 'Todas' });

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
        <Text
          numberOfLines={1}
          color={active ? theme.palette.acc2 : theme.colors.textSecondary}
          style={{ fontSize: 12 }}
        >
          {displayLabel}
        </Text>
        <Icon
          name="chevron-down"
          size={11}
          color={active ? theme.palette.acc2 : theme.colors.textTertiary}
        />
      </Pressable>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        maxHeight="74%"
        showClose={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 4,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '500' }}>{label}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setOpen(false)}
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
              {t('common.close')}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <Option
            label={resolvedAllLabel}
            selected={!active}
            onPress={() => {
              onChange(null);
              setOpen(false);
            }}
          />
          {options.map((option) => (
            <Option
              key={option.value}
              label={option.label}
              selected={option.value === value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
            />
          ))}
        </ScrollView>
      </BottomSheet>
    </>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        minHeight: 44,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 11,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected
            ? withAlpha(theme.palette.acc, 0.18)
            : theme.colors.bgFloat,
        }}
      >
        <Text
          color={selected ? theme.palette.acc2 : theme.colors.textSecondary}
          style={{ fontSize: 12, fontWeight: '600' }}
        >
          {label.trim().charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 14.5 }}>
        {label}
      </Text>
      {selected ? (
        <Icon name="check" size={17} stroke={2.2} color={theme.palette.acc} />
      ) : null}
    </Pressable>
  );
}
