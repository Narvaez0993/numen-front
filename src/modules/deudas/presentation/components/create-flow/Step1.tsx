import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../../domain';

import { PersonSelector } from './PersonSelector';
import type { PersonPick } from './personPick';

type Props = {
  direction: DebtDirection;
  onDirectionChange: (d: DebtDirection) => void;
  persons: PersonPick[];
  onPersonsChange: (next: PersonPick[]) => void;
};

const TABS: DebtDirection[] = ['incoming', 'outgoing'];

export function Step1({ direction, onDirectionChange, persons, onPersonsChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ gap: 18 }}>
      <View>
        <Text
          style={{
            fontSize: 26,
            fontWeight: '500',
            letterSpacing: -0.65,
            marginBottom: 8,
          }}
        >
          {t('deudas.create.step1.title')}
        </Text>
        <Text
          color={theme.colors.textSecondary}
          style={{ fontSize: 14, lineHeight: 20.3 }}
        >
          {t('deudas.create.step1.subtitle')}
        </Text>
      </View>

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
              onPress={() => onDirectionChange(id)}
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

      <View style={{ gap: 8 }}>
        <SectionLabel>
          {t('deudas.create.step1.personsLabel', { count: persons.length })}
        </SectionLabel>
        <PersonSelector selected={persons} onChange={onPersonsChange} />
      </View>

      {persons.length >= 2 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.accentPurpleBg,
            borderRadius: 12,
          }}
        >
          <View style={{ marginTop: 1 }}>
            <Icon
              name="info-circle"
              size={14}
              stroke={1.8}
              color={theme.colors.accentPurple}
            />
          </View>
          <Text
            color={theme.colors.textSecondary}
            style={{ flex: 1, fontSize: 11.5, lineHeight: 16.68 }}
          >
            {t('deudas.create.step1.sharedBanner')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
