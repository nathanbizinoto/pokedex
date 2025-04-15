import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { registerUser } = useAuth();

  const validateForm = () => {
    if (!username || !password || !confirmPassword || !name || !phone || !cpf || !email || !course) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return false;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Atenção', 'Por favor, insira um e-mail válido');
      return false;
    }

    // Validação simples de CPF (apenas verifica se tem 11 dígitos)
    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      Alert.alert('Atenção', 'Por favor, insira um CPF válido (11 dígitos)');
      return false;
    }

    return true;
  };

  const formatCpf = (value: string) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const cpfDigits = digits.slice(0, 11);
    
    // Formata o CPF (XXX.XXX.XXX-XX)
    if (cpfDigits.length <= 3) {
      return cpfDigits;
    } else if (cpfDigits.length <= 6) {
      return `${cpfDigits.slice(0, 3)}.${cpfDigits.slice(3)}`;
    } else if (cpfDigits.length <= 9) {
      return `${cpfDigits.slice(0, 3)}.${cpfDigits.slice(3, 6)}.${cpfDigits.slice(6)}`;
    } else {
      return `${cpfDigits.slice(0, 3)}.${cpfDigits.slice(3, 6)}.${cpfDigits.slice(6, 9)}-${cpfDigits.slice(9)}`;
    }
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (com DDD)
    const phoneDigits = digits.slice(0, 11);
    
    // Formata o telefone ((XX) XXXXX-XXXX)
    if (phoneDigits.length <= 2) {
      return phoneDigits;
    } else if (phoneDigits.length <= 7) {
      return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2)}`;
    } else {
      return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7)}`;
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const success = await registerUser({
        username,
        password,
        name,
        phone,
        cpf,
        email,
        course
      });
      
      if (success) {
        Alert.alert(
          'Sucesso', 
          'Usuário cadastrado com sucesso!',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Erro', 'Este nome de usuário já existe. Por favor, escolha outro.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Houve um problema ao cadastrar o usuário. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Cadastro de Usuário</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Nome completo"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          
          <TextInput
            label="Telefone"
            value={phone}
            onChangeText={(value) => setPhone(formatPhone(value))}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            disabled={loading}
          />
          
          <TextInput
            label="CPF"
            value={cpf}
            onChangeText={(value) => setCpf(formatCpf(value))}
            mode="outlined"
            style={styles.input}
            keyboardType="number-pad"
            disabled={loading}
          />
          
          <TextInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          
          <TextInput
            label="Curso"
            value={course}
            onChangeText={setCourse}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          
          <TextInput
            label="Nome de usuário"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            disabled={loading}
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
                disabled={loading}
              />
            }
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          
          <TextInput
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmTextEntry}
            right={
              <TextInput.Icon 
                icon={secureConfirmTextEntry ? 'eye' : 'eye-off'} 
                onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} 
                disabled={loading}
              />
            }
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          
          <Button 
            mode="contained" 
            onPress={handleRegister}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            SALVAR
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => navigation.goBack()}
            style={styles.buttonBack}
            disabled={loading}
          >
            VOLTAR
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
    padding: 20,
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
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
  },
  buttonBack: {
    marginTop: 10,
  },
});

export default RegisterScreen; 