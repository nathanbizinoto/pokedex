import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Button, Card, FAB, IconButton, Text, Title } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPokemons, fetchPokemonDetails, PokemonDetails } from '../services/pokemonService';
import { useAuth } from '../context/AuthContext';

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

  // Carrega os Pokémon salvos do AsyncStorage
  const loadSavedPokemons = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem('@Pokedex:savedPokemons');
      if (savedData) {
        const pokemonData = JSON.parse(savedData);
        setPokemons(pokemonData);
      }
    } catch (error) {
      console.error('Erro ao carregar Pokémon salvos:', error);
    }
  }, []);

  // Atualiza a lista de Pokémon salvos no AsyncStorage
  const updateSavedPokemons = async (newList: SavedPokemon[]) => {
    try {
      await AsyncStorage.setItem('@Pokedex:savedPokemons', JSON.stringify(newList));
      setPokemons(newList);
    } catch (error) {
      console.error('Erro ao salvar Pokémon:', error);
    }
  };

  // Carrega mais Pokémon da API
  const loadMorePokemons = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetchPokemons(offset, PAGE_SIZE);
      
      // Verifica se ainda existem mais Pokémon para carregar
      if (!response.next) {
        setHasMore(false);
      }
      
      // Busca os detalhes de cada Pokémon
      const pokemonDetailsPromises = response.results.map(
        pokemon => fetchPokemonDetails(pokemon.name)
      );
      
      const pokemonDetailsResponses = await Promise.all(pokemonDetailsPromises);
      
      const formattedPokemons = pokemonDetailsResponses.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
        types: pokemon.types.map(typeInfo => typeInfo.type.name)
      }));
      
      setOffset(offset + PAGE_SIZE);
      
      // Não adicionar Pokémon que já estão na lista
      const newPokemons = [...pokemons];
      formattedPokemons.forEach(pokemon => {
        if (!newPokemons.some(p => p.id === pokemon.id)) {
          newPokemons.push(pokemon);
        }
      });
      
      await updateSavedPokemons(newPokemons);
    } catch (error) {
      console.error('Erro ao carregar mais Pokémon:', error);
      Alert.alert('Erro', 'Não foi possível carregar mais Pokémon');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset, hasMore, loading, pokemons]);

  // Carrega os Pokémon ao iniciar a tela
  useEffect(() => {
    loadSavedPokemons().then(() => {
      // Se não houver Pokémon salvos, carrega da API
      if (pokemons.length === 0) {
        loadMorePokemons();
      } else {
        setLoading(false);
      }
    });
  }, []);

  // Recarrega toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadSavedPokemons();
    }, [loadSavedPokemons])
  );

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

  // Renderiza cada card de Pokémon
  const renderPokemonCard = ({ item }: { item: SavedPokemon }) => {
    // Define a cor de fundo baseada no tipo do Pokémon
    const getTypeColor = (type: string) => {
      const typeColors: Record<string, string> = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC',
      };
      
      return typeColors[type] || '#CCCCCC';
    };

    return (
      <Card style={styles.card}>
        <Card.Title 
          title={item.name.charAt(0).toUpperCase() + item.name.slice(1)} 
          subtitle={`#${item.id}`}
          right={() => (
            <IconButton
              icon="delete"
              size={24}
              onPress={() => handleRemovePokemon(item.id)}
            />
          )}
        />
        <Card.Content>
          <View style={styles.cardContent}>
            {item.image && (
              <Card.Cover 
                source={{ uri: item.image }} 
                style={styles.pokemonImage} 
              />
            )}
            <View style={styles.typesContainer}>
              {item.types.map((type, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.typeTag, 
                    { backgroundColor: getTypeColor(type) }
                  ]}
                >
                  <Text style={styles.typeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => handleViewDetails(item)}>
            VER MAIS DETALHES
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
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
      
      {pokemons.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum Pokémon encontrado</Text>
          <Button 
            mode="contained" 
            onPress={onRefresh}
            style={styles.refreshButton}
          >
            CARREGAR POKÉMON
          </Button>
        </View>
      ) : (
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
      )}
    </View>
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