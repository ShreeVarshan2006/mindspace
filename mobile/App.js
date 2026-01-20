import React from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function AppContent() {
  const { isDarkMode } = useTheme();
  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  console.log('App component rendering...');

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <ThemeProvider>
            <PaperProvider theme={DefaultTheme}>
              <AppContent />
            </PaperProvider>
          </ThemeProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
