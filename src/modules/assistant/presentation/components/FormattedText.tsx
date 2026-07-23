import { Fragment } from 'react';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  text: string;
};

/**
 * Highlights any monetary amount (`$X.XXX.XXX`) or percentage inside a sentence
 * with tabular-nums + primary color + medium weight.
 */
export function FormattedText({ text }: Props) {
  const { theme } = useTheme();
  if (!text) return null;
  const parts = text.split(/(\$[\d.]+|\d+%)/g);
  return (
    <Text
      variant="body"
      color={theme.colors.textPrimary}
      style={{ fontSize: 13, lineHeight: 19.5, letterSpacing: -0.065 }}
    >
      {parts.map((p, i) => {
        if (/^\$[\d.]+$/.test(p) || /^\d+%$/.test(p)) {
          return (
            <Text
              key={i}
              variant="body"
              tabular
              style={{ fontWeight: '500', fontSize: 13 }}
            >
              {p}
            </Text>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </Text>
  );
}
