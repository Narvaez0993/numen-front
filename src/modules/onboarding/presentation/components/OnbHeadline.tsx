import { Trans } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  /** A key whose `<b>…</b>` is the part the sentence leans on. */
  i18nKey: string;
  values?: Record<string, unknown>;
  /** The line under it: what is being asked for, and why. */
  body?: string;
  /** 33 is the welcome's «Hola. Soy Deshka.»; every other entry screen is 29. */
  size?: 29 | 33;
  paddingTop?: number;
};

/**
 * The entry screens' title: big, light, left-aligned, with one part in medium
 * weight — «Guardemos esto **antes de que se pierda**». The old screens
 * centred a bold title under a logo, which is the layout of a form, not of
 * someone talking to you.
 */
export function OnbHeadline({
  i18nKey,
  values,
  body,
  size = 29,
  paddingTop = 34,
}: Props) {
  const { theme } = useTheme();
  const welcome = size === 33;

  return (
    <View style={{ paddingHorizontal: 30, paddingTop }}>
      <Text
        style={{
          fontSize: size,
          lineHeight: Math.round(size * (welcome ? 1.2 : 1.24)),
          fontWeight: '300',
          letterSpacing: welcome ? -1.1 : -0.9,
          color: theme.colors.textPrimary,
        }}
      >
        <Trans
          i18nKey={i18nKey}
          values={values}
          components={{ b: <Text style={{ fontSize: size, fontWeight: '500' }} /> }}
        />
      </Text>
      {body !== undefined ? (
        <Text
          color={theme.colors.textSecondary}
          style={{
            fontSize: welcome ? 15 : 14,
            lineHeight: welcome ? 24 : 22,
            marginTop: welcome ? 16 : 14,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}
