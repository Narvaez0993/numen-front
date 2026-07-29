import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import type { AccentColor } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useDebtsContext } from '../../context/DebtsContext';
import { PersonAvatar } from '../PersonAvatar';

import { pickKey, type PersonPick } from './personPick';

type Props = {
  selected: PersonPick[];
  onChange: (next: PersonPick[]) => void;
};

const NEW_COLORS: AccentColor[] = ['mint', 'coral', 'purple', 'amber', 'pink'];

const normalize = (name: string) => name.trim().toLowerCase();

/**
 * Pick who the money is between: people the ledger already knows, or a name typed
 * fresh. A fresh name is only a pick — the server creates the person inline when the
 * debt lands (and dedupes by normalized name, so "juan" cannot mint a twin of "Juan").
 */
export function PersonSelector({ selected, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { snapshot } = useDebtsContext();
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const selectedKeys = new Set(selected.map(pickKey));

  const matches = trimmed
    ? snapshot.counterparties.filter(
        (person) =>
          person.name.toLowerCase().includes(trimmed.toLowerCase()) &&
          !selectedKeys.has(person.id),
      )
    : [];

  const knownByName = snapshot.counterparties.some(
    (person) => normalize(person.name) === normalize(trimmed),
  );
  const pickedByName = selected.some(
    (pick) => normalize(pick.name) === normalize(trimmed),
  );
  const showCreate = trimmed.length >= 2 && !knownByName && !pickedByName;

  const toggle = (pick: PersonPick) => {
    const key = pickKey(pick);
    if (selectedKeys.has(key)) {
      onChange(selected.filter((other) => pickKey(other) !== key));
    } else {
      onChange([...selected, pick]);
    }
    setQuery('');
  };

  const handleCreate = () => {
    if (!trimmed) return;
    const color = NEW_COLORS[selected.length % NEW_COLORS.length] ?? 'mint';
    toggle({ id: null, name: trimmed, color });
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
          {matches.map((person, i) => (
            <Pressable
              key={person.id}
              onPress={() =>
                toggle({ id: person.id, name: person.name, color: person.color })
              }
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
              <PersonAvatar person={person} size={28} fontSize={12} />
              <Text style={{ fontSize: 13, fontWeight: '500' }}>{person.name}</Text>
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
          {selected.map((pick) => (
            <View
              key={pickKey(pick)}
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
              <PersonAvatar person={pick} size={22} fontSize={10} />
              <Text variant="label" style={{ fontSize: 12.5, paddingRight: 2 }}>
                {pick.name}
              </Text>
              <Pressable
                onPress={() => toggle(pick)}
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
