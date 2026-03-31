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
import InCallManager from "@videosdk.live/react-native-incallmanager";
import { navigationRef } from './src/navigation/RootNavigationRef';

// Register background handler OUTSIDE of the component lifecycle
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📬 Background notification received:', remoteMessage);
  
  if (remoteMessage.data?.type === 'incoming_call') {
    // 1. Start the Ringtone immediately
    InCallManager.startRingtone('_BUNDLE_');
    console.log('🔔 Ringtone started for incoming call');

    // 2. Navigate to IncomingCall screen when user opens app from notification tap
    setTimeout(() => {
      if (navigationRef.current) {
        navigationRef.current.navigate('IncomingCall', {
          meetingId: remoteMessage.data.meetingId,
          senderId: remoteMessage.data.senderId,
          senderEmail: remoteMessage.data.senderEmail || remoteMessage.data.senderId,
          callType: remoteMessage.data.callType,
          callerName: remoteMessage.data.callerName,
        });
        console.log('✅ Navigated to IncomingCall screen from background');
      }
    }, 500);
  }
});

// 🎯 Handle notification opened when app is in background/quitting state
messaging().onNotificationOpenedApp((remoteMessage) => {
  console.log('📬 App opened via notification:', remoteMessage);
  
  if (remoteMessage?.data?.type === 'incoming_call') {
    if (navigationRef.current) {
      navigationRef.current.navigate('IncomingCall', {
        meetingId: remoteMessage.data.meetingId,
        senderId: remoteMessage.data.senderId,
        senderEmail: remoteMessage.data.senderEmail || remoteMessage.data.senderId,
        callType: remoteMessage.data.callType,
        callerName: remoteMessage.data.callerName,
      });
      console.log('✅ Routed to IncomingCall from notification tap');
    }
  }
});

// 🎯 Check if app was opened from a notification (cold start)
messaging()
  .getInitialNotification()
  .then((remoteMessage) => {
    if (remoteMessage?.data?.type === 'incoming_call') {
      console.log('📬 App started from notification:', remoteMessage);
      if (navigationRef.current) {
        navigationRef.current.navigate('IncomingCall', {
          meetingId: remoteMessage.data.meetingId,
          senderId: remoteMessage.data.senderId,
          senderEmail: remoteMessage.data.senderEmail || remoteMessage.data.senderId,
          callType: remoteMessage.data.callType,
          callerName: remoteMessage.data.callerName,
        });
      }
    }
  });

function App() {
  return (
    <SafeAreaProvider>
     <MyApp />
    </SafeAreaProvider>
  );
}

export default App;
