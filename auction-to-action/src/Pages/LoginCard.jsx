import React from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  Divider,
  Image,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { IoPerson } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import a2aLogo from "../assets/images/a2a.png";
import { Link } from "react-router-dom"; // Import Link component

function LoginCard() {
  return (
    <Box
      w={{ base: "90%", md: "500px" }}
      bg="rgba(255,255,255,0.3)"
      backdropFilter="blur(15px)"
      boxShadow="0px 4px 10px rgba(0,0,0,0.6)"
      borderRadius="53px"
      p={10}
      textAlign="center"
    >
      {/* Logo */}
      <Image
        src={a2aLogo}
        alt="Auction 2 Action Logo"
        w="250px"
        mx="auto"
        mb={6}
      />

      {/* Input Fields */}
      <VStack spacing={8}>
        {/* Team Name */}
        <InputGroup>
<InputLeftElement pointerEvents="none">
  <Box
    bg="rgba(255, 255, 255, 0.8)"
    backdropFilter="blur(6px)"
    borderRadius="50%"
    w="40px"
    h="40px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    boxShadow="0 2px 6px rgba(0,0,0,0.25)"
  >
    <IoPerson color="black" size={20} />
  </Box>
</InputLeftElement>

          <Input
            placeholder="Team Name"
            bg="rgba(217, 217, 217, 0.51)"
            backdropFilter="blur(7.5px)"
            boxShadow="0px 4px 10px rgba(0, 0, 0, 0.3)"
            border="none"
            borderRadius="12px"
            color="white"
            _placeholder={{ color: "whiteAlpha.800" }}
            h="45px"
            pl="80px"
          />
        </InputGroup>

        {/* Password */}
        <InputGroup>
          <Input
            type="password"
            placeholder="Password"
            bg="rgba(217, 217, 217, 0.49)"
            backdropFilter="blur(7.5px)"
            boxShadow="0px 4px 10px rgba(0, 0, 0, 0.3)"
            border="none"
            borderRadius="12px"
            color="white"
            _placeholder={{ color: "whiteAlpha.800" }}
            h="45px"
            pr="80px"
          />
<InputRightElement>
  <Box
    bg="rgba(255, 255, 255, 0.8)"
    backdropFilter="blur(6px)"
    borderRadius="50%"
    w="40px"
    h="40px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    boxShadow="0 2px 6px rgba(0,0,0,0.25)"
  >
    <IoIosLock color="black" size={20} />
  </Box>
</InputRightElement>

        </InputGroup>
      </VStack>

      {/* Login Button */}
      <Button
        mt={12}
        w="359px"
        h="58px"
        bg="#107074"
        color="white"
        fontWeight="500"
        fontSize="20px"
        borderRadius="15px"
        boxShadow="0px 4px 10px rgba(0,0,0,0.3)"
        _hover={{ bg: "#0c5a5d" }}
      >
        Login
      </Button>

      {/* Divider */}
      <Flex align="center" my={10}>
        <Divider borderColor="white" w="166px" />
        <Box
          border="1px solid white"
          borderRadius="50%"
          w="20px"
          h="20px"
          mx={2}
        />
        <Divider borderColor="white" w="166px" />
      </Flex>

      {/* Admin Login */}
      <Link to="/admin-login">
        <Text fontSize="12px" color="white" fontWeight="300" cursor="pointer">
          Admin Login
        </Text>
      </Link>
    </Box>
  );
}

export default LoginCard;
