/**
 * @format
 */

import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Temporarily disable react-native-screens due to compatibility flags issue
enableScreens(false);

AppRegistry.registerComponent(appName, () => App);
