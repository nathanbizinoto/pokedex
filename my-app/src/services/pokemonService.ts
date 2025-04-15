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
const RETRY_DELAY_BASE = 1000; // 1 segundo inicial
let alertShownTimestamp = 0; 

// Função utilitária para timeout de Promise
function timeoutPromise<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout: ${errorMessage} (${ms}ms)`)), ms)
    )
  ]);
}

// Função para fazer uma requisição com retentativas automáticas e atraso exponencial
async function fetchWithRetry(url: string, retries = MAX_RETRIES, attempt = 0): Promise<Response> {
  try {
    console.log(`Fazendo requisição para ${url} (tentativa ${attempt + 1}/${MAX_RETRIES + 1})`);
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
      // Calcula atraso exponencial com jitter para evitar múltiplas requisições simultâneas
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt) + Math.floor(Math.random() * 1000);
      console.log(`Aguardando ${delay}ms antes de tentar novamente...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, attempt + 1);
    }
    
    throw error;
  }
}

// Função para mostrar alertas sem duplicação (evita múltiplos alertas em sequência)
function showUniqueAlert(title: string, message: string) {
  const now = Date.now();
  // Só mostra um alerta a cada 3 segundos para evitar spam de alertas
  if (now - alertShownTimestamp > 3000) {
    Alert.alert(title, message);
    alertShownTimestamp = now;
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
    showUniqueAlert(
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
    // Não mostra alertas para detalhes individuais para evitar spam
    throw error;
  }
}; 