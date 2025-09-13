import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import TeamTableAdmin from './TeamManagment/TeamTable.Admin'

function TeamsManagementAdmin() {
    return (
        <Box width="79%" float="right" ml={2} mr={2}>
            <Box bg="transparent" p={4} mt={2} borderRadius="md" textColor="white">
                <Heading>Teams Management</Heading>
            </Box>
            <TeamTableAdmin />
        </Box>
    )
}

export default TeamsManagementAdmin

