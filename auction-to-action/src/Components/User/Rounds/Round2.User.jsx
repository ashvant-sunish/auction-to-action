import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Center,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";
import io from "socket.io-client";
import serverUrl from "./../../../servercon";

// Custom theme colors
const colors = {
  primary: {
    50: "#6BA3BE",
    100: "#0C969C",
    150: "#0A7075",
    200: "#032F30",
  },
  dark: "#031716",
  bg: "#274D60",
  white: "#FFFFFF",
};

// Animation keyframes
const boxShake = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-2deg) scale(1.05); }
  50% { transform: rotate(2deg) scale(1.1); }
  75% { transform: rotate(-1deg) scale(1.05); }
`;

const cardPop = keyframes`
  0% { 
    transform: translateY(100px) scale(0.5) rotateY(180deg);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) scale(1.1) rotateY(90deg);
    opacity: 0.8;
  }
  100% { 
    transform: translateY(0) scale(1) rotateY(0deg);
    opacity: 1;
  }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px ${colors.primary[100]}; }
  50% { box-shadow: 0 0 40px ${colors.primary[50]}, 0 0 60px ${colors.primary[100]}; }
`;

const Round2User = () => {
  const [revealedBox, setRevealedBox] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [socket, setSocket] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Listen for mystery box reveals
    newSocket.on("mysteryBoxRevealed", (boxData) => {
      console.log("Mystery box revealed for users:", boxData);
      handleAdminReveal(boxData);
    });

    // Listen for reset events
    newSocket.on("mysteryBoxReset", () => {
      handleReset();
    });

    // Listen for undo events
    newSocket.on("mysteryBoxUndo", () => {
      handleReset();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Auto reset timer
  useEffect(() => {
    let timer;
    if (isRevealed && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleReset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRevealed, countdown]);

  const handleAdminReveal = (boxData) => {
    setIsShaking(true);
    setRevealedBox(boxData);

    setTimeout(() => {
      setIsRevealed(true);
      setIsShaking(false);
      setCountdown(60); // Start 60 second countdown
    }, 1000);
  };

  const handleReset = () => {
    setIsRevealed(false);
    setIsShaking(false);
    setRevealedBox(null);
    setCountdown(0);
  };

  const getRewardTypeColor = (type) => {
    switch (type) {
      case "cash":
        return colors.primary[50];
      case "resources":
        return "#4A90E2";
      case "challenge":
        return "#FF8C42";
      case "nothing":
        return "#8A8A8A";
      default:
        return colors.primary[100];
    }
  };

  return (
    <Box
      minH="100vh"
      bg={`linear-gradient(135deg, ${colors.dark} 0%, ${colors.bg} 50%, ${colors.primary[200]} 100%)`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background particles */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          position="absolute"
          width="4px"
          height="4px"
          bg={colors.primary[50]}
          borderRadius="50%"
          top={`${Math.random() * 100}%`}
          left={`${Math.random() * 100}%`}
          css={css`
            animation: ${sparkle} ${2 + Math.random() * 3}s infinite
              ${Math.random() * 2}s;
          `}
        />
      ))}

      <Center>
        <VStack spacing={8}>
          {/* Status Header */}
          {isRevealed && revealedBox && (
            <Flex direction="column" align="center" spacing={2}>
              <Badge
                colorScheme={
                  revealedBox.itemType === "cash"
                    ? "green"
                    : revealedBox.itemType === "resources"
                    ? "blue"
                    : revealedBox.itemType === "challenge"
                    ? "orange"
                    : "gray"
                }
                fontSize="lg"
                p={3}
                borderRadius="full"
              >
                Box {revealedBox.boxId} - {revealedBox.itemName}
              </Badge>
              {countdown > 0 && (
                <Text
                  color={colors.white}
                  fontSize="sm"
                  fontWeight="bold"
                  textShadow={`1px 1px 2px ${colors.dark}`}
                >
                  Auto-reset in {countdown}s
                </Text>
              )}
            </Flex>
          )}
          {/* Mystery Box */}
          {!isRevealed && (
            <Box
              position="relative"
              width="200px"
              height="200px"
              bg={`linear-gradient(45deg, ${colors.primary[200]}, ${colors.primary[150]})`}
              border={`3px solid ${colors.primary[100]}`}
              borderRadius="20px"
              cursor="not-allowed"
              transition="all 0.3s ease"
              animation={isShaking ? `${boxShake} 0.5s ease-in-out 2` : ""}
              opacity={0.8}
              _hover={{
                transform: "scale(1.02)",
                boxShadow: `0 0 15px ${colors.primary[100]}`,
              }}
            >
              {/* Box lid */}
              <Box
                position="absolute"
                top="-10px"
                left="-5px"
                right="-5px"
                height="30px"
                bg={`linear-gradient(45deg, ${colors.primary[150]}, ${colors.primary[100]})`}
                borderRadius="15px 15px 5px 5px"
                border={`2px solid ${colors.primary[100]}`}
                zIndex={2}
              />

              {/* Box ribbon */}
              <Box
                position="absolute"
                top="-15px"
                left="50%"
                transform="translateX(-50%)"
                width="20px"
                height="calc(100% + 30px)"
                bg={colors.primary[50]}
                zIndex={3}
              />
              <Box
                position="absolute"
                top="50%"
                left="-10px"
                transform="translateY(-50%)"
                width="calc(100% + 20px)"
                height="20px"
                bg={colors.primary[50]}
                zIndex={1}
              />

              {/* Mystery symbol */}
              <Center height="100%">
                <VStack spacing={2}>
                  <Text
                    fontSize="4xl"
                    color={colors.white}
                    fontWeight="bold"
                    textShadow={`2px 2px 4px ${colors.dark}`}
                  >
                    ?
                  </Text>
                </VStack>
              </Center>

              {/* Glow effect */}
              <Box
                position="absolute"
                inset="-20px"
                borderRadius="30px"
                bg={`radial-gradient(circle, ${colors.primary[100]}22 0%, transparent 70%)`}
                zIndex={-1}
              />
            </Box>
          )}

          {/* Revealed Card */}
          {isRevealed && (
            <Box
              width="400px"
              height="250px"
              bg={`linear-gradient(135deg, ${colors.primary[200]} 0%, ${colors.bg} 100%)`}
              borderRadius="20px"
              border={`3px solid ${colors.primary[100]}`}
              animation={`${cardPop} 0.8s ease-out`}
              position="relative"
              overflow="hidden"
              boxShadow={`0 20px 40px ${colors.dark}88, 0 0 30px ${colors.primary[100]}44`}
            >
              {/* Card background pattern */}
              <Box
                position="absolute"
                inset={0}
                opacity={0.1}
                bg={`radial-gradient(circle at 20% 80%, ${colors.primary[50]} 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, ${colors.primary[100]} 0%, transparent 50%)`}
              />

              {/* Card content */}
              <Center height="100%" p={6}>
                <VStack spacing={4}>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={colors.white}
                    textAlign="center"
                    textShadow={`2px 2px 4px ${colors.dark}`}
                    letterSpacing="wider"
                  >
                    {revealedBox?.content ||
                      revealedBox?.description ||
                      "Mystery Reward"}
                  </Text>

                  {/* Reward type indicator */}
                  {revealedBox?.itemType && (
                    <Badge
                      colorScheme={
                        revealedBox.itemType === "cash"
                          ? "green"
                          : revealedBox.itemType === "resources"
                          ? "blue"
                          : revealedBox.itemType === "challenge"
                          ? "orange"
                          : "gray"
                      }
                      fontSize="md"
                      p={2}
                      borderRadius="full"
                    >
                      {revealedBox.itemType.toUpperCase()} REWARD
                    </Badge>
                  )}

                  {/* Decorative elements */}
                  <Box
                    width="80%"
                    height="2px"
                    bg={`linear-gradient(90deg, transparent, ${colors.primary[50]}, transparent)`}
                  />
                </VStack>
              </Center>

              {/* Corner decorations */}
              {[...Array(4)].map((_, i) => (
                <Box
                  key={i}
                  position="absolute"
                  width="30px"
                  height="30px"
                  border={`2px solid ${colors.primary[50]}`}
                  borderRadius="50%"
                  {...{
                    top: i < 2 ? "15px" : "auto",
                    bottom: i >= 2 ? "15px" : "auto",
                    left: i % 2 === 0 ? "15px" : "auto",
                    right: i % 2 === 1 ? "15px" : "auto",
                  }}
                />
              ))}
            </Box>
          )}

          {/* Real-time Status Display */}
          {!isRevealed && (
            <Box
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="12"
              p={4}
              border={`1px solid ${colors.primary[100]}33`}
            >
              <Text
                color={colors.white}
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                textShadow={`1px 1px 2px ${colors.dark}`}
              >
                🎁 Round 2: Mystery Box Reveal
              </Text>
              <Text
                color={colors.primary[50]}
                textAlign="center"
                fontSize="sm"
                mt={2}
              >
                Waiting for Admin to reveal mystery boxes in real-time
              </Text>
            </Box>
          )}
        </VStack>
      </Center>
    </Box>
  );
};

export default Round2User;
