import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  DebtDraft,
  DebtDraftOverrides,
  DraftOverrides,
  MovementDraft,
} from '@/modules/assistant/domain/types/Assistant';
import { DebtDraftCard } from '@/modules/assistant/presentation/components/DebtDraftCard';
import { DraftCard } from '@/modules/assistant/presentation/components/DraftCard';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  drafts: MovementDraft[];
  debtDrafts: DebtDraft[];
  today: string;
  /** What the mic heard — `null` for typed captures, which need no echo. */
  transcript: string | null;
  busyDraftId: string | null;
  error: string | null;
  onClose: () => void;
  onConfirm: (draft: MovementDraft, overrides?: DraftOverrides) => void;
  onEdit: (draft: MovementDraft) => void;
  onDiscard: (draft: MovementDraft) => void;
  onConfirmDebt: (draft: DebtDraft, overrides?: DebtDraftOverrides) => void;
  onDiscardDebt: (draft: DebtDraft) => void;
};

/**
 * A capture that still has questions, on a whole screen.
 *
 * It exists because the sheet was the wrong container for this moment. Answering
 * "which debt" and "which account" is two decisions, each needing a list, and a
 * sheet showed them stacked and squeezed — a form pretending to be a card. Height
 * was never the fix: more room for three cramped questions is still three cramped
 * questions. Room plus separation is.
 *
 * The sheet keeps the other half of the job, and keeps it precisely because it is
 * the common one: most captures ask nothing at all and never reach this screen —
 * they save themselves and offer an undo. Speaking should cost one breath; only
 * being asked something should cost a screen.
 */
export function CaptureConfirmScreen({
  visible,
  drafts,
  debtDrafts,
  today,
  transcript,
  busyDraftId,
  error,
  onClose,
  onConfirm,
  onEdit,
  onDiscard,
  onConfirmDebt,
  onDiscardDebt,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const total = drafts.length + debtDrafts.length;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView
        edges={['bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <View
          style={{
            paddingTop: Math.max(insets.top, 44) + 8,
            paddingBottom: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            hitSlop={14}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name="x" size={16} stroke={1.9} color={theme.colors.textSecondary} />
          </Pressable>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 6,
            paddingBottom: 32,
            gap: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '500', letterSpacing: -0.6 }}>
              {total > 1
                ? t('expenses.sheet.confirm.titleMany', { count: total })
                : t('expenses.sheet.confirm.title')}
            </Text>
            {transcript !== null ? (
              <Text
                color={theme.colors.textSecondary}
                style={{ fontSize: 13, lineHeight: 18.85 }}
              >
                {t('expenses.sheet.confirm.said')}{' '}
                <Text style={{ fontSize: 13 }}>“{transcript}”</Text>
              </Text>
            ) : null}
          </View>

          <View style={{ gap: 14 }}>
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                busy={busyDraftId === draft.id}
                onConfirm={(overrides) => onConfirm(draft, overrides)}
                onEdit={() => onEdit(draft)}
                onDiscard={() => onDiscard(draft)}
              />
            ))}
            {debtDrafts.map((draft) => (
              <DebtDraftCard
                key={draft.id}
                debtDraft={draft}
                today={today}
                busy={busyDraftId === draft.id}
                onConfirm={(overrides) => onConfirmDebt(draft, overrides)}
                onDiscard={() => onDiscardDebt(draft)}
              />
            ))}
          </View>

          {error ? (
            <Text
              variant="caption"
              color={theme.colors.accentCoral}
              style={{ fontSize: 12, lineHeight: 17 }}
            >
              {error}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
