import React, { useState, useEffect } from "react";
import { Box, Text, VStack, Center, Badge, Flex } from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";
import io from "socket.io-client";
import serverUrl from "./../../../servercon";

// Custom theme colors
const colors = {
  primary: {
    50: "rgba(232, 255, 0, 0.7)",
    100: "#e8ff00",
    150: "#1c2330",
    200: "#080b0f",
  },
  dark: "#031716",
  bg: "#141920",
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
      w="100%"
      minH="calc(100vh - 80px)"
      bg="radial-gradient(circle at center, rgba(13, 17, 23, 0) 0%, rgba(8, 11, 15, 0.95) 100%), #080b0f"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="16px"
    >
      <VStack spacing={6}>
        {/* Status Header */}
        {isRevealed && revealedBox && (
          <Flex direction="column" align="center" gap={2}>
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
              bg="rgba(13, 17, 23, 0.9)"
              backdropFilter="blur(15px)"
              border="1px solid rgba(255, 255, 255, 0.08)"
              color="white"
            >
              Box {revealedBox.boxId} - {revealedBox.itemName}
            </Badge>
            {countdown > 0 && (
              <Text
                color="white"
                fontSize="sm"
                fontWeight="bold"
                bg="rgba(13, 17, 23, 0.8)"
                backdropFilter="blur(10px)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid rgba(255, 255, 255, 0.08)"
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
            opacity={0.9}
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
              <Text
                fontSize="4xl"
                color={colors.white}
                fontWeight="bold"
                textShadow={`2px 2px 4px ${colors.dark}`}
              >
                ?
              </Text>
            </Center>

            {/* Glow effect */}
            <Box
              position="absolute"
              inset="-30px"
              borderRadius="40px"
              bg={`radial-gradient(circle, ${colors.primary[100]}44 0%, transparent 70%)`}
              zIndex={-1}
              animation="pulse 2s infinite"
            />
          </Box>
        )}

        {/* Revealed Card */}
        {isRevealed && (
          <Box
            width="500px"
            height="300px"
            bg={`linear-gradient(135deg, rgba(232, 255, 0, 0.1) 0%, rgba(8, 11, 15, 0.95) 100%)`}
            borderRadius="16px"
            border={`1px solid ${colors.primary[50]}`}
            borderTop={`4px solid ${colors.primary[100]}`}
            animation={`${cardPop} 0.8s ease-out`}
            position="relative"
            overflow="hidden"
            backdropFilter="blur(16px)"
            boxShadow={`0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(232,255,0,0.15)`}
          >
            {/* Card background pattern */}
            <Box
              position="absolute"
              inset={0}
              opacity={0.3}
              bg={`radial-gradient(circle at 50% 0%, rgba(232,255,0,0.2) 0%, transparent 70%)`}
            />

            {/* Card content */}
            <Center height="100%" p={8}>
              <VStack spacing={6}>
                <Text
                  color={colors.primary[100]}
                  fontSize="sm"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  fontWeight="600"
                >
                  REWARD UNLOCKED
                </Text>
                <Text
                  fontSize="3xl"
                  fontWeight="300"
                  color={colors.white}
                  textAlign="center"
                  letterSpacing="wide"
                  lineHeight="1.2"
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
                width="15px"
                height="15px"
                border={`1px solid ${colors.primary[50]}`}
                {...{
                  top: i < 2 ? "15px" : "auto",
                  bottom: i >= 2 ? "15px" : "auto",
                  left: i % 2 === 0 ? "15px" : "auto",
                  right: i % 2 === 1 ? "15px" : "auto",
                  borderTop: i >= 2 ? "none" : undefined,
                  borderBottom: i < 2 ? "none" : undefined,
                  borderLeft: i % 2 === 1 ? "none" : undefined,
                  borderRight: i % 2 === 0 ? "none" : undefined,
                }}
              />
            ))}
          </Box>
        )}

        {/* Waiting Status - Only when box is not revealed */}
        {!isRevealed && (
          <Box
            bg="rgba(13, 17, 23, 0.8)"
            backdropFilter="blur(15px)"
            borderRadius="12"
            p={4}
            border="1px solid rgba(255, 255, 255, 0.08)"
            textAlign="center"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          >
            <Text color="white" fontSize="lg" fontWeight="bold" mb={2}>
              🎁 Round 2: Mystery Box Reveal
            </Text>
            <Text color="white" fontSize="sm" fontWeight="medium">
              Waiting for Admin to reveal mystery boxes
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default Round2User;
