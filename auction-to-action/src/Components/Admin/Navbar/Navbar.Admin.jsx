import { Box } from "@chakra-ui/react";
import React from "react";

function NavbarAdmin({ setfile, file }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "bidhistory", label: "Bid History" },
    { key: "adminmanagement", label: "Admin Management" },
    { key: "teamsmanagement", label: "Teams Management" },
    { key: "rounds", label: "Rounds" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <Box float="left" w="20%" h="100vh" p={2} bg="transparent" position="fixed">
      <Box bg="white" p={4} borderRadius="md" h="100%">
        <Box as="nav" display="flex" flexDirection="column" gap={3}>
          <Box borderBottom="1px" borderColor="gray.200" p={3}>
            <Box
              borderRadius="5px"
              borderWidth="1px"
              borderColor="bg"
              p={2}
              textAlign="center"
              userSelect="none"
            >
              <h2>Admin Navigation</h2>
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
