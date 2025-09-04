import React from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Button,
  VStack,
  Divider,
  Text,
  Flex,
} from "@chakra-ui/react";

function Round3() {
  // Define colors based on the design image
  const bgColor = "primary.200"; // Dark teal background
  const inputBgColor = "rgba(255, 255, 255, 0.1)";
  const borderColor = "rgba(255, 255, 255, 0.2)";
  const textColor = "white";

  return (
    <Flex
      minH="100vh"
      bg={bgColor}
      align="center"
      justify="center"
      fontFamily="'Inter', sans-serif"
    >
      <Box
        bg="rgba(0,0,0,0.2)"
        p={{ base: 6, md: 10 }}
        borderRadius="2xl"
        boxShadow="xl"
        w="full"
        maxW="4xl" // Increased max width for the wider layout
        backdropFilter="blur(10px)"
      >
        <VStack spacing={6} align="stretch">
          <Heading
            color={textColor}
            textAlign="center"
            size="lg"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Round 3 Trading Data Entry
          </Heading>

          {/* Top Level Fields */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FormControl id="trading-id" isRequired>
              <FormLabel color={textColor}>Trading ID</FormLabel>
              <Input
                placeholder="Enter Trading ID"
                bg={inputBgColor}
                borderColor={borderColor}
                color={textColor}
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
            <FormControl id="trade-team-1" isRequired>
              <FormLabel color={textColor}>Trading Team 1</FormLabel>
              <Input
                placeholder="Enter Team 1 Name"
                bg={inputBgColor}
                borderColor={borderColor}
                color={textColor}
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
            <FormControl id="trade-team-2" isRequired>
              <FormLabel color={textColor}>Trade Team 2</FormLabel>
              <Input
                placeholder="Enter Team 2 Name"
                bg={inputBgColor}
                borderColor={borderColor}
                color={textColor}
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>
          </SimpleGrid>

          <Divider borderColor="rgba(255, 255, 255, 0.3)" />

          {/* Trade Details Section */}
          <Box>
            <Heading size="md" color={textColor} mb={4} textAlign="center">
              Trade Details
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {/* Team 1 Offers */}
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={3}>
                  Team 1 offers Team 2
                </Text>
                <VStack spacing={4}>
                  <FormControl id="team1-offer-amount">
                    <FormLabel color={textColor}>Bid Amount</FormLabel>
                    <Input
                      placeholder="e.g., 5,000"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      color={textColor}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                  <FormControl id="team1-offer-property">
                    <FormLabel color={textColor}>Property</FormLabel>
                    <Input
                      placeholder="e.g., 2 x Skilled Labour"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      color={textColor}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Team 1 Receives */}
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={3}>
                  Team 1 receives from Team 2
                </Text>
                <VStack spacing={4}>
                  <FormControl id="team1-receive-amount">
                    <FormLabel color={textColor}>Bid Amount</FormLabel>
                    <Input
                      placeholder="e.g., 2,500"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      color={textColor}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                  <FormControl id="team1-receive-property">
                    <FormLabel color={textColor}>Property</FormLabel>
                    <Input
                      placeholder="e.g., 1 x Technology"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      color={textColor}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>

          <Button
            bg="gray.50"
            color="gray.900"
            size="lg"
            alignSelf="center"
            mt={4}
            w="30%"
            borderRadius="xl"
            _hover={{ bg: "gray.200" }}
          >
            Submit Trade
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export default Round3;
