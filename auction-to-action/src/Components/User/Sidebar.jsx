import React from "react";
import {
  Box,
  VStack,
  Text,
  Link,
  Divider,
  Icon,
  Heading,
  Flex,
  IconButton,
  Tooltip,
  Img,
} from "@chakra-ui/react";
import {
  MdDashboard,
  MdHistory,
  MdGroups,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { FaHardHat } from "react-icons/fa";
import logo from "../../assets/images/csedlogo/csedwhite.png"; // Import the logo image
import gravitasLogo from "../../assets/images/gravitasA2A.png"; // Import the gravitas A2A logo


const CsedLogo = () => (
  <Heading size="md" color="white" letterSpacing="wider">
    <Img src={logo} alt="CSED Logo" />
  </Heading>
);

const Sidebar = ({
  setActiveComponent,
  activeComponent,
  isCollapsed,
  onToggle,
  gameState,
}) => {
  const navItems = [
    { name: "Dashboard", icon: MdDashboard, key: "dashboard" },
    { name: "Auction Rounds", icon: RiAuctionLine, key: "rounds" },
    { name: "My History", icon: MdHistory, key: "my-bids" },
    { name: "Trading Market", icon: MdGroups, key: "trading-market" },
    {
      name: "Enterprise Construction",
      icon: FaHardHat,
      key: "enterprise-construction",
    },
  ];

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="full"
      w={isCollapsed ? "80px" : "260px"}
      bg="theme.sidebar"
      backdropFilter="blur(10px)"
      color="theme.textPrimary"
      p={4}
      display={{ base: "none", md: "block" }}
      transition="width 0.2s ease-in-out"
      borderRight="1px solid"
      borderColor="theme.outline"
      overflowX="hidden"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          background: "var(--outline)",
          borderRadius: "4px",
        },
      }}
    >
      <VStack align="stretch" spacing={4} h="full">
        <Flex align="center" justify={isCollapsed ? "center" : "space-between"}>
          {!isCollapsed && <CsedLogo />}
          <IconButton
            icon={isCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
            onClick={onToggle}
            variant="ghost"
            color="theme.textSecondary"
            aria-label="Toggle Sidebar"
            fontSize="24px"
            _hover={{ bg: "theme.surfaceContainer", color: "theme.textPrimary" }}
          />
        </Flex>

        <Divider borderColor="theme.outline" />

        <VStack align="stretch" spacing={2} mt={2} flex="1">
          {navItems.map((item) => (
            <Tooltip
              key={item.key}
              label={item.name}
              placement="right"
              isDisabled={!isCollapsed}
              hasArrow
              bg="theme.surfaceHigh"
              color="theme.textPrimary"
            >
              <Link
                onClick={() => setActiveComponent(item.key)}
                p={3}
                borderRadius="md"
                bg={
                  activeComponent === item.key
                    ? "theme.primaryContainer"
                    : "transparent"
                }
                color={activeComponent === item.key ? "theme.onPrimaryContainer" : "theme.textSecondary"}
                border={activeComponent === item.key ? "1px solid var(--outline)" : "none"}
                shadow="none"
                fontWeight="500"
                fontSize="15px"
                display="flex"
                alignItems="center"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                _hover={{
                  bg: "theme.surfaceContainer",
                  cursor: "pointer",
                  color: activeComponent === item.key ? "theme.onPrimaryContainer" : "theme.textPrimary",
                }}
              >
                <Icon as={item.icon} boxSize={6} />
                {!isCollapsed && (
                  <Text ml={3} transition="opacity 0.2s ease-in-out">
                    {item.name}
                  </Text>
                )}
              </Link>
            </Tooltip>
          ))}
        </VStack>

        {/* Gravitas A2A Logo at bottom */}
        <Box
          mt="auto"
          pt={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          w="full"
        >
          <Divider borderColor="theme.outline" mb={3} />
          <Tooltip
            label="Auction to Action 3.0"
            placement="right"
            isDisabled={!isCollapsed}
            hasArrow
            bg="theme.surfaceHigh"
            color="theme.textPrimary"
          >
            <Box
              w="full"
              display="flex"
              justifyContent="center"
              alignItems="center"
              px={isCollapsed ? 0 : 2}
            >
              <Img
                src={gravitasLogo}
                alt="Auction to Action"
                maxW="full"
                maxH={isCollapsed ? "50px" : "150px"}
                objectFit="contain"
                transition="all 0.2s ease-in-out"
              />
            </Box>
          </Tooltip>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
