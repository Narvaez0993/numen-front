import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../domain/types/Deuda';

type Props = {
  direction: DebtDirection;
  onChange: (direction: DebtDirection) => void;
};

const TABS: DebtDirection[] = ['incoming', 'outgoing'];

export function DirectionTabs({ direction, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 12,
        padding: 4,
        gap: 6,
      }}
    >
      {TABS.map((id) => {
        const active = id === direction;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              backgroundColor: active ? theme.colors.bgFloat : 'transparent',
              borderWidth: 1,
              borderColor: active ? theme.colors.borderSubtle : 'transparent',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              variant="label"
              color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
              style={{ fontSize: 12.5 }}
            >
              {t(`deudas.tabs.${id}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
