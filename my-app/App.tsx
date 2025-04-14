import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CardsScreen from './src/screens/CardsScreen';
import CardDetailsScreen from './src/screens/CardDetailsScreen';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro de Usuário' }} />
              <Stack.Screen 
                name="Cards" 
                component={CardsScreen} 
                options={{ 
                  headerShown: false, 
                  gestureEnabled: false 
                }} 
              />
              <Stack.Screen name="CardDetails" component={CardDetailsScreen} options={{ title: 'Detalhes do Pokémon' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 