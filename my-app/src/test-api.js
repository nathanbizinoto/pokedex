const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Script para testar a API do Pokémon diretamente
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
    console.log(`- Imagem: ${data.sprites.other['official-artwork'].front_default}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${nameOrId}:`, error);
    return { success: false, error: String(error) };
  }
}

// Função para testar o comportamento da Promise.allSettled
async function testPromiseAllSettled() {
  try {
    console.log('Testando Promise.allSettled com múltiplos Pokémon...');
    const pokemonIds = [1, 2, 3, 4, 5]; 
    
    const fetchPromises = pokemonIds.map(id => fetch(`${BASE_URL}/pokemon/${id}`));
    const responses = await Promise.allSettled(fetchPromises);
    
    console.log('Esperando resultados das promises...');
    const start = Date.now();
    
    const pokemonDetailsPromises = responses
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.json());
    
    const pokemonDetailsResponses = await Promise.allSettled(pokemonDetailsPromises);
    const end = Date.now();
    
    console.log(`Tempo de execução: ${end - start}ms`);
    console.log(`Resultados obtidos: ${pokemonDetailsResponses.filter(r => r.status === 'fulfilled').length}/${pokemonIds.length}`);
    
    return { success: true, results: pokemonDetailsResponses };
  } catch (error) {
    console.error('Erro ao testar Promise.allSettled:', error);
    return { success: false, error: String(error) };
  }
}

// Executar os testes
async function runTests() {
  console.log('=== INICIANDO TESTES DA API ===');
  
  console.log('\n1. Teste da busca de lista de Pokémon:');
  await testFetchPokemons();
  
  console.log('\n2. Teste da busca de detalhes de um Pokémon:');
  await testFetchPokemonDetails(1);
  
  console.log('\n3. Teste de Promise.allSettled:');
  await testPromiseAllSettled();
  
  console.log('\n=== TESTES CONCLUÍDOS ===');
}

// Executar testes
runTests().catch(error => {
  console.error('Erro ao executar testes:', error);
}); 