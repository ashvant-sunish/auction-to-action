// Round2User.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Center,
} from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";

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
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleReveal = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsShaking(false);
    }, 1000);
  };

  const handleReset = () => {
    setIsRevealed(false);
    setIsShaking(false);
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
            animation: ${sparkle} ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s;
          `}
        />
      ))}

      <Center>
        <VStack spacing={8}>
          {/* Mystery Box */}
          {!isRevealed && (
            <Box
              position="relative"
              width="200px"
              height="200px"
              bg={`linear-gradient(45deg, ${colors.primary[200]}, ${colors.primary[150]})`}
              border={`3px solid ${colors.primary[100]}`}
              borderRadius="20px"
              cursor="pointer"
              transition="all 0.3s ease"
              animation={isShaking ? `${boxShake} 0.5s ease-in-out 2` : ""}
              _hover={{
                transform: "scale(1.05)",
                boxShadow: `0 0 20px ${colors.primary[100]}`,
                animation: `${glowPulse} 2s infinite`,
              }}
              onClick={handleReveal}
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
                    Gain 6 Transportation, 2 Office Space
                  </Text>
                  
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

          {/* Action Button */}
          <Button
            size="lg"
            bg={colors.primary[100]}
            color={colors.white}
            _hover={{
              bg: colors.primary[50],
              transform: "translateY(-2px)",
              boxShadow: `0 8px 20px ${colors.primary[100]}44`,
            }}
            _active={{
              transform: "translateY(0)",
            }}
            borderRadius="15px"
            px={8}
            py={6}
            fontSize="lg"
            fontWeight="bold"
            transition="all 0.2s"
            onClick={isRevealed ? handleReset : handleReveal}
            disabled={isShaking}
            boxShadow={`0 4px 15px ${colors.dark}88`}
          >
            {isShaking
              ? "Opening..."
              : isRevealed
              ? "Create New Mystery"
              : "Open Mystery Box"}
          </Button>
        </VStack>
      </Center>
    </Box>
  );
};

export default Round2User;
