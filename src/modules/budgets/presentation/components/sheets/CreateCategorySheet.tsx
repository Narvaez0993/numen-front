import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  type TextInput as TextInputType,
  TextInput,
  View,
} from 'react-native';

import {
  BottomSheet,
  Button,
  Icon,
  type IconName,
  Pill,
  Text,
} from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import type { AccentColor } from '@/shared/domain';

import { useCreateCategory } from '@/modules/categories/presentation/hooks/useCreateCategory';

import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from '../../constants/presets';

/** What the caller gets back: a category that exists, with the id the server gave it. */
export type CreatedCategory = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (category: CreatedCategory) => void;
};

/**
 * Creates a real category through the categories module — it used to mint an id from
 * `Date.now()` and hand back a local object that no cap could ever be attached to.
 */
export function CreateCategorySheet({ visible, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const inputRef = useRef<TextInputType>(null);
  const create = useCreateCategory();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>('tag');
  const [color, setColor] = useState<AccentColor>('purple');
  const [focused, setFocused] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName('');
      setIcon('tag');
      setColor('purple');
      setFailed(null);
      const t = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const valid = name.trim().length >= 2;
  const previewBg = theme.colors[accentColorKey(color, 'bg')];
  const previewFg = theme.colors[accentColorKey(color, 'fg')];

  const handleSave = async () => {
    if (!valid || create.isPending) return;
    setFailed(null);
    try {
      const created = await create.mutateAsync({
        name: name.trim(),
        icon: String(icon),
        color,
        // A cap watches spending, so this sheet only ever makes expense categories.
        flow: 'expense',
      });
      onSave({
        id: created.id,
        name: created.name,
        icon: created.icon,
        color: created.color === 'neutral' ? 'mint' : (created.color as AccentColor),
      });
    } catch (error) {
      setFailed(error instanceof Error ? error.message : t('common.error'));
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: 26,
        }}
      >
        <View style={{ paddingTop: 8, paddingBottom: 16, paddingRight: 40 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Text variant="h1" style={{ fontSize: 19 }}>
              {t('budgets.createCategory.title')}
            </Text>
            <Pill variant="purple" uppercase style={{ paddingHorizontal: 7 }}>
              {t('budgets.createCategory.plus')}
            </Pill>
          </View>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            style={{ fontSize: 13, lineHeight: 18.9 }}
          >
            {t('budgets.createCategory.subtitle')}
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
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyLarge" style={{ fontSize: 14.5 }} numberOfLines={1}>
              {name.trim() || t('budgets.createCategory.previewPlaceholder')}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5, marginTop: 2 }}
            >
              {t('budgets.createCategory.preview')}
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={{ marginBottom: 18 }}>
          <Text
            variant="micro"
            color={theme.colors.textTertiary}
            uppercase
            style={{
              fontSize: 10.5,
              letterSpacing: 1.05,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            {t('budgets.createCategory.nameLabel')}
          </Text>
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('budgets.createCategory.namePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={24}
            onSubmitEditing={handleSave}
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: focused ? theme.colors.accentMint : theme.colors.borderSubtle,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
            }}
          />
        </View>

        {/* Icon grid */}
        <View style={{ marginBottom: 18 }}>
          <Text
            variant="micro"
            color={theme.colors.textTertiary}
            uppercase
            style={{
              fontSize: 10.5,
              letterSpacing: 1.05,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            {t('budgets.createCategory.iconLabel')}
          </Text>
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
          <Text
            variant="micro"
            color={theme.colors.textTertiary}
            uppercase
            style={{
              fontSize: 10.5,
              letterSpacing: 1.05,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            {t('budgets.createCategory.colorLabel')}
          </Text>
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
          label={t('budgets.createCategory.save')}
          disabled={!valid || create.isPending}
          onPress={handleSave}
        />

        {failed && (
          <Text
            variant="caption"
            color={theme.colors.accentCoral}
            style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}
          >
            {failed}
          </Text>
        )}

        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{
            fontSize: 10.5,
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 15.2,
          }}
        >
          {t('budgets.createCategory.footnote')}
        </Text>
      </ScrollView>
    </BottomSheet>
  );
}
