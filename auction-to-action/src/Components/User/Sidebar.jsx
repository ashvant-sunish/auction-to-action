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
      bg="rgba(15, 59, 61, 0.5)"
      backdropFilter="blur(10px)"
      color="white"
      p={4}
      display={{ base: "none", md: "block" }}
      transition="width 0.2s ease-in-out"
      borderRight="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
    >
      <VStack align="stretch" spacing={4} h="full">
        <Flex align="center" justify={isCollapsed ? "center" : "space-between"}>
          {!isCollapsed && <CsedLogo />}
          <IconButton
            icon={isCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
            onClick={onToggle}
            variant="ghost"
            color="white"
            aria-label="Toggle Sidebar"
            fontSize="24px"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          />
        </Flex>

        <Divider borderColor="rgba(255, 255, 255, 0.2)" />

        <VStack align="stretch" spacing={2} mt={4}>
          {navItems.map((item) => (
            <Tooltip
              key={item.key}
              label={item.name}
              placement="right"
              isDisabled={!isCollapsed}
              hasArrow
              bg="gray.800"
              color="white"
            >
              <Link
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
                justifyContent={isCollapsed ? "center" : "flex-start"}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)", cursor: "pointer" }}
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
      </VStack>
    </Box>
  );
};

export default Sidebar;
