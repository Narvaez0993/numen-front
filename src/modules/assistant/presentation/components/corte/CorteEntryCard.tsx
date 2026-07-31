import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';

import type { AgentOutput } from '../../../domain/types/AgentFeed';

type Props = {
  corte: AgentOutput;
  onOpen: () => void;
  onDismiss: () => void;
};

/**
 * The feed's invitation to the month's story. The body line IS the cover's
 * narration — the agent's voice sells its own Corte.
 */
export function CorteEntryCard({ corte, onOpen, onDismiss }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const month = monthName(`${corte.period}-01`, i18n.language);
  const cover = corte.slides.find((s) => s.type === 'cover');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.accentMint,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 10,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pill variant={corte.readAt === null ? 'mint' : 'neutral'} uppercase>
          {corte.readAt === null
            ? t('assistant.corte.pillNew')
            : t('assistant.corte.pillSeen')}
        </Pill>
        <Pressable
          accessibilityRole="button"
          onPress={onDismiss}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="x" size={14} color={theme.colors.textTertiary} />
        </Pressable>
      </View>

      <View>
        <Text
          variant="label"
          style={{ fontSize: 17, letterSpacing: -0.2, marginBottom: 4 }}
        >
          {t('assistant.corte.entryTitle', { month })}
        </Text>
        {cover ? (
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ fontSize: 12.5, lineHeight: 18 }}
          >
            {cover.text}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 12 }}>
          {t('assistant.corte.entryCta')}
        </Text>
        <Icon name="chevron-right" size={12} color={theme.colors.accentMint} />
      </View>
    </Pressable>
  );
}
