import { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { formatBalanceInput } from '../utils/formatBalanceInput';

import { OnbCTA } from './OnbCTA';
import { OnbTextLink } from './OnbTextLink';

type Props = {
  visible: boolean;
  name: string;
  onNameChange: (name: string) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onClose: () => void;
  title: string;
  hint: string;
  nameLabel: string;
  namePlaceholder: string;
  balanceLabel: string;
  saveLabel: string;
  skipLabel: string;
};

export function SetupBalanceSheet({
  visible,
  name,
  onNameChange,
  value,
  onChange,
  onSave,
  onSkip,
  onClose,
  title,
  hint,
  nameLabel,
  namePlaceholder,
  balanceLabel,
  saveLabel,
  skipLabel,
}: Props) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const formatted = formatBalanceInput(value);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={onClose}
          style={{ flex: 1, backgroundColor: theme.colors.scrim }}
        />
        <View
          style={{
            backgroundColor: theme.colors.bgSurface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            paddingHorizontal: 22,
            paddingTop: 8,
            paddingBottom: 28,
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 6 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.textTertiary,
                opacity: 0.4,
              }}
            />
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => ({
              position: 'absolute',
              top: 14,
              right: 14,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.bgFloat,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="x" size={15} color={theme.colors.textSecondary} />
          </Pressable>

          <View style={{ height: 18 }} />
          <Text variant="h1" style={{ fontSize: 18 }}>
            {title}
          </Text>
          <Text
            variant="caption"
            muted
            style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}
          >
            {hint}
          </Text>

          <View style={{ height: 18 }} />

          <Text
            variant="micro"
            muted
            uppercase
            style={{ fontSize: 10.5, letterSpacing: 1.05, marginBottom: 8 }}
          >
            {nameLabel}
          </Text>
          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder={namePlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 13,
              fontSize: 15,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_500Medium',
            }}
          />

          <View style={{ height: 14 }} />

          <Text
            variant="micro"
            muted
            uppercase
            style={{ fontSize: 10.5, letterSpacing: 1.05, marginBottom: 8 }}
          >
            {balanceLabel}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <Text
              variant="bodyLarge"
              color={theme.colors.textTertiary}
              style={{ fontSize: 22 }}
            >
              $
            </Text>
            <TextInput
              ref={inputRef}
              value={formatted}
              onChangeText={onChange}
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              inputMode="numeric"
              style={{
                flex: 1,
                color: theme.colors.textPrimary,
                fontSize: 22,
                fontFamily: 'Geist_500Medium',
                letterSpacing: -0.22,
                fontVariant: ['tabular-nums'],
                padding: 0,
              }}
            />
          </View>

          <View style={{ height: 18 }} />

          <OnbCTA onPress={onSave}>{saveLabel}</OnbCTA>
          <OnbTextLink onPress={onSkip} style={{ marginTop: 4 }}>
            {skipLabel}
          </OnbTextLink>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
