import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

/** One thing to do, and whether the data says it is already done. */
export type StartStep = {
  key: string;
  label: string;
  done: boolean;
  onPress: () => void;
};

type Props = {
  steps: StartStep[];
  /** No movements registered yet — the copy leads instead of nagging. */
  firstTime: boolean;
  footer: string;
};

/**
 * What a brand-new user sees instead of a hero full of zeros.
 *
 * Every step reads its `done` from real data (an account exists, an expense was
 * registered, income was registered this month) — nothing is remembered client
 * side, so it cannot go out of sync with what the user actually has. The card
 * lives inside the hero while there is no basis for a daily figure, and the last
 * step is precisely what makes it disappear.
 */
export function GettingStarted({ steps, firstTime, footer }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const done = steps.filter((s) => s.done).length;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 12,
        }}
      >
        <Text variant="micro" muted uppercase style={{ letterSpacing: 1.05 }}>
          {t(firstTime ? 'home.start.title' : 'home.start.titleReturning')}
        </Text>
        <Text variant="micro" muted tabular style={{ letterSpacing: 0.4 }}>
          {t('home.start.progress', { done, total: steps.length })}
        </Text>
      </View>

      <ProgressBar
        pct={done / steps.length}
        height={5}
        color={theme.colors.accentMint}
        style={{ marginBottom: 14 }}
      />

      <View style={{ gap: 2 }}>
        {steps.map((step) => (
          <Pressable
            key={step.key}
            accessibilityRole="button"
            accessibilityState={{ checked: step.done }}
            onPress={step.onPress}
            disabled={step.done}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 9,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: step.done ? theme.colors.accentMintBg : 'transparent',
                borderWidth: step.done ? 0 : 1.5,
                borderColor: theme.colors.borderSubtle,
              }}
            >
              {step.done ? (
                <Icon
                  name="check"
                  size={12}
                  stroke={2.4}
                  color={theme.colors.accentMint}
                />
              ) : null}
            </View>
            <Text
              variant="body"
              muted={step.done}
              numberOfLines={1}
              style={{ flex: 1, fontSize: 13.5 }}
            >
              {step.label}
            </Text>
            {step.done ? null : (
              <Icon name="chevron-right" size={15} color={theme.colors.textTertiary} />
            )}
          </Pressable>
        ))}
      </View>

      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ marginTop: 10, lineHeight: 17 }}
      >
        {footer}
      </Text>
    </View>
  );
}
