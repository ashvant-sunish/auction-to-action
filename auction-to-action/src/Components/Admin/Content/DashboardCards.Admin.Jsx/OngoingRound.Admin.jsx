import { Box, Flex, Heading, IconButton } from '@chakra-ui/react'
import React from 'react'
import { FaArrowTrendUp } from "react-icons/fa6";

function OngoingRoundAdmin({ ongoingRound }) {
    return (
        <Box bg="white" p={4} mt={2} borderRadius="md" width="80%" float="right">
            <Flex align="center" height="100%">
                <Box borderRadius={10} bg="transparent">
                    <FaArrowTrendUp size="40" />
                </Box>
                <Box>
                    <Flex direction="column" align="center" justify="center" ml={4}>
                        <Heading size="xs" >Ongoing Round</Heading>
                        <Heading size="md" color="teal.500" mt={1} ml={4}>{ongoingRound}</Heading>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    )
}

export default OngoingRoundAdmin