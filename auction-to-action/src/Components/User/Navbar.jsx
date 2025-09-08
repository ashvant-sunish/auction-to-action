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
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
} from "@chakra-ui/react";
import { MdHome, MdPerson } from "react-icons/md";
import { BsPersonCircle } from "react-icons/bs";
import { CiLogout } from "react-icons/ci";

const Navbar = ({ pageTitle, onLogout, teamData, }) => {
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
              {pageTitle || "Dashboard"}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Box>

      <HStack spacing={4}>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<BsPersonCircle />}
            variant='none'
          />
          <MenuList bg="white" textColor="black">
            <MenuItem>
              Logged in as: {teamData?.teamNumber || "Team"}
            </MenuItem>
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
