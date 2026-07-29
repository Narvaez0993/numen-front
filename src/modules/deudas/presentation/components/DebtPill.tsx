import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtStatus } from '../../domain';

type Props = { status: DebtStatus };

export function DebtPill({ status }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const cfg: Record<
    DebtStatus,
    { bg: string; fg: string; icon: 'check' | 'alert-circle' | null }
  > = {
    pending: { bg: theme.colors.bgFloat, fg: theme.colors.textSecondary, icon: null },
    partial: {
      bg: theme.colors.accentAmberBg,
      fg: theme.colors.accentAmber,
      icon: null,
    },
    paid: {
      bg: theme.colors.accentMintBg,
      fg: theme.colors.accentMint,
      icon: 'check',
    },
    overdue: {
      bg: theme.colors.accentCoralBg,
      fg: theme.colors.accentCoral,
      icon: 'alert-circle',
    },
  };

  const { bg, fg, icon } = cfg[status];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 100,
        backgroundColor: bg,
        alignSelf: 'flex-start',
      }}
    >
      {icon ? <Icon name={icon} size={10} stroke={2.4} color={fg} /> : null}
      <Text
        variant="micro"
        color={fg}
        uppercase
        style={{ fontSize: 9.5, letterSpacing: 0.57, fontFamily: 'Geist_500Medium' }}
      >
        {t(`deudas.status.${status}`)}
      </Text>
    </View>
  );
}
