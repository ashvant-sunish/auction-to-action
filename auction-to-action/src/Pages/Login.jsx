import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, Text, Link, Image, VStack } from "@chakra-ui/react";
import LoginComponentUser from "../Components/Login/User/LoginComponent.User";
import illustration from "../assets/images/login_illustrationbg.png";
import LoginComponentAdmin from "../Components/Login/Admin/LoginComponent.Admin";

function Login() {
  const [page, setPage] = useState(true); // true for "user", false for "admin"

  useEffect(() => {
    // Hide the scrollbar when the Login component is mounted
    document.body.style.overflow = "hidden";

    // Restore the scrollbar when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  // Admin (Teal) Theme
  const tealBase = "#0f3b3d"; 
  const tealMid = "#154a4c"; 
  const tealDeep = "#0a2f31"; 
  const goldSoft = "rgba(199,152,58,0.18)";
  const whiteSoft = "rgba(255,255,255,0.10)";

  // User (Graphite) Theme
  const graphBase = "#080b0f";
  const graphMid = "#11161d";
  const yellowSoft = "rgba(232,255,0,0.1)";
  const yellowGlow = "rgba(232,255,0,0.05)";

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg={page ? graphBase : tealBase}
      className={page ? "user-app-root" : ""}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient: page 
          ? `linear(135deg, ${graphBase} 0%, ${graphMid} 50%, ${graphBase} 100%)`
          : `linear(135deg, ${tealDeep} 0%, ${tealBase} 40%, ${tealMid} 70%, ${tealDeep} 100%)`,
        opacity: 0.9,
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgImage: page 
          ? `
              radial-gradient(800px 800px at 50% -20%, ${yellowSoft} 0%, transparent 60%),
              radial-gradient(600px 600px at -10% 80%, ${yellowGlow} 0%, transparent 60%)
            `
          : `
              radial-gradient(600px 300px at 85% 20%, ${goldSoft} 0%, transparent 60%),
              radial-gradient(520px 260px at 15% 70%, ${whiteSoft} 0%, transparent 65%),
              radial-gradient(380px 240px at 60% 80%, ${goldSoft} 0%, transparent 70%)
            `,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Flex minH="100vh" position="relative" zIndex={2}>
        {/* LEFT SIDE */}
        <VStack
          flex={1.5}
          display={{ base: "none", md: "flex" }}
          bg="transparent"
          p={10}
          spacing={8}
          align="flex-start"
          justify="space-between"
        >
          <VStack align="flex-start" spacing={0}></VStack>

          {/* Text Block */}
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
        </VStack>

        {/* RIGHT SIDE */}
        <Flex
          flex={1}
          p={{ base: 4, sm: 8, md: 12 }}
          align="center"
          justify="center"
          direction="column"
          bg="transparent"
        >
          <Box w="100%" maxW="520px">
            {page ? <LoginComponentUser /> : <LoginComponentAdmin />}
            <Text mt={6} textAlign="center" color="white">
              {page ? "Are you an Admin?" : "Are you a Player?"}{" "}
              <Link
                color={page ? "#e8ff00" : "teal.200"}
                fontWeight="bold"
                onClick={() => setPage(!page)}
              >
                Click Here
              </Link>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Login;
