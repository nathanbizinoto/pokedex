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
const TIMEOUT_MS = 15000; // 15 segundos
const MAX_RETRIES = 2;

// Função utilitária para timeout de Promise
function timeoutPromise<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout: ${errorMessage} (${ms}ms)`)), ms)
    )
  ]);
}

// Função para fazer uma requisição com retentativas automáticas
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    console.log(`Fazendo requisição para ${url}`);
    const response = await timeoutPromise(
      fetch(url), 
      TIMEOUT_MS, 
      `Requisição para ${url} excedeu o tempo limite`
    );
    
    if (!response.ok) {
      throw new Error(`Erro de resposta: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Erro na requisição para ${url}:`, error);
    
    if (retries > 0) {
      console.log(`Tentando novamente (${retries} tentativas restantes)...`);
      return fetchWithRetry(url, retries - 1);
    }
    
    throw error;
  }
}

// Buscar lista de Pokémon
export const fetchPokemons = async (offset = 0, limit = 20): Promise<PokemonListResponse> => {
  try {
    console.log(`Buscando lista de Pokémon: offset=${offset}, limit=${limit}`);
    const url = `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`;
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    console.log(`Pokémons encontrados: ${data.results.length}`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar Pokémons:', error);
    Alert.alert(
      'Erro de Conexão', 
      'Não foi possível carregar os Pokémons. Verifique sua conexão e tente novamente.'
    );
    throw error;
  }
};

// Buscar detalhes de um Pokémon específico
export const fetchPokemonDetails = async (nameOrId: string | number): Promise<PokemonDetails> => {
  try {
    console.log(`Buscando detalhes do Pokémon ${nameOrId}`);
    const url = `${BASE_URL}/pokemon/${nameOrId}`;
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    console.log(`Detalhes do Pokémon ${nameOrId} obtidos com sucesso`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${nameOrId}:`, error);
    Alert.alert(
      'Erro de Conexão',
      `Não foi possível carregar os detalhes do Pokémon ${nameOrId}. Verifique sua conexão e tente novamente.`
    );
    throw error;
  }
}; 