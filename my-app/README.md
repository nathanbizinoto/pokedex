# Aplicação PokéDex - React Native

Este projeto é uma aplicação React Native que implementa uma PokéDex utilizando a [PokeAPI](https://pokeapi.co/).

## Descrição do Projeto

A aplicação consiste em quatro telas principais:

1. **Tela de Login**
   - Campos para usuário e senha
   - Botões para entrar e cadastrar novo usuário

2. **Tela de Cadastro de Usuário**
   - Formulário com: Nome, Telefone, CPF, E-mail, Curso
   - Armazenamento local usando AsyncStorage

3. **Tela de Cards (Pokémon)**
   - Lista de pokémon em formato de cards
   - Funcionalidades para adicionar novos pokémon, excluir e ver detalhes

4. **Tela de Detalhes do Pokémon**
   - Exibe informações detalhadas do pokémon selecionado
   - Status, habilidades e características físicas

## Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- React Native Paper (Material Design)
- AsyncStorage
- PokeAPI

## Instalação

Siga os passos abaixo para executar o projeto em seu ambiente local:

```bash
# Clone o repositório
git clone https://github.com/seuusuario/pokedex.git
cd pokedex

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

## Como Usar

1. **Login**
   - Ao iniciar a aplicação, você será direcionado para a tela de login
   - Se não tiver um usuário, clique em "CADASTRAR USUÁRIO"

2. **Cadastro**
   - Preencha todos os campos do formulário e clique em "SALVAR"
   - Após o cadastro, você será redirecionado para a tela de login

3. **Tela de Cards**
   - Visualize os pokémon em formato de cards
   - Clique no botão "+" para adicionar mais pokémon da API
   - Use o botão de exclusão para remover um pokémon
   - Clique em "VER MAIS DETALHES" para acessar informações detalhadas

4. **Detalhes do Pokémon**
   - Veja características como altura, peso, tipos, habilidades e estatísticas

## Observações

- Os dados de usuários são armazenados localmente usando AsyncStorage
- A aplicação consome a API pública gratuita [PokeAPI](https://pokeapi.co/)
- O design segue os padrões de Material Design através da biblioteca React Native Paper

## Autores

- Seu Nome Completo

## Licença

Este projeto está sob a licença MIT.
