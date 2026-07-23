import { Tabs, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExpenseSheet } from '@/modules/expenses/presentation/components/ExpenseSheet';
import { useExpenseSheetStore } from '@/modules/expenses/presentation/stores/useExpenseSheetStore';
import { Icon, FAB } from '@/shared/presentation/components';
import {
  GlassTabBar,
  useFloatingTabBarClearance,
} from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';

export default function TabsLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const pathname = usePathname();
  const openSheet = useExpenseSheetStore((s) => s.openSheet);
  const clearance = useFloatingTabBarClearance();

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
              <Icon name="home" size={22} stroke={focused ? 2.2 : 1.8} color={color} />
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
