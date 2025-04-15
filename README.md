# Aplicação PokéDex - React Native

## Descrição do Projeto

Esta aplicação é uma PokéDex desenvolvida em React Native com Expo, que permite aos usuários explorar e gerenciar uma lista de Pokémon. A aplicação consome a [PokéAPI](https://pokeapi.co/) para obter dados detalhados sobre os Pokémon.

## Funcionalidades

### 1. Sistema de Autenticação
- Tela de login com campos para usuário e senha
- Cadastro de novos usuários com informações completas (nome, telefone, CPF, e-mail e curso)
- Armazenamento local das informações de usuário através do AsyncStorage

### 2. Listagem de Pokémon
- Visualização dos Pokémon em formato de cards, exibindo imagem, nome e tipo
- Funcionalidade para adicionar novos Pokémon à lista
- Opção para remover Pokémon da coleção
- Paginação ao rolar a tela para carregar mais Pokémon

### 3. Detalhes do Pokémon
- Visualização detalhada ao selecionar um Pokémon
- Informações como altura, peso, tipos, habilidades e estatísticas base
- Interface visual intuitiva com representação gráfica dos status

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para facilitar o desenvolvimento React Native
- **TypeScript**: Superset tipado de JavaScript
- **React Navigation**: Navegação entre telas
- **React Native Paper**: Componentes com Material Design
- **AsyncStorage**: Armazenamento local
- **PokeAPI**: API pública para dados de Pokémon

## Requisitos

- Node.js instalado
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Um dispositivo móvel com o aplicativo Expo Go ou um emulador

## Instalação e Execução

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/pokedex.git
cd pokedex/my-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie a aplicação**
```bash
npx expo start
```

4. **Opções de execução**
- Escaneie o QR code com o aplicativo Expo Go (Android) ou Câmera (iOS)
- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no emulador iOS
- Use o modo túnel para execução remota:
```bash
npx expo start --tunnel
```

## Estrutura do Projeto

```
my-app/
├── src/
│   ├── screens/           # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── CardsScreen.tsx
│   │   └── CardDetailsScreen.tsx
│   ├── components/        # Componentes reutilizáveis
│   ├── context/           # Contextos React (autenticação)
│   │   └── AuthContext.tsx
│   ├── services/          # Serviços e APIs
│   │   └── pokemonService.ts
│   ├── hooks/             # Hooks personalizados
│   └── types/             # Definições de tipos
├── assets/                # Imagens e recursos
├── App.tsx                # Componente principal
├── tsconfig.json          # Configuração do TypeScript
└── package.json           # Dependências do projeto
```

## Uso da Aplicação

1. Na tela de login, insira o nome de usuário e senha ou crie uma nova conta
2. Visualize os Pokémon disponíveis na tela principal
3. Utilize o botão "+" para adicionar mais Pokémon à sua lista
4. Toque em "VER MAIS DETALHES" para obter informações completas sobre um Pokémon
5. Use o ícone de lixeira para remover Pokémon da sua lista

## Solução de Problemas

Se encontrar problemas ao iniciar a aplicação:

1. Verifique se todas as dependências estão instaladas:
```bash
npm install
```

2. Limpe o cache do Expo:
```bash
npx expo start --clear
```

3. Se estiver com problemas de conexão, tente usar o modo túnel:
```bash
npm install --global @expo/ngrok@^4.1.0
npx expo start --tunnel
```

4. Certifique-se de que seu dispositivo móvel e computador estão na mesma rede WiFi

## Desenvolvimento

Este projeto segue uma estrutura organizada com separação de responsabilidades. Para adicionar novos recursos:

1. Crie componentes reutilizáveis em `/src/components`
2. Adicione novos serviços em `/src/services`
3. Implemente novas telas em `/src/screens`

## Autor

- Seu Nome Completo

## Licença

Este projeto está sob a licença MIT.