import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  type TextInput as TextInputType,
  TextInput,
  View,
} from 'react-native';

import type { AccentColor } from '@/shared/domain';
import {
  BottomSheet,
  Icon,
  type IconName,
  SheetDangerAction,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from '@/shared/presentation/constants/categoryOptions';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

import type { Category, CategoryFlow } from '../../domain';

export type CategoryFormValues = {
  name: string;
  icon: string;
  color: AccentColor;
  flow: CategoryFlow;
};

type Props = {
  visible: boolean;
  /** Present → edit mode; absent → create mode. */
  initial?: Category | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  onDelete?: () => void;
};

const FLOWS: readonly CategoryFlow[] = ['expense', 'income'];

/**
 * Naming a category.
 *
 * Restyled to the app's one vocabulary: the header carries the title and the
 * destructive action, the switch is the same one the manual capture uses, and
 * choosing something is the accent at 15% rather than a two-pixel ring in a
 * different colour per row.
 *
 * The preview at the top is now **exactly how the row will look** — a
 * monochrome well with the icon in the accent. It used to preview the category's
 * own colour, which was an honest preview of the old design and a promise the
 * new one does not keep.
 */
export function CategoryFormSheet({
  visible,
  initial,
  submitting = false,
  errorMessage,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const inputRef = useRef<TextInputType>(null);
  const isEdit = !!initial;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>('tag');
  const [color, setColor] = useState<AccentColor>('purple');
  const [flow, setFlow] = useState<CategoryFlow>('expense');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(initial?.name ?? '');
    setIcon((initial?.icon as IconName) ?? 'tag');
    setColor(initial && initial.color !== 'neutral' ? initial.color : 'purple');
    setFlow(initial?.flow ?? 'expense');
    const tid = setTimeout(() => inputRef.current?.focus(), 280);
    return () => clearTimeout(tid);
  }, [visible, initial]);

  const valid = name.trim().length >= 2;

  const handleSubmit = () => {
    if (!valid || submitting) return;
    onSubmit({ name: name.trim(), icon: String(icon), color, flow });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="90%" showClose={false}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 26 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 8,
          }}
        >
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {isEdit ? t('categories.form.editTitle') : t('categories.form.createTitle')}
          </Text>
          {isEdit && onDelete ? (
            <SheetDangerAction
              label={t('categories.form.delete')}
              confirmLabel={t('categories.form.deleteConfirm.confirm')}
              onConfirm={onDelete}
            />
          ) : null}
        </View>

        {/* What the row will actually look like. */}
        <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 14,
              paddingHorizontal: 14,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                backgroundColor: withAlpha(theme.palette.acc, 0.14),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={icon} size={19} stroke={1.8} color={theme.palette.acc2} />
            </View>
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 14.5 }}>
              {name.trim() || t('categories.form.previewPlaceholder')}
            </Text>
          </View>
        </View>

        {/* Flow is fixed after creation — a category that changes side would
            rewrite what every movement on it meant. */}
        {!isEdit ? (
          <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
            <FieldLabel>{t('categories.form.flowLabel')}</FieldLabel>
            <View
              style={{
                flexDirection: 'row',
                gap: 6,
                padding: 3,
                borderRadius: 14,
                backgroundColor: theme.colors.bgSurface,
              }}
            >
              {FLOWS.map((f) => {
                const active = f === flow;
                return (
                  <Pressable
                    key={f}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFlow(f)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 11,
                      backgroundColor: active ? theme.colors.bgElevated : 'transparent',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      color={
                        active ? theme.colors.textPrimary : theme.colors.textTertiary
                      }
                      style={{ fontSize: 12.5, fontWeight: '500' }}
                    >
                      {t(`categories.form.flow.${f}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
          <FieldLabel>{t('categories.form.nameLabel')}</FieldLabel>
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('categories.form.namePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={24}
            selectionColor={theme.palette.acc}
            onSubmitEditing={handleSubmit}
            style={{
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: errorMessage
                ? theme.colors.accentCoral
                : focused
                  ? withAlpha(theme.palette.acc, 0.4)
                  : theme.colors.borderSubtle,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 13,
              minHeight: 44,
              fontSize: 13.5,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
            }}
          />
          {errorMessage ? (
            <Text color={theme.colors.accentCoral} style={{ fontSize: 12, marginTop: 8 }}>
              {errorMessage}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
          <FieldLabel>{t('categories.form.iconLabel')}</FieldLabel>
          <View style={{ gap: 8 }}>
            {[0, 1].map((row) => (
              <View key={row} style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORY_ICON_OPTIONS.slice(row * 6, row * 6 + 6).map((ic) => {
                  const active = ic === icon;
                  return (
                    <Pressable
                      key={ic}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setIcon(ic as IconName)}
                      style={({ pressed }) => ({
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active
                          ? withAlpha(theme.palette.acc, 0.15)
                          : theme.colors.bgSurface,
                        borderWidth: 1,
                        borderColor: active
                          ? withAlpha(theme.palette.acc, 0.3)
                          : theme.colors.borderSubtle,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Icon
                        name={ic as IconName}
                        size={17}
                        stroke={1.8}
                        color={active ? theme.palette.acc2 : theme.colors.textSecondary}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* The colour is stored but no longer drawn anywhere in the redesign —
            every well in the app is the accent now. Kept because removing a
            field is not a styling decision. */}
        <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
          <FieldLabel>{t('categories.form.colorLabel')}</FieldLabel>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {CATEGORY_COLOR_OPTIONS.map((col) => {
              const active = col === color;
              const swatch = theme.colors[accentColorKey(col, 'fg')];
              return (
                <Pressable
                  key={col}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setColor(col)}
                  style={({ pressed }) => ({
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: swatch,
                    borderWidth: 2,
                    borderColor: active ? theme.colors.textPrimary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  {active ? (
                    <Icon
                      name="check"
                      size={15}
                      stroke={2.4}
                      color={theme.colors.bgBase}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !valid || submitting }}
            onPress={handleSubmit}
            disabled={!valid || submitting}
            style={({ pressed }) => ({
              minHeight: 52,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              backgroundColor: theme.colors.textPrimary,
              opacity: !valid || submitting ? 0.4 : pressed ? 0.9 : 1,
            })}
          >
            <Text color={theme.colors.bgBase} style={{ fontSize: 14, fontWeight: '600' }}>
              {isEdit ? t('categories.form.saveEdit') : t('categories.form.saveCreate')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function FieldLabel({ children }: { children: string }) {
  const { theme } = useTheme();

  return (
    <Text
      variant="micro"
      uppercase
      color={theme.colors.textTertiary}
      style={{ letterSpacing: 2.2, marginBottom: 9 }}
    >
      {children}
    </Text>
  );
}
