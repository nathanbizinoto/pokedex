import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  registerUser: (userData: User & { password: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Verificar se já existe um usuário logado
    const loadStoredData = async () => {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('@Pokedex:user');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
    };

    loadStoredData();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // Buscar usuários do AsyncStorage
      const storedUsers = await AsyncStorage.getItem('@Pokedex:users');
      
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const foundUser = users.find((u: User & { password: string }) => 
          u.username === username && u.password === password
        );
        
        if (foundUser) {
          // Remover a senha antes de armazenar no contexto
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          await AsyncStorage.setItem('@Pokedex:user', JSON.stringify(userWithoutPassword));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@Pokedex:user');
    setUser(null);
  };

  const registerUser = async (userData: User & { password: string }) => {
    try {
      // Buscar usuários existentes
      const storedUsers = await AsyncStorage.getItem('@Pokedex:users');
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Adicionar novo usuário
      users.push(userData);
      
      // Salvar lista atualizada
      await AsyncStorage.setItem('@Pokedex:users', JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
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