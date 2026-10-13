import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import type { AccentColor } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import { initialOf } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';

import { pickKey, type PersonPick } from './personPick';

type Props = {
  selected: PersonPick[];
  onChange: (next: PersonPick[]) => void;
};

const NEW_COLORS: AccentColor[] = ['mint', 'coral', 'purple', 'amber', 'pink'];

const normalize = (name: string) => name.trim().toLowerCase();

/**
 * Who the money is between.
 *
 * The list is there before you type. The old version only revealed people once a
 * query matched, which meant the answer to "who do I already have in here" was
 * to guess a letter and see — and picking someone you had lent to twice took
 * more typing than adding them again by mistake.
 *
 * A name that matches nobody becomes an "add" row instead of an error. It is
 * only a pick: the server creates the person when the debt lands, and dedupes by
 * normalized name so "juan" cannot mint a twin of "Juan".
 *
 * Choosing two or more turns the whole flow into a split, which is why the check
 * stays visible rather than closing the list — you have to be able to see that
 * you have picked three people.
 */
export function WhoStep({ selected, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { snapshot } = useDebtsContext();
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const keys = new Set(selected.map(pickKey));

  const people = snapshot.counterparties.filter((person) =>
    trimmed ? person.name.toLowerCase().includes(trimmed.toLowerCase()) : true,
  );

  const known = snapshot.counterparties.some(
    (person) => normalize(person.name) === normalize(trimmed),
  );
  const alreadyPicked = selected.some(
    (pick) => normalize(pick.name) === normalize(trimmed),
  );
  const canCreate = trimmed.length >= 2 && !known && !alreadyPicked;

  const toggle = (pick: PersonPick) => {
    const key = pickKey(pick);
    if (keys.has(key)) {
      onChange(selected.filter((other) => pickKey(other) !== key));
    } else {
      onChange([...selected, pick]);
    }
    setQuery('');
  };

  /** People typed in this session are picks, not rows in the snapshot — they have
   *  to be listed too or they vanish the moment the query is cleared. */
  const fresh = selected.filter((pick) => pick.id === null);

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 16,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
          }}
        >
          <Icon name="search" size={15} stroke={1.9} color={theme.colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('deudas.create.searchPeople')}
            placeholderTextColor={theme.colors.textTertiary}
            selectionColor={theme.palette.acc}
            style={{
              flex: 1,
              fontSize: 13.5,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
              padding: 0,
            }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 18 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {canCreate ? (
          <PersonRow
            name={trimmed}
            note={t('deudas.create.addAsNew')}
            checked={false}
            color={NEW_COLORS[selected.length % NEW_COLORS.length] ?? 'mint'}
            onPress={() =>
              toggle({
                id: null,
                name: trimmed,
                color: NEW_COLORS[selected.length % NEW_COLORS.length] ?? 'mint',
              })
            }
          />
        ) : null}

        {fresh.map((pick) => (
          <PersonRow
            key={pickKey(pick)}
            name={pick.name}
            note={t('deudas.create.newPerson')}
            color={pick.color}
            checked
            onPress={() => toggle(pick)}
          />
        ))}

        {people.map((person) => {
          const open = snapshot.debts.filter(
            (debt) =>
              debt.counterpartyId === person.id &&
              debt.status !== 'paid' &&
              debt.status !== 'written_off',
          ).length;
          return (
            <PersonRow
              key={person.id}
              name={person.name}
              color={person.color}
              note={
                open > 0
                  ? t('deudas.create.openDebts', { count: open })
                  : t('deudas.create.noOpenDebts')
              }
              checked={keys.has(person.id)}
              onPress={() =>
                toggle({ id: person.id, name: person.name, color: person.color })
              }
            />
          );
        })}

        {people.length === 0 && !canCreate && fresh.length === 0 ? (
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 12.5, paddingVertical: 20 }}
          >
            {t('deudas.create.noPeople')}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PersonRow({
  name,
  note,
  color,
  checked,
  onPress,
}: {
  name: string;
  note: string;
  color: AccentColor;
  checked: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: checked }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        minHeight: 44,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: theme.colors[accentColorKey(color, 'bg')],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          color={theme.colors[accentColorKey(color, 'fg')]}
          style={{ fontSize: 14, fontWeight: '600' }}
        >
          {initialOf(name)}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14.5 }}>
          {name}
        </Text>
        <Text
          numberOfLines={1}
          color={theme.colors.textTertiary}
          style={{ fontSize: 11, marginTop: 2 }}
        >
          {note}
        </Text>
      </View>

      {checked ? (
        <Icon name="check" size={17} stroke={2.2} color={theme.palette.acc} />
      ) : null}
    </Pressable>
  );
}
