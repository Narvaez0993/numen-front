import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  TextInput,
  type TextInput as TextInputType,
  View,
} from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

function formatThousands(n: number): string {
  if (!n) return '';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

type Props = {
  value: number;
  onChange: (value: number) => void;
  presets: number[];
  size?: 'large' | 'small';
  autoFocus?: boolean;
};

export function BudgetInputHero({
  value,
  onChange,
  presets,
  size = 'large',
  autoFocus = true,
}: Props) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInputType>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => inputRef.current?.focus(), 240);
    return () => clearTimeout(t);
  }, [autoFocus]);

  const display = value > 0 ? formatThousands(value) : '';
  const fontSize = size === 'large' ? 44 : 32;
  const dollarSize = size === 'large' ? 24 : 18;

  const borderColor = focused ? theme.colors.accentMint : theme.colors.borderDefault;

  return (
    <View>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 4,
          paddingVertical: size === 'large' ? 14 : 10,
          borderBottomWidth: 2,
          borderBottomColor: borderColor,
        }}
      >
        <Text
          color={theme.colors.textSecondary}
          style={{ fontSize: dollarSize, fontWeight: '400' }}
        >
          $
        </Text>
        <TextInput
          ref={inputRef}
          keyboardType="numeric"
          inputMode="numeric"
          value={display}
          onChangeText={(text) => {
            const raw = text.replace(/\D/g, '').slice(0, 12);
            onChange(raw === '' ? 0 : parseInt(raw, 10));
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          placeholderTextColor={theme.colors.textTertiary}
          style={{
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            fontSize,
            fontFamily: 'Geist_500Medium',
            letterSpacing: -1.1,
            fontVariant: ['tabular-nums'],
            textAlign: value > 0 ? 'left' : 'center',
            minWidth: 60,
            maxWidth: 260,
            padding: 0,
            includeFontPadding: false,
          }}
        />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingTop: size === 'large' ? 20 : 14,
          paddingHorizontal: 4,
        }}
      >
        {presets.map((p) => {
          const active = value === p;
          return (
            <Pressable
              key={p}
              onPress={() => onChange(p)}
              style={({ pressed }) => ({
                paddingHorizontal: size === 'large' ? 14 : 12,
                paddingVertical: size === 'large' ? 8 : 7,
                borderRadius: 100,
                backgroundColor: active
                  ? theme.colors.accentMintBg
                  : theme.colors.bgSurface,
                borderWidth: 1,
                borderColor: active ? 'transparent' : theme.colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                color={active ? theme.colors.accentMint : theme.colors.textSecondary}
                tabular
                style={{ fontSize: 12.5, fontWeight: '500' }}
              >
                {formatCOP(p)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
