/**
 * Premium Bottom Tabs Navigator
 *
 * Modern animated navigation with:
 * - Smooth transitions and micro-interactions
 * - Professional vector icons
 * - Premium visual design
 * - Fluid animations
 * - Enhanced accessibility
 *
 * Inspired by Linear, Notion, and modern mobile apps
 */

import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/icons/Icon';

import type { BottomTabsParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';

import {
  HomeStackNavigator,
  RepositoriesStackNavigator,
  DevelopersStackNavigator,
  SettingsStackNavigator,
} from './stacks';

// ============================================================================
// PREMIUM TAB ICON COMPONENT
// ============================================================================

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  routeName: string;
}

const PremiumTabIcon: React.FC<TabIconProps> = ({ focused, color, size, routeName }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Icon mapping with premium Feather icons
  const getIconName = (route: string): string => {
    switch (route) {
      case 'HomeStack':
        return 'home';
      case 'RepositoriesStack':
        return 'package';
      case 'DevelopersStack':
        return 'users';
      case 'SettingsStack':
        return 'settings';
      default:
        return 'circle';
    }
  };

  // Animate on focus change
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 20,
      stiffness: 300,
    });
    rotation.value = withSpring(focused ? 0 : 5, {
      damping: 20,
      stiffness: 300,
    });
  }, [focused, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[animatedStyle, styles.iconContainer]}>
      <View
        style={[
          styles.iconBackground,
          {
            backgroundColor: focused ? color : 'transparent',
            borderColor: focused ? color : 'transparent',
          },
        ]}
      >
        <Icon
          name={getIconName(routeName)}
          size={size}
          color={focused ? '#FFFFFF' : color}
          style={styles.icon}
        />
      </View>
    </Animated.View>
  );
};

// ============================================================================
// BOTTOM TABS NAVIGATOR
// ============================================================================

const Tab = createBottomTabNavigator<BottomTabsParamList>();

export const BottomTabsNavigator: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, theme.spacing.sm) + theme.spacing.xs;

  // Memoize options to prevent unnecessary re-renders
  const tabScreenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: [
        styles.tabBar,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderTopColor: theme.colors.borderLight,
          borderTopWidth: 1,
          shadowColor: theme.colors.border,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          paddingBottom: bottomPadding,
          paddingTop: theme.spacing.md,
        },
      ],
      tabBarLabelStyle: [
        styles.tabLabel,
        {
          fontSize: theme.typography.sizes.xs,
          fontWeight: theme.typography.weights.semiBold as any,
          marginTop: theme.spacing.sm,
          letterSpacing: theme.typography.letterSpacing.tight,
        },
      ],
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textQuaternary,
      tabBarItemStyle: styles.tabItem,
      tabBarIconStyle: styles.tabIcon,
      keyboardHidesTabBar: Platform.OS === 'ios',
    }),
    [bottomPadding, theme]
  );

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <PremiumTabIcon focused={focused} color={color} size={size} routeName="HomeStack" />
          ),
          tabBarAccessibilityLabel: 'Home dashboard',
        }}
      />
      <Tab.Screen
        name="RepositoriesStack"
        component={RepositoriesStackNavigator}
        options={{
          tabBarLabel: 'Repositories',
          tabBarIcon: ({ focused, color, size }) => (
            <PremiumTabIcon
              focused={focused}
              color={color}
              size={size}
              routeName="RepositoriesStack"
            />
          ),
          tabBarAccessibilityLabel: 'Repositories',
        }}
      />
      <Tab.Screen
        name="DevelopersStack"
        component={DevelopersStackNavigator}
        options={{
          tabBarLabel: 'Developers',
          tabBarIcon: ({ focused, color, size }) => (
            <PremiumTabIcon
              focused={focused}
              color={color}
              size={size}
              routeName="DevelopersStack"
            />
          ),
          tabBarAccessibilityLabel: 'Developers',
        }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color, size }) => (
            <PremiumTabIcon focused={focused} color={color} size={size} routeName="SettingsStack" />
          ),
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================================================
// PREMIUM STYLES
// ============================================================================

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 92 : 72,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  tabIcon: {
    marginTop: 2,
  },
  tabLabel: {
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  icon: {
    textAlign: 'center',
  },
});
