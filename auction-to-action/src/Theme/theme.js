import { extendTheme } from "@chakra-ui/react";

const customTheme = {
  colors: {
    primary: {
      50: '#6BA3BE',
      100: '#0C969C',
      150: '#0A7075',
      200: '#032F30',
    },
    dark: '#031716',
    bg: '#274D60',
    white: '#FFFFFF',
    theme: {
      background: '#080B0F',
      sidebar: 'rgba(15, 59, 61, 0.65)',
      header: 'rgba(15, 59, 61, 0.95)',
      surface: 'rgba(15, 59, 61, 0.55)',
      surfaceContainer: 'rgba(15, 59, 61, 0.75)',
      surfaceHigh: 'rgba(15, 59, 61, 0.9)',
      outline: 'rgba(255, 255, 255, 0.18)',
      primary: '#C24F6D',
      onPrimary: '#FFFFFF',
      primaryContainer: '#512431',
      onPrimaryContainer: '#F3B8C7',
      secondary: '#0C969C',
      secondaryContainer: '#0A7075',
      onSecondaryContainer: '#E0F7F8',
      tertiary: '#6BA3BE',
      tertiaryContainer: '#274D60',
      onTertiaryContainer: '#E6F3F7',
      textPrimary: '#F0F4FF',
      textSecondary: '#CBD5E1',
      textMuted: '#82959B',
      textDisabled: '#4E6268',
      success: '#6EC497',
      error: '#E17786',
      info: '#74ABCD',
      warning: '#D6AC64',
      portfolio: '#AE97D6',
      eventRed: '#C00F37',
    }
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
};

const theme = extendTheme(customTheme);

export default theme;