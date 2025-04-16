import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CardsScreen from './src/screens/CardsScreen';
import CardDetailsScreen from './src/screens/CardDetailsScreen';
import Colors from './src/constants/Colors';

const Stack = createNativeStackNavigator();

// Tema personalizado do Pokémon
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    accent: Colors.light.accent,
    background: Colors.light.background,
    surface: Colors.light.background,
    error: Colors.light.error,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator 
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.light.background }
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Cards" component={CardsScreen} />
              <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 