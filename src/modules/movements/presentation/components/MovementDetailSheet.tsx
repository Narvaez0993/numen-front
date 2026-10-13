import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import {
  AmountSheet,
  ChooseSheet,
  DatePickerSheet,
  SheetDeleteConfirm,
  SheetFieldRow,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { capitalized, dayLabel, toIsoDate } from '@/shared/presentation/utils/dates';

import type { Movement, MovementPatch, SourceRef } from '../../domain';
import type { MovementCatalogs } from '../hooks/useMovementCatalogs';

type Props = {
  visible: boolean;
  movement: Movement | null;
  catalogs: MovementCatalogs;
  submitting?: boolean;
  onClose: () => void;
  onSave: (patch: MovementPatch) => void;
  onDelete: () => void;
};

type Picker = 'category' | 'source' | 'destination' | null;

/** `type:id` keeps an option unique — two sources may share a name. */
const refKey = (ref: SourceRef) => `${ref.type}:${ref.id}`;
const parseRefKey = (key: string): SourceRef => {
  const [type, ...rest] = key.split(':');
  return { type: type as SourceRef['type'], id: rest.join(':') };
};

/**
 * One movement, to correct or to delete — the design's `DETALLE`.
 *
 * It is the sheet every amount in this app is entered in (`AmountSheet`): the
 * amount big at the top, the details as rows under it, «Guardar cambios» where
 * the thumb is. «Borrar movimiento» sits under it, last and smallest, and asks
 * by name before anything goes.
 *
 * The pickers open inside the sheet, never beside it: iOS drops a sibling
 * `Modal` without a word.
 */
export function MovementDetailSheet({
  visible,
  movement,
  catalogs,
  submitting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('en') ? 'en' : 'es';
  const categories = useCategories();

  // The parent clears the movement the moment it closes the sheet; holding on
  // to the last one keeps the sheet drawn while it slides away.
  const lastMovement = useRef(movement);
  if (movement) lastMovement.current = movement;
  const shown = movement ?? lastMovement.current;

  const [today] = useState(() => toIsoDate(new Date()));
  const [description, setDescription] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [digits, setDigits] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sourceKey, setSourceKey] = useState<string | null>(null);
  const [destinationKey, setDestinationKey] = useState<string | null>(null);
  const [occurredOn, setOccurredOn] = useState(today);
  const [picker, setPicker] = useState<Picker>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!visible || !movement) return;
    setDescription(movement.description);
    setEditingDescription(false);
    setDigits(String(movement.amount));
    setCategoryId(movement.categoryId);
    // A source the catalogs cannot resolve was deleted: leave the picker empty so
    // the user has to choose a valid one instead of silently keeping a ghost.
    setSourceKey(
      catalogs.sourceById[movement.source.id] ? refKey(movement.source) : null,
    );
    setDestinationKey(
      movement.destination && catalogs.sourceById[movement.destination.id]
        ? refKey(movement.destination)
        : null,
    );
    setOccurredOn(movement.occurredOn);
    setPicker(null);
    setDatePickerOpen(false);
  }, [visible, movement, catalogs.sourceById]);

  const type = shown?.type ?? 'expense';
  const isTransfer = type === 'transfer';

  const categoryOptions = useMemo(() => {
    const flow = type === 'income' ? 'income' : 'expense';
    return (categories.data ?? [])
      .filter((category) => category.flow === flow)
      .map((category) => ({ value: category.id, label: category.name }));
  }, [categories.data, type]);

  // Money comes in to an account, never to a card; a goal's pocket only ever
  // receives a transfer.
  const sourceOptions = useMemo(
    () =>
      Object.values(catalogs.sourceById)
        .filter((source) =>
          type === 'income' ? source.type === 'account' : source.type !== 'goal',
        )
        .map((source) => ({
          value: refKey({ type: source.type, id: source.id }),
          label: source.name,
        })),
    [catalogs.sourceById, type],
  );
  const destinationOptions = useMemo(
    () =>
      Object.values(catalogs.sourceById)
        .map((source) => ({
          value: refKey({ type: source.type, id: source.id }),
          label: source.name,
        }))
        .filter((option) => option.value !== sourceKey),
    [catalogs.sourceById, sourceKey],
  );

  if (!shown) return null;

  const amount = Number(digits || '0');
  const valid =
    amount > 0 &&
    sourceKey !== null &&
    (isTransfer ? destinationKey !== null : description.trim().length >= 2);

  const handleSave = () => {
    if (!valid || submitting || sourceKey === null) return;
    onSave({
      description: description.trim(),
      amount,
      source: parseRefKey(sourceKey),
      destination: destinationKey ? parseRefKey(destinationKey) : undefined,
      categoryId: isTransfer ? undefined : (categoryId ?? undefined),
      occurredOn,
    });
  };

  const nameOf = (key: string | null) =>
    key ? (catalogs.sourceById[parseRefKey(key).id]?.name ?? '—') : null;
  const categoryName = categoryId
    ? (catalogs.categoryById[categoryId]?.name ?? '—')
    : '—';

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      keyboard="system"
      digits={digits}
      onDigits={setDigits}
      currency={shown.currency}
      primaryLabel={t('movements.detail.save')}
      onPrimary={handleSave}
      primaryDisabled={!valid || submitting}
      header={
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>
              {t('movements.detail.title')}
            </Text>
            {/* Read-only: changing the type would change the whole shape. */}
            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: theme.colors.bgFloat,
              }}
            >
              <Text
                uppercase
                color={theme.colors.textSecondary}
                style={{ fontSize: 10, letterSpacing: 0.6 }}
              >
                {t(`expenses.sheet.manualEntry.type.${type}`)}
              </Text>
            </View>
          </View>
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 12.5, marginTop: 6 }}
          >
            {t('movements.detail.subtitle')}
          </Text>
        </View>
      }
      footerExtra={
        <SheetDeleteConfirm
          label={t('movements.detail.delete')}
          question={t('movements.detail.deleteConfirmTitle', { name: shown.description })}
          confirmLabel={t('movements.detail.deleteConfirm')}
          cancelLabel={t('movements.detail.cancel')}
          onConfirm={onDelete}
          busy={submitting}
        />
      }
      overlays={
        <>
          <ChooseSheet
            visible={picker === 'category'}
            title={t('movements.detail.category')}
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            onClose={() => setPicker(null)}
          />
          <ChooseSheet
            visible={picker === 'source'}
            title={t(isTransfer ? 'movements.detail.from' : 'movements.detail.account')}
            options={sourceOptions}
            value={sourceKey}
            onChange={(value: string) => {
              setSourceKey(value);
              if (value === destinationKey) setDestinationKey(null);
            }}
            onClose={() => setPicker(null)}
          />
          <ChooseSheet
            visible={picker === 'destination'}
            title={t('movements.detail.to')}
            options={destinationOptions}
            value={destinationKey}
            onChange={setDestinationKey}
            onClose={() => setPicker(null)}
          />
          <DatePickerSheet
            visible={datePickerOpen}
            value={occurredOn}
            today={today}
            title={t('movements.detail.datePickerTitle')}
            language={language}
            onClose={() => setDatePickerOpen(false)}
            onSelect={setOccurredOn}
          />
        </>
      }
    >
      <SheetFieldRow
        label={t('movements.detail.description')}
        onPress={() => setEditingDescription(true)}
      >
        {editingDescription ? (
          <TextInput
            value={description}
            onChangeText={setDescription}
            autoFocus
            maxLength={80}
            onBlur={() => setEditingDescription(false)}
            selectionColor={theme.palette.acc2}
            style={{
              flex: 1,
              textAlign: 'right',
              fontSize: 13.5,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
              padding: 0,
            }}
          />
        ) : (
          <Text numberOfLines={1} style={{ flex: 1, textAlign: 'right', fontSize: 13.5 }}>
            {description}
          </Text>
        )}
      </SheetFieldRow>

      {isTransfer ? null : (
        <SheetFieldRow
          label={t('movements.detail.category')}
          value={categoryName}
          chevron
          onPress={() => setPicker('category')}
        />
      )}

      <SheetFieldRow
        label={t(isTransfer ? 'movements.detail.from' : 'movements.detail.account')}
        value={nameOf(sourceKey) ?? t('movements.detail.pickSource')}
        chevron
        onPress={() => setPicker('source')}
      />

      {isTransfer ? (
        <SheetFieldRow
          label={t('movements.detail.to')}
          value={nameOf(destinationKey) ?? '—'}
          chevron
          onPress={() => setPicker('destination')}
        />
      ) : null}

      <SheetFieldRow
        label={t('movements.detail.date')}
        value={capitalized(
          dayLabel(occurredOn, today, language, {
            today: t('movements.days.today'),
            yesterday: t('movements.days.yesterday'),
          }),
        )}
        onPress={() => setDatePickerOpen(true)}
      />
    </AmountSheet>
  );
}
