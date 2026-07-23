import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import type { AccentColor } from '@/shared/domain';
import { useTheme } from '@/shared/presentation/theme';

import type { Counterparty } from '../../../domain/types/Deuda';
import { useDeudasStore } from '../../stores/useDeudasStore';
import { PersonAvatar } from '../PersonAvatar';

type Props = {
  selected: Counterparty[];
  onChange: (next: Counterparty[]) => void;
};

const NEW_COLORS: AccentColor[] = ['mint', 'coral', 'purple', 'amber', 'pink'];

export function PersonSelector({ selected, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const counterparties = useDeudasStore((s) => s.counterparties);
  const addCounterparty = useDeudasStore((s) => s.addCounterparty);
  const [query, setQuery] = useState('');

  const trimmed = query.trim();

  const matches = trimmed
    ? counterparties.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed.toLowerCase()) &&
          !selected.find((s) => s.id === p.id),
      )
    : [];

  const showCreate =
    trimmed.length >= 2 &&
    !counterparties.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());

  const togglePerson = (p: Counterparty) => {
    if (selected.find((s) => s.id === p.id)) {
      onChange(selected.filter((s) => s.id !== p.id));
    } else {
      onChange([...selected, p]);
    }
    setQuery('');
  };

  const handleCreate = () => {
    if (!trimmed) return;
    const color = NEW_COLORS[Math.floor(Math.random() * NEW_COLORS.length)] ?? 'mint';
    const newP: Counterparty = {
      id: `new-${Date.now().toString(36)}`,
      name: trimmed,
      initial: trimmed[0]!.toUpperCase(),
      color,
      custom: true,
    };
    addCounterparty(newP);
    onChange([...selected, newP]);
    setQuery('');
  };

  const hasMargin = selected.length > 0 || matches.length > 0 || showCreate;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: theme.colors.bgSurface,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 13,
          marginBottom: hasMargin ? 10 : 0,
        }}
      >
        <Icon name="search" size={15} stroke={1.8} color={theme.colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('deudas.create.step1.searchPlaceholder')}
          placeholderTextColor={theme.colors.textTertiary}
          style={{
            flex: 1,
            color: theme.colors.textPrimary,
            fontSize: 13,
            fontFamily: 'Geist_400Regular',
            padding: 0,
          }}
        />
      </View>

      {matches.length > 0 || showCreate ? (
        <View
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: selected.length > 0 ? 10 : 0,
          }}
        >
          {matches.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => togglePerson(p)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderBottomWidth: i === matches.length - 1 && !showCreate ? 0 : 1,
                borderBottomColor: theme.colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <PersonAvatar person={p} size={28} fontSize={12} />
              <Text style={{ fontSize: 13, fontWeight: '500' }}>{p.name}</Text>
            </Pressable>
          ))}
          {showCreate ? (
            <Pressable
              onPress={handleCreate}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: theme.colors.accentMintBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name="plus"
                  size={13}
                  stroke={2.4}
                  color={theme.colors.accentMint}
                />
              </View>
              <Text style={{ fontSize: 13, flexShrink: 1 }}>
                {t('deudas.create.step1.addPersonPrefix')}{' '}
                <Text
                  color={theme.colors.accentMint}
                  style={{ fontFamily: 'Geist_500Medium' }}
                >
                  {trimmed}
                </Text>{' '}
                {t('deudas.create.step1.addPersonSuffix')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {selected.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 4,
          }}
        >
          {selected.map((p) => (
            <View
              key={p.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: theme.colors.bgSurface,
                borderWidth: 1,
                borderColor: theme.colors.borderDefault,
                borderRadius: 100,
                paddingLeft: 4,
                paddingRight: 6,
                paddingVertical: 4,
              }}
            >
              <PersonAvatar person={p} size={22} fontSize={10} />
              <Text variant="label" style={{ fontSize: 12.5, paddingRight: 2 }}>
                {p.name}
              </Text>
              <Pressable
                onPress={() => togglePerson(p)}
                hitSlop={6}
                style={({ pressed }) => ({
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.bgElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Icon name="x" size={9} stroke={2.4} color={theme.colors.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
