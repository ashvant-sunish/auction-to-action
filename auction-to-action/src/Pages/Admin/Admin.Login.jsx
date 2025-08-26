import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, Text, Link, Image, VStack } from "@chakra-ui/react";
import LoginComponentAdmin from "../../Components/Login/Admin/LoginComponent.Admin";
import illustration from "../../assets/images/login_illustrationbg.png";

function AdminLogin() {
  const tealBase = "#0f3b3d";
  const tealMid = "#154a4c";
  const tealDeep = "#0a2f31";
  const goldSoft = "rgba(199,152,58,0.18)";
  const whiteSoft = "rgba(255,255,255,0.10)";

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg={tealBase}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient: `linear(135deg, ${tealDeep} 0%, ${tealBase} 40%, ${tealMid} 70%, ${tealDeep} 100%)`,
        opacity: 0.9,
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgImage: `
          radial-gradient(600px 300px at 85% 20%, ${goldSoft} 0%, transparent 60%),
          radial-gradient(520px 260px at 15% 70%, ${whiteSoft} 0%, transparent 65%),
          radial-gradient(380px 240px at 60% 80%, ${goldSoft} 0%, transparent 70%)
        `,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Flex minH="100vh" position="relative" zIndex={2}>
        <VStack
          flex={1.5}
          display={{ base: "none", md: "flex" }}
          bg="transparent"
          p={10}
          spacing={8}
          align="flex-start"
          justify="space-between"
        >
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              CSED
            </Text>
            <Text fontSize="md" color="white">
              VIT Vellore
            </Text>
          </VStack>

          <VStack align="flex-start" spacing={2} w="full">
            <Text
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              fontWeight="900"
              fontFamily="'Inter', sans-serif"
              textTransform="uppercase"
              letterSpacing="wide"
              color="white"
              lineHeight="1"
            >
              Auction To Action
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="white"
              fontStyle="italic"
              fontWeight="medium"
              letterSpacing="wide"
              mt={2}
            >
              When Bids Become Betrayal, Action Becomes War
            </Text>
          </VStack>

          <Image
            src={illustration}
            alt="Login Illustration"
            objectFit="contain"
            w="full"
            maxW="500px"
            alignSelf="center"
          />

          <Text fontSize="sm" color="white" alignSelf="center">
            Made with ❤️ CSED Tech Team
          </Text>
        </VStack>

        <Flex
          flex={1}
          p={{ base: 4, sm: 8, md: 12 }}
          align="center"
          justify="center"
          direction="column"
          bg="transparent"
        >
          <Box w="100%" maxW="520px">
            <LoginComponentAdmin />
            <Text mt={6} textAlign="center" color="white">
              Not an Admin?{" "}
              <Link as={RouterLink} to="/" color="teal.200" fontWeight="bold">
                Go to Participant Login
              </Link>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default AdminLogin;
