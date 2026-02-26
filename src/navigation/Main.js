// App.js
import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "../../firebase";
// for sesssion
import { onAuthStateChanged } from 'firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Notifier } from 'react-native-notifier';
// Animated transitions
import {defaultScreenOptions  , slideFromRight , slideFromLeft} from "../Animations/screenAnimations";


import MapScreen from "../screens/Map";
import SaleDetailsScreen from "../screens/SaleDetail";
import CreatePostScreen from "../screens/CreateaSale";
import SignupScreen from "../screens/Signup";
import LoginScreen from "../screens/login";
import MapPickerScreen from "../screens/PinMap";
import MessagesScreen from "../screens/Messages";
import RecievedMessege from "../screens/RecievedMessege";
import SplashScreen from "../screens/splash";

import { ActivityIndicator, MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { NotifierWrapper } from 'react-native-notifier';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocationProvider } from "../context/contextapi/LiveLocationAPI";
import Store from "../context/redux/store/Store";
import { Provider , useSelector } from "react-redux";




const Stack = createNativeStackNavigator();

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#FFFFFF',
    onSurface: '#1E293B',
    primary: '#6366F1',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#0F172A',
    onSurface: '#E2E8F0',
    primary: '#818CF8',
  },
};

const AppContent = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  

  // Now useSelector works because it's inside a component that's wrapped by Provider
  const isDark = useSelector((state) => state.theme.theme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      console.log("Auth state changed:", usr);
      setUser(usr);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // Handle foreground notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📬 Foreground notification:', remoteMessage);
      
      Notifier.showNotification({
        title: remoteMessage.notification?.title || 'New Message',
        description: remoteMessage.notification?.body,
        duration: 5000,
      });
    });

    return unsubscribe;
  }, [user]);

  if (initializing) {
    // Show loader while Firebase checks auth state
    return (
      <SplashScreen />
    );
  }

  return (
    <PaperProvider theme={theme}>
        <NotifierWrapper>
          <LocationProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName={user ? "Map" : "Login"}
                screenOptions={{ headerShown: false }}
              >
                {/* Authenticated routes */}
                <Stack.Screen name="Map" component={MapScreen} />
                <Stack.Screen name="SaleDetails" component={SaleDetailsScreen} />
                <Stack.Screen name="CreateSale" component={CreatePostScreen} />
                <Stack.Screen name="MapPicker" component={MapPickerScreen} />
                <Stack.Screen name="Messege" component={MessagesScreen} options={slideFromRight} />
                <Stack.Screen name="ReceivedMessege" component={RecievedMessege} options={slideFromRight} />

                {/* Auth routes */}
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </LocationProvider>
        </NotifierWrapper>
    </PaperProvider>
  );
};

const MyApp = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={Store}>
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
};

export default MyApp;
