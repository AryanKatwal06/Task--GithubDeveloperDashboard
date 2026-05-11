/**
 * Navigation Module Exports
 *
 * Centralized exports for all navigation functionality
 */

export { RootNavigator } from './RootNavigator';
export { BottomTabsNavigator } from './BottomTabs';
export {
  HomeStackNavigator,
  RepositoriesStackNavigator,
  DevelopersStackNavigator,
  SettingsStackNavigator,
} from './stacks';

// Type exports
export type {
  RootStackParamList,
  RootStackScreenProps,
  BottomTabsParamList,
  BottomTabsScreenProps,
  HomeStackParamList,
  HomeStackScreenProps,
  RepositoriesStackParamList,
  RepositoriesStackScreenProps,
  DevelopersStackParamList,
  DevelopersStackScreenProps,
  SettingsStackParamList,
  SettingsStackScreenProps,
} from '../types/navigation';
export { isInStack } from '../types/navigation';
