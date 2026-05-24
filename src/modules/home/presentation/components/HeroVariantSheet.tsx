import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Icon, type IconName, Text } from '@/shared/presentation/components';
import type { AccentColor } from '@/shared/domain';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { HeroVariant } from '../stores/useHeroVariantStore';

import { SheetHeader } from './SheetHeader';

type Option = {
  id: HeroVariant;
  icon: IconName;
  color: AccentColor;
};

const OPTIONS: Option[] = [
  { id: 'daily', icon: 'sun', color: 'mint' },
  { id: 'saldo', icon: 'building-bank', color: 'purple' },
  { id: 'mes', icon: 'target', color: 'amber' },
];

type Props = {
  visible: boolean;
  variant: HeroVariant;
  onChange: (variant: HeroVariant) => void;
  onClose: () => void;
};

export function HeroVariantSheet({ visible, variant, onChange, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="62%">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: 26,
        }}
      >
        <SheetHeader
          title={t('home.heroPicker.title')}
          subtitle={t('home.heroPicker.subtitle')}
        />

        <View style={{ gap: 10 }}>
          {OPTIONS.map((opt) => {
            const active = opt.id === variant;
            const bg = theme.colors[accentColorKey(opt.color, 'bg')];
            const fg = theme.colors[accentColorKey(opt.color, 'fg')];
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  onChange(opt.id);
                  onClose();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: active ? 13 : 14,
                  backgroundColor: active ? theme.colors.bgFloat : theme.colors.bgSurface,
                  borderWidth: active ? 2 : 1,
                  borderColor: active
                    ? theme.colors.accentMint
                    : theme.colors.borderSubtle,
                  borderRadius: 14,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={opt.icon} size={18} color={fg} stroke={1.8} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyLarge" style={{ fontSize: 14, marginBottom: 2 }}>
                    {t(`home.heroPicker.${opt.id}.label`)}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={{ fontSize: 11.5, lineHeight: 15.5 }}
                  >
                    {t(`home.heroPicker.${opt.id}.sub`)}
                  </Text>
                </View>
                {active ? (
                  <Icon
                    name="check"
                    size={16}
                    color={theme.colors.accentMint}
                    stroke={2.4}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{
            fontSize: 11,
            textAlign: 'center',
            marginTop: 14,
            lineHeight: 15.95,
          }}
        >
          {t('home.heroPicker.footnote')}
        </Text>
      </ScrollView>
    </BottomSheet>
  );
}
