import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import AdminTableAdmin from './AdminManagement/AdminTable.Admin'

function AdminManagementAdmin() {
    return (
        <Box width="79%" float="right" mr={2} ml={2}>
            <Box bg="transparent" p={4} mt={2} borderRadius="md" textColor="white">
                <Heading>Admin Management</Heading>
            </Box>
            <AdminTableAdmin />
        </Box>
    )
}

export default AdminManagementAdmin
