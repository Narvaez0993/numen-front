import { Children, ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

import { SectionLabel } from './SectionLabel';

type Props = {
  label?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SettingsGroup({ label, children, style }: Props) {
  const { theme } = useTheme();
  const items = Children.toArray(children);

  return (
    <View style={[{ marginBottom: 18 }, style]}>
      {label ? (
        <SectionLabel style={{ marginBottom: 8, paddingHorizontal: 4 }}>
          {label}
        </SectionLabel>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {items}
      </View>
    </View>
  );
}
