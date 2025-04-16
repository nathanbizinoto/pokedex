import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text, Title, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPokemonDetails, PokemonDetails } from '../services/pokemonService';
import { useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

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

const CardsScreen = () => {
  const [pokemons, setPokemons] = useState<SavedPokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SavedPokemon | null>(null);
  
  const navigation = useNavigation<CardsScreenNavigationProp>();
  const { user, signOut } = useAuth();

  // Função para pesquisar Pokémon
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Aviso', 'Digite o nome ou número do Pokémon');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Pesquisando Pokémon: ${searchQuery}`);
      const searchTerm = searchQuery.toLowerCase().trim();
      let pokemonData;
      
      // Verifica se é um número ou nome
      const pokemonId = parseInt(searchTerm);
      if (!isNaN(pokemonId)) {
        pokemonData = await fetchPokemonDetails(pokemonId);
      } else {
        pokemonData = await fetchPokemonDetails(searchTerm);
      }
      
      if (!pokemonData) {
        setError('Pokémon não encontrado. Verifique o nome ou número digitado.');
        setSearchResult(null);
        return;
      }
      
      const formattedPokemon = {
        id: pokemonData.id,
        name: pokemonData.name,
        image: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        types: pokemonData.types.map(typeInfo => typeInfo.type.name)
      };
      
      // Mostrar o resultado da pesquisa
      setSearchResult(formattedPokemon);
      
    } catch (error) {
      console.error('Erro ao pesquisar Pokémon:', error);
      setError('Não foi possível encontrar o Pokémon. Verifique o nome ou número e tente novamente.');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar a pesquisa
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError(null);
  };

  // Função para adicionar o Pokémon pesquisado à lista
  const handleAddPokemon = (pokemon: SavedPokemon) => {
    // Verificar se o Pokémon já está na lista
    if (!pokemons.some(p => p.id === pokemon.id)) {
      setPokemons(prev => [...prev, pokemon]);
      setSearchResult(null);
      setSearchQuery('');
      Alert.alert('Sucesso', `${pokemon.name} foi adicionado à sua Pokédex!`);
    } else {
      Alert.alert('Atenção', `${pokemon.name} já está na sua Pokédex!`);
    }
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

  // Função para remover um Pokémon da lista
  const handleRemovePokemon = (id: number) => {
    setPokemons(prev => prev.filter(pokemon => pokemon.id !== id));
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

  // Renderiza o resultado da pesquisa
  const renderSearchResult = () => {
    if (!searchResult) return null;
    
    return (
      <Card style={styles.searchResultCard}>
        {searchResult.image && (
          <Card.Cover source={{ uri: searchResult.image }} />
        )}
        <Card.Title 
          title={searchResult.name.charAt(0).toUpperCase() + searchResult.name.slice(1)} 
        />
        <View style={styles.typesContainer}>
          {searchResult.types.map((type, index) => (
            <View 
              key={index} 
              style={[styles.typeTag, { backgroundColor: getTypeColor(type) }]}
            >
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained" 
            onPress={() => handleAddPokemon(searchResult)}
            style={styles.cardButton}
            icon="plus"
            buttonColor={Colors.light.primary}
          >
            Adicionar
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Renderiza cada card de Pokémon
  const renderPokemonCard = ({ item }: { item: SavedPokemon }) => {    
    return (
      <Card style={styles.card}>
        {item.image && (
          <Card.Cover source={{ uri: item.image }} />
        )}
        <Card.Title 
          title={item.name.charAt(0).toUpperCase() + item.name.slice(1)} 
        />
        <View style={styles.typesContainer}>
          {item.types.map((type, index) => (
            <View 
              key={index} 
              style={[styles.typeTag, { backgroundColor: getTypeColor(type) }]}
            >
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained" 
            onPress={() => handleRemovePokemon(item.id)}
            style={styles.cardButton}
            icon="delete"
            buttonColor="#f44336"
            textColor="white"
          >
            Excluir
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleViewDetails(item)}
            style={styles.cardButton}
            buttonColor={Colors.light.primary}
          >
            Ver detalhes
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Função auxiliar para determinar a cor de fundo com base no tipo do Pokémon
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dark: '#705848',
      dragon: '#7038F8',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    
    return typeColors[type.toLowerCase()] || '#888888';
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Title style={styles.title}>PokéDex</Title>
            {user && <Text style={styles.welcomeText}>Olá, {user.name.split(' ')[0]}</Text>}
          </View>
          <IconButton
            icon="logout"
            size={24}
            onPress={handleLogout}
            style={styles.logoutButton}
            iconColor="#fff"
          />
        </View>
        
        {/* Barra de pesquisa */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar Pokémon por nome ou número"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            placeholderTextColor="#888"
            icon="magnify"
            clearIcon={searchQuery ? "close" : undefined}
            onIconPress={handleSearch}
            onClearIconPress={handleClearSearch}
          />
          <Button 
            mode="contained" 
            onPress={handleSearch}
            style={styles.searchButton}
            disabled={loading}
            buttonColor={Colors.light.primary}
          >
            Buscar
          </Button>
        </View>
        
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Buscando Pokémon...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* Resultado da pesquisa */}
            {searchResult && renderSearchResult()}
            
            {/* Lista de Pokémon adicionados */}
            <FlatList
              data={pokemons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPokemonCard}
              contentContainerStyle={[
                styles.list,
                pokemons.length === 0 && !searchResult && styles.emptyList
              ]}
              ListHeaderComponent={
                pokemons.length > 0 ? (
                  <Text style={styles.sectionTitle}>Seus Pokémon</Text>
                ) : null
              }
              ListEmptyComponent={
                !searchResult ? (
                  <View style={styles.emptyContainer}>
                    <Image 
                      source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                      style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>
                      Digite o nome ou número do Pokémon para pesquisar
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  userInfo: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  searchButton: {
    justifyContent: 'center',
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
  },
  searchResultCard: {
    margin: 12,
    marginBottom: 0,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  list: {
    padding: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  typesContainer: {
    flexDirection: 'row',
    padding: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    marginBottom: 20,
    color: '#555',
  },
  emptyImage: {
    width: 150, 
    height: 150,
    marginBottom: 20,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.light.error,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  cardButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.light.primary,
  },
});

export default CardsScreen; 