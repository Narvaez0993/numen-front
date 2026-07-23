import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { PreviewChip } from './PreviewChip';

export function CustomCategoriesUpsell() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: theme.colors.accentPurpleBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name="sparkles"
            size={18}
            stroke={1.8}
            color={theme.colors.accentPurple}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              flexWrap: 'wrap',
            }}
          >
            <Text variant="bodyLarge" style={{ fontSize: 13.5 }}>
              {t('categories.upsell.title')}
            </Text>
            <Pill
              variant="purple"
              uppercase
              style={{ paddingHorizontal: 6, paddingVertical: 2 }}
            >
              {t('categories.upsell.plus')}
            </Pill>
          </View>
          <Text variant="caption" muted style={{ fontSize: 11.5, lineHeight: 16 }}>
            {t('categories.upsell.description')}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
          paddingTop: 10,
          paddingBottom: 4,
        }}
      >
        <PreviewChip
          icon="heart"
          color="pink"
          label={t('categories.upsell.preview.mascotas')}
        />
        <PreviewChip
          icon="bolt"
          color="mint"
          label={t('categories.upsell.preview.gym')}
        />
        <PreviewChip
          icon="school"
          color="amber"
          label={t('categories.upsell.preview.cursos')}
        />
        <PreviewChip
          icon="movie"
          color="purple"
          label={t('categories.upsell.preview.streaming')}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/plan')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: theme.colors.accentPurpleBg,
          borderRadius: 12,
          paddingVertical: 11,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          variant="label"
          color={theme.colors.accentPurple}
          style={{ fontSize: 12.5 }}
        >
          {t('categories.upsell.cta')}
        </Text>
        <Icon name="chevron-right" size={12} color={theme.colors.accentPurple} />
      </Pressable>
    </View>
  );
}
