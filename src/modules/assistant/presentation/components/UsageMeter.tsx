import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanStore, limitsFor } from '@/modules/plan/presentation/stores/usePlanStore';
import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

export function UsageMeter() {
  const { t } = useTranslation();
  const tier = usePlanStore((s) => s.tier);
  const used = usePlanStore((s) => s.used);
  const limits = limitsFor(tier);

  return (
    <Card padding={12}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <MeterColumn
          label={t('assistant.usage.registrations')}
          used={used.registrations}
          limit={limits.registrations}
        />
        <MeterColumn
          label={t('assistant.usage.messages')}
          used={used.messages}
          limit={limits.messages}
        />
      </View>
      <Text variant="caption" muted style={{ fontSize: 10.5, marginTop: 8 }}>
        {t(tier === 'plus' ? 'assistant.usage.planPlus' : 'assistant.usage.planFree')}
      </Text>
    </Card>
  );
}

function MeterColumn({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const { theme } = useTheme();
  const pct = limit > 0 ? used / limit : 0;
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <Text
          variant="micro"
          muted
          uppercase
          numberOfLines={1}
          style={{ fontSize: 10, letterSpacing: 0.8, flexShrink: 1 }}
        >
          {label}
        </Text>
        <Text variant="caption" tabular color={theme.colors.textSecondary}>
          {used}/{limit}
        </Text>
      </View>
      <ProgressBar pct={pct} height={4} />
    </View>
  );
}
