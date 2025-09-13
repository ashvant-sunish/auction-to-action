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
    
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
};

const theme = extendTheme(customTheme);

export default theme;