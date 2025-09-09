import { Box, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import Round2User from "./Rounds/Round2.User";
import Round3User from "./Rounds/Round3.User";

function RoundsUser() {
  const [activeTab, setActiveTab] = useState(0);

  // Teal color scheme for tabs
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
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <Text fontSize="lg" fontWeight="bold" color="teal.200">
              Round 1
            </Text>
            <Text mt={2}>This is the content for Round 1.</Text>
          </Box>
        );
      case 1:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <Round2User />
          </Box>
        );
      case 2:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <Round3User />
          </Box>
        );
      default:
        return (
          <Box p={4} color="white" borderRadius="md" mt={4}>
            <Text>Select a round</Text>
          </Box>
        );
    }
  };

  return (
    <Box bg="transparent" minH="100vh" p={4}>
      <Box p={4} mt={2} borderRadius="xl" width="100%">
        <Tabs variant="unstyled" index={activeTab} onChange={setActiveTab}>
          <TabList gap={2}>
            <Tab {...tabStyles}>Round 1</Tab>
            <Tab {...tabStyles}>Round 2</Tab>
            <Tab {...tabStyles}>Round 3</Tab>
          </TabList>
        </Tabs>
        {renderTabContent()}
      </Box>
    </Box>
  );
}

export default RoundsUser;
