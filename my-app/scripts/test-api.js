const { default: fetch } = require('node-fetch');

/**
 * Script para testar a API do Pokémon diretamente pelo terminal
 */

const BASE_URL = 'https://pokeapi.co/api/v2';

// Função para testar a busca de lista de Pokémon
async function testFetchPokemons() {
  try {
    console.log('Testando busca de lista de Pokémon...');
    const response = await fetch(`${BASE_URL}/pokemon?offset=0&limit=10`);
    
    if (!response.ok) {
      console.error(`Erro na resposta: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, message: 'Falha ao buscar Pokémons' };
    }
    
    const data = await response.json();
    console.log('Resposta da API (primeiros 2 resultados):', JSON.stringify(data.results.slice(0, 2), null, 2));
    console.log(`Total: ${data.count} pokémons encontrados`);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar Pokémons:', error);
    return { success: false, error: String(error) };
  }
}

// Função para testar a busca de detalhes de um Pokémon específico
async function testFetchPokemonDetails(nameOrId = 1) {
  try {
    console.log(`Testando busca de detalhes do Pokémon ${nameOrId}...`);
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
    
    if (!response.ok) {
      console.error(`Erro na resposta: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, message: `Falha ao buscar detalhes do Pokémon ${nameOrId}` };
    }
    
    const data = await response.json();
    console.log('Detalhes básicos do Pokémon:');
    console.log(`- Nome: ${data.name}`);
    console.log(`- ID: ${data.id}`);
    console.log(`- Tipos: ${data.types.map(t => t.type.name).join(', ')}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${nameOrId}:`, error);
    return { success: false, error: String(error) };
  }
}

// Função para executar todos os testes
async function runAllTests() {
  console.log('==== INICIANDO TESTES DA API POKEMON ====');
  
  const listResult = await testFetchPokemons();
  console.log('\nResultado da busca de lista:', listResult.success ? 'SUCESSO ✅' : 'FALHA ❌');
  
  const detailsResult = await testFetchPokemonDetails();
  console.log('\nResultado da busca de detalhes:', detailsResult.success ? 'SUCESSO ✅' : 'FALHA ❌');
  
  console.log('\n==== TESTES CONCLUÍDOS ====');
  
  return {
    listTestSuccess: listResult.success,
    detailsTestSuccess: detailsResult.success
  };
}

// Execute os testes quando o script for rodado diretamente
(async () => {
  try {
    await runAllTests();
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  }
})(); 