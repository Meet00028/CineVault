import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import {
  Montserrat_600SemiBold,
  Montserrat_700Bold
} from '@expo-google-fonts/montserrat';

import AppNavigator from './src/navigation/AppNavigator';
import { MovieProvider } from './src/context/MovieContext';
import { theme } from './src/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  useEffect(() => {
    if (fontError) {
      // If fonts fail, proceed anyway
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontError]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <MovieProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </MovieProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
