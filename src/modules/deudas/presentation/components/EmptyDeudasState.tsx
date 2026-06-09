import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../domain/types/Deuda';

type Props = {
  direction: DebtDirection;
  onCreate: () => void;
};

export function EmptyDeudasState({ direction, onCreate }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isIncoming = direction === 'incoming';
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 32 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: theme.colors.bgSurface,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon name="users" size={32} stroke={1.6} color={theme.colors.textTertiary} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '500',
          letterSpacing: -0.36,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {t(isIncoming ? 'deudas.empty.incomingTitle' : 'deudas.empty.outgoingTitle')}
      </Text>
      <Text
        color={theme.colors.textSecondary}
        style={{
          fontSize: 13,
          lineHeight: 18.85,
          textAlign: 'center',
          maxWidth: 280,
          marginBottom: 22,
        }}
      >
        {t(isIncoming ? 'deudas.empty.incomingBody' : 'deudas.empty.outgoingBody')}
      </Text>
      <Pressable
        onPress={onCreate}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.accentMint,
          borderRadius: 12,
          paddingVertical: 11,
          paddingHorizontal: 18,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="plus" size={14} stroke={2.2} color={theme.colors.accentMint} />
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 13 }}>
          {t('deudas.empty.cta')}
        </Text>
      </Pressable>
    </View>
  );
}
