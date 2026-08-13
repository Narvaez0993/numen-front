import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTier } from '@/modules/plan/presentation/hooks/useTier';
import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AssistantUsage } from '../../domain/types/Assistant';

type Props = {
  /** Server truth; while it loads the meter shows quiet placeholders. */
  usage: AssistantUsage | undefined;
};

/**
 * The quota, docked: it lives OUTSIDE the conversation's scroll because it is
 * the one number that governs what the user is about to do — buried in the
 * stream it was three screens up after a few questions. One slim row; the tap
 * opens the full card with the renewal caption.
 */
export function UsageMeterStrip({ usage, onPress }: Props & { onPress: () => void }) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('assistant.usage.planFree')}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <MeterColumn
        label={t('assistant.usage.registrations')}
        used={usage?.registrations.used}
        limit={usage?.registrations.limit}
      />
      <MeterColumn
        label={t('assistant.usage.messages')}
        used={usage?.messages.used}
        limit={usage?.messages.limit}
      />
    </Pressable>
  );
}

export function UsageMeter({ usage }: Props) {
  const { t } = useTranslation();
  const tier = useTier();

  return (
    <Card padding={12}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <MeterColumn
          label={t('assistant.usage.registrations')}
          used={usage?.registrations.used}
          limit={usage?.registrations.limit}
        />
        <MeterColumn
          label={t('assistant.usage.messages')}
          used={usage?.messages.used}
          limit={usage?.messages.limit}
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
  used: number | undefined;
  limit: number | undefined;
}) {
  const { theme } = useTheme();
  const pct = used !== undefined && limit !== undefined && limit > 0 ? used / limit : 0;
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
          {used ?? '–'}/{limit ?? '–'}
        </Text>
      </View>
      <ProgressBar pct={pct} height={4} />
    </View>
  );
}
