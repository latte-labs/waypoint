/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './components/App'; // Update path to match new location
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
