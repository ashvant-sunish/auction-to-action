import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import AdminTableAdmin from './AdminManagement/AdminTable.Admin'

function AdminManagementAdmin() {
    return (
        <Box width="80%" float="right">
            <Box bg="transparent" p={4} mt={2} borderRadius="md" textColor="white">
                <Heading>Admin Management</Heading>
            </Box>
            <AdminTableAdmin />
        </Box>
    )
}

export default AdminManagementAdmin
