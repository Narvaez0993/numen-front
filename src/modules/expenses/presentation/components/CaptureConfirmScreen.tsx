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
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  visible: boolean;
  drafts: MovementDraft[];
  debtDrafts: DebtDraft[];
  today: string;
  /** What the mic heard — `null` for typed captures, which need no echo. */
  transcript: string | null;
  busyDraftId: string | null;
  error: string | null;
  /** What the capture heard but could not record. Distinct from `error`: this is
   *  not a failure to save, it is a part of the sentence that never became a
   *  card, and without it the screen looks like it understood everything. */
  notice: string | null;
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
  notice,
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
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            hitSlop={14}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name="x" size={15} stroke={2} color={theme.colors.textSecondary} />
          </Pressable>
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
          <View style={{ gap: 10 }}>
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ letterSpacing: 2.4 }}
            >
              {t('expenses.sheet.confirm.eyebrow')}
            </Text>
            <Text style={{ fontSize: 29, fontWeight: '300', letterSpacing: -0.9 }}>
              {total > 1
                ? t('expenses.sheet.confirm.titleMany', { count: total })
                : t('expenses.sheet.confirm.title')}
            </Text>
            {transcript !== null ? (
              // What was heard, quoted back. The transcript is the one thing that
              // explains a card the user disagrees with — without it, a wrong
              // amount looks like the app inventing numbers rather than mishearing.
              <View
                style={{
                  borderLeftWidth: 2,
                  borderLeftColor: withAlpha(theme.palette.acc, 0.4),
                  paddingLeft: 12,
                }}
              >
                <Text
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 13.5, lineHeight: 19.5 }}
                >
                  {transcript}
                </Text>
              </View>
            ) : null}
          </View>

          {notice !== null ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                padding: 14,
                borderRadius: 16,
                backgroundColor: withAlpha(theme.colors.accentAmber, 0.12),
                borderWidth: 1,
                borderColor: withAlpha(theme.colors.accentAmber, 0.28),
              }}
            >
              <Icon
                name="alert-circle"
                size={16}
                stroke={1.9}
                color={theme.colors.accentAmber}
              />
              <Text
                color={theme.colors.textSecondary}
                style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}
              >
                {notice}
              </Text>
            </View>
          ) : null}

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
