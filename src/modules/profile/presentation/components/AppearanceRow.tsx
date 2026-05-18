import { useTranslation } from 'react-i18next';

import { SettingsRow } from '@/shared/presentation/components';
import { useThemePreference } from '@/shared/presentation/theme';

type Props = { last?: boolean };

export function AppearanceRow({ last = false }: Props) {
  const { t } = useTranslation();
  const mode = useThemePreference((state) => state.mode);
  const cycle = useThemePreference((state) => state.cycle);

  return (
    <SettingsRow
      icon="palette"
      iconColor="neutral"
      title={t('profile.rows.appearance.title')}
      value={t(`profile.appearance.${mode}`)}
      last={last}
      onPress={cycle}
    />
  );
}
