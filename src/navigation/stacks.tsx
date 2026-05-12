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

import { HomeDashboardScreen } from '../features/home/screens/HomeDashboardScreen';
import { DevelopersScreen } from '../features/developers/screens/DevelopersScreen';
import { DeveloperDetailScreen } from '../features/developers/screens/DeveloperDetailScreen';
import { DeveloperRepositoriesScreen } from '../features/developers/screens/DeveloperRepositoriesScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { RepositoriesSearchScreen } from '../features/repositories/screens/RepositoriesSearchScreen';
import { RepositoryDetailScreen } from '../features/repositories/screens/RepositoryDetailScreen';
import { RepositoryIssuesScreen } from '../features/repositories/screens/RepositoryIssuesScreen';

// ============================================================================
// HOME STACK
// ============================================================================

const HomeStack = createStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
    </HomeStack.Navigator>
  );
};

// ============================================================================
// REPOSITORIES STACK
// ============================================================================

const RepositoriesStack = createStackNavigator<RepositoriesStackParamList>();

export const RepositoriesStackNavigator: React.FC = () => {
  return (
    <RepositoriesStack.Navigator>
      <RepositoriesStack.Screen name="RepositoriesSearch" component={RepositoriesSearchScreen} />
      <RepositoriesStack.Screen
        name="RepositoryDetail"
        options={{ title: 'Repository' }}
        component={RepositoryDetailScreen}
      />
      <RepositoriesStack.Screen
        name="RepositoryIssues"
        options={{ title: 'Issues' }}
        component={RepositoryIssuesScreen}
      />
    </RepositoriesStack.Navigator>
  );
};

// ============================================================================
// DEVELOPERS STACK
// ============================================================================

const DevelopersStack = createStackNavigator<DevelopersStackParamList>();

export const DevelopersStackNavigator: React.FC = () => {
  return (
    <DevelopersStack.Navigator>
      <DevelopersStack.Screen name="DevelopersList" component={DevelopersScreen} />
      <DevelopersStack.Screen
        name="DeveloperDetail"
        options={{ title: 'Developer' }}
        component={DeveloperDetailScreen}
      />
      <DevelopersStack.Screen
        name="DeveloperRepositories"
        options={{ title: "Developer's Repos" }}
        component={DeveloperRepositoriesScreen}
      />
    </DevelopersStack.Navigator>
  );
};

// ============================================================================
// SETTINGS STACK
// ============================================================================

const SettingsStack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator: React.FC = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
};
