import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import './App.css'
import theme from './Theme/theme.js'
function App() {
  return (
    <Box p={8} maxWidth="600px" mx="auto">
      <VStack spacing={6}>
        <Heading as="h1" size="2xl" color="secondary">
          Auction to Action
        </Heading>
        <Text fontSize="lg" textAlign="center" fontFamily="heading">
          Welcome to your auction platform! Start building amazing features.
        </Text>
        <Button colorScheme="blue" size="lg">
          Get Started
        </Button>
      </VStack>
    </Box>
  )
}

export default App
