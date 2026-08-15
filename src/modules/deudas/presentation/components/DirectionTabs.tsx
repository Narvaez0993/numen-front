import { useTranslation } from 'react-i18next';

import { Segmented } from '@/shared/presentation/components';

import type { DebtDirection } from '../../domain/types/Deuda';

type Props = {
  direction: DebtDirection;
  onChange: (direction: DebtDirection) => void;
};

/** Which side of the ledger you are looking at. It drives the total under it, so
 *  it is the design's segmented switch and nothing more. */
export function DirectionTabs({ direction, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Segmented
      value={direction}
      onChange={onChange}
      options={[
        { value: 'incoming', label: t('deudas.tabs.incoming') },
        { value: 'outgoing', label: t('deudas.tabs.outgoing') },
      ]}
    />
  );
}
