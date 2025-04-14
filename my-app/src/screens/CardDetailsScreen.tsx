import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Title, Paragraph, Divider, Chip } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PokemonDetails } from '../services/pokemonService';

type RootStackParamList = {
  CardDetails: { pokemon: PokemonDetails };
};

type CardDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CardDetails'>;

const CardDetailsScreen = () => {
  const route = useRoute<CardDetailsScreenRouteProp>();
  const { pokemon } = route.params;

  // Função para capitalizar a primeira letra
  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Função para formatar o número do Pokémon (ex: #001, #025)
  const formatPokemonNumber = (id: number) => {
    return `#${id.toString().padStart(3, '0')}`;
  };

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

  // Função para renderizar a barra de status
  const renderStatBar = (baseStat: number, statName: string) => {
    // Define o valor máximo para cada status
    const maxStats: Record<string, number> = {
      hp: 255,
      attack: 190,
      defense: 250,
      'special-attack': 194,
      'special-defense': 250,
      speed: 200,
    };
    
    const maxValue = maxStats[statName] || 100;
    const percentage = (baseStat / maxValue) * 100;
    
    // Define a cor da barra com base no status
    const getStatColor = (stat: string) => {
      const statColors: Record<string, string> = {
        hp: '#FF5959',
        attack: '#F5AC78',
        defense: '#FAE078',
        'special-attack': '#9DB7F5',
        'special-defense': '#A7DB8D',
        speed: '#FA92B2',
      };
      
      return statColors[stat] || '#A8A8A8';
    };

    return (
      <View style={styles.statContainer} key={statName}>
        <Text style={styles.statName}>
          {statName
            .replace('special-attack', 'Sp. Atk')
            .replace('special-defense', 'Sp. Def')
            .replace('attack', 'Attack')
            .replace('defense', 'Defense')
            .replace('speed', 'Speed')
            .replace('hp', 'HP')}
        </Text>
        <Text style={styles.statValue}>{baseStat}</Text>
        <View style={styles.statBarContainer}>
          <View 
            style={[
              styles.statBar, 
              { 
                width: `${percentage}%`,
                backgroundColor: getStatColor(statName) 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header com a imagem e informações básicas */}
      <View style={styles.header}>
        <View style={styles.pokemonInfo}>
          <Title style={styles.pokemonName}>{capitalize(pokemon.name)}</Title>
          <Text style={styles.pokemonNumber}>{formatPokemonNumber(pokemon.id)}</Text>
          
          <View style={styles.typesContainer}>
            {pokemon.types.map((typeInfo, index) => (
              <Chip 
                key={index} 
                style={[
                  styles.typeChip,
                  { backgroundColor: getTypeColor(typeInfo.type.name) }
                ]}
                textStyle={styles.typeText}
              >
                {capitalize(typeInfo.type.name)}
              </Chip>
            ))}
          </View>
        </View>
        
        <Image 
          source={{ 
            uri: pokemon.sprites.other['official-artwork'].front_default || 
                 pokemon.sprites.front_default 
          }} 
          style={styles.pokemonImage} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.detailsContainer}>
        {/* Informações físicas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Informações básicas</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Altura</Text>
                <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Peso</Text>
                <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Habilidades */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Habilidades</Title>
            <Divider style={styles.divider} />
            
            {pokemon.abilities.map((abilityInfo, index) => (
              <View key={index} style={styles.abilityRow}>
                <Text style={styles.abilityName}>
                  {capitalize(abilityInfo.ability.name.replace('-', ' '))}
                </Text>
                {abilityInfo.is_hidden && (
                  <Chip style={styles.hiddenChip}>Oculta</Chip>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Status base */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Status base</Title>
            <Divider style={styles.divider} />
            
            {pokemon.stats.map((statInfo) => 
              renderStatBar(statInfo.base_stat, statInfo.stat.name)
            )}
            
            <Text style={styles.totalStats}>
              Total: {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pokemonNumber: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pokemonImage: {
    width: 150,
    height: 150,
  },
  detailsContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  abilityName: {
    fontSize: 16,
  },
  hiddenChip: {
    backgroundColor: '#7986CB',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statName: {
    width: 80,
    fontSize: 14,
  },
  statValue: {
    width: 30,
    textAlign: 'right',
    marginRight: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 6,
  },
  totalStats: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 12,
  },
});

export default CardDetailsScreen; 