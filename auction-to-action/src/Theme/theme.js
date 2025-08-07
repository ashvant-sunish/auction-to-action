import { border, extendTheme } from "@chakra-ui/react";

 const customTheme = {
      colors: {
        brand: {
          50: '#E6FFFA',
          100: '#09ff00ff',
        },
        primary: '#ffffffff',
        secondary: '#ff0000ff',
        button: '#0087cfff',
        // Add or override other colors
      },
      fonts: {
        heading: ' Georgia, serif',  
        body: ' Montserrat, sans-serif',
      },
      // ... more customizations
    };

    const theme = extendTheme(customTheme);

    export default theme;