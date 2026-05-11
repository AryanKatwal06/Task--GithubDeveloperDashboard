/**
 * Navigation Types
 *
 * Provides type-safe navigation throughout the app.
 * React Navigation with TypeScript - all params are compile-time checked.
 *
 * Architecture:
 * - RootStackParamList: Top-level navigation
 * - BottomTabsParamList: Tab navigation
 * - Feature-specific stacks: Each feature has its own params
 *
 * STRICT TYPING:
 * All route names and params are strictly typed.
 * TypeScript prevents navigation to invalid routes or with wrong params.
 */

import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ============================================================================
// BOTTOM TABS NAVIGATION
// ============================================================================

/**
 * Bottom tabs screen params
 * Each tab can pass data between screens
 */
export type BottomTabsParamList = {
  HomeStack: undefined;
  RepositoriesStack: undefined;
  DevelopersStack: undefined;
  SettingsStack: undefined;
};

export type BottomTabsScreenProps<T extends keyof BottomTabsParamList> = BottomTabScreenProps<
  BottomTabsParamList,
  T
>;

// ============================================================================
// HOME STACK NAVIGATION
// ============================================================================

export type HomeStackParamList = {
  HomeDashboard: undefined;
  RepositoryDetails: {
    id: string;
    owner: string;
    name: string;
  };
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, T>,
  BottomTabsScreenProps<'HomeStack'>
>;

// ============================================================================
// REPOSITORIES STACK NAVIGATION
// ============================================================================

export type RepositoriesStackParamList = {
  RepositoriesSearch: undefined;
  RepositoryDetail: {
    id: string;
    owner: string;
    name: string;
  };
  RepositoryIssues: {
    owner: string;
    repo: string;
  };
};

export type RepositoriesStackScreenProps<T extends keyof RepositoriesStackParamList> =
  CompositeScreenProps<
    StackScreenProps<RepositoriesStackParamList, T>,
    BottomTabsScreenProps<'RepositoriesStack'>
  >;

// ============================================================================
// DEVELOPERS STACK NAVIGATION
// ============================================================================

export type DevelopersStackParamList = {
  DevelopersList: undefined;
  DeveloperDetail: {
    login: string;
  };
  DeveloperRepositories: {
    login: string;
  };
};

export type DevelopersStackScreenProps<T extends keyof DevelopersStackParamList> =
  CompositeScreenProps<
    StackScreenProps<DevelopersStackParamList, T>,
    BottomTabsScreenProps<'DevelopersStack'>
  >;

// ============================================================================
// SETTINGS STACK NAVIGATION
// ============================================================================

export type SettingsStackParamList = {
  SettingsHome: undefined;
  ThemeSettings: undefined;
  AppInfo: undefined;
  CacheManagement: undefined;
};

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> = CompositeScreenProps<
  StackScreenProps<SettingsStackParamList, T>,
  BottomTabsScreenProps<'SettingsStack'>
>;

// ============================================================================
// ROOT STACK NAVIGATION
// ============================================================================

/**
 * Root stack params
 * Handles app-level navigation (modals, overlays, etc)
 */
export type RootStackParamList = {
  MainTabs: undefined;
  // Future: can add modals here
  // NotificationDetail: { id: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

// ============================================================================
// NAVIGATION TYPE GUARDS
// ============================================================================

/**
 * Helper to check if route is in a specific stack
 * Useful for conditional rendering based on navigation context
 */
export const isInStack = (currentRoute: string, stack: keyof BottomTabsParamList): boolean => {
  if (!currentRoute || !stack) {
    return false;
  }

  // Ensure stack is a valid key before using it
  if (typeof stack !== 'string' || !stack) {
    return false;
  }

  const stackRoutes: Record<keyof BottomTabsParamList, string[]> = {
    HomeStack: ['HomeDashboard', 'RepositoryDetails'],
    RepositoriesStack: ['RepositoriesSearch', 'RepositoryDetail', 'RepositoryIssues'],
    DevelopersStack: ['DevelopersList', 'DeveloperDetail', 'DeveloperRepositories'],
    SettingsStack: ['SettingsHome', 'ThemeSettings', 'AppInfo', 'CacheManagement'],
  };

  // Check if stack exists in stackRoutes before accessing
  if (!(stack in stackRoutes)) {
    return false;
  }

  const routes = stackRoutes[stack];
  return routes ? routes.includes(currentRoute) : false;
};
