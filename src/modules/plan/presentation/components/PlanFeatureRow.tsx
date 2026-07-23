import { Text as RNText, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { PlanFeature } from '../../domain';

type Props = {
  feature: PlanFeature;
};

export function PlanFeatureRow({ feature }: Props) {
  const { theme } = useTheme();
  const strong = typeof feature === 'object' ? feature.strong : null;
  const text = typeof feature === 'object' ? feature.text : feature;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 5,
          backgroundColor: theme.colors.accentMintBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Icon name="check" size={11} stroke={2.4} color={theme.colors.accentMint} />
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}
      >
        {strong ? (
          <>
            <RNText
              style={{
                fontFamily: 'Geist_500Medium',
                color: theme.colors.textPrimary,
              }}
            >
              {strong}
            </RNText>
            {' — '}
            {text}
          </>
        ) : (
          text
        )}
      </Text>
    </View>
  );
}
