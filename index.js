/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { register } from "@videosdk.live/react-native-sdk";


import App from './App'



register();

AppRegistry.registerComponent(appName, () => App);