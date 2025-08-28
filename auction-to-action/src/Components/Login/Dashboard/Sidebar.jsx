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
import { Link as RouterLink } from "react-router-dom";
import { MdDashboard, MdHistory, MdGroups } from "react-icons/md";

const CsedLogo = () => (
  <Heading size="md" color="white" letterSpacing="wider">
    CSED
  </Heading>
);

const Sidebar = () => {
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
          <Link
            as={RouterLink}
            to="/userdashboard"
            p={3}
            borderRadius="md"
            bg="rgba(255, 255, 255, 0.1)"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
          >
            <Icon as={MdDashboard} mr={3} />
            <Text>Dashboard</Text>
          </Link>
          <Link
            as={RouterLink}
            to="/my-bids"
            p={3}
            borderRadius="md"
            display="flex"
            alignItems="center"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          >
            <Icon as={MdHistory} mr={3} />
            <Text>My Bidding History</Text>
          </Link>
          <Link
            as={RouterLink}
            to="/team-bids" // Link to the new page
            p={3}
            borderRadius="md"
            display="flex"
            alignItems="center"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          >
            <Icon as={MdGroups} mr={3} />
            <Text>Team Bid History</Text>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;
