import { Box, Heading } from "@chakra-ui/react";
import React from "react";

function NavbarAdmin({ setfile, file }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "bidhistory", label: "Bid History" },
    { key: "adminmanagement", label: "Admin Management" },
    { key: "teamsmanagement", label: "Teams Management" },
    { key: "rounds", label: "Rounds" },
  ];

  return (
    <Box float="left" w="20%" h="100vh" p={2} bg="transparent" position="fixed">
      <Box bg="white" p={4} borderRadius="md" h="100%" display="flex" flexDirection="column">
        <Box as="nav" display="flex" flexDirection="column" gap={3} flex="1">
          <Box borderBottom="1px" borderColor="gray.200" p={3}>
            <Box
              p={2}
              textAlign="center"
              userSelect="none"
              color="bg"
            >
              <Heading size="md" color="bg" letterSpacing="wider">
                CSED ADMIN
              </Heading>
            </Box>
          </Box>
          {navItems.map((item) => (
            <Box
              key={item.key}
              onClick={() => setfile(item.key)}
              p={2}
              borderBottom="1px"
              borderColor="gray.200"
              cursor="pointer"
              userSelect="none"
              _hover={
                file !== item.key ? { bg: "gray.50", borderRadius: "md" } : {}
              }
            >
              {file === item.key ? (
                <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                  {item.label}
                </Box>
              ) : (
                <Box p={3}>{item.label}</Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default NavbarAdmin;
