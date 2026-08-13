import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  DatePickerSheet,
  DeleteFlow,
  FieldLabel,
  Pill,
  SelectListInline,
  SelectRow,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { dayLabel, toIsoDate } from '@/shared/presentation/utils/dates';

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

type ExpandedField = 'category' | 'source' | 'destination' | null;

/** `type:id` keeps an option unique — two sources may share a name. */
const refKey = (ref: SourceRef) => `${ref.type}:${ref.id}`;
const parseRefKey = (key: string): SourceRef => {
  const [type, ...rest] = key.split(':');
  return { type: type as SourceRef['type'], id: rest.join(':') };
};

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

  const [today] = useState(() => toIsoDate(new Date()));
  const [description, setDescription] = useState('');
  const [digits, setDigits] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sourceKey, setSourceKey] = useState<string | null>(null);
  const [destinationKey, setDestinationKey] = useState<string | null>(null);
  const [occurredOn, setOccurredOn] = useState(today);
  const [expanded, setExpanded] = useState<ExpandedField>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible || !movement) return;
    setDescription(movement.description);
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
    setExpanded(null);
    setDatePickerOpen(false);
    setConfirmingDelete(false);
  }, [visible, movement, catalogs.sourceById]);

  if (!movement) return null;

  const isTransfer = movement.type === 'transfer';
  const amount = Number(digits || '0');

  const sourceOptions = Object.values(catalogs.sourceById).map((source) => ({
    value: refKey({ type: source.type, id: source.id }),
    label: source.name,
  }));

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

  const typeLabel = t(`movements.types.${movement.type}`);
  const categoryName = categoryId ? catalogs.categoryById[categoryId]?.name : undefined;
  const sourceLabel = sourceKey
    ? (catalogs.sourceById[parseRefKey(sourceKey).id]?.name ?? '—')
    : t('movements.detail.pickSource');
  const destinationLabel = destinationKey
    ? (catalogs.sourceById[parseRefKey(destinationKey).id]?.name ?? '—')
    : '—';
  const categoryOptions = Object.values(catalogs.categoryById).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} maxHeight="92%">
        <View
          style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="h1" style={{ fontSize: 16 }}>
                {t('movements.detail.title')}
              </Text>
              {/* Read-only: changing the type would change the whole shape. */}
              <Pill variant="neutral">{typeLabel}</Pill>
            </View>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ marginTop: 4 }}
            >
              {t('movements.detail.subtitle')}
            </Text>
          </View>

          {/* The amount IS the movement — it leads at 44px instead of hiding
              under a label the same size as every other field's. */}
          <AmountField
            digits={digits}
            onChangeDigits={setDigits}
            currency={movement.currency}
            size="hero"
          />

          <View>
            <FieldLabel label={t('movements.detail.description')} />
            <TextField value={description} onChangeText={setDescription} />
          </View>

          <View style={{ gap: 10 }}>
            {!isTransfer ? (
              <SelectRow
                label={t('movements.detail.category')}
                value={categoryName ?? '—'}
                expanded={expanded === 'category'}
                onToggle={() =>
                  setExpanded((e) => (e === 'category' ? null : 'category'))
                }
              >
                <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                  <SelectListInline
                    options={categoryOptions}
                    selected={categoryId}
                    onSelect={(value) => {
                      setCategoryId(value);
                      setExpanded(null);
                    }}
                  />
                </View>
              </SelectRow>
            ) : null}

            <SelectRow
              label={
                isTransfer ? t('movements.detail.from') : t('movements.detail.account')
              }
              value={sourceLabel}
              expanded={expanded === 'source'}
              onToggle={() => setExpanded((e) => (e === 'source' ? null : 'source'))}
            >
              <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                <SelectListInline
                  options={sourceOptions}
                  selected={sourceKey}
                  onSelect={(value) => {
                    setSourceKey(value);
                    if (value === destinationKey) setDestinationKey(null);
                    setExpanded(null);
                  }}
                />
              </View>
            </SelectRow>

            {isTransfer ? (
              <SelectRow
                label={t('movements.detail.to')}
                value={destinationLabel}
                expanded={expanded === 'destination'}
                onToggle={() =>
                  setExpanded((e) => (e === 'destination' ? null : 'destination'))
                }
              >
                <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                  <SelectListInline
                    options={sourceOptions.filter((option) => option.value !== sourceKey)}
                    selected={destinationKey}
                    onSelect={(value) => {
                      setDestinationKey(value);
                      setExpanded(null);
                    }}
                  />
                </View>
              </SelectRow>
            ) : null}

            <SelectRow
              label={t('movements.detail.date')}
              value={dayLabel(occurredOn, today, language, {
                today: t('movements.days.today'),
                yesterday: t('movements.days.yesterday'),
              })}
              expanded={false}
              onToggle={() => setDatePickerOpen(true)}
              last
            >
              <View />
            </SelectRow>
          </View>

          <Button
            label={t('movements.detail.save')}
            full
            disabled={!valid}
            loading={submitting}
            onPress={handleSave}
          />

          <DeleteFlow
            label={t('movements.detail.delete')}
            confirmTitle={t('movements.detail.deleteConfirmTitle', {
              name: movement.description,
            })}
            confirmLabel={t('movements.detail.deleteConfirm')}
            cancelLabel={t('movements.detail.cancel')}
            confirming={confirmingDelete}
            onToggle={setConfirmingDelete}
            onConfirm={onDelete}
          />
        </View>

        {/* Inside the sheet, not beside it: iOS presents a modal from whichever
            one is already on screen, so a sibling is silently dropped. */}
        <DatePickerSheet
          visible={datePickerOpen}
          value={occurredOn}
          today={today}
          title={t('movements.detail.datePickerTitle')}
          language={language}
          onClose={() => setDatePickerOpen(false)}
          onSelect={setOccurredOn}
        />
      </BottomSheet>
    </>
  );
}
