import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves para armazenamento no AsyncStorage
const USER_STORAGE_KEY = '@Pokedex:user';
const USERS_STORAGE_KEY = '@Pokedex:users';

type User = {
  username: string;
  name: string;
  phone: string;
  cpf: string;
  email: string;
  course: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  registerUser: (userData: User & { password: string }) => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário já está logado quando o app inicia
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setLoading(true);
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          console.log('Usuário recuperado do AsyncStorage');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Busca usuários do AsyncStorage
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      
      if (!storedUsers) {
        console.log('Nenhum usuário cadastrado');
        return false;
      }
      
      const users = JSON.parse(storedUsers);
      const foundUser = users.find((u: User & { password: string }) => 
        u.username === username && u.password === password
      );
      
      if (foundUser) {
        // Remove a senha antes de armazenar no contexto
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Salva o usuário no AsyncStorage e no estado
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        console.log('Login realizado com sucesso');
        return true;
      }
      
      console.log('Usuário ou senha incorretos');
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Remove o usuário do AsyncStorage e do estado
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: User & { password: string }) => {
    try {
      setLoading(true);
      
      // Verifica se já existem usuários cadastrados
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Verifica se o usuário já existe
      const userExists = users.some((u: User) => u.username === userData.username);
      
      if (userExists) {
        console.log('Usuário já existe');
        return false;
      }
      
      // Adiciona o novo usuário à lista
      users.push(userData);
      
      // Salva a lista atualizada no AsyncStorage
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      console.log('Usuário registrado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        registerUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 