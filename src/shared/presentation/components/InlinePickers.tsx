import { Pressable, View } from 'react-native';

import type { AccentColor } from '@/shared/domain';

import { accentColorKey, useTheme } from '../theme';

import { Icon } from './Icon';
import { Text } from './Text';

export type CategoryOption = {
  name: string;
  color: AccentColor;
};

export function CategoryPickerInline({
  categories,
  selected,
  onSelect,
}: {
  categories: CategoryOption[];
  selected: string;
  onSelect: (name: string, color: AccentColor) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {categories.map((c) => {
        const active = c.name === selected;
        return (
          <Pressable
            key={c.name}
            onPress={() => onSelect(c.name, c.color)}
            style={({ pressed }) => ({
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: active
                ? theme.colors[accentColorKey(c.color, 'bg')]
                : theme.colors.bgElevated,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              variant="label"
              color={
                active
                  ? theme.colors[accentColorKey(c.color, 'fg')]
                  : theme.colors.textSecondary
              }
              style={{ fontSize: 12 }}
            >
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type SelectOption = {
  value: string;
  label: string;
};

/** Picks by **id**, not by label — labels are not unique (two accounts can share a name). */
export function SelectListInline({
  options,
  selected,
  onSelect,
}: {
  options: readonly SelectOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 2 }}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              paddingVertical: 9,
              borderRadius: 9,
              backgroundColor: active ? theme.colors.bgElevated : 'transparent',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              variant="label"
              color={active ? theme.colors.textPrimary : theme.colors.textSecondary}
              style={{ fontSize: 12.5 }}
            >
              {option.label}
            </Text>
            {active ? (
              <Icon name="check" size={13} color={theme.colors.accentMint} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Label-as-value list, for options that have no id of their own. */
export function OptionListInline({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <SelectListInline
      options={options.map((option) => ({ value: option, label: option }))}
      selected={selected}
      onSelect={onSelect}
    />
  );
}
