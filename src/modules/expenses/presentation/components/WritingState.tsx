import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  /** The agent's one short question after an ambiguous capture. */
  clarification: string | null;
  /** What the user already said — editable, so answering means completing. */
  initialText: string;
  busy: boolean;
  error: string | null;
  onSubmit: (text: string) => void;
};

/** The «Escribir» method: natural language in, the same parse as the mic. */
export function WritingState({
  clarification,
  initialText,
  busy,
  error,
  onSubmit,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [text, setText] = useState(initialText);

  const canSubmit = text.trim().length >= 3 && !busy;

  return (
    <View style={{ paddingTop: 4, gap: 14 }}>
      <View>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {t('expenses.sheet.writing.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4 }}
        >
          {t('expenses.sheet.writing.subtitle')}
        </Text>
      </View>

      {clarification !== null ? (
        <View
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text
            variant="caption"
            color={theme.colors.accentMint}
            style={{ marginBottom: 2 }}
          >
            {t('expenses.sheet.writing.agentAsks')}
          </Text>
          <Text variant="body">{clarification}</Text>
        </View>
      ) : null}

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('expenses.sheet.writing.placeholder')}
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        autoFocus
        maxLength={500}
        style={{
          minHeight: 88,
          textAlignVertical: 'top',
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_400Regular',
        }}
      />

      {error ? (
        <Text
          variant="caption"
          style={{ color: theme.colors.accentCoral, fontSize: 12, textAlign: 'center' }}
        >
          {error}
        </Text>
      ) : null}

      <Button
        label={t('expenses.sheet.writing.cta')}
        full
        disabled={!canSubmit}
        loading={busy}
        onPress={() => onSubmit(text)}
      />
    </View>
  );
}
