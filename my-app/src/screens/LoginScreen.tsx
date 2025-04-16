import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Image,
  ImageBackground
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  ActivityIndicator
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import Colors from '../constants/Colors';

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
        <ActivityIndicator size="large" color={Colors.light.primary} />
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
        <ImageBackground 
          source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
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
              activeOutlineColor={Colors.light.primary}
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
              activeOutlineColor={Colors.light.primary}
            />
            
            <Button 
              mode="contained" 
              onPress={handleLogin}
              style={styles.button}
              loading={loginLoading}
              disabled={loginLoading}
              buttonColor={Colors.light.primary}
            >
              ENTRAR
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Register')}
              style={styles.button}
              disabled={loginLoading}
              textColor={Colors.light.primary}
            >
              CADASTRAR USUÁRIO
            </Button>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    opacity: 0.1,
    resizeMode: 'contain',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 12,
    paddingVertical: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.primary,
  },
});

export default LoginScreen; 