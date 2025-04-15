import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { ActivityIndicator, Button, Card, FAB, IconButton, Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPokemons, fetchPokemonDetails, PokemonDetails } from '../services/pokemonService';
import { useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type RootStackParamList = {
  Login: undefined;
  Cards: undefined;
  CardDetails: { pokemon: PokemonDetails };
};

type CardsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cards'>;

interface SavedPokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
}

const PAGE_SIZE = 10;

const CardsScreen = () => {
  const [pokemons, setPokemons] = useState<SavedPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const navigation = useNavigation<CardsScreenNavigationProp>();
  const { user, signOut } = useAuth();

  // Função utilitária para timeout de Promise
  function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout na requisição')), ms))
    ]);
  }

  // Carrega mais Pokémon da API
  const loadMorePokemons = useCallback(async () => {
    console.log('Chamou loadMorePokemons');
    if (!hasMore || loading) {
      console.log('Ignorando chamada (loading ou sem mais itens)');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Buscando Pokémons: offset=${offset}, limit=${PAGE_SIZE}`);
      
      // Busca lista de Pokémons
      const response = await fetchPokemons(offset, PAGE_SIZE);
      
      if (!response || !response.results || response.results.length === 0) {
        console.log('Nenhum resultado encontrado');
        setHasMore(false);
        Alert.alert('Aviso', 'Não há mais Pokémons para carregar.');
        return;
      }
      
      // Verifica se há mais páginas
      if (!response.next) {
        console.log('Chegou ao fim da lista');
        setHasMore(false);
      }
      
      // Divide os resultados em grupos menores para evitar sobrecarga
      const BATCH_SIZE = 5;
      const batches = [];
      
      for (let i = 0; i < response.results.length; i += BATCH_SIZE) {
        batches.push(response.results.slice(i, i + BATCH_SIZE));
      }
      
      const allPokemonDetails = [];
      
      // Processa cada lote sequencialmente
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processando lote ${i+1}/${batches.length} (${batch.length} Pokémons)`);
        
        const batchPromises = batch.map(pokemon => 
          fetchPokemonDetails(pokemon.name)
            .catch(error => {
              console.error(`Erro ao buscar detalhes de ${pokemon.name}:`, error);
              return null;
            })
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        const validResults = batchResults.filter(result => result !== null);
        allPokemonDetails.push(...validResults);
      }
      
      // Formata os detalhes obtidos
      const formattedPokemons = allPokemonDetails
        .filter(Boolean)
        .map(data => ({
          id: data.id,
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          types: data.types.map(typeInfo => typeInfo.type.name)
        }));
      
      console.log(`Total de Pokémons carregados: ${formattedPokemons.length}`);
      
      // Atualiza o estado apenas se houver resultados
      if (formattedPokemons.length > 0) {
        setOffset(offset + PAGE_SIZE);
        
        setPokemons(prev => {
          const newPokemons = [...prev];
          
          formattedPokemons.forEach(pokemon => {
            if (!newPokemons.some(p => p.id === pokemon.id)) {
              newPokemons.push(pokemon);
            }
          });
          
          return newPokemons;
        });
      } else {
        console.warn('Nenhum Pokémon foi carregado nesta consulta');
        Alert.alert(
          'Aviso', 
          'Não foi possível carregar os Pokémons. Verifique sua conexão e tente novamente.'
        );
      }
    } catch (error) {
      console.error('Erro ao carregar mais Pokémon:', error);
      Alert.alert(
        'Erro', 
        'Ocorreu um problema ao carregar mais Pokémons. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset, hasMore, loading]);

  // Carrega os Pokémon ao iniciar a tela (sempre da API)
  useEffect(() => {
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);
    loadMorePokemons();
  }, []);

  // Função para atualizar a lista
  const onRefresh = () => {
    setRefreshing(true);
    loadMorePokemons();
  };

  // Função para remover um Pokémon da lista
  const handleRemovePokemon = async (id: number) => {
    const updatedPokemons = pokemons.filter(pokemon => pokemon.id !== id);
    await updateSavedPokemons(updatedPokemons);
  };

  // Função para navegar para os detalhes do Pokémon
  const handleViewDetails = async (pokemon: SavedPokemon) => {
    try {
      setLoading(true);
      const details = await fetchPokemonDetails(pokemon.id);
      navigation.navigate('CardDetails', { pokemon: details });
    } catch (error) {
      console.error('Erro ao buscar detalhes do Pokémon:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do Pokémon');
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }]
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Atualiza a lista de Pokémon salvos no AsyncStorage
  const updateSavedPokemons = async (newList: SavedPokemon[]) => {
    try {
      await AsyncStorage.setItem('@Pokedex:savedPokemons', JSON.stringify(newList));
      setPokemons(newList);
    } catch (error) {
      console.error('Erro ao salvar Pokémon:', error);
    }
  };

  // Função para limpar o AsyncStorage
  const handleClearStorage = async () => {
    try {
      await AsyncStorage.removeItem('@Pokedex:savedPokemons');
      setPokemons([]);
      setOffset(0);
      setHasMore(true);
      Alert.alert('Sucesso', 'Pokémons salvos removidos!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível limpar os Pokémons salvos.');
    }
  };

  // Renderiza cada card de Pokémon (ajustado para o padrão do projeto de referência)
  const renderPokemonCard = ({ item }: { item: SavedPokemon }) => (
    <Card style={{ margin: 10 }}>
      {item.image && (
        <Card.Cover source={{ uri: item.image }} />
      )}
      <Card.Title title={item.name.charAt(0).toUpperCase() + item.name.slice(1)} />
      <Button mode="contained" onPress={() => handleViewDetails(item)}>
        Ver detalhes
      </Button>
    </Card>
  );

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Title style={styles.title}>PokéDex</Title>
            {user && <Text style={styles.welcomeText}>Olá, {user.name.split(' ')[0]}!</Text>}
          </View>
          <IconButton
            icon="logout"
            size={24}
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
        <FlatList
          data={pokemons}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPokemonCard}
          contentContainerStyle={styles.list}
          onEndReached={loadMorePokemons}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text>Carregando mais Pokémon...</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  userInfo: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 24,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
  },
  logoutButton: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  list: {
    padding: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  pokemonImage: {
    width: '80%',
    height: 200,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    margin: 2,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  refreshButton: {
    marginTop: 16,
  },
});

export default CardsScreen; 