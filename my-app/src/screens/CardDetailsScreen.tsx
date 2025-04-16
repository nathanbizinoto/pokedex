import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Title, Card, Chip, IconButton } from 'react-native-paper';
import Colors from '../constants/Colors';

type CardDetailsRouteParams = {
  pokemon: {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: Array<{
      slot: number;
      type: {
        name: string;
      };
    }>;
    stats: Array<{
      base_stat: number;
      stat: {
        name: string;
      };
    }>;
    sprites: {
      front_default: string;
      back_default: string;
      other: {
        'official-artwork': {
          front_default: string;
        };
      };
    };
    abilities: Array<{
      ability: {
        name: string;
      };
      is_hidden: boolean;
    }>;
  };
};

type ParamList = {
  CardDetails: CardDetailsRouteParams;
};

const CardDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'CardDetails'>>();
  const navigation = useNavigation();
  const { pokemon } = route.params;

  // Formata o número do Pokémon (ex: #001, #025)
  const formatPokemonNumber = (id: number) => {
    return `#${String(id).padStart(3, '0')}`;
  };

  // Formata altura de decímetros para metros
  const formatHeight = (height: number) => {
    return `${(height / 10).toFixed(1)} m`;
  };

  // Formata peso de hectogramas para quilogramas
  const formatWeight = (weight: number) => {
    return `${(weight / 10).toFixed(1)} kg`;
  };

  // Formata o nome para começar com letra maiúscula
  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Determina a cor de acordo com o tipo do Pokémon
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
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor="#fff"
        />
        <Title style={styles.headerTitle}>{formatPokemonNumber(pokemon.id)}</Title>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Header com imagem de fundo e nome */}
        <View style={styles.header}>
          <View style={styles.pokemonInfo}>
            <Title style={styles.pokemonName}>{capitalize(pokemon.name)}</Title>
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
        
        {/* Seção com informações básicas */}
        <View style={styles.infoContainer}>
          <Card style={styles.card}>
            <Card.Title title="Informações Básicas" titleStyle={styles.cardTitle} />
            <Card.Content>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Altura</Text>
                  <Text style={styles.infoValue}>{formatHeight(pokemon.height)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Peso</Text>
                  <Text style={styles.infoValue}>{formatWeight(pokemon.weight)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Seção de habilidades */}
          <Card style={styles.card}>
            <Card.Title title="Habilidades" titleStyle={styles.cardTitle} />
            <Card.Content>
              <View style={styles.abilitiesContainer}>
                {pokemon.abilities.map((abilityInfo, index) => (
                  <Chip 
                    key={index} 
                    style={styles.abilityChip}
                    textStyle={abilityInfo.is_hidden ? styles.hiddenAbilityText : styles.abilityText}
                  >
                    {capitalize(abilityInfo.ability.name.replace('-', ' '))}
                    {abilityInfo.is_hidden && ' (Oculta)'}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
          
          {/* Seção de estatísticas */}
          <Card style={styles.card}>
            <Card.Title title="Estatísticas" titleStyle={styles.cardTitle} />
            <Card.Content>
              {pokemon.stats.map((statInfo, index) => {
                // Mapeia o nome da estatística para um nome mais amigável
                const statNameMap: Record<string, string> = {
                  'hp': 'HP',
                  'attack': 'Ataque',
                  'defense': 'Defesa',
                  'special-attack': 'Atq. Especial',
                  'special-defense': 'Def. Especial',
                  'speed': 'Velocidade'
                };
                
                const statName = statNameMap[statInfo.stat.name] || capitalize(statInfo.stat.name);
                
                // Define a cor da barra de estatística
                let barColor = Colors.light.primary;
                if (statInfo.base_stat < 50) barColor = '#f44336';
                else if (statInfo.base_stat < 80) barColor = '#ffa726';
                else if (statInfo.base_stat < 100) barColor = '#66bb6a';
                else barColor = '#42a5f5';
                
                return (
                  <View key={index} style={styles.statItem}>
                    <Text style={styles.statName}>{statName}</Text>
                    <Text style={styles.statValue}>{statInfo.base_stat}</Text>
                    <View style={styles.statBarContainer}>
                      <View 
                        style={[
                          styles.statBar, 
                          { 
                            width: `${Math.min(100, statInfo.base_stat / 2)}%`,
                            backgroundColor: barColor 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
          
          {/* Sprites extras */}
          <Card style={styles.card}>
            <Card.Title title="Sprites" titleStyle={styles.cardTitle} />
            <Card.Content style={styles.spritesContainer}>
              {pokemon.sprites.front_default && (
                <Image 
                  source={{ uri: pokemon.sprites.front_default }} 
                  style={styles.sprite} 
                />
              )}
              {pokemon.sprites.back_default && (
                <Image 
                  source={{ uri: pokemon.sprites.back_default }} 
                  style={styles.sprite} 
                />
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerBar: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    marginLeft: 16,
    fontSize: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  pokemonNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pokemonImage: {
    width: 150,
    height: 150,
    marginTop: -20,
  },
  infoContainer: {
    padding: 16,
    marginTop: -20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  abilityChip: {
    margin: 4,
    backgroundColor: '#efefef',
  },
  abilityText: {
    color: '#333',
  },
  hiddenAbilityText: {
    color: Colors.light.primary,
    fontStyle: 'italic',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statName: {
    width: 100,
    color: '#666',
  },
  statValue: {
    width: 40,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 8,
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
  },
  spritesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sprite: {
    width: 100,
    height: 100,
    marginHorizontal: 10,
  },
});

export default CardDetailsScreen; 