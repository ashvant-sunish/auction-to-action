import React from 'react'
import { Alert, AlertDescription, AlertTitle, Box, Heading } from '@chakra-ui/react'


function RoundLinksAdmin({ setfile }) {
    return (
        <Box bg="white" p={4} mt={4} borderRadius="md" width="79%" float="right" ml={2} mr={2}>
            <Alert status='success' borderRadius="md" justifyContent="center" alignItems="center">
                <AlertTitle>Click Here To</AlertTitle>
                <AlertDescription>
                    <Heading onClick={() => setfile('rounds')} textColor='teal' ml={2} size='md'>
                        View Rounds
                    </Heading>
                </AlertDescription>
            </Alert>
        </Box>
    )
}

export default RoundLinksAdmin
