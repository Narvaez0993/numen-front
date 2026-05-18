import { ReactNode } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { Text } from './Text';

type Props = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function SectionLabel({ children, style }: Props) {
  return (
    <Text variant="micro" muted uppercase style={style}>
      {children}
    </Text>
  );
}
