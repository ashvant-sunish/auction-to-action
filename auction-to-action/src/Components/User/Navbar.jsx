import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Icon,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { MdHome } from "react-icons/md";
import { BsPersonCircle } from "react-icons/bs";
import { CiLogout } from "react-icons/ci";

const Navbar = ({ pageTitle, onLogout, teamData, currentRound, gameState }) => {
  // Function to determine badge color based on game state
  const getBadgeColorScheme = () => {
    // States 1, 3, 5 are "Ongoing"
    if ([1, 3, 5].includes(gameState)) {
      return "green";
    }
    // States 2, 4, 6 are "Ended"
    if ([2, 4, 6].includes(gameState)) {
      return "red";
    }
    // State 0 is "Not Started"
    return "gray";
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px="4"
      py="2"
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
    >
      <HStack spacing={4}>
        <Breadcrumb separator="/">
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              <Icon as={MdHome} color="gray.600" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#" fontWeight="bold">
              {pageTitle || "Dashboard"}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        {/* --- CHANGE: Added the Round Status Badge --- */}
        <Badge
          colorScheme={getBadgeColorScheme()}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
        >
          {currentRound}
        </Badge>
      </HStack>

      <HStack spacing={4}>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<BsPersonCircle />}
            variant="none"
          />
          <MenuList bg="white" textColor="black">
            <MenuItem>Logged in as: {teamData?.teamNumber || "Team"}</MenuItem>
            <Divider />
            <MenuItem onClick={onLogout}>
              <CiLogout /> &nbsp;Log Out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

export default Navbar;
