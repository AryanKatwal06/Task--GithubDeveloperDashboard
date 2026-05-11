/**
 * Stack Navigators
 *
 * Feature-specific stack navigators that are combined into the bottom tabs.
 * Each stack maintains its own navigation history independently.
 *
 * Pattern:
 * - Stack per feature (Home, Repositories, Developers, Settings)
 * - Each stack has its own screens and deep linking support
 * - Screens are lazy-loaded (imported only when needed)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import type {
  HomeStackParamList,
  RepositoriesStackParamList,
  DevelopersStackParamList,
  SettingsStackParamList,
} from '../types/navigation';

// import { useTheme } from '@hooks/useTheme'; // Temporarily commented out
import { HomeDashboardScreen } from '../features/home/screens/HomeDashboardScreen';
import { DevelopersScreen } from '../features/developers/screens/DevelopersScreen';
import { DeveloperDetailScreen } from '../features/developers/screens/DeveloperDetailScreen';
import { DeveloperRepositoriesScreen } from '../features/developers/screens/DeveloperRepositoriesScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { RepositoriesSearchScreen } from '../features/repositories/screens/RepositoriesSearchScreen';
import { RepositoryDetailScreen } from '../features/repositories/screens/RepositoryDetailScreen';
import { RepositoryIssuesScreen } from '../features/repositories/screens/RepositoryIssuesScreen';

// Debug: Check if all screen components are properly imported
console.log('=== SCREEN COMPONENT DEBUG ===');
console.log('HomeDashboardScreen:', typeof HomeDashboardScreen, HomeDashboardScreen);
console.log('DevelopersScreen:', typeof DevelopersScreen, DevelopersScreen);
console.log('DeveloperDetailScreen:', typeof DeveloperDetailScreen, DeveloperDetailScreen);
console.log('DeveloperRepositoriesScreen:', typeof DeveloperRepositoriesScreen, DeveloperRepositoriesScreen);
console.log('SettingsScreen:', typeof SettingsScreen, SettingsScreen);
console.log('RepositoriesSearchScreen:', typeof RepositoriesSearchScreen, RepositoriesSearchScreen);
console.log('RepositoryDetailScreen:', typeof RepositoryDetailScreen, RepositoryDetailScreen);
console.log('RepositoryIssuesScreen:', typeof RepositoryIssuesScreen, RepositoryIssuesScreen);

// ============================================================================
// HOME STACK
// ============================================================================

const HomeStack = createStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  // Temporarily removed theme and screen options to isolate issue
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeDashboard"
        component={HomeDashboardScreen}
      />
      {/* Temporarily commented out to isolate issue */}
      {/* <HomeStack.Screen
        name="RepositoryDetails"
        options={{ title: 'Repository' }}
        component={RepositoryDetailScreen}
      /> */}
    </HomeStack.Navigator>
  );
};

// ============================================================================
// REPOSITORIES STACK
// ============================================================================

const RepositoriesStack = createStackNavigator<RepositoriesStackParamList>();

export const RepositoriesStackNavigator: React.FC = () => {
  // Temporarily removed theme and screen options to isolate issue
  return (
    <RepositoriesStack.Navigator>
      <RepositoriesStack.Screen
        name="RepositoriesSearch"
        component={RepositoriesSearchScreen}
      />
      {/* Temporarily commented out to isolate issue */}
      {/* <RepositoriesStack.Screen
        name="RepositoryDetail"
        options={{ title: 'Repository' }}
        component={RepositoryDetailScreen}
      />
      <RepositoriesStack.Screen
        name="RepositoryIssues"
        options={{ title: 'Issues' }}
        component={RepositoryIssuesScreen}
      /> */}
    </RepositoriesStack.Navigator>
  );
};

// ============================================================================
// DEVELOPERS STACK
// ============================================================================

const DevelopersStack = createStackNavigator<DevelopersStackParamList>();

export const DevelopersStackNavigator: React.FC = () => {
  // Temporarily removed theme and screen options to isolate issue
  return (
    <DevelopersStack.Navigator>
      <DevelopersStack.Screen
        name="DevelopersList"
        component={DevelopersScreen}
      />
      {/* Temporarily commented out to isolate issue */}
      {/* <DevelopersStack.Screen
        name="DeveloperDetail"
        options={{ title: 'Developer' }}
        component={DeveloperDetailScreen}
      />
      <DevelopersStack.Screen
        name="DeveloperRepositories"
        options={{ title: "Developer's Repos" }}
        component={DeveloperRepositoriesScreen}
      /> */}
    </DevelopersStack.Navigator>
  );
};

// ============================================================================
// SETTINGS STACK
// ============================================================================

const SettingsStack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator: React.FC = () => {
  // Temporarily removed theme and screen options to isolate issue
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
      />
      {/* Temporarily commented out to isolate issue */}
      {/* <SettingsStack.Screen
        name="ThemeSettings"
        options={{ title: 'Theme' }}
        component={SettingsScreen}
      />
      <SettingsStack.Screen
        name="AppInfo"
        options={{ title: 'About' }}
        component={SettingsScreen}
      />
      <SettingsStack.Screen
        name="CacheManagement"
        options={{ title: 'Cache' }}
        component={SettingsScreen}
      /> */}
    </SettingsStack.Navigator>
  );
};
