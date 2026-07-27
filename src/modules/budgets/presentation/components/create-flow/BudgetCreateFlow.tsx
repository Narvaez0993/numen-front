import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { SegmentProgress } from '@/modules/onboarding/presentation/components/SegmentProgress';

import { TECHO_MIN } from '../../constants/presets';
import { CreateCategorySheet } from '../sheets/CreateCategorySheet';
import { ConfirmSheet } from '../sheets/ConfirmSheet';
import { EditTopeSheet } from '../sheets/EditTopeSheet';

import { CreateStep1 } from './CreateStep1';
import { CreateStep2 } from './CreateStep2';

import type { CandidateCategory } from '../../hooks/useWatchedCategories';
import type { CreatedCategory } from '../sheets/CreateCategorySheet';

type Props = {
  visible: boolean;
  categories: CandidateCategory[];
  /** The real month of the snapshot. */
  monthName: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (techo: number, topes: Record<string, number>) => void;
};

/**
 * Two steps: the month's ceiling, then the categories to watch. Both are saved by the
 * caller in one go, so a flow abandoned halfway leaves nothing behind.
 */
export function BudgetCreateFlow({
  visible,
  categories,
  monthName,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2>(1);
  const [techo, setTecho] = useState(2500000);
  const [draftTopes, setDraftTopes] = useState<Record<string, number>>({});
  const [topeSheetFor, setTopeSheetFor] = useState<CandidateCategory | null>(null);
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setTecho(2500000);
      setDraftTopes({});
      setTopeSheetFor(null);
      setCreateCatOpen(false);
      setExitConfirm(false);
    }
  }, [visible]);

  const validTecho = techo >= TECHO_MIN;
  const hasDraft = Object.keys(draftTopes).length > 0 || techo !== 2500000;

  const handleRequestClose = () => {
    if (step === 1 && techo === 2500000) {
      onClose();
      return;
    }
    if (!hasDraft) {
      onClose();
      return;
    }
    setExitConfirm(true);
  };

  const handlePrimary = () => {
    if (step === 1) {
      if (validTecho) setStep(2);
    } else {
      onSave(techo, draftTopes);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        {/* Top bar */}
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Pressable
            onPress={step === 1 ? handleRequestClose : () => setStep(1)}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon
              name={step === 1 ? 'x' : 'arrow-left'}
              size={16}
              color={theme.colors.textSecondary}
            />
          </Pressable>
          <Text
            variant="micro"
            color={theme.colors.textTertiary}
            uppercase
            style={{ fontSize: 11, letterSpacing: 1.1, fontWeight: '500' }}
          >
            {t('budgets.create.step', { current: step, total: 2 })}
          </Text>
          {step === 2 ? (
            <Pressable
              onPress={() => onSave(techo, {})}
              hitSlop={8}
              style={({ pressed }) => ({
                paddingVertical: 8,
                paddingHorizontal: 4,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                variant="label"
                color={theme.colors.textSecondary}
                style={{ fontSize: 13 }}
              >
                {t('budgets.create.skip')}
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>

        {/* Progress */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
          <SegmentProgress total={2} current={step - 1} />
        </View>

        {/* Body */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <CreateStep1 techo={techo} onChange={setTecho} monthName={monthName} />
          ) : (
            <CreateStep2
              techo={techo}
              categories={categories}
              topes={draftTopes}
              onOpenTope={(c) => setTopeSheetFor(c)}
              onCreateCategory={() => setCreateCatOpen(true)}
            />
          )}
        </ScrollView>

        {/* CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Button
            full
            label={step === 1 ? t('budgets.create.next') : t('budgets.create.save')}
            disabled={saving || (step === 1 && !validTecho)}
            onPress={handlePrimary}
          />
        </View>

        {/* Nested tope sheet */}
        <EditTopeSheet
          visible={topeSheetFor != null}
          category={
            topeSheetFor
              ? {
                  categoryId: topeSheetFor.id,
                  name: topeSheetFor.name,
                  icon: topeSheetFor.icon,
                  color: topeSheetFor.color,
                  spent: topeSheetFor.spent,
                }
              : null
          }
          current={topeSheetFor ? (draftTopes[topeSheetFor.id] ?? 0) : 0}
          onClose={() => setTopeSheetFor(null)}
          onSave={(amount) => {
            if (!topeSheetFor) return;
            setDraftTopes((prev) => ({ ...prev, [topeSheetFor.id]: amount }));
            setTopeSheetFor(null);
          }}
          onDelete={() => {
            if (!topeSheetFor) return;
            setDraftTopes((prev) => {
              const next = { ...prev };
              delete next[topeSheetFor.id];
              return next;
            });
            setTopeSheetFor(null);
          }}
        />

        {/* Nested create-category sheet */}
        <CreateCategorySheet
          visible={createCatOpen}
          onClose={() => setCreateCatOpen(false)}
          onSave={(created: CreatedCategory) => {
            setCreateCatOpen(false);
            // Wait for the create-category sheet to fully close before opening the tope
            // sheet — RN can't have two Modals visible at the same time.
            setTimeout(() => setTopeSheetFor({ ...created, spent: 0 }), 280);
          }}
        />

        {/* Exit confirm */}
        <ConfirmSheet
          visible={exitConfirm}
          title={t('budgets.create.step2.exitTitle')}
          body={t('budgets.create.step2.exitBody')}
          confirmLabel={t('budgets.create.step2.exitCta')}
          onConfirm={() => {
            setExitConfirm(false);
            onClose();
          }}
          onClose={() => setExitConfirm(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}
