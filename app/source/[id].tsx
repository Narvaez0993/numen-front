import { useLocalSearchParams } from 'expo-router';

import { MovementsScreen } from '@/modules/movements/presentation/screens/MovementsScreen';

/**
 * One source's movements, as a stack route rather than the Movements tab.
 *
 * The tab cannot serve this: pushing `/movements` from Accounts stacks nothing
 * — expo-router returns to the tabs already mounted underneath and swaps the
 * active one, which dismisses Accounts and leaves the back button with nothing
 * to pop. Arriving somewhere you can leave requires a screen of your own.
 */
export default function SourceMovementsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MovementsScreen scopedSourceId={id} />;
}
