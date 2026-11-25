import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { useColors } from '@theme';
import { useTranslation } from 'react-i18next';
import { Layout } from '@design/tokens';
import {
  DashboardScreen,
  ConnectionScreen,
  SettingsScreen,
  EditModeScreen,
} from '@screens';
import {
  LayoutDashboard,
  MonitorSmartphone,
  ChartNoAxesCombined,
  Settings,
} from 'lucide-react-native';
import {
  BottomNavVisibilityProvider,
  useBottomNavVisibility,
} from '@navigator/BottomNavVisibility';
import { ErrorBoundary } from '@components/base/ErrorBoundary';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function Wrapped(props: P) {
    const { t } = useTranslation();
    return (
      <ErrorBoundary fallback={t('errors.screenError')}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

function createTabBarOptions(
  colors: ReturnType<typeof import('../theme').useColors>,
  insets: { bottom: number }
) {
  return {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: Layout.tabBarHeight + insets.bottom,
      paddingBottom: Math.max(4, insets.bottom),
      paddingHorizontal: 8,
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '700' as const,
      marginTop: 2,
    },
    headerShown: false,
  };
}

export function AppNavigator() {
  const colors = useColors();

  return (
    <NavigationContainer>
      <BottomNavVisibilityProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Root" component={withErrorBoundary(RootTabs)} />
          <Stack.Screen
            name="Connection"
            component={withErrorBoundary(ConnectionScreen)}
            options={{
              animation: 'fade',
              cardStyle: { backgroundColor: colors.background },
            }}
          />
          <Stack.Screen
            name="Settings"
            component={withErrorBoundary(SettingsScreen)}
            options={{
              animation: 'slide_from_right',
              cardStyle: { backgroundColor: colors.background },
            }}
          />
          <Stack.Screen
            name="EditMode"
            component={withErrorBoundary(EditModeScreen)}
            options={{
              animation: 'slide_from_right',
              cardStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack.Navigator>
      </BottomNavVisibilityProvider>
    </NavigationContainer>
  );
}

function RootTabs() {
  const colors = useColors();
  const { t } = useTranslation();
  const { isBottomNavVisible } = useBottomNavVisibility();
  const insets = useSafeAreaInsets();
  const tabBarOptions = useMemo(
    () => createTabBarOptions(colors, insets),
    [colors, insets]
  );

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        ...tabBarOptions,
        tabBarStyle: isBottomNavVisible
          ? tabBarOptions.tabBarStyle
          : {
              display: 'none',
            },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('nav.dashboard'),
          tabBarIcon: ({ focused }) => (
            <LayoutDashboard
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              stroke={focused ? colors.primary : colors.textMuted}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Connection"
        component={ConnectionScreen}
        options={{
          title: t('nav.connection'),
          tabBarIcon: ({ focused }) => (
            <MonitorSmartphone
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              stroke={focused ? colors.primary : colors.textMuted}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Metrics"
        component={DashboardScreen}
        options={{
          title: t('nav.metrics'),
          tabBarIcon: ({ focused }) => (
            <ChartNoAxesCombined
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              stroke={focused ? colors.primary : colors.textMuted}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ focused }) => (
            <Settings
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              stroke={focused ? colors.primary : colors.textMuted}
              fill="none"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
