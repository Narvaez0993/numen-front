import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

import type { AssistantUsage } from '../../domain/types/Assistant';

type Props = {
  usage: AssistantUsage | undefined;
  onPress: () => void;
};

/**
 * How much of the thread is spent, as two numbers and a hairline.
 *
 * This is the design's answer to a quota, and it is a better one than the meter
 * it replaces: `18/30 mensajes` says the same thing in the space of a label,
 * where a card said it in the space of a card — on a screen whose whole point is
 * that the answer gets the room.
 *
 * It is also the way back into the conversation. The design shows one exchange
 * at a time and never draws the transcript, but the thread is what this counts,
 * so tapping the count is where it belongs.
 */
export function ThreadMeter({ usage, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const messages = usage?.messages;
  const used = messages?.used ?? 0;
  const limit = messages?.limit ?? 0;
  const filled = limit > 0 ? Math.min(1, used / limit) : 0;
  const over = limit > 0 && used >= limit;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 24,
        paddingTop: 18,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2 }}
        >
          {t('assistant.thread.label')}
        </Text>
        <Text
          tabular
          color={over ? theme.colors.accentCoralSoft : theme.colors.textTertiary}
          style={{ fontSize: 10.5 }}
        >
          {t('assistant.thread.count', { used, limit })}
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
            backgroundColor: over
              ? theme.colors.accentCoral
              : withAlpha(theme.palette.acc, 0.75),
          }}
        />
      </View>
    </Pressable>
  );
}
