import React from "react";
import { Box, Button } from "@chakra-ui/react";

function RoundLinksAdmin({ setfile }) {
  return (
    <Box
      bg="transparent"
      p={4}
      mt={4}
      borderRadius="md"
      width="79%"
      float="right"
      ml={2}
      mr={2}
      textAlign={"center"}
    >
      <Button colorScheme="teal" onClick={() => setfile("rounds")}>
        View Rounds
      </Button>
    </Box>
  );
}

export default RoundLinksAdmin;
