import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, TextInput, View } from 'react-native';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

const PROCESSING_MS = 1300;

export function WritingState() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const setTranscript = useExpenseSheetStore((s) => s.setTranscript);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    const tid = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(tid);
  }, [opacity]);

  const valid = text.trim().length >= 3;
  const examples = t('expenses.sheet.writing.examples', {
    returnObjects: true,
  }) as string[];

  const handleSubmit = () => {
    if (!valid) return;
    setTranscript(text.trim());
    setFlow('processing');
    setTimeout(() => setFlow('confirm'), PROCESSING_MS);
  };

  const appendExample = (example: string) => {
    setText((prev) => (prev ? `${prev}, ${example}` : example));
    inputRef.current?.focus();
  };

  return (
    <Animated.View style={{ gap: 14, paddingTop: 4, opacity }}>
      <View style={{ paddingHorizontal: 40 }}>
        <Text variant="h1" style={{ fontSize: 16, textAlign: 'center' }}>
          {t('expenses.sheet.writing.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          {t('expenses.sheet.writing.subtitle')}
        </Text>
      </View>

      <View style={{ position: 'relative' }}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('expenses.sheet.writing.placeholder')}
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: focused ? theme.colors.accentMint : theme.colors.borderSubtle,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            paddingRight: 38,
            fontSize: 14,
            color: theme.colors.textPrimary,
            fontFamily: 'Geist_400Regular',
            lineHeight: 21,
            minHeight: 110,
          }}
        />
        {text.length > 0 ? (
          <Pressable
            onPress={() => setText('')}
            hitSlop={8}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 10,
              right: 10,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: theme.colors.bgElevated,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="x" size={11} color={theme.colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 4,
        }}
      >
        <Icon name="sparkles" size={13} color={theme.colors.accentPurple} />
        <Text variant="caption" muted style={{ fontSize: 11.5, flex: 1 }}>
          {t('expenses.sheet.writing.iaHint')}
        </Text>
      </View>

      <View>
        <Text
          variant="micro"
          muted
          uppercase
          style={{
            fontSize: 10.5,
            letterSpacing: 1.05,
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          {t('expenses.sheet.writing.examplesLabel')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {examples.map((example) => (
            <Pressable
              key={example}
              onPress={() => appendExample(example)}
              style={({ pressed }) => ({
                paddingHorizontal: 11,
                paddingVertical: 7,
                borderRadius: 10,
                backgroundColor: theme.colors.bgFloat,
                borderColor: theme.colors.borderSubtle,
                borderWidth: 1,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                variant="label"
                color={theme.colors.textSecondary}
                style={{ fontSize: 11.5 }}
              >
                {example}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        label={t('expenses.sheet.writing.cta')}
        full
        disabled={!valid}
        onPress={handleSubmit}
      />
    </Animated.View>
  );
}
