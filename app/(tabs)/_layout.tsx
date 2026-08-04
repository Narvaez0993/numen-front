import { Tabs, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAgentFeed } from '@/modules/assistant/presentation/hooks/useAgentFeed';
import { ExpenseSheet } from '@/modules/expenses/presentation/components/ExpenseSheet';
import { useExpenseSheetStore } from '@/modules/expenses/presentation/stores/useExpenseSheetStore';
import { Icon, FAB } from '@/shared/presentation/components';
import {
  GlassTabBar,
  useFloatingTabBarClearance,
} from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';

export default function TabsLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const pathname = usePathname();
  const openSheet = useExpenseSheetStore((s) => s.openSheet);
  const clearance = useFloatingTabBarClearance();
  const today = useMemo(() => toIsoDate(new Date()), []);
  // Same query Home's banner and summaries row read — one fetch, three
  // surfaces. The dot sits on HOME because that is where the agent delivers;
  // on the chat it promised something the conversation no longer holds.
  const feed = useAgentFeed(today);
  const unseen = (feed.data?.unseenCount ?? 0) > 0;

  // Hide FAB on assistant per the brief
  const hideFab = pathname.endsWith('/assistant');

  return (
    <>
      <Tabs
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.bgBase },
          tabBarActiveTintColor: theme.colors.accentMint,
          tabBarInactiveTintColor: theme.colors.textTertiary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, focused }) => (
              <View>
                <Icon name="home" size={22} stroke={focused ? 2.2 : 1.8} color={color} />
                {unseen ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -1,
                      right: -5,
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: theme.colors.accentMint,
                    }}
                  />
                ) : null}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="movements"
          options={{
            title: t('tabs.movements'),
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name="list-details"
                size={22}
                stroke={focused ? 2.2 : 1.8}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="budgets"
          options={{
            title: t('tabs.budgets'),
            tabBarIcon: ({ color, focused }) => (
              <Icon name="target" size={22} stroke={focused ? 2.2 : 1.8} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: t('tabs.assistant'),
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name="sparkles"
                size={22}
                stroke={focused ? 2.2 : 1.8}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      {!hideFab ? <FAB onPress={openSheet} bottomOffset={clearance + 4} /> : null}
      <ExpenseSheet />
    </>
  );
}
