/**
 * Root Navigator
 *
 * Top-level navigation structure
 * Orchestrates all navigation stacks and modals
 *
 * Future extensions:
 * - Authentication stack (before logged in)
 * - Modal screens (full-screen overlays)
 * - Deep linking support
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import type { RootStackParamList } from '../types/navigation';

import { BottomTabsNavigator } from './BottomTabs';

// ============================================================================
// ROOT NAVIGATOR SETUP
// ============================================================================

const RootStack = createStackNavigator<RootStackParamList>();

/**
 * RootNavigator
 *
 * Top-level navigation container
 * Wraps all app navigation in the NavigationContainer
 *
 * Features:
 * - Theme-aware styling
 * - ErrorBoundary integration (via NavigationContainer)
 * - Deep linking can be added later if needed
 */
export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen
          name="MainTabs"
          component={BottomTabsNavigator}
          options={{ headerShown: false }}
        />
        {/* Example:
          <RootStack.Group screenOptions={{ presentation: 'modal' }}>
            <RootStack.Screen
              name="NotificationDetail"
              component={NotificationDetailScreen}
              options={{ title: 'Notification' }}
            />
          </RootStack.Group>
        */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
