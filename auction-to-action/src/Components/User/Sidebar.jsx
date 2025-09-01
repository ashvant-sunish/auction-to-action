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

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const navItems = [
    { name: "Dashboard", icon: MdDashboard, key: "dashboard" },
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
      bg="#111c44"
      color="white"
      p={4}
      display={{ base: "none", md: "block" }}
    >
      <VStack align="stretch" spacing={4} h="full">
        <Box p={4} display="flex" alignItems="center" justifyContent="center">
          <CsedLogo />
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
      </VStack>
    </Box>
  );
};

export default Sidebar;
