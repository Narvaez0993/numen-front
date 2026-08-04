import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useAgentFeed } from '../../hooks/useAgentFeed';

type Props = { today: string };

/**
 * The permanent door to «Resúmenes», in Home's scroll. A label, not an icon:
 * it has to be understood without being learned, and it costs no fixed pixels
 * because Home already scrolls.
 *
 * Home carries both doors on purpose — this one is always here, and the
 * announcement banner above the hero is the premiere that only exists while
 * something is unwatched. The count comes from the feed query the banner
 * already made, so the row adds no request.
 */
export function AgentSummariesRow({ today }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const feed = useAgentFeed(today);
  const unseen = feed.data?.unseenCount ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/resumenes')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <IconBox name="books" color="mint" size={36} iconSize={17} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" numberOfLines={1} style={{ fontWeight: '500' }}>
          {t('assistant.summaries.rowTitle')}
        </Text>
        <Text
          variant="caption"
          muted
          numberOfLines={1}
          style={{ fontSize: 12, marginTop: 2 }}
        >
          {t('assistant.summaries.rowSubtitle')}
        </Text>
      </View>
      {unseen > 0 ? (
        <Pill variant="mint" uppercase>
          {t('assistant.summaries.unseen', { count: unseen })}
        </Pill>
      ) : null}
      <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
    </Pressable>
  );
}
