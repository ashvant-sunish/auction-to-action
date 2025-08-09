import React from "react";
import { Box, Button, VStack, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, #6BA3BE, #0C969C)"
    >
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading color="white" size="2xl">
            Auction to Action
          </Heading>
          <Text color="gray.200" fontSize="lg" mt={2}>
            Please select your login type
          </Text>
        </Box>
        <VStack spacing={4} align="stretch" w="xs">
          <Button
            colorScheme="purple"
            size="lg"
            onClick={() => navigate("/admin-login")}
          >
            Admin Login
          </Button>
          <Button
            colorScheme="teal"
            size="lg"
            onClick={() => navigate("/user-login")}
          >
            User Login
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

export default Login;
