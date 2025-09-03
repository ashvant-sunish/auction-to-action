import { Box } from '@chakra-ui/react'
import React from 'react'

function NavbarAdmin({ setfile, file }) {
    return (
        <Box float="left" w="20%" h="100vh" p={2} bg="transparent" position="fixed">
            <Box bg="white" p={4} borderRadius="md" h="100%">
                <Box as="nav" display="flex" flexDirection="column" gap={3}>
                    <Box borderBottom="1px" borderColor="gray.200" p={3}>
                        <Box borderRadius="5px" borderWidth="1px" borderColor="bg" p={2} textAlign="center">
                            <h2>Admin Navigation</h2>
                        </Box>
                    </Box>
                    <Box onClick={() => setfile('dashboard')} p={2} borderBottom="1px" borderColor="gray.200">
                        {file == 'dashboard' ? <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                            Dashboard
                        </Box> : <Box p={3}>Dashboard</Box>}
                    </Box>
                    <Box onClick={() => setfile('bidhistory')} p={2} borderBottom="1px" borderColor="gray.200">
                        {file == 'bidhistory' ? <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                            Bid History
                        </Box> : <Box p={3}>Bid History</Box>}
                    </Box>
                    <Box onClick={() => setfile('adminmanagement')} p={2} borderBottom="1px" borderColor="gray.200">
                        {file == 'adminmanagement' ? <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                            Admin Management
                        </Box> : <Box p={3}>Admin Management</Box>}
                    </Box>
                    <Box onClick={() => setfile('teamsmanagement')} p={2} borderBottom="1px" borderColor="gray.200">
                        {file == 'teamsmanagement' ? <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                            Teams Management
                        </Box> : <Box p={3}>Teams Management</Box>}
                    </Box>
                    <Box onClick={() => setfile('rounds')} p={2} borderBottom="1px" borderColor="gray.200">
                        {file == 'rounds' ? <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                            Rounds
                        </Box> : <Box p={3}>Rounds</Box>}
                    </Box>
                    <Box onClick={() => setfile('settings')} p={2} borderBottom="1px" borderColor="gray.200">
                        {file == 'settings' ? <Box bg="primary.150" p={3} borderRadius="5px" color="white">
                            Settings
                        </Box> : <Box p={3}>Settings</Box>}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default NavbarAdmin
