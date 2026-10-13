import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../domain/types/Deuda';

type Props = {
  direction: DebtDirection;
};

/**
 * Nothing on this side of the ledger.
 *
 * It carries no illustration and no button of its own any more. The dashed
 * "anotar una deuda nueva" sits on the screen whether or not the list is empty,
 * so an empty state with its own call to action was the same offer twice, forty
 * pixels apart — and the inner one vanished the moment you had a single debt,
 * which is exactly when someone goes looking for where the button went.
 *
 * What stays is the sentence, left-aligned with everything else, because the
 * empty state is a line in the list and not a page of its own.
 */
export function EmptyDeudasState({ direction }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isIncoming = direction === 'incoming';

  return (
    <View style={{ paddingVertical: 26 }}>
      <Text
        style={{
          fontSize: 19,
          fontWeight: '300',
          letterSpacing: -0.4,
          marginBottom: 8,
        }}
      >
        {t(isIncoming ? 'deudas.empty.incomingTitle' : 'deudas.empty.outgoingTitle')}
      </Text>
      <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5, lineHeight: 20 }}>
        {t('deudas.empty.body')}
      </Text>
    </View>
  );
}
