import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { AccentColor } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import { ALL_CATEGORIES, QUICK_CATS } from '../../constants/options';

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
  onSeeAll: () => void;
};

const NEUTRAL_BG = 'rgba(168,178,200,0.12)';

function asAccent(c: AccentColor | 'neutral' | undefined): AccentColor | null {
  if (!c || c === 'neutral') return null;
  return c;
}

export function CategoryPicker({ value, onChange, onSeeAll }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const inQuick = !!value && QUICK_CATS.find((c) => c.value === value);
  const selectedFull = value ? ALL_CATEGORIES.find((c) => c.value === value) : null;
  const selectedAccent = asAccent(selectedFull?.color);

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {QUICK_CATS.map((c) => {
          const active = value === c.value;
          const accent = asAccent(c.color);
          const colorBg = accent
            ? theme.colors[accentColorKey(accent, 'bg')]
            : NEUTRAL_BG;
          const colorFg = accent
            ? theme.colors[accentColorKey(accent, 'fg')]
            : theme.colors.textSecondary;
          return (
            <Pressable
              key={c.value}
              onPress={() => onChange(c.value)}
              style={({ pressed }) => ({
                flexBasis: '31%',
                flexGrow: 1,
                alignItems: 'center',
                gap: 6,
                paddingVertical: 12,
                paddingHorizontal: 8,
                backgroundColor: active ? colorBg : theme.colors.bgSurface,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colorFg : theme.colors.borderSubtle,
                borderRadius: 12,
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <Icon name={c.icon!} size={17} stroke={1.8} color={colorFg} />
              <Text variant="label" style={{ fontSize: 11.5 }}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedFull && !inQuick && selectedAccent ? (
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: theme.colors[accentColorKey(selectedAccent, 'bg')],
            borderWidth: 2,
            borderColor: theme.colors[accentColorKey(selectedAccent, 'fg')],
            borderRadius: 12,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              backgroundColor: theme.colors.bgSurface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name={selectedFull.icon!}
              size={14}
              stroke={1.9}
              color={theme.colors[accentColorKey(selectedAccent, 'fg')]}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="label" style={{ fontSize: 13, letterSpacing: -0.13 }}>
              {selectedFull.label}
            </Text>
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ fontSize: 10.5, letterSpacing: 0.42, marginTop: 1 }}
            >
              {t('deudas.create.step2.categorySelected')}
            </Text>
          </View>
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={6}
            style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.7 : 1 })}
          >
            <Icon name="x" size={14} color={theme.colors.textTertiary} />
          </Pressable>
        </View>
      ) : null}

      <Pressable
        onPress={onSeeAll}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 10,
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.colors.borderDefault,
          borderRadius: 12,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="search" size={13} stroke={1.9} color={theme.colors.textSecondary} />
        <Text
          variant="label"
          color={theme.colors.textSecondary}
          style={{ fontSize: 12.5 }}
        >
          {t('deudas.create.step2.categorySeeAll')}
        </Text>
      </Pressable>
    </View>
  );
}
