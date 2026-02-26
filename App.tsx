/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MyApp from './src/navigation/Main';
import messaging from '@react-native-firebase/messaging';

function App() {
  // Register background handler for notifications (when app is closed)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background notification received:', remoteMessage);
});


  return (
    <SafeAreaProvider>
     <MyApp />
    </SafeAreaProvider>
  );
}

export default App;
