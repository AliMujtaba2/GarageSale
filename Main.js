// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth } from "./firebase";
// for sesssion
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from "firebase/auth";



import MapScreen from "./Screens/Map";
import SaleDetailsScreen from "./Screens/SaleDetail";
import CreatePostScreen from "./Screens/CreateaSale";
import SignupScreen from "./Screens/Signup";
import LoginScreen from "./Screens/login";
import MapPickerScreen from "./Screens/PinMap";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { NotifierWrapper } from 'react-native-notifier';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocationProvider } from "./Screens/LiveLocationAPI";
import { View } from "react-native";

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#FFFFFF',
    onSurface: '#1E293B',
    primary: '#6366F1',
  },
};

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      console.log("Auth state changed:", usr);
      setUser(usr);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    // Show loader while Firebase checks auth state
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
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

                  {/* Auth routes */}
                  <Stack.Screen name="Signup" component={SignupScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </LocationProvider>
          </NotifierWrapper>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
