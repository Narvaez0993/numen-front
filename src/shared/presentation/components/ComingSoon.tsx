import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '../theme';

import { Icon, type IconName } from './Icon';
import { Pill } from './Pill';
import { SubScreenHeader } from './SubScreenHeader';
import { Text } from './Text';

type Props = {
  title: string;
  /** What the screen will do — and that it is not wired yet, which is different
   * from "you have none". An empty list would say the wrong thing. */
  body: string;
  icon: IconName;
  onBack?: () => void;
};

/**
 * A screen whose module does not exist yet.
 *
 * The alternative was leaving the mock in place, and a screen that shows a
 * $30.900 Netflix nobody registered is worse than one that admits it is not
 * ready: the user cannot tell which numbers to trust. Same call we made for the
 * voice/photo/text capture.
 */
export function ComingSoon({ title, body, icon, onBack }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgBase }}>
      <SubScreenHeader title={title} onBack={onBack} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          paddingHorizontal: 32,
          paddingBottom: 60,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.colors.bgSurface,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={25} stroke={1.6} color={theme.colors.textTertiary} />
        </View>
        <Pill variant="amber">{t('common.soon')}</Pill>
        <Text
          variant="body"
          muted
          style={{ fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 290 }}
        >
          {body}
        </Text>
      </View>
    </View>
  );
}
