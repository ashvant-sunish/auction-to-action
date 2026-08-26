import { Box, Text } from "@chakra-ui/react";
import React from "react";
import Round3User from "./Rounds/Round3.User.jsx";
import Round2User from "./Rounds/Round2.User.jsx";
import Round1User from "./Rounds/Round1.User.jsx";

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

function RoundsUser({ gameState }) {
  const renderRoundContent = () => {
    switch (gameState) {
      case 1: // Round 1 ongoing
        return (
          <Box width="100%" height="100%">
            <Round1User />
          </Box>
        );
      case 3: // Round 2 ongoing
        return (
          <Box borderRadius="full" bg="transparent">
            <Round2User />
          </Box>
        );
      case 5: // Round 3 ongoing
        return (
          <Box>
            <Round3User />
          </Box>
        );
      default: // Not started, or between rounds (states 0, 2, 4, 6)
        return (
          <Box
            p={8}
            color="white"
            borderRadius="2xl"
            mt={4}
            textAlign="center"
            bg="rgba(13, 17, 23, 0.8)"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Text fontSize="2xl" fontWeight="bold" color="#e8ff00">
              Please Wait
            </Text>
            <Text mt={4} fontSize="lg" opacity={0.8}>
              The current round has not started or has ended.
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box width="100%" height="100%">
      {renderRoundContent()}
    </Box>
  );
}

export default RoundsUser;
