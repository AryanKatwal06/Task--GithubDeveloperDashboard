/**
 * Bottom Tabs Navigator
 *
 * Main app navigation - bottom tabs with icons and labels
 * Each tab contains its own stack navigator for independent navigation histories
 *
 * Features:
 * - Theme-aware styling (light/dark mode)
 * - Custom tab styling
 * - Lazy loading of stack navigators
 * - Accessibility support (labels for each tab)
 */

import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';

import type { BottomTabsParamList } from '../types/navigation';

import { useTheme } from '@hooks/useTheme';

import {
  HomeStackNavigator,
  RepositoriesStackNavigator,
  DevelopersStackNavigator,
  SettingsStackNavigator,
} from './stacks';

// ============================================================================
// TAB NAVIGATOR SETUP
// ============================================================================

const Tab = createBottomTabNavigator<BottomTabsParamList>();

// ============================================================================
// CUSTOM TAB ICON COMPONENT
// ============================================================================

/**
 * Custom Tab Icon
 * Since we can't use icon libraries, we create simple shapes
 *
 * In production, consider:
 * - react-native-vector-icons (small, widely used)
 * - Custom SVG icons via react-native-svg
 * - PNG icons as images
 */
interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const HomeIcon: React.FC<TabIconProps> = ({ focused, color }) => (
  <View
    style={[
      styles.iconBox,
      {
        backgroundColor: focused ? color : 'transparent',
        borderColor: color,
      },
    ]}
  >
    <Text style={{ fontSize: 16, color: focused ? 'white' : color }}>🏠</Text>
  </View>
);

const RepositoriesIcon: React.FC<TabIconProps> = ({ focused, color }) => (
  <View
    style={[
      styles.iconBox,
      {
        backgroundColor: focused ? color : 'transparent',
        borderColor: color,
      },
    ]}
  >
    <Text style={{ fontSize: 16, color: focused ? 'white' : color }}>📦</Text>
  </View>
);

const DevelopersIcon: React.FC<TabIconProps> = ({ focused, color }) => (
  <View
    style={[
      styles.iconBox,
      {
        backgroundColor: focused ? color : 'transparent',
        borderColor: color,
      },
    ]}
  >
    <Text style={{ fontSize: 16, color: focused ? 'white' : color }}>👨‍💻</Text>
  </View>
);

const SettingsIcon: React.FC<TabIconProps> = ({ focused, color }) => (
  <View
    style={[
      styles.iconBox,
      {
        backgroundColor: focused ? color : 'transparent',
        borderColor: color,
      },
    ]}
  >
    <Text style={{ fontSize: 16, color: focused ? 'white' : color }}>⚙️</Text>
  </View>
);

// ============================================================================
// BOTTOM TABS NAVIGATOR
// ============================================================================

export const BottomTabsNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Memoize options to prevent unnecessary re-renders
  const tabScreenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        paddingVertical: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600' as const,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textTertiary,
    }),
    [theme]
  );

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="RepositoriesStack"
        component={RepositoriesStackNavigator}
        options={{
          tabBarLabel: 'Repositories',
          tabBarIcon: RepositoriesIcon,
        }}
      />
      <Tab.Screen
        name="DevelopersStack"
        component={DevelopersStackNavigator}
        options={{
          tabBarLabel: 'Developers',
          tabBarIcon: DevelopersIcon,
        }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
