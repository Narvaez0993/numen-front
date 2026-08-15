import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTier } from '@/modules/plan/presentation/hooks/useTier';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

import type { AssistantUsage } from '../../domain/types/Assistant';

type Props = {
  /** Server truth; while it loads the meter shows quiet placeholders. */
  usage: AssistantUsage | undefined;
};

/**
 * Both quotas, and the day they come back.
 *
 * The chat screen only counts messages now — that is the number governing what
 * you are about to send, and the design gives it one line. But the agent spends
 * a second quota nobody was left able to see: the captures it registers for you,
 * which run out on their own schedule and would otherwise fail with an
 * explanation instead of a warning. So both live here, behind the count that
 * opens the thread, with the sentence that says when they reset.
 */
export function UsageMeter({ usage }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const tier = useTier();

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 16 }}>
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
      <Text
        color={theme.colors.textTertiary}
        style={{ fontSize: 11, lineHeight: 17, marginTop: 12 }}
      >
        {t(tier === 'plus' ? 'assistant.usage.planPlus' : 'assistant.usage.planFree')}
      </Text>
    </View>
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
  const filled =
    used !== undefined && limit !== undefined && limit > 0
      ? Math.min(1, used / limit)
      : 0;
  const spent = used !== undefined && limit !== undefined && used >= limit;

  return (
    <View style={{ flex: 1, gap: 8 }}>
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
          uppercase
          numberOfLines={1}
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 1.6, flexShrink: 1 }}
        >
          {label}
        </Text>
        <Text
          tabular
          color={spent ? theme.colors.accentCoralSoft : theme.colors.textSecondary}
          style={{ fontSize: 11.5 }}
        >
          {`${used ?? '–'}/${limit ?? '–'}`}
        </Text>
      </View>

      <View
        style={{
          height: 2,
          borderRadius: 2,
          backgroundColor: withAlpha(theme.colors.textPrimary, 0.1),
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${filled * 100}%`,
            height: '100%',
            backgroundColor: spent
              ? theme.colors.accentCoral
              : withAlpha(theme.palette.acc, 0.75),
          }}
        />
      </View>
    </View>
  );
}
