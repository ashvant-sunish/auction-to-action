import { Box, Flex, Heading, IconButton } from '@chakra-ui/react'
import React from 'react'
import { RiAdminLine } from "react-icons/ri";

function TotalAdminsAdmin({ TotalAdmins }) {
  return (
    <Box bg="white" p={4} mt={2} borderRadius="md" width="80%" float="right">
      <Flex align="center" height="100%">
        <Box borderRadius={10} bg="transparent">
          <RiAdminLine size="40" />
        </Box>
        <Box>
          <Flex direction="column" ml={4}>
            <Heading size="xs" > Total Admins Count</Heading>
            <Heading size="md" color="teal.500" mt={1} ml={4}>{TotalAdmins}</Heading>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default TotalAdminsAdmin