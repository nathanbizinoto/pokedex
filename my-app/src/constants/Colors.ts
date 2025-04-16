/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Cores temáticas do Pokémon
const tintColorPokemonRed = '#E3350D';
const pokemonDarkRed = '#B32A0C';
const pokemonLightRed = '#FF5339';
const pokemonBlue = '#3260AD';
const pokemonYellow = '#FFCB05';

export default {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorPokemonRed,
    tabIconDefault: '#CCCCCC',
    tabIconSelected: tintColorPokemonRed,
    primary: tintColorPokemonRed,
    secondary: pokemonBlue,
    accent: pokemonYellow,
    cardBackground: '#F8F8F8',
    border: '#E0E0E0',
    error: '#D32F2F',
    buttonText: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: pokemonLightRed,
    tabIconDefault: '#8C8C8C',
    tabIconSelected: pokemonLightRed,
    primary: pokemonLightRed,
    secondary: '#5C85DF',
    accent: pokemonYellow,
    cardBackground: '#1E1E1E',
    border: '#333333',
    error: '#F44336',
    buttonText: '#FFFFFF',
  },
};
