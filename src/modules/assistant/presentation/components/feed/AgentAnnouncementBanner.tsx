import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';

import { useAgentFeed } from '../../hooks/useAgentFeed';
import { selectAnnouncement } from '../../utils/agentAttention';

type Props = { today: string };

/**
 * The premiere slot: Home's announcement that something from the agent is
 * waiting, above the hero because it happens once a month (plus Mondays) and
 * vanishes the moment it is watched — reading IS the exit, so Home never
 * grows a permanent agent section and there is no X to manage.
 *
 * Self-contained like the shelf: its own query, and on loading, error or
 * nothing-unread it renders nothing — Home never waits for the agent.
 * Both destinations are full screens with a back button (the player, the
 * weekly report), so coming home is always one gesture.
 */
export function AgentAnnouncementBanner({ today }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const feed = useAgentFeed(today);

  const announcement = selectAnnouncement(feed.data?.outputs ?? []);
  if (announcement === null) return null;

  const isCorte = announcement.kind === 'monthly_summary';
  const accent = isCorte ? theme.colors.accentMint : theme.colors.accentPurple;
  const cover = isCorte ? announcement.slides.find((s) => s.type === 'cover') : null;
  const title = isCorte
    ? t('assistant.corte.entryTitle', {
        month: monthName(`${announcement.period}-01`, i18n.language),
      })
    : t('assistant.announce.weeklyTitle');
  const body = isCorte
    ? (cover?.text ?? null)
    : (announcement.weekly?.diagnosisText ?? null);
  const cta = isCorte ? t('assistant.corte.entryCta') : t('assistant.announce.weeklyCta');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push(isCorte ? `/corte/${announcement.id}` : `/weekly/${announcement.id}`)
      }
      style={({ pressed }) => ({
        backgroundColor: theme.colors.bgSurface,
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* The design's corner wash: a solid accent tint bleeding off the card. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -46,
          top: -46,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: isCorte
            ? theme.colors.accentMintBg
            : theme.colors.accentPurpleBg,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pill variant={isCorte ? 'mint' : 'purple'} uppercase>
          {t('assistant.corte.pillNew')}
        </Pill>
        <Icon name="sparkles" size={15} color={accent} />
      </View>
      <View style={{ gap: 4 }}>
        <Text variant="label" style={{ fontSize: 17, letterSpacing: -0.2 }}>
          {title}
        </Text>
        {body ? (
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            numberOfLines={2}
            style={{ fontSize: 12.5, lineHeight: 18 }}
          >
            {body}
          </Text>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text variant="label" color={accent} style={{ fontSize: 12 }}>
          {cta}
        </Text>
        <Icon name="chevron-right" size={12} color={accent} />
      </View>
    </Pressable>
  );
}
