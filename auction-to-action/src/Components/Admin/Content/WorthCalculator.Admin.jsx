import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import WorthCalculatorTableAdmin from './WorthCalculator/WorthCalculatorTable.Admin'

function WorthCalculatorAdmin() {
    return (
        <Box width="79%" float="right" ml={2} mr={2}>
            <Box bg="transparent" p={4} mt={2} borderRadius="md" textColor="white">
                <Heading>Worth Calculator</Heading>
            </Box>
            <WorthCalculatorTableAdmin />
        </Box>
    )
}

export default WorthCalculatorAdmin
