import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Cards: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, loading, isAuthenticated } = useAuth();

  // Redireciona automaticamente se o usuário já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Cards' }],
      });
    }
  }, [isAuthenticated, loading, navigation]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    setLoginLoading(true);
    
    try {
      const success = await signIn(username, password);
      
      if (success) {
        // Navega para a tela principal e limpa o histórico para evitar voltar para o login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Cards' }],
        });
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Houve um problema ao fazer login. Tente novamente.');
      console.error(error);
    } finally {
      setLoginLoading(false);
    }
  };

  // Mostra um indicador de carregamento enquanto verifica o estado de autenticação
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png' }} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>PokéDex App</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Usuário"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            disabled={loginLoading}
          />
          
          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            right={
              <TextInput.Icon 
                icon={secureTextEntry ? 'eye' : 'eye-off'} 
                onPress={() => setSecureTextEntry(!secureTextEntry)} 
              />
            }
            mode="outlined"
            style={styles.input}
            disabled={loginLoading}
          />
          
          <Button 
            mode="contained" 
            onPress={handleLogin}
            style={styles.button}
            loading={loginLoading}
            disabled={loginLoading}
          >
            ENTRAR
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Register')}
            style={styles.button}
            disabled={loginLoading}
          >
            CADASTRAR USUÁRIO
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoginScreen; 