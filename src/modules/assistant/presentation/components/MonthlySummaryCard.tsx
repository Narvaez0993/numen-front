import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { usePlanStore } from '@/modules/plan/presentation/stores/usePlanStore';
import { Card, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onSeePlus: () => void;
};

/**
 * The agent's monthly-summary artifact (free tier gets one per month).
 * Content is mock until the real agent lands.
 */
export function MonthlySummaryCard({ onSeePlus }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const tier = usePlanStore((s) => s.tier);

  return (
    <Card padding={16}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Icon name="sparkles" size={14} color={theme.colors.accentPurple} />
        <Text
          variant="micro"
          uppercase
          color={theme.colors.accentPurple}
          style={{ fontSize: 10.5, letterSpacing: 1.05 }}
        >
          {t('assistant.summary.pill')}
        </Text>
      </View>

      <Text variant="h2" style={{ marginBottom: 8 }}>
        {t('assistant.summary.title')}
      </Text>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ lineHeight: 18, marginBottom: 12 }}
      >
        {t('assistant.summary.body')}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginBottom: tier === 'free' ? 12 : 0,
        }}
      >
        <SummaryStat
          label={t('assistant.summary.spent')}
          value="$1.919.500"
          color={theme.colors.textPrimary}
        />
        <SummaryStat
          label={t('assistant.summary.savings')}
          value="54%"
          color={theme.colors.accentMint}
        />
        <SummaryStat
          label={t('assistant.summary.projection')}
          value="$4.250.000"
          color={theme.colors.accentCoral}
        />
      </View>

      {tier === 'free' ? (
        <Pressable
          accessibilityRole="button"
          onPress={onSeePlus}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="caption"
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, flex: 1 }}
          >
            {t('assistant.summary.plusTeaser')}
          </Text>
          <Text
            variant="label"
            color={theme.colors.accentMint}
            style={{ fontSize: 11.5 }}
          >
            {t('assistant.summary.seePlus')}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bgFloat,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 3,
      }}
    >
      <Text
        variant="micro"
        muted
        uppercase
        numberOfLines={1}
        style={{ fontSize: 9.5, letterSpacing: 0.6 }}
      >
        {label}
      </Text>
      <Text
        variant="label"
        tabular
        color={color}
        numberOfLines={1}
        style={{ fontSize: 13 }}
      >
        {value}
      </Text>
    </View>
  );
}
