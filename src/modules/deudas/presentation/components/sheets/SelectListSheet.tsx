import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { BottomSheet, Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { SelectOption } from '../../constants/options';

type Props<T> = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: SelectOption<T>[];
  value: T;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSelect: (opt: SelectOption<T>) => void;
  onClose: () => void;
};

export function SelectListSheet<T>({
  visible,
  title,
  subtitle,
  options,
  value,
  searchable = false,
  searchPlaceholder,
  onSelect,
  onClose,
}: Props<T>) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const filtered =
    searchable && query.trim()
      ? options.filter((o) =>
          (o.label ?? String(o.value)).toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="78%">
      <View style={{ paddingTop: 14, paddingHorizontal: 22, paddingRight: 60 }}>
        <Text
          style={{
            fontSize: 19,
            fontWeight: '500',
            letterSpacing: -0.38,
            marginBottom: 6,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            color={theme.colors.textSecondary}
            style={{ fontSize: 13, lineHeight: 18.85 }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {searchable ? (
        <View style={{ paddingTop: 12, paddingHorizontal: 22 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 12,
            }}
          >
            <Icon
              name="search"
              size={15}
              stroke={1.8}
              color={theme.colors.textTertiary}
            />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.colors.textTertiary}
              style={{
                flex: 1,
                color: theme.colors.textPrimary,
                fontSize: 13,
                fontFamily: 'Geist_400Regular',
                padding: 0,
              }}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={6}>
                <Icon name="x" size={13} color={theme.colors.textTertiary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <ScrollView
        style={{ marginTop: 12 }}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={{ paddingVertical: 32 }}>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 13, textAlign: 'center' }}
            >
              Sin resultados
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {filtered.map((opt, i) => {
              const active = opt.value === value;
              const accent = opt.color && opt.color !== 'neutral' ? opt.color : null;
              const iconBg = accent
                ? theme.colors[accentColorKey(accent, 'bg')]
                : 'rgba(168,178,200,0.12)';
              const iconFg = accent
                ? theme.colors[accentColorKey(accent, 'fg')]
                : theme.colors.textSecondary;
              return (
                <Pressable
                  key={String(opt.value ?? `idx-${i}`)}
                  onPress={() => onSelect(opt)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    backgroundColor: active ? theme.colors.bgElevated : 'transparent',
                    borderBottomWidth: i === filtered.length - 1 ? 0 : 1,
                    borderBottomColor: theme.colors.borderSubtle,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  {opt.icon ? (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: iconBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={opt.icon} size={15} stroke={1.9} color={iconFg} />
                    </View>
                  ) : null}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13.5,
                        fontWeight: '500',
                        letterSpacing: -0.135,
                      }}
                    >
                      {opt.label}
                    </Text>
                    {opt.sub ? (
                      <Text
                        color={theme.colors.textTertiary}
                        numberOfLines={1}
                        style={{ fontSize: 11.5, marginTop: 2 }}
                      >
                        {opt.sub}
                      </Text>
                    ) : null}
                  </View>
                  {active ? (
                    <Icon
                      name="check"
                      size={15}
                      stroke={2.4}
                      color={theme.colors.accentMint}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}
