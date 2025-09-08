import { Box, Flex, Heading, IconButton } from '@chakra-ui/react'
import React from 'react'
import { FaArrowTrendUp } from "react-icons/fa6";

function OngoingRoundAdmin({ ongoingRound }) {

    const getRoundLabel = (round) => {
        switch (round) {
            case 0:
                return "Not Yet Started";
            case 1:
                return "Round One";
            case 2:
                return "Round Ended";
            case 3:
                return "Round Two";
            case 4:
                return "Round Two Ended";
            case 5:
                return "Round Three";
            case 6:
                return "Round Three Ended";
            default:
                return "Unknown Round";
        }
    };

    return (
        <Box bg="white" p={4} mt={2} borderRadius="md" width="80%" float="right">
            <Flex align="center" height="100%">
                <Box borderRadius={10} bg="transparent">
                    <FaArrowTrendUp size="40" />
                </Box>
                <Box>
                    <Flex direction="column" justify="center" ml={4}>
                        <Heading size="xs" >Ongoing Round </Heading>
                        <Heading size="md" color="teal.500" mt={1} ml={4}>{getRoundLabel(ongoingRound)}</Heading>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    )
}

export default OngoingRoundAdmin