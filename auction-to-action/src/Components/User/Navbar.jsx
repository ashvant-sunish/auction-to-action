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
  Button,
  Tooltip,
  Portal,
} from "@chakra-ui/react";
import { BsPersonCircle } from "react-icons/bs";
import { CiLogout } from "react-icons/ci";
import { IoDocumentTextOutline } from "react-icons/io5";

const Navbar = ({
  pageTitle,
  onLogout,
  onViewRules,
  teamCode,
  currentRound,
  gameState,
}) => {
  // Remove the old rule state management
  // let [ruleview, setruleview] = React.useState(localStorage.getItem("rulestate"));
  // let [rulebutton, setrulebutton] = React.useState(localStorage.getItem("rulebutton"));

  // console.log("Rule View:", ruleview);
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
      bg="rgba(10, 112, 117, 0.6)"
      backdropFilter="blur(15px)"
      borderBottomWidth="1px"
      borderColor="rgba(255, 255, 255, 0.2)"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
    >
      <HStack spacing={4}>
        <Breadcrumb>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink
              href="#"
              fontSize="2xl"
              fontWeight="bold"
              color="white"
            >
              {pageTitle || "Dashboard"}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
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
      <Flex flex="1" justify="flex-end" gap={4}>
        <HStack>
          <Tooltip label="Rules" placement="bottom" bg="gray.800" color="white">
            <IconButton
              icon={<IoDocumentTextOutline />}
              onClick={onViewRules}
              bg="transparent"
              color="white"
              _hover={{
                bg: "rgba(255, 255, 255, 0.1)",
              }}
              _active={{ bg: "rgba(255, 255, 255, 0.05)" }}
              size="lg"
              aria-label="Rules"
              variant="ghost"
              fontSize="24px"
            />
          </Tooltip>
        </HStack>
        <HStack spacing={4}>
          <Menu>
            <Tooltip
              label="Profile"
              placement="bottom"
              bg="gray.800"
              color="white"
            >
              <MenuButton
                as={IconButton}
                aria-label="Profile Options"
                icon={<BsPersonCircle />}
                variant="ghost"
                color="white"
                bg="transparent"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.1)",
                }}
                _active={{ bg: "rgba(255, 255, 255, 0.05)" }}
                size="lg"
              />
            </Tooltip>
            <Portal>
              <MenuList
                bg="rgba(15, 59, 61, 0.95)"
                backdropFilter="blur(20px)"
                border="1px solid rgba(255, 255, 255, 0.3)"
                borderRadius="lg"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
                color="white"
                zIndex={99999}
                sx={{
                  zIndex: "99999 !important",
                }}
              >
                <MenuItem
                  bg="transparent"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  _focus={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  borderRadius="md"
                  mx={0.25}
                  my={0.5}
                  py={2}
                  px={2}
                  fontSize="sm"
                  whiteSpace="nowrap"
                >
                  Logged in as: {teamCode || "Team"}
                </MenuItem>
                <Divider borderColor="rgba(255, 255, 255, 0.3)" my={1} />
                <MenuItem
                  onClick={onLogout}
                  bg="transparent"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  _focus={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  borderRadius="md"
                  mx={0.25}
                  my={0.5}
                  py={2}
                  px={2}
                  fontSize="sm"
                  whiteSpace="nowrap"
                >
                  <CiLogout /> &nbsp;Log Out
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default Navbar;
