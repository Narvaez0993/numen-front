import { useEffect, useState } from 'react';

import { BottomSheet } from '@/shared/presentation/components';

import type { CandidateCategory } from '../../hooks/useWatchedCategories';

import { AddVigilanceBody } from './AddVigilanceSheet';
import { EditTopeBody } from './EditTopeSheet';

type Props = {
  visible: boolean;
  candidates: CandidateCategory[];
  saving?: boolean;
  onClose: () => void;
  onSave: (categoryId: string, amount: number) => void;
};

/**
 * Starting to watch a category: pick one, then say how much.
 *
 * Two steps, **one sheet**. The first version was two sheets handing over on a
 * 280ms timer, chosen because React Native only shows one `Modal` at a time on
 * iOS — and it did not work: the picker was still animating out when the cap
 * sheet tried to mount, and picking a category did nothing at all, with no
 * error to explain it.
 *
 * The timer was the tell. Choreographing two modals by guessing how long the
 * other takes to leave is a race whichever number you pick; the fix is to have
 * one modal and change what is inside it. It also reads better — the sheet you
 * opened stays put and answers its own second question, instead of blinking out
 * and being replaced by something that looks like a different decision.
 */
export function WatchCategoryFlow({
  visible,
  candidates,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [picked, setPicked] = useState<CandidateCategory | null>(null);

  // Each opening starts at the picker, whatever the last one ended on.
  useEffect(() => {
    if (visible) setPicked(null);
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="82%">
      {picked === null ? (
        <AddVigilanceBody candidates={candidates} onPick={setPicked} />
      ) : (
        <EditTopeBody
          category={{
            categoryId: picked.id,
            name: picked.name,
            icon: picked.icon,
            color: picked.color,
            spent: picked.spent,
          }}
          current={0}
          saving={saving}
          resetKey={picked.id}
          onSave={(amount) => onSave(picked.id, amount)}
        />
      )}
    </BottomSheet>
  );
}
