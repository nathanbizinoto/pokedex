import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [savedPokemons, setSavedPokemons] = useState<SavedPokemon[]>([]);
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  
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
    // Evita executar se a tela estiver no estado inicial
    if (initialLoad) {
      console.log('Ignorando loadMorePokemons durante carregamento inicial');
      return;
    }
    
    console.log('Chamou loadMorePokemons');
    
    // Evita chamadas duplicadas ou desnecessárias
    if (!hasMore || loading) {
      console.log('Ignorando chamada (loading ou sem mais itens)');
      return;
    }
    
    // Captura o valor atual do offset para usá-lo consistentemente
    const currentOffset = offset;
    console.log(`Preparando para buscar com offset=${currentOffset}, limit=${PAGE_SIZE}`);
    
    try {
      setError(null);
      setLoading(true);
      
      console.log(`Buscando mais Pokémons: offset=${currentOffset}, limit=${PAGE_SIZE}`);
      
      // Busca lista de Pokémons
      const response = await fetchPokemons(currentOffset, PAGE_SIZE);
      
      if (!response || !response.results || response.results.length === 0) {
        console.log('Nenhum resultado encontrado');
        setHasMore(false);
        Alert.alert('Aviso', 'Não há mais Pokémons para carregar.');
        setLoading(false);
        setRefreshing(false);
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
        .filter((data): data is PokemonDetails => Boolean(data))
        .map(data => ({
          id: data.id,
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          types: data.types.map(typeInfo => typeInfo.type.name)
        }));
      
      console.log(`Total de Pokémons carregados: ${formattedPokemons.length}`);
      
      // Atualiza o estado apenas se houver resultados
      if (formattedPokemons.length > 0) {
        // Atualiza o offset para o próximo lote
        const newOffset = currentOffset + PAGE_SIZE;
        console.log(`Atualizando offset para: ${newOffset}`);
        setOffset(newOffset);
        
        setPokemons(prev => {
          const newPokemons = [...prev];
          
          formattedPokemons.forEach(pokemon => {
            if (!newPokemons.some(p => p.id === pokemon.id)) {
              newPokemons.push(pokemon);
            }
          });
          
          return newPokemons;
        });
        
        setInitialLoad(false);
      } else {
        console.warn('Nenhum Pokémon foi carregado nesta consulta');
        if (initialLoad) {
          setError('Não foi possível carregar os Pokémons. Verifique sua conexão e tente novamente.');
        } else {
          Alert.alert(
            'Aviso', 
            'Não foi possível carregar os Pokémons. Verifique sua conexão e tente novamente.'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mais Pokémon:', error);
      if (initialLoad) {
        setError('Ocorreu um problema ao carregar os Pokémons. Verifique sua conexão de internet e tente novamente.');
      } else {
        Alert.alert(
          'Erro', 
          'Ocorreu um problema ao carregar mais Pokémons. Tente novamente mais tarde.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hasMore, loading, offset, initialLoad]);

  // useEffect adicional para registrar as mudanças de estado
  useEffect(() => {
    console.log(`Estado atual: loading=${loading}, initialLoad=${initialLoad}, pokemons=${pokemons.length}, offset=${offset}`);
  }, [loading, initialLoad, pokemons.length, offset]);

  // Carrega os Pokémon ao iniciar a tela (sempre da API)
  useEffect(() => {
    let isMounted = true;
    
    const initializeScreen = async () => {
      console.log('Inicializando tela de Cards');
      
      if (!isMounted) return;
      
      // Definir estado inicial
      setLoading(true);
      setPokemons([]);
      setOffset(0);
      setHasMore(true);
      setError(null);
      
      // Carregar pokémons salvos
      try {
        const savedData = await AsyncStorage.getItem('@Pokedex:savedPokemons');
        if (savedData) {
          const parsedData = JSON.parse(savedData) as SavedPokemon[];
          setSavedPokemons(parsedData);
          console.log(`Carregados ${parsedData.length} pokémons salvos do AsyncStorage`);
        }
      } catch (error) {
        console.error('Erro ao carregar pokémons salvos:', error);
      }
      
      try {
        console.log('Forçando carregamento inicial de dados');
        
        const response = await fetchPokemons(0, PAGE_SIZE);
        
        if (!response || !response.results || response.results.length === 0) {
          console.log('Nenhum resultado encontrado na inicialização');
          setHasMore(false);
          setError('Não foi possível carregar os Pokémons. Verifique sua conexão e tente novamente.');
          setLoading(false);
          return;
        }
        
        if (!response.next) {
          setHasMore(false);
        }
        
        // Processa em um único lote para inicialização
        console.log(`Processando ${response.results.length} Pokémons`);
        
        const pokemonPromises = response.results.map(pokemon => 
          fetchPokemonDetails(pokemon.name)
            .catch(error => {
              console.error(`Erro ao buscar detalhes de ${pokemon.name}:`, error);
              return null;
            })
        );
        
        const results = await Promise.all(pokemonPromises);
        
        // Formata os detalhes obtidos
        const formattedPokemons = results
          .filter((data): data is PokemonDetails => Boolean(data))
          .map(data => ({
            id: data.id,
            name: data.name,
            image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
            types: data.types.map(typeInfo => typeInfo.type.name)
          }));
        
        console.log(`Total de Pokémons carregados na inicialização: ${formattedPokemons.length}`);
        
        if (formattedPokemons.length > 0) {
          setOffset(PAGE_SIZE);
          setPokemons(formattedPokemons);
          setInitialLoad(false);
        } else {
          setError('Não foi possível carregar os Pokémons. Verifique sua conexão e tente novamente.');
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setError('Ocorreu um problema ao carregar os Pokémons. Verifique sua conexão de internet e tente novamente.');
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    initializeScreen();
    
    // Cleanup para evitar atualização de estado em componente desmontado
    return () => {
      isMounted = false;
    };
  }, []); // Sem dependências para executar apenas uma vez

  // Função para atualizar a lista manualmente
  const onRefresh = useCallback(() => {
    if (refreshing || loading) {
      console.log('Ignorando refresh (já está atualizando)');
      return;
    }
    
    console.log('Iniciando refresh manual');
    setRefreshing(true);
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    setInitialLoad(false); // Importante: não é mais carregamento inicial
    
    // Executa um pequeno timeout para garantir que os estados sejam atualizados antes de chamar loadMorePokemons
    setTimeout(() => {
      loadMorePokemons();
    }, 100);
    
  }, [refreshing, loading, loadMorePokemons]);

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

  // Função para salvar um Pokémon como favorito
  const handleSavePokemon = async (pokemon: SavedPokemon) => {
    try {
      // Verifica se o Pokémon já está salvo
      const isAlreadySaved = savedPokemons.some(p => p.id === pokemon.id);
      
      if (isAlreadySaved) {
        // Se já estiver salvo, remove dos favoritos
        const updatedSavedList = savedPokemons.filter(p => p.id !== pokemon.id);
        await AsyncStorage.setItem('@Pokedex:savedPokemons', JSON.stringify(updatedSavedList));
        setSavedPokemons(updatedSavedList);
        Alert.alert('Sucesso', `${pokemon.name} foi removido dos favoritos!`);
      } else {
        // Adicionar aos favoritos
        const updatedSavedList = [...savedPokemons, pokemon];
        await AsyncStorage.setItem('@Pokedex:savedPokemons', JSON.stringify(updatedSavedList));
        setSavedPokemons(updatedSavedList);
        Alert.alert('Sucesso', `${pokemon.name} foi adicionado aos favoritos!`);
      }
    } catch (error) {
      console.error('Erro ao salvar/remover Pokémon:', error);
      Alert.alert('Erro', 'Não foi possível salvar/remover o Pokémon.');
    }
  };

  // Verifica se um Pokémon está salvo
  const isPokemonSaved = (id: number) => {
    return savedPokemons.some(p => p.id === id);
  };

  // Alterna entre todos os pokémons e apenas os favoritos
  const toggleSavedFilter = () => {
    setShowOnlySaved(!showOnlySaved);
  };

  // Dados a serem exibidos na FlatList (filtrados ou não)
  const displayData = showOnlySaved ? savedPokemons : pokemons;

  // Renderiza cada card de Pokémon (ajustado para o padrão do projeto de referência)
  const renderPokemonCard = ({ item }: { item: SavedPokemon }) => {
    const isSaved = isPokemonSaved(item.id);
    
    return (
      <Card style={{ margin: 10 }}>
        {item.image && (
          <Card.Cover source={{ uri: item.image }} />
        )}
        <Card.Title 
          title={item.name.charAt(0).toUpperCase() + item.name.slice(1)} 
          right={(props) => (
            <IconButton
              {...props}
              icon={isSaved ? "heart" : "heart-outline"}
              iconColor={isSaved ? "#F44336" : undefined}
              onPress={() => handleSavePokemon(item)}
            />
          )}
        />
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => handleRemovePokemon(item.id)}
            style={styles.cardButton}
            icon="delete"
          >
            Excluir
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleViewDetails(item)}
            style={styles.cardButton}
          >
            Ver detalhes
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Componente para exibir mensagem de erro com botão para tentar novamente
  const ErrorView = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <Button 
        mode="contained" 
        style={styles.retryButton}
        onPress={() => {
          setOffset(0);
          setHasMore(true);
          loadMorePokemons();
        }}
      >
        Tentar Novamente
      </Button>
    </View>
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
        
        {/* Barra de filtro */}
        <View style={styles.filterBar}>
          <Text style={styles.filterText}>
            {showOnlySaved ? 'Mostrando favoritos' : 'Mostrando todos'}
          </Text>
          <Button 
            mode="outlined"
            icon={showOnlySaved ? "cards" : "heart"}
            onPress={toggleSavedFilter}
            style={styles.filterButton}
          >
            {showOnlySaved ? 'Ver todos' : 'Ver favoritos'}
          </Button>
        </View>
        
        {error && !refreshing ? (
          <ErrorView />
        ) : (
          <>
            <FlatList
              data={displayData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPokemonCard}
              contentContainerStyle={styles.list}
              onEndReached={!showOnlySaved ? loadMorePokemons : undefined}
              onEndReachedThreshold={0.1}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2196F3']}
                />
              }
              ListEmptyComponent={
                loading && !refreshing ? (
                  <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Carregando Pokémons...</Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {showOnlySaved ? 'Você não tem pokémons favoritos' : 'Nenhum pokémon encontrado'}
                    </Text>
                    {showOnlySaved && (
                      <Button 
                        mode="contained"
                        style={styles.retryButton}
                        onPress={toggleSavedFilter}
                      >
                        Ver todos os pokémons
                      </Button>
                    )}
                  </View>
                )
              }
              ListFooterComponent={
                loading && !refreshing && displayData.length > 0 ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text>Carregando mais Pokémon...</Text>
                  </View>
                ) : null
              }
            />
            
            {/* Botão ADD para adicionar mais pokémons */}
            {!showOnlySaved && (
              <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => {
                  setRefreshing(true);
                  loadMorePokemons();
                }}
                disabled={loading || refreshing || !hasMore}
                label="Adicionar"
              />
            )}
          </>
        )}
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
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#F44336'
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  cardButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    borderRadius: 20,
  },
});

export default CardsScreen; 