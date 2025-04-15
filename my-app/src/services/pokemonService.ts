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

// Função utilitária para timeout de Promise
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout na requisição')), ms))
  ]);
}

// Buscar lista de Pokémon
export const fetchPokemons = async (offset = 0, limit = 20): Promise<PokemonListResponse> => {
  try {
    console.log(`Buscando Pokémons: offset=${offset}, limit=${limit}`);
    const response = await timeoutPromise(
      fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`),
      10000
    );
    
    if (!response.ok) {
      const errorMsg = `Falha ao buscar Pokémons: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    console.log(`Pokémons encontrados: ${data.results.length}`);
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
    console.log(`Buscando detalhes do Pokémon: ${nameOrId}`);
    const response = await timeoutPromise(
      fetch(`${BASE_URL}/pokemon/${nameOrId}`),
      10000
    );
    
    if (!response.ok) {
      const errorMsg = `Falha ao buscar detalhes do Pokémon ${nameOrId}: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    console.log(`Detalhes do Pokémon ${nameOrId} obtidos com sucesso`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${nameOrId}:`, error);
    Alert.alert('Erro', `Não foi possível carregar os detalhes do Pokémon ${nameOrId}`);
    throw error;
  }
}; 