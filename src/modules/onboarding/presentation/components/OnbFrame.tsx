import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aurora } from '@/shared/presentation/components';

type Props = {
  children: React.ReactNode;
  /**
   * For the screens with fields. With the keyboard up, the title, the fields
   * and the button do not fit on a small phone; scrolling keeps the button
   * reachable instead of pushing it under the keyboard.
   */
  scroll?: boolean;
};

/**
 * The entry screens' frame: the aurora behind, the safe area, room for the
 * keyboard.
 *
 * The design paints the whole way in — welcome, account, code, name, objective —
 * on the aurora. The old screens sat on flat black, which is most of why they
 * read as a different app from the one they led into.
 */
export function OnbFrame({ children, scroll = false }: Props) {
  return (
    <Aurora>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Aurora>
  );
}
