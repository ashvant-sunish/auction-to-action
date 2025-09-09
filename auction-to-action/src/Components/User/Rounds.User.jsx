import { Box, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import React from "react";
import Round3User from "./Rounds/Round3.User.jsx";
import Round2 from "./Rounds/Round2.User.jsx";
// Placeholder components for Round 1 and 2
const Round1User = () => (
  <Box>
    <Text fontSize="lg" fontWeight="bold" color="teal.200">
      Round 1
    </Text>
    <Text mt={2}>
      Round 1 content will be displayed here when the round is active.
    </Text>
  </Box>
);
const Round2User = () => (
  <Box>
    <Text fontSize="lg" fontWeight="bold" color="teal.200">
      Round 2
    </Text>
    <Round2 />
  </Box>
);

function RoundsUser({ gameState }) {
  const tabStyles = {
    color: "white",
    border: "1px solid",
    borderColor: "teal.600",
    borderRadius: "md",
    mx: 1,
    bg: "teal.700",
    _selected: {
      color: "white",
      bg: "teal.500",
      borderColor: "teal.300",
      fontWeight: "bold",
      boxShadow: "0 0 8px rgba(129, 230, 217, 0.5)",
    },
    _hover: {
      bg: "teal.600",
    },
    _disabled: {
      opacity: 0.4,
      cursor: "not-allowed",
      bg: "gray.600",
      borderColor: "gray.500",
    },
  };

  const renderTabContent = () => {
    switch (gameState) {
      case 1: // Round 1 ongoing
        return <Round1User />;
      case 3: // Round 2 ongoing
        return <Round2User />;
      case 5: // Round 3 ongoing
        return <Round3User />;
      default: // Not started, or between rounds (states 0, 2, 4, 6)
        return (
          <Box p={4} color="white" borderRadius="md" mt={4} textAlign="center">
            <Text fontSize="xl" fontWeight="bold">
              Please Wait
            </Text>
            <Text mt={2}>The current round has not started or has ended.</Text>
          </Box>
        );
    }
  };

  const getTabIndex = () => {
    if (gameState === 1 || gameState === 2) return 0;
    if (gameState === 3 || gameState === 4) return 1;
    if (gameState === 5 || gameState === 6) return 2;
    return 0;
  };

  return (
    <Box bg="transparent" minH="100vh" p={4}>
      <Box p={4} mt={2} borderRadius="xl" width="100%">
        <Tabs variant="unstyled" index={getTabIndex()} isLazy>
          <TabList gap={2}>
            <Tab
              {...tabStyles}
              isDisabled={!(gameState === 1 || gameState === 2)}
            >
              Round 1
            </Tab>
            <Tab
              {...tabStyles}
              isDisabled={!(gameState === 3 || gameState === 4)}
            >
              Round 2
            </Tab>
            <Tab
              {...tabStyles}
              isDisabled={!(gameState === 5 || gameState === 6)}
            >
              Round 3
            </Tab>
          </TabList>
        </Tabs>
        <Box mt={4}>{renderTabContent()}</Box>
      </Box>
    </Box>
  );
}

export default RoundsUser;
