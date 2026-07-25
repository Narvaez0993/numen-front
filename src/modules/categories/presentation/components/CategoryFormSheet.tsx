import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Pressable,
  ScrollView,
  type TextInput as TextInputType,
  TextInput,
  View,
} from 'react-native';

import type { AccentColor } from '@/shared/domain';
import {
  BottomSheet,
  Button,
  Icon,
  type IconName,
  Text,
} from '@/shared/presentation/components';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from '@/shared/presentation/constants/categoryOptions';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

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
  const previewBg = theme.colors[accentColorKey(color, 'bg')];
  const previewFg = theme.colors[accentColorKey(color, 'fg')];

  const handleSubmit = () => {
    if (!valid || submitting) return;
    onSubmit({ name: name.trim(), icon: String(icon), color, flow });
  };

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      t('categories.form.deleteConfirm.title'),
      t('categories.form.deleteConfirm.body'),
      [
        { text: t('categories.form.deleteConfirm.cancel'), style: 'cancel' },
        {
          text: t('categories.form.deleteConfirm.confirm'),
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="90%">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: 26,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingTop: 8, paddingBottom: 16, paddingRight: 40 }}>
          <Text variant="h1" style={{ fontSize: 19, marginBottom: 8 }}>
            {isEdit ? t('categories.form.editTitle') : t('categories.form.createTitle')}
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            style={{ fontSize: 13, lineHeight: 18.9 }}
          >
            {t('categories.form.subtitle')}
          </Text>
        </View>

        {/* Preview */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 14,
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 14,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: previewBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={19} color={previewFg} stroke={1.8} />
          </View>
          <Text variant="bodyLarge" style={{ flex: 1, fontSize: 14.5 }} numberOfLines={1}>
            {name.trim() || t('categories.form.previewPlaceholder')}
          </Text>
        </View>

        {/* Flow toggle (create only — flow is fixed after creation) */}
        {!isEdit ? (
          <View style={{ marginBottom: 18 }}>
            <FieldLabel>{t('categories.form.flowLabel')}</FieldLabel>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FLOWS.map((f) => {
                const active = f === flow;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFlow(f)}
                    style={{
                      flex: 1,
                      paddingVertical: 11,
                      borderRadius: 11,
                      alignItems: 'center',
                      backgroundColor: active ? theme.colors.bgFloat : 'transparent',
                      borderWidth: active ? 2 : 1,
                      borderColor: active
                        ? theme.colors.accentMint
                        : theme.colors.borderSubtle,
                    }}
                  >
                    <Text
                      variant="label"
                      color={
                        active ? theme.colors.textPrimary : theme.colors.textSecondary
                      }
                      style={{ fontSize: 13 }}
                    >
                      {t(`categories.form.flow.${f}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Name */}
        <View style={{ marginBottom: 6 }}>
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
            onSubmitEditing={handleSubmit}
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: errorMessage
                ? theme.colors.accentCoral
                : focused
                  ? theme.colors.accentMint
                  : theme.colors.borderSubtle,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
            }}
          />
        </View>
        <View style={{ minHeight: 18, marginBottom: 12 }}>
          {errorMessage ? (
            <Text
              variant="caption"
              style={{ color: theme.colors.accentCoral, fontSize: 12 }}
            >
              {errorMessage}
            </Text>
          ) : null}
        </View>

        {/* Icon grid */}
        <View style={{ marginBottom: 18 }}>
          <FieldLabel>{t('categories.form.iconLabel')}</FieldLabel>
          <View style={{ gap: 8 }}>
            {[0, 1].map((row) => (
              <View key={row} style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORY_ICON_OPTIONS.slice(row * 6, row * 6 + 6).map((ic) => {
                  const active = ic === icon;
                  return (
                    <Pressable
                      key={ic}
                      onPress={() => setIcon(ic as IconName)}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        backgroundColor: active ? theme.colors.bgFloat : 'transparent',
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? previewFg : theme.colors.borderSubtle,
                        borderRadius: 11,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name={ic as IconName}
                        size={17}
                        color={active ? previewFg : theme.colors.textSecondary}
                        stroke={1.8}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Color picker */}
        <View style={{ marginBottom: 22 }}>
          <FieldLabel>{t('categories.form.colorLabel')}</FieldLabel>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {CATEGORY_COLOR_OPTIONS.map((col) => {
              const active = col === color;
              const swatchFg = theme.colors[accentColorKey(col, 'fg')];
              return (
                <Pressable
                  key={col}
                  onPress={() => setColor(col)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: swatchFg,
                    borderWidth: 2,
                    borderColor: active ? theme.colors.textPrimary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active ? (
                    <Icon name="check" size={15} color="#0A0E1A" stroke={2.4} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          full
          label={isEdit ? t('categories.form.saveEdit') : t('categories.form.saveCreate')}
          disabled={!valid}
          loading={submitting}
          onPress={handleSubmit}
        />

        {isEdit && onDelete ? (
          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            style={({ pressed }) => ({
              alignItems: 'center',
              paddingVertical: 12,
              marginTop: 4,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              variant="label"
              color={theme.colors.accentCoral}
              style={{ fontSize: 13 }}
            >
              {t('categories.form.delete')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

function FieldLabel({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text
      variant="micro"
      color={theme.colors.textTertiary}
      uppercase
      style={{ fontSize: 10.5, letterSpacing: 1.05, marginBottom: 8, fontWeight: '500' }}
    >
      {children}
    </Text>
  );
}
