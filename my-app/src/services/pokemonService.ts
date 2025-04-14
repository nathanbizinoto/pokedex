import { Alert } from 'react-native';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
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
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
}

const BASE_URL = 'https://pokeapi.co/api/v2';

// Buscar lista de Pokémon
export const fetchPokemons = async (offset = 0, limit = 20): Promise<PokemonListResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar Pokémons');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar Pokémons:', error);
    Alert.alert('Erro', 'Não foi possível carregar os Pokémons');
    throw error;
  }
};

// Buscar detalhes de um Pokémon específico
export const fetchPokemonDetails = async (nameOrId: string | number): Promise<PokemonDetails> => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar detalhes do Pokémon ${nameOrId}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${nameOrId}:`, error);
    Alert.alert('Erro', `Não foi possível carregar os detalhes do Pokémon ${nameOrId}`);
    throw error;
  }
}; 