import { Alert } from 'react-native';

/**
 * Script para testar a API do Pokémon diretamente
 */

const BASE_URL = 'https://pokeapi.co/api/v2';

// Função para testar a busca de lista de Pokémon
export const testFetchPokemons = async () => {
  try {
    console.log('Testando busca de lista de Pokémon...');
    const response = await fetch(`${BASE_URL}/pokemon?offset=0&limit=10`);
    
    if (!response.ok) {
      console.error(`Erro na resposta: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, message: 'Falha ao buscar Pokémons' };
    }
    
    const data = await response.json();
    console.log('Resposta da API:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar Pokémons:', error);
    return { success: false, error: String(error) };
  }
};

// Função para testar a busca de detalhes de um Pokémon específico
export const testFetchPokemonDetails = async (nameOrId: string | number = 1) => {
  try {
    console.log(`Testando busca de detalhes do Pokémon ${nameOrId}...`);
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
    
    if (!response.ok) {
      console.error(`Erro na resposta: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, message: `Falha ao buscar detalhes do Pokémon ${nameOrId}` };
    }
    
    const data = await response.json();
    console.log('Detalhes do Pokémon:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${nameOrId}:`, error);
    return { success: false, error: String(error) };
  }
};

// Função para executar todos os testes
export const runAllTests = async () => {
  console.log('==== INICIANDO TESTES DA API POKEMON ====');
  
  const listResult = await testFetchPokemons();
  console.log('Resultado da busca de lista:', listResult.success ? 'SUCESSO' : 'FALHA');
  
  const detailsResult = await testFetchPokemonDetails();
  console.log('Resultado da busca de detalhes:', detailsResult.success ? 'SUCESSO' : 'FALHA');
  
  console.log('==== TESTES CONCLUÍDOS ====');
  
  return {
    listTestSuccess: listResult.success,
    detailsTestSuccess: detailsResult.success,
    results: {
      list: listResult,
      details: detailsResult
    }
  };
}; 