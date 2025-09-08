import React from "react";
import {
  Box,
  VStack,
  Text,
  Link,
  Divider,
  Icon,
  Heading,
} from "@chakra-ui/react";
import { MdDashboard, MdHistory, MdGroups } from "react-icons/md";

const CsedLogo = () => (
  <Heading size="md" color="white" letterSpacing="wider">
    CSED
  </Heading>
);

const Sidebar = ({ setActiveComponent, activeComponent, currentRound }) => {
  const navItems = [
    { name: "Dashboard", icon: MdDashboard, key: "dashboard" },
    { name: "Rounds", icon: MdHistory, key: "rounds" },
    { name: "My Bidding History", icon: MdHistory, key: "my-bids" },
    { name: "Team Bid History", icon: MdGroups, key: "team-bids" },
  ];

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="full"
      w="260px"
      bg="#0f3b3d"
      color="white"
      p={4}
      display={{ base: "none", md: "block" }}
    >
      <VStack align="stretch" spacing={4} h="full">
        <Box
          border={"1px solid white"}
          borderRadius={"10px"}
        >
          <Box color="white" letterSpacing="wider" p={3} justifyContent={"center"} textAlign={"center"}>
            {currentRound}
          </Box>
        </Box>
        <Divider borderColor="gray.600" />
        <VStack align="stretch" spacing={2} mt={8}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              onClick={() => setActiveComponent(item.key)}
              p={3}
              borderRadius="md"
              bg={
                activeComponent === item.key
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent"
              }
              fontWeight={activeComponent === item.key ? "bold" : "normal"}
              display="flex"
              alignItems="center"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)", cursor: "pointer" }}
            >
              <Icon as={item.icon} mr={3} />
              <Text>{item.name}</Text>
            </Link>
          ))}
        </VStack>
        <Box
          p={2}
          userSelect="none"
          mt="auto"
        >
          <Box p={4} display="flex" alignItems="center" justifyContent="center">
            <CsedLogo />
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
