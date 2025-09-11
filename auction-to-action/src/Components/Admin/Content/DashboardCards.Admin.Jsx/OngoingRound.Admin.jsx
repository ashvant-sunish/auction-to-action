import { Box, Flex, Heading, IconButton, Badge, Circle } from '@chakra-ui/react'
import React from 'react'
import { FaArrowTrendUp, FaPlay, FaStop, FaPause } from "react-icons/fa6";

function OngoingRoundAdmin({ ongoingRound }) {

    const getRoundData = (round) => {
        switch (round) {
            case 0:
                return { 
                    label: "Not Yet Started", 
                    color: "gray.500", 
                    bgColor: "gray.100",
                    icon: <FaPause size="16" />,
                    badgeColor: "gray",
                    status: "Waiting"
                };
            case 1:
                return { 
                    label: "Round One", 
                    color: "green.500", 
                    bgColor: "green.50",
                    icon: <FaPlay size="16" />,
                    badgeColor: "green",
                    status: "Live"
                };
            case 2:
                return { 
                    label: "Round One", 
                    color: "orange.500", 
                    bgColor: "orange.50",
                    icon: <FaStop size="16" />,
                    badgeColor: "orange",
                    status: "Ended"
                };
            case 3:
                return { 
                    label: "Round Two", 
                    color: "green.500", 
                    bgColor: "green.50",
                    icon: <FaPlay size="16" />,
                    badgeColor: "green",
                    status: "Live"
                };
            case 4:
                return { 
                    label: "Round Two", 
                    color: "orange.500", 
                    bgColor: "orange.50",
                    icon: <FaStop size="16" />,
                    badgeColor: "orange",
                    status: "Ended"
                };
            case 5:
                return { 
                    label: "Round Three", 
                    color: "green.500", 
                    bgColor: "green.50",
                    icon: <FaPlay size="16" />,
                    badgeColor: "green",
                    status: "Live"
                };
            case 6:
                return { 
                    label: "Round Three", 
                    color: "blue.500", 
                    bgColor: "blue.50",
                    icon: <FaStop size="16" />,
                    badgeColor: "blue",
                    status: "Complete"
                };
            default:
                return { 
                    label: "Unknown Round", 
                    color: "gray.500", 
                    bgColor: "gray.100",
                    icon: <FaPause size="16" />,
                    badgeColor: "gray",
                    status: "Unknown"
                };
        }
    };

    const roundData = getRoundData(ongoingRound);

    return (
        <Box bg="white" p={4} mt={2} borderRadius="md" width="80%" float="right" borderLeft="4px" borderColor={roundData.color}>
            <Flex align="center" height="100%" justify="space-between">
                <Flex align="center">
                    <Box borderRadius={10} bg={roundData.bgColor} p={3} color={roundData.color}>
                        <FaArrowTrendUp size="24" />
                    </Box>
                    <Box ml={4}>
                        <Flex direction="column" justify="center">
                            <Flex align="center" gap={2}>
                                <Heading size="xs">Ongoing Round</Heading>
                                <Badge colorScheme={roundData.badgeColor} size="sm" variant="solid">
                                    {roundData.status}
                                </Badge>
                            </Flex>
                            <Heading size="md" color={roundData.color} mt={1}>
                                {roundData.label}
                            </Heading>
                        </Flex>
                    </Box>
                </Flex>
                
                {/* Live indicator for ongoing rounds */}
                <Flex align="center" gap={2}>
                    {(ongoingRound === 1 || ongoingRound === 3 || ongoingRound === 5) && (
                        <>
                            <Circle size="8px" bg="red.500" className="pulse-animation" />
                            <Box color={roundData.color}>
                                {roundData.icon}
                            </Box>
                        </>
                    )}
                    {(ongoingRound === 2 || ongoingRound === 4 || ongoingRound === 6) && (
                        <Box color={roundData.color}>
                            {roundData.icon}
                        </Box>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
}

export default OngoingRoundAdmin;