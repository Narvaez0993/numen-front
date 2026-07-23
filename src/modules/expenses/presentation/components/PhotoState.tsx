import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, View } from 'react-native';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

import { ReceiptScanPreview } from './ReceiptScanPreview';

const SCAN_MS = 1900;
const PROCESSING_MS = 1300;

export function PhotoState() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const setTranscript = useExpenseSheetStore((s) => s.setTranscript);
  const [phase, setPhase] = useState<'idle' | 'captured'>('idle');
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  useEffect(() => {
    if (phase !== 'captured') return;
    const scan = setTimeout(() => {
      setTranscript(t('expenses.sheet.photo.demoTranscript'));
      setFlow('processing');
      const processing = setTimeout(() => setFlow('confirm'), PROCESSING_MS);
      return () => clearTimeout(processing);
    }, SCAN_MS);
    return () => clearTimeout(scan);
  }, [phase, setFlow, setTranscript, t]);

  const handleCapture = () => setPhase('captured');

  return (
    <Animated.View style={{ gap: 14, paddingTop: 4, opacity }}>
      <View style={{ paddingHorizontal: 40 }}>
        <Text variant="h1" style={{ fontSize: 16, textAlign: 'center' }}>
          {t('expenses.sheet.photo.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          {t('expenses.sheet.photo.subtitle')}
        </Text>
      </View>

      <View
        style={{
          height: 180,
          borderRadius: 16,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            phase === 'idle' ? theme.colors.bgFloat : theme.colors.bgElevated,
          borderWidth: phase === 'idle' ? 2 : 1,
          borderStyle: phase === 'idle' ? 'dashed' : 'solid',
          borderColor: theme.colors.borderDefault,
        }}
      >
        {phase === 'idle' ? (
          <View style={{ alignItems: 'center', gap: 10, padding: 24 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: theme.colors.bgSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                name="camera"
                size={22}
                stroke={1.6}
                color={theme.colors.textSecondary}
              />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="label" style={{ fontSize: 13 }}>
                {t('expenses.sheet.photo.dropzoneTitle')}
              </Text>
              <Text variant="caption" muted style={{ marginTop: 4, fontSize: 11.5 }}>
                {t('expenses.sheet.photo.dropzoneHint')}
              </Text>
            </View>
          </View>
        ) : (
          <ReceiptScanPreview />
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: theme.colors.accentPurpleBg,
          borderColor: 'rgba(139, 127, 255, 0.15)',
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Icon name="sparkles" size={14} color={theme.colors.accentPurple} />
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ flex: 1, fontSize: 11.5, lineHeight: 16 }}
        >
          {t('expenses.sheet.photo.iaHint')}
        </Text>
      </View>

      {phase === 'idle' ? (
        <View style={{ gap: 8 }}>
          <Button
            label={t('expenses.sheet.photo.take')}
            icon="camera"
            full
            onPress={handleCapture}
          />
          <Pressable
            onPress={handleCapture}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: theme.colors.bgFloat,
              borderColor: theme.colors.borderSubtle,
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 13,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name="image" size={16} color={theme.colors.textPrimary} />
            <Text variant="label" style={{ fontSize: 13.5 }}>
              {t('expenses.sheet.photo.gallery')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 4,
          }}
        >
          <Icon name="sparkles" size={13} color={theme.colors.accentPurple} />
          <Text
            variant="label"
            color={theme.colors.accentPurple}
            style={{ fontSize: 12.5 }}
          >
            {t('expenses.sheet.photo.analyzing')}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
