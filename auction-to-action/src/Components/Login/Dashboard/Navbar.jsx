import React from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Icon,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tooltip,
} from "@chakra-ui/react";
import { MdHome, MdPerson } from "react-icons/md";

const Navbar = () => {
  const location = useLocation();

  let pageTitle = "Dashboard";
  switch (location.pathname) {
    case "/userdashboard":
      pageTitle = "Dashboard";
      break;
    case "/my-bids":
      pageTitle = "My Bidding History";
      break;
    case "/team-bids":
      pageTitle = "Team Bid History";
      break;
  }

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
      <Box>
        <Breadcrumb separator="/">
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              <Icon as={MdHome} color="gray.600" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#" fontWeight="bold">
              {pageTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Box>

      <HStack spacing={4}>
        <Tooltip label="Profile" hasArrow>
          <IconButton
            variant="ghost"
            aria-label="Profile"
            icon={<Icon as={MdPerson} />}
            size="lg"
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default Navbar;
