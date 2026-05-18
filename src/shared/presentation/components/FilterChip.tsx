import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme';

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
    <View style={{ flex: 1, minWidth: 0 }}>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: active ? theme.colors.accentMintBg : theme.colors.bgSurface,
          borderColor: active ? 'transparent' : theme.colors.borderSubtle,
          borderWidth: 1,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          variant="label"
          color={active ? theme.colors.accentMint : theme.colors.textSecondary}
          numberOfLines={1}
          style={{ fontSize: 12, flex: 1 }}
        >
          {displayLabel}
        </Text>
        <Icon
          name="chevron-down"
          size={11}
          color={active ? theme.colors.accentMint : theme.colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: theme.colors.scrim,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 320,
              backgroundColor: theme.colors.bgFloat,
              borderColor: theme.colors.borderDefault,
              borderWidth: 1,
              borderRadius: 16,
              padding: 8,
              maxHeight: 360,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Option
                label={resolvedAllLabel}
                selected={!active}
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}
              />
              {options.map((o) => (
                <Option
                  key={o.value}
                  label={o.label}
                  selected={o.value === value}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: selected ? theme.colors.accentMintBg : 'transparent',
        opacity: pressed && !selected ? 0.6 : 1,
      })}
    >
      <Text
        variant="label"
        color={selected ? theme.colors.accentMint : theme.colors.textPrimary}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
      {selected ? <Icon name="check" size={13} color={theme.colors.accentMint} /> : null}
    </Pressable>
  );
}
